import string
import re

def normalize_text(text: str) -> list:
    """
    Normalizes the text by converting to lowercase, removing punctuation,
    and splitting into tokens.
    """
    text = text.lower()
    text = re.sub(f"[{re.escape(string.punctuation)}]", "", text)
    return text.split()

def compare_answers(expected_text: str, user_text: str):
    """
    Compares the user's answer with the expected text token by token.
    Returns a score (0-100), boolean if correct, and list of mistakes.
    """
    expected_tokens = normalize_text(expected_text)
    user_tokens = normalize_text(user_text)
    
    if not expected_tokens:
        return 100, True, []
        
    mistakes = []
    correct_count = 0
    
    # We will do a simple word-by-word comparison for the MVP
    # In a more advanced version, we could use Levenshtein distance on words
    max_len = max(len(expected_tokens), len(user_tokens))
    
    for i in range(len(expected_tokens)):
        expected_word = expected_tokens[i]
        
        if i < len(user_tokens):
            user_word = user_tokens[i]
            if expected_word == user_word:
                correct_count += 1
            else:
                mistakes.append({"expected": expected_word, "actual": user_word})
        else:
            # User missed these words entirely
            mistakes.append({"expected": expected_word, "actual": ""})
            
    # If user provided extra words
    for i in range(len(expected_tokens), len(user_tokens)):
        mistakes.append({"expected": "", "actual": user_tokens[i]})
        
    score = int((correct_count / len(expected_tokens)) * 100)
    
    # Let's say score >= 90 is considered correct enough, but let's be strict for boolean
    is_correct = score == 100
    
    return score, is_correct, mistakes
