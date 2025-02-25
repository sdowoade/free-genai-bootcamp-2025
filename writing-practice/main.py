import streamlit as st
import requests
import random
from PIL import Image
import io
import base64
import google.generativeai as genai
import os
from dotenv import load_dotenv
import numpy as np

load_dotenv()

# Configure Gemini API (replace with your API key)
genai.configure(api_key=os.getenv("GOOGLE_GEN_KEY"))

# Load the Gemini Pro Vision model
model = genai.GenerativeModel('gemini-1.5-flash-latest')

def grade_yoruba_ajami_script(image_data, target_word):
    """
    Grades the Yoruba Ajami script using the Gemini Pro Vision model.

    Args:
        image_data (str): The base64 encoded image data of the drawn Yoruba Ajami script.
        target_word (str): The Yoruba word being practiced.

    Returns:
        tuple: A tuple containing the grade (str) and feedback (str).
    """
    if image_data is None:
        return "Error", "No image provided"

    try:
        img_data = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_data))

        prompt = f"""
        Analyze the following image of Yoruba Ajami script. The target word is "{target_word}".
        Assess the accuracy of the script in the image compared to the target word.
        Provide a letter grade (S, A, B, C, D, or F) and detailed feedback on the accuracy.

        Respond with the following format:
        Grade: [letter grade]
        Feedback: [detailed feedback]
        """

        response = model.generate_content([prompt, img])
        response.resolve()  # wait for response to be resolved.
        result = response.text
        # Parse the response for grade and feedback
        grade = "Unknown"
        feedback = "Could not parse response."

        if "Grade:" in result and "Feedback:" in result:
            try:
                grade_start = result.find("Grade:") + len("Grade:")
                grade_end = result.find("Feedback:")
                grade = result[grade_start:grade_end].strip()

                feedback_start = result.find("Feedback:") + len("Feedback:")
                feedback = result[feedback_start:].strip()
            except:
                pass

        return grade, feedback

    except Exception as e:
        return "Error", f"Gemini API error: {e}"


def fetch_words():
    """Fetches words from the API and stores them in memory."""
    try:
        response = requests.get("http://localhost:4000/api/words")
        response.raise_for_status()
        data = response.json()
        return data["items"]
    except requests.exceptions.RequestException as e:
        st.error(f"Error fetching words: {e}")
        return []

def get_random_word(words):
    """Gets a random word from the stored collection."""
    if not words:
        return None
    return random.choice(words)

def generate_question():
    """Generates a new question and transitions to the Practice State."""
    global current_word
    current_word = get_random_word(words_data)
    if current_word:
        st.session_state.practice_visible = True
        st.session_state.review_visible = False
        st.session_state.grade = ""
        st.session_state.feedback = ""
        st.session_state.image_display = None
        st.session_state.drawing_data = None
        return current_word["yoruba"], current_word["english"]
    else:
        return "No words available.", "Please check the API."

def submit_review(uploaded_file): # changed input
    """Submits the drawn Yoruba Ajami script for review and transitions to the Review State."""
    if current_word and uploaded_file: # changed conditional
        image = Image.open(uploaded_file) # changed line
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        image_data_base64 = base64.b64encode(buffered.getvalue()).decode()
        grade, feedback = grade_yoruba_ajami_script(image_data_base64, current_word["yoruba"])
        st.session_state.practice_visible = False
        st.session_state.review_visible = True
        st.session_state.grade = grade
        st.session_state.feedback = feedback
        st.session_state.image_display = image
    else:
        st.warning("Please draw the word and upload it before submitting.")

# Initialization
if 'words_data' not in st.session_state:
    st.session_state.words_data = fetch_words()
if 'current_word' not in st.session_state:
    st.session_state.current_word = None
if 'practice_visible' not in st.session_state:
    st.session_state.practice_visible = False
if 'review_visible' not in st.session_state:
    st.session_state.review_visible = False
if 'grade' not in st.session_state:
    st.session_state.grade = ""
if 'feedback' not in st.session_state:
    st.session_state.feedback = ""
if 'image_display' not in st.session_state:
    st.session_state.image_display = None
if 'drawing_data' not in st.session_state:
    st.session_state.drawing_data = None

words_data = st.session_state.words_data
current_word = st.session_state.current_word

# Streamlit Interface
st.title("Yoruba Ajami Script Grader")

if st.button("Generate Word"):
    yoruba_word, english_word = generate_question()
    st.session_state.current_word = current_word
    if yoruba_word:
        st.write(f"Yoruba Word: {yoruba_word}")
        st.write(f"English Translation: {english_word}")

if st.session_state.practice_visible:
    st.write("Write the word in Yoruba Ajami script and upload it:")
    uploaded_file = st.file_uploader("Upload an image", type=["png", "jpg", "jpeg"]) # changed line
    if st.button("Submit for Review"):
        submit_review(uploaded_file) # changed input

if st.session_state.review_visible:
    st.write(f"Yoruba Word: {current_word['yoruba']}")
    st.write(f"English Translation: {current_word['english']}")
    st.write(f"Grade: {st.session_state.grade}")
    st.write(f"Feedback: {st.session_state.feedback}")
    if st.session_state.image_display:
        st.image(st.session_state.image_display, caption="Submitted Drawing", use_column_width=True)
    if st.button("Next Question"):
        yoruba_word, english_word = generate_question()
        st.session_state.current_word = current_word
        if yoruba_word:
            st.write(f"Yoruba Word: {yoruba_word}")
            st.write(f"English Translation: {english_word}")