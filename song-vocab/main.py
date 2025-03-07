from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_community.document_loaders import AsyncChromiumLoader
from langchain_community.document_transformers import Html2TextTransformer
from typing import List, Dict, Union
from bs4 import BeautifulSoup
import sqlite3
import os
import re
import asyncio
import requests
import urllib.parse
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.tools import BaseTool
from pydantic import BaseModel as LangchainBaseModel

load_dotenv()

app = FastAPI()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in .env file")

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", convert_system_message_to_human=True, google_api_key=api_key)
search = DuckDuckGoSearchRun()

db_file = "yoruba_vocabulary.db"
conn = sqlite3.connect(db_file)
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS vocabulary (
        word TEXT PRIMARY KEY,
        definition TEXT
    )
""")
conn.commit()

class MessageRequest(BaseModel):
    message_request: str

# Test code to avoid rate limit issues
class MockSearchLyricsTool(BaseTool):
    name: str = "search_lyrics"
    description: str = "Mocks searching the web for Yoruba song lyrics."

    def _run(self, query: str) -> str:
        # Mock search results based on the query
        if "fela kuti" in query.lower():
            return "Search results for Fela Kuti, URL: https://www.nairaland.com/2054081/top-15-yoruba-gospel-music"
        elif "sunny ade" in query.lower():
            return "Search results for Sunny Ade, URL: https://www.nairaland.com/2054081/top-15-yoruba-gospel-music"
        elif "yoruba praise song" in query.lower():
            return "Search results for Yoruba praise song, URL: https://www.nairaland.com/2054081/top-15-yoruba-gospel-music"
        else:
            return "No mock search results found."

    async def _arun(self, query: str) -> str:
        raise NotImplementedError("Does not support async")

    def get_url(self, query):
        search_results = self._run(query)
        url_match = re.search(r"URL:\s*(https?://[^\s]+)", search_results)
        if url_match:
            return url_match.group(1)
        else:
            return None


class SearchLyricsTool(BaseTool):
    name: str = "search_lyrics"
    description: str = "Searches the web for Yoruba song lyrics and returns the first search result URL."

    def _run(self, query: str) -> str:
        try:
            search_query = f"{query} lyrics"
            encoded_query = urllib.parse.quote_plus(search_query)
            search_url = f"https://duckduckgo.com/html/?q={encoded_query}"

            response = requests.get(search_url, headers={"User-Agent": "Mozilla/5.0"})
            if response.status_code != 200:
                return f"Error fetching search results: {response.status_code}"

            soup = BeautifulSoup(response.text, "html.parser")
            result_link = soup.select_one(".result__url")  # DuckDuckGo's search result links
            print(f"result_link: {result_link}")
            if result_link:
                return f"Search results for {query}: URL: {result_link.text}"
            else:
                return "No lyrics results found."

        except Exception as e:
            return f"Error extracting lyrics URL: {e}"

    async def _arun(self, query: str) -> str:
        raise NotImplementedError("Does not support async")

    def get_url(self, query):
        return self._run(query)


class GetPageContentTool(BaseTool):
    name: str = "extract_lyrics_from_duckduckgo"
    description: str = "Extracts all text content from a DuckDuckGo search result page, assuming lyrics may be present."

    def _run(self, url: str) -> str:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")

            # Extract all text from the page
            page_text = soup.get_text(separator="\n", strip=True)

            if page_text:
                return page_text
            else:
                return "No text content found on the page."

        except requests.exceptions.RequestException as e:
            return f"Error loading page: {e}"
        except Exception as e:
            return f"Error processing page: {e}"

    async def _arun(self, url: str) -> str:
        raise NotImplementedError("Does not support async")

class ExtractVocabularyTool(BaseTool):
    name: str = "extract_vocabulary"
    description: str = "Extracts Yoruba vocabulary from lyrics."

    def _run(self, lyrics: str) -> str:
        vocabulary_response = llm.invoke(f"Extract Yoruba vocabulary from the following lyrics and provide English definitions in JSON format. Ignore all non Yoruba words: {lyrics}")
        return vocabulary_response.content

    async def _arun(self, lyrics: str) -> str:
        raise NotImplementedError("Does not support async")

tools = [SearchLyricsTool(), GetPageContentTool(), ExtractVocabularyTool()]

class AgentState(BaseModel):
    messages: List[BaseMessage] = Field(default_factory=list)
    url: Union[str, None] = None
    lyrics: Union[str, None] = None
    vocabulary: Union[List[Dict], None] = None

def search_lyrics(state: AgentState):
    if not state.messages:
        return {"lyrics": "No query provided.", 'messages': state.messages + [AIMessage(content="No query provided")]}
    query = state.messages[-1].content
    search_results = tools[0].run(query)
    url_match = re.search(r"URL:\s*(https?://[^\s]+|(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/[^\s]+)", search_results)
    if url_match:
        url = url_match.group(1)
        
        if not url.startswith("http"):
            url = f"https://{url}"
        
        return {
            "url": url,
            "messages": state.messages + [AIMessage(content=f"Found url: {url}")]
        }
    else:
        return {"lyrics": "URL not found.", 'messages': state.messages + [AIMessage(content="URL not found")]}

def get_page_content(state: AgentState):
    url = state.url
    lyrics = tools[1].run(url)
    return {"lyrics": lyrics, 'messages': state.messages + [AIMessage(content="Lyrics retrieved")]}

def extract_vocabulary(state: AgentState):
    lyrics = state.lyrics
    vocabulary_response = tools[2].run(lyrics)
    vocabulary = []
    try:
        vocabulary_json = re.findall(r'\{.*\}', vocabulary_response, re.DOTALL)

        if vocabulary_json:
            import json
            vocabulary_list = json.loads(vocabulary_json[0])
            if isinstance(vocabulary_list['YorubaVocabulary'], list):
                vocabulary = [item for item in vocabulary_list['YorubaVocabulary'] if isinstance(item, dict) and "word" in item and "definition" in item]
            elif isinstance(vocabulary_list['YorubaVocabulary'], dict):
                vocabulary = [{"word": word, "definition": definition} for word, definition in vocabulary_list['YorubaVocabulary'].items()]
        
    except Exception as e:
        print(f"Error parsing vocabulary: {e}")
    return {"vocabulary": vocabulary, 'messages': state.messages + [AIMessage(content="vocabulary extracted")]}

def store_vocabulary(state: AgentState):
    if state.vocabulary:
        for item in state.vocabulary:
            if item.get("word") and item.get("definition"):
                try:
                    cursor.execute("INSERT OR REPLACE INTO vocabulary (word, definition) VALUES (?, ?)", (item["word"], item["definition"]))
                except sqlite3.IntegrityError:
                    print(f"Word '{item["word"]}' already exists in the database.")
        conn.commit()
    return {}

def decide_next_step(state: AgentState):
    if state.url:
        next_node = "get_page_content"
    elif state.lyrics and state.vocabulary is None:
        next_node = "extract_vocabulary"
    elif state.vocabulary:
        next_node = "store_vocabulary"
    else:
        next_node = END
    print(f"decide_next_step: {next_node}")
    return next_node

graph = StateGraph(AgentState)
graph.add_node("search_lyrics", search_lyrics)
graph.add_node("get_page_content", get_page_content)
graph.add_node("extract_vocabulary", extract_vocabulary)
graph.add_node("store_vocabulary", store_vocabulary)

graph.add_edge("search_lyrics", "get_page_content")
graph.add_edge("get_page_content", "extract_vocabulary")
graph.add_edge("extract_vocabulary", "store_vocabulary")
graph.add_edge("store_vocabulary", END)
graph.set_entry_point("search_lyrics")

chain = graph.compile()

@app.post("/api/agent")
async def run_agent(request: MessageRequest):
    try:
        messages = [HumanMessage(content=request.message_request)]
        result = chain.invoke({"messages": messages})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("shutdown")
async def shutdown_event():
    conn.close()
    if os.path.exists(db_file):
        print("Database connection closed.")