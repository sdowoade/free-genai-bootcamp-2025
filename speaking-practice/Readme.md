# Yoruba Speaking Practice

This is a simple application that helps you practice speaking Yoruba. It uses a speech recognition model to transcribe your speech and provides feedback on your pronunciation.

## Features

- Generates a random Yoruba word for you to practice
- Records your speech and transcribes it
- Grades your pronunciation and provides feedback

## How to Use

1. Click on the "Generate Word" button to get a new word to practice.
2. Click on the "Speak the Word" button and say the word out loud.
3. Click on the "Submit for Review" button to get feedback on your pronunciation.
4. If you want to practice a new word, click on the "Next Question" button.

## Requirements

This application requires the following Python libraries:

- gradio
- requests
- random
- torch
- whisper

You can install these libraries using pip:

```bash
pip install gradio requests random torch whisper
```

## Running the Application

You can run the application by executing the `speak.py` file. This will start a local server that you can access in your web browser.

```bash
python speak.py
```