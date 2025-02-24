import os
import re
import logging
from dotenv import load_dotenv
import google.generativeai as genai
import google.api_core.exceptions
import json  # Add this import at the top
import openai

# Suppress the gRPC warning
logging.getLogger('absl').setLevel(logging.ERROR)

load_dotenv()

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")  # Or set it directly: "YOUR_OPENAI_API_KEY"

def get_transcript_from_file(filepath):
    """Reads a transcript from a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        return "File not found."
    except IOError as e:
        return f"IO error occurred: {e}"
    except UnicodeDecodeError as e:
        return f"Error decoding file: {e}"

def extract_qa_from_transcript(transcript):
    """Extracts question/answer pairs from a transcript using GPT-4o."""

    prompt = f"""
    Analyze the following English comprehension test transcript and extract the question/answer pairs.
    Structure the data in the following strict format:

    Dialogue: {{dialogue}} translate to Yoruba
    Question: {{Question}} translate to Yoruba
    Options: 
    - option A translate to Yoruba
    - option B translate to Yoruba
    - option C translate to Yoruba
    - option D translate to Yoruba
    Answer: {{Answer}} translate to Yoruba

    Fill in the options if necessary. Make sure the answer is the right one.

    Make sure values for dialogue, question, options and answer are in Yoruba

    Transcript:
    {transcript}
    """

    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert at extracting and formatting Q&A from transcripts."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3, #lower temp for more deterministic results
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating content: {e}"

def format_answers(raw_text):
    """Formats the raw text output from GPT-4o into distinct Q&A blocks."""
    blocks = re.split(r"Dialogue:", raw_text)[1:]
    formatted_blocks = []
    for block in blocks:
        block = "Dialogue:" + block
        formatted_blocks.append(block.strip())
    return formatted_blocks

def write_output_to_file(output, filepath):
    """Writes the output to a file."""
    try:
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as file:
            for item in output:
                file.write(item + "\n" + "-" * 20 + "\n")
        return True
    except IOError as e:
        print(f"IO error while writing file: {e}")
        return False
    except UnicodeEncodeError as e:
        print(f"Encoding error while writing file: {e}")
        return False

if __name__ == "__main__":
    # Example usage
    transcript_filepath = "./transcripts/dz9cZWGM1Zs.txt"
    output_filepath = "./data/yoruba_questions.txt"

    transcript = get_transcript_from_file(transcript_filepath)
    print("Transcript content:", transcript[:100] + "...")  # Print first 100 chars
    
    if transcript:
        raw_output = extract_qa_from_transcript(transcript)
        print("Raw output:", raw_output[:100] + "...")  # Print first 100 chars
        
        if "Error generating content" not in raw_output:
            formatted_output = format_answers(raw_output)
            print("Formatted output length:", len(formatted_output))
            print("First formatted block:", formatted_output[0] if formatted_output else "No blocks")
            if write_output_to_file(formatted_output, output_filepath):
                print(f"Output written to {output_filepath}")
        else:
            print("Error in output:", raw_output)
            