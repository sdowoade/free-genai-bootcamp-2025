# Writing Practice App
The Writing Practice App is a single-page application that allows users to practice writing Yoruba words in the Yoruba Ajami script. The app uses the Gradio library and the Gemini Pro Vision model to grade the user's writing.

## Installation
To run the app, you need to have Python and pip installed on your system. You can install the required Python packages by running the following command in your terminal:

```bash
pip install -r writing-practice/requirements.txt
```

This will install the necessary packages listed in the `requirements.txt` file.


## Running the App
After installing the required packages, you can run the app by executing the following command in your terminal:

```bash
streamlit run writing-practice/main.py
```

This will start a local server and open the app in your default web browser.


## Using the App

The app has three main states: Setup, Practice, and Review.


### Setup State

When you first start the app, you will see a button called "Generate Word". Clicking this button will get a word at random from the collection of words stored in memory.


### Practice State

In the Practice state, you will get a Yoruba word and its English translation from the collection of words stored in memory. You will also get a drawing box to write the word in Yoruba Ajami script. After writing the word, you can click the "Submit for Review" button. The input of the drawing box will be passed to the Gemini Pro Vision model to check if the word was written correctly, and then the app will transition to the Review state.


### Review State


In the Review state, you will see a correct drawing of the word in Yoruba Ajami script written in an extra large font. You will also see the Yoruba word and its English translation. You will see a review of the output from the Grading System, which includes a letter score and a description of whether the attempt at writing the word was accurate. There will be a button called "Next Question" that, when clicked, will generate a new question and place the app into the Practice state.