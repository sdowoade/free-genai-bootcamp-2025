import chromadb
import google.generativeai as genai
import random
from dotenv import load_dotenv
import os   

# Configure Google Generative AI
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_GEN_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash-latest')

# Initialize ChromaDB
client = chromadb.PersistentClient(path="./chroma_db")  # Store ChromaDB data locally
collection = client.get_or_create_collection(name="comprehension_tests")

def store_comprehension_test(conversation, question, options, answer):
    """Stores a comprehension test example in ChromaDB."""
    document = {
        "conversation": conversation,
        "question": question,
        "options": options,
        "answer": answer,
    }
    collection.add(
        documents=[str(document)],  # Store as string for simplicity
        metadatas=[{"type": "comprehension_test"}],
        ids=[f"comprehension_test_{len(collection.get()['ids'])}"]
    )

def generate_similar_test(topic):
    """Generates a similar comprehension test based on the given topic."""
    results = collection.query(
        query_texts=[topic],
        n_results=3  # Retrieve top 3 similar examples
    )

    if not results["documents"][0]:
        return "No similar examples found."

    # Select a random example from the retrieved results
    selected_example_str = random.choice(results["documents"][0])
    selected_example = eval(selected_example_str) #convert string back to dictionary

    # Generate a prompt for Gemini
    prompt = f"""
    Generate a new comprehension test in the style of the following example, but on the topic of "{topic}" and must be in the same language as the example which is Yoruba.

    Example:
    Conversation: {selected_example['conversation']}
    Question: {selected_example['question']}
    Options: {selected_example['options']}
    Answer: {selected_example['answer']}

    New Test:
    Topic: {topic}
    """

    response = model.generate_content(prompt)
    return response.text

def parse_question_file(file_path):
    """Parses a file containing comprehension tests and returns a list of test dictionaries."""
    tests = []
    current_test = {}
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        sections = content.split('--------------------')
        
        for section in sections:
            if not section.strip():
                continue
                
            # Extract dialogue
            dialogue_start = section.find('Dialogue:**') + 11
            dialogue_end = section.find('**Question:')
            if dialogue_start > 10 and dialogue_end > 0:
                dialogue = section[dialogue_start:dialogue_end].strip()
                
                # Extract question
                question_start = section.find('**Question:**') + 12
                question_end = section.find('**Options:')
                question = section[question_start:question_end].strip()
                
                # Extract options
                options_start = section.find('**Options:**') + 11
                options_end = section.find('**Answer:')
                options_text = section[options_start:options_end].strip()
                options = [opt.split(': ')[1].strip() for opt in options_text.split('\n') if ': ' in opt]
                
                # Extract answer
                answer_start = section.find('**Answer:**') + 10
                answer = section[answer_start:].strip()
                
                tests.append({
                    'conversation': dialogue,
                    'question': question,
                    'options': options,
                    'answer': answer
                })
    
    return tests

def store_all_tests_from_file(file_path):
    """Reads tests from a file and stores them in ChromaDB."""
    tests = parse_question_file(file_path)
    for test in tests:
        store_comprehension_test(
            conversation=test['conversation'],
            question=test['question'],
            options=test['options'],
            answer=test['answer']
        )
    return len(tests)

if __name__ == "__main__":
    # Store tests from file
    file_path = "data/yoruba_questions.txt"
    num_tests = store_all_tests_from_file(file_path)
    print(f"Stored {num_tests} tests from file")

    # Example of generating new tests
    new_test = generate_similar_test("a discussion about sports")
    print("\nGenerated test about sports:")
    print(new_test)

    new_test2 = generate_similar_test("a conversation about travel")
    print("\nGenerated test about travel:")
    print(new_test2)