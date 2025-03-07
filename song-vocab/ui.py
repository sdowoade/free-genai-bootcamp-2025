import gradio as gr
import requests
import json
import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = "http://127.0.0.1:8000/api/agent"

def get_vocabulary_from_db():
    """Retrieves vocabulary from the SQLite database."""
    db_file = "yoruba_vocabulary.db"
    if not os.path.exists(db_file):
        return "Database not found."

    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute("SELECT word, definition FROM vocabulary")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return "Vocabulary database is empty."

    vocabulary_text = ""
    for word, definition in rows:
        vocabulary_text += f"Word: {word}, Definition: {definition}\n"
    return vocabulary_text

def run_agent_and_display(message_request):
    """Runs the agent and displays the results, including agent state."""
    try:
        payload = {"message_request": message_request}
        headers = {"Content-Type": "application/json"}
        response = requests.post(API_URL, data=json.dumps(payload), headers=headers)

        if response.status_code == 200:
            result = response.json()
            lyrics = result.get("lyrics", "Lyrics not found.")
            vocabulary = result.get("vocabulary", [])
            vocabulary_text = ""
            for item in vocabulary:
                vocabulary_text += f"Word: {item.get('word', 'N/A')}, Definition: {item.get('definition', 'N/A')}\n"

            db_vocab = get_vocabulary_from_db()

            agent_state = json.dumps(result, indent=4) #Display the whole result as the agent state.
            return lyrics, vocabulary_text, db_vocab, agent_state
        else:
            return f"Error: {response.status_code}, {response.text}", "", "",""

    except Exception as e:
        return f"An error occurred: {e}", "","",""

# Gradio Interface
iface = gr.Interface(
    fn=run_agent_and_display,
    inputs=gr.Textbox(lines=2, placeholder="Enter song and/or artist..."),
    outputs=[
        gr.Textbox(lines=10, label="Lyrics"),
        gr.Textbox(lines=10, label="Extracted Vocabulary"),
        gr.Textbox(lines=10, label="Vocabulary in Database"),
        gr.Code(label="Agent State", language="json")
    ],
    title="Yoruba Song Vocabulary Extractor (LangGraph)",
    description="Enter the name of a Yoruba song or artist to extract lyrics and vocabulary. Agent state will show the progression of the LangGraph.",
)

if __name__ == "__main__":
    iface.launch()