# Listening Comprehension Practice App

This application helps users practice listening comprehension by generating questions from YouTube video transcripts and creating audio clips for practice exercises.

## Features

- Extract transcripts from YouTube videos
- Generate practice questions based on video content
- Create audio clips for listening exercises
- Interactive web interface built with Streamlit

## Setup
1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Create a `.env` file and add your API keys:

```bash
GOOGLE_GEN_KEY=your_google_gen_key
OPENAI_API_KEY=your_openai_api_key
```

## Usage

1. Run the application:

```bash
streamlit run frontend/main.py
```

2. Open the web interface in your browser:

```bash
http://localhost:8501
```

## Technical Details

### Transcript Generation

The application uses the `youtube-transcript-api` library to extract transcripts from YouTube videos. The transcripts are saved in the `transcripts` directory. The original transcript is in English.

### Question Generation

The application uses the `openai` library to generate questions from the transcripts. The questions are saved in the `data` directory. The also handles converting the English questions to Yoruba.

### Audio Generation

The application uses the `facebook/mms-tts-yor` model to generate audio clips from the transcripts text. The audio clips are saved in the `audio` directory.
