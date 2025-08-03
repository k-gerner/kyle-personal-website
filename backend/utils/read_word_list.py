from typing import Set
from pathlib import Path

def load_words(file_path: str) -> Set[str]:
    """
    Reads a word list from a file and returns it as a list of words.
    
    Args:
        file_path (str): The path to the file containing the word list.
        
    Returns:
        Set[str]: A set of words in lowercase, stripped of whitespace.
    """
    full_path = Path(__file__).parent.parent / file_path
    with open(full_path, 'r', encoding='utf-8') as file:
        words = [line.strip().lower() for line in file if line.strip()]
    return set(words)