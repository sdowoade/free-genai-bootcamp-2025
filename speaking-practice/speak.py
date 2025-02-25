import gradio as gr
import requests
import random
import torch
import whisper

# Load speech recognition model
model = whisper.load_model("small")

def fetch_words():
    response = requests.get("http://localhost:4000/api/words")
    if response.status_code == 200:
        return response.json().get("items", [])
    return []

words_collection = fetch_words()
current_word = None

def generate_word():
    global current_word
    if words_collection:
        current_word = random.choice(words_collection)
        return f"Yoruba: {current_word['yoruba']}\nEnglish: {current_word['english']}"
    return "No words available. Please check the API."

def grade_pronunciation(audio):
    global current_word
    if not current_word:
        return "No word selected. Please generate a word first."
    
    # Transcribe user speech
    result = model.transcribe(audio)
    transcribed_text = result["text"].strip().lower()
    
    # Determine correctness (basic string matching for now)
    expected = current_word["yoruba"].strip().lower()
    
    if transcribed_text == expected:
        grade = "S"
        feedback = "Excellent pronunciation!"
    else:
        grade = "C"
        feedback = f"Try again. You said '{transcribed_text}', but the correct pronunciation is '{expected}'."
    
    return f"Grading: {grade}\nFeedback: {feedback}"

def next_question():
    return generate_word()

# Gradio UI
def ui():
    with gr.Blocks() as app:
        gr.Markdown("# Yoruba Speaking Practice")
        
        word_display = gr.Textbox(label="Word to Practice", interactive=False)
        generate_button = gr.Button("Generate Word")
        
        audio_input = gr.Audio(sources=["microphone"], type="filepath", label="Speak the Word")
        submit_button = gr.Button("Submit for Review")
        review_output = gr.Textbox(label="Review Feedback", interactive=False)
        next_button = gr.Button("Next Question")
        
        generate_button.click(generate_word, outputs=word_display)
        submit_button.click(grade_pronunciation, inputs=audio_input, outputs=review_output)
        next_button.click(next_question, outputs=word_display)
        
    return app

app = ui()
app.launch()
