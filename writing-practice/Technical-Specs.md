# Technical Specs
Create a single page application using gradio that allows a user to practice writing Yoruba words in the Yoruba Ajami script.

## Initialization Step
When the app first initializes it needs to the following:
Fetch from the GET localhost:4000/api/words, this will return a collection of words in a json structure. It will have yoruba words with their english translation. Store this collection of words in memory.

Format of the JSON response from the API is as follows:
```json
{
  "items": [
    {
      "parts": {
        "gender": "neutral",
        "number": "singular",
        "tone": "toned",
        "use_case": "formal"
      },
      "yoruba": "ọmọ",
      "english": "child",
      "correct_count": 2,
      "wrong_count": 0
    },
    {
      "parts": {
        "gender": "neutral",
        "number": "singular",
        "tone": "toned",
        "use_case": "formal"
      },
      "yoruba": "ilé",
      "english": "house",
      "correct_count": null,
      "wrong_count": null
    }
  ],
  "pagination": {
    "total_pages": 1,
    "current_page": 1,
    "items_per_page": 100,
    "total_items": 6
  }
}
```

## Page States

Page states describes the state the single page application should behave from a user's perspective. 

### Setup State
When a user first's start up the app.
They will only see a button called "Generate Word"
When they press the button, The app will get a word at random from the collection of words stored in memory.

### Practice State
When a user in is a practice state,
they will get a yoruba word and the english translation gotten from the collection of words stored in memory,
They will also get a drawing box to write the word in Yoruba Ajami script.
They will see a button called "Submit for Review"
When they press the Submit for Review Button the input of the drawing box will be passed to a model (Please usr the gemini-1.5-flash-latest model to accomplish this) that checks if the word was written correctly and then transition to the Review State

### Review State
 When a user in is the review state,
 The user will see a correct drawing of the word in Yoruba Ajami script written in an extra large font.
 The user will still see the yoruba word and the english translation.
 The user will now see a review of the output from the Grading System:
- Grading
  - a letter score using the S Rank to score
  - a description of whether the attempt at saying the word was accurate.
There will be a button called "Next Question" when clicked
it will it generate a new question and place the app into Practice State
