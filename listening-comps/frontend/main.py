import sys
import os
import logging
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.vector_store import generate_similar_test
from backend.audio_generator import AudioGenerator

import streamlit as st
import json
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Constants
APP_TITLE = "Yoruba Listening Practice"
TOPICS = [
    "daily conversation",
    "greetings",
    "shopping",
    "food and dining",
    "travel",
    "sports",
    "family",
    "weather",
    "education"
]

# Page config
st.set_page_config(
    page_title=APP_TITLE,
    page_icon="🎧",
    layout="wide"
)

def initialize_session_state():
    """Initialize all session state variables"""
    try:
        if 'current_question' not in st.session_state:
            st.session_state.current_question = None
        if 'current_audio' not in st.session_state:
            st.session_state.current_audio = None
        if 'audio_generator' not in st.session_state:
            logger.info("Initializing AudioGenerator")
            st.session_state.audio_generator = AudioGenerator()
    except Exception as e:
        logger.error(f"Error initializing session state: {str(e)}", exc_info=True)
        raise

def parse_generated_test(raw_test):
    """Parse the generated test text into components"""
    try:
        logger.debug("Parsing raw test: %s", raw_test)
        
        # Initialize result
        result = {
            'dialogue': '',
            'question': '',
            'options': [],
            'answer': ''
        }
        
        # Remove all markdown formatting
        raw_test = raw_test.replace('**', '').replace('*', '')
        
        # Split by sections
        if 'Conversation:' in raw_test:
            dialogue = raw_test.split('Conversation:')[1].split('Question:')[0].strip()
            result['dialogue'] = dialogue
            
        if 'Question:' in raw_test:
            question = raw_test.split('Question:')[1].split('Options:')[0].strip()
            result['question'] = question
            
        if 'Options:' in raw_test:
            options_text = raw_test.split('Options:')[1].split('Answer:')[0].strip()
            # Parse the list literal safely
            try:
                options = eval(options_text)  # Safe here as we expect a list literal
                result['options'] = options
            except:
                logger.warning("Failed to parse options list, trying alternative parsing")
                # Fallback parsing if eval fails
                options = options_text.strip('[]').split(',')
                result['options'] = [opt.strip().strip("'\"") for opt in options]
            
        if 'Answer:' in raw_test:
            answer_text = raw_test.split('Answer:')[1].strip()
            try:
                # Remove any remaining markdown from answer
                answer = eval(answer_text)[0].replace('*', '')  # Get first item and clean it
                result['answer'] = answer
            except:
                logger.warning("Failed to parse answer list, using raw text")
                result['answer'] = answer_text.strip('[]').strip().strip("'\"").replace('*', '')
        
        # Validate result
        if not all([result['dialogue'], result['question'], result['options'], result['answer']]):
            logger.error("Missing required fields in parsed result: %s", result)
            return None
            
        logger.debug("Parsed result: %s", result)
        return result
        
    except Exception as e:
        logger.error("Error parsing test: %s", str(e), exc_info=True)
        st.error(f"Error parsing test: {str(e)}")
        return None

def generate_audio(text):
    """Generate audio for the given text"""
    try:
        logger.info("Generating audio")
        # Clean up previous audio file if it exists
        if st.session_state.current_audio and os.path.exists(st.session_state.current_audio):
            logger.debug(f"Removing previous audio file: {st.session_state.current_audio}")
            os.remove(st.session_state.current_audio)
        
        # Generate unique filename based on timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"practice_{timestamp}.mp3"
        logger.debug(f"Generated filename: {filename}")
        
        # Generate the audio
        st.session_state.audio_generator.generate_audio(
            text,
            output_filename=filename
        )
        
        # Get full path to audio file
        audio_file = os.path.join("audio", filename)
        logger.debug(f"Audio file path: {audio_file}")
        
        # Verify file was created
        if not os.path.exists(audio_file):
            raise FileNotFoundError("Audio file was not created")
            
        st.session_state.current_audio = audio_file
        return audio_file
        
    except Exception as e:
        logger.error(f"Error generating audio: {str(e)}", exc_info=True)
        st.error(f"Error generating audio: {str(e)}")
        return None

def render_interactive_stage():
    """Render the interactive learning stage"""
    try:
        initialize_session_state()
        
        st.title(APP_TITLE)
        
        # Sidebar for topic selection
        with st.sidebar:
            st.header("Select Topic")
            selected_topic = st.selectbox(
                "Choose a topic for practice:",
                TOPICS
            )
            
            if st.button("Generate New Question"):
                logger.info("Generating new question for topic: %s", selected_topic)
                with st.spinner("Generating question..."):
                    raw_test = generate_similar_test(selected_topic)
                    logger.debug("Generated raw test: %s", raw_test)
                    
                    parsed_test = parse_generated_test(raw_test)
                    if parsed_test:
                        st.session_state.current_question = parsed_test
                        st.session_state.current_audio = None  # Reset audio when new question generated
                        st.success("New question generated!")
                    else:
                        st.error("Failed to parse generated question")
                        logger.error("Failed to parse test: %s", raw_test)
        
        # Main content area
        if st.session_state.current_question:
            logger.debug("Displaying question: %s", st.session_state.current_question)
            
            # Audio controls first
            st.subheader("Audio")
            if st.button("🔊 Generate Audio", use_container_width=True):
                with st.spinner("Generating audio..."):
                    audio_file = generate_audio(st.session_state.current_question['dialogue'])
                    if audio_file:
                        st.audio(audio_file)
            
            # Question content
            with st.container():
                st.subheader("Dialogue")
                st.write(st.session_state.current_question['dialogue'])
                
                st.subheader("Question")
                st.write(st.session_state.current_question['question'])
                
                if st.session_state.current_question['options']:
                    selected = st.radio(
                        "Choose your answer:",
                        st.session_state.current_question['options'],
                        key="current_answer"
                    )
                    
                    # Debug logging to see what's being compared
                    logger.debug("Selected answer: '%s'", selected)
                    logger.debug("Correct answer: '%s'", st.session_state.current_question['answer'])
                    
                    if st.button("Check Answer", type="primary"):
                        # Normalize both strings for comparison
                        selected_norm = selected.strip()
                        correct_norm = st.session_state.current_question['answer'].strip()
                        
                        if selected_norm == correct_norm:
                            st.success("Correct! 🎉")
                        else:
                            st.error(f"Incorrect. The correct answer was: {correct_norm}")
                else:
                    st.warning("No options available for this question")
        else:
            st.info("Select a topic and click 'Generate New Question' to start practicing!")
            
    except Exception as e:
        logger.error("Error in render_interactive_stage: %s", str(e), exc_info=True)
        st.error("An unexpected error occurred. Please check the console for details.")

if __name__ == "__main__":
    try:
        render_interactive_stage()
    except Exception as e:
        logger.error(f"Application error: {str(e)}", exc_info=True)
        st.error("An unexpected error occurred. Please check the console for details.")