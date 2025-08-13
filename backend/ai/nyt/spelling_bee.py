from typing import Set, List
from utils.data_store import get_common_word_set

def spelling_bee_sort(word: str, center_letter: str, outer_letters: Set[str]) -> int:
    """
    Custom sorting function for Spelling Bee words.
    Words that use all the letters (pangrams) are prioritized.
    If not a pangram, words are sorted by length.
    
    Parameters:
        word (str): The word to evaluate.
        center_letter (str): The center letter that must be included in each word.
        outer_letters (Set[str]): The set of outer letters.
    
    Returns:
        int: A score for sorting. Higher scores come first.
    """
    # Combine all letters (center + outer)
    all_letters = outer_letters | {center_letter}
    
    # Check if the word is a pangram (uses all letters)
    is_pangram = all(letter in word for letter in all_letters)
    
    # Return a higher score for pangrams, fallback to length
    return (1 if is_pangram else 0, len(word))


def run(center_letter: str, outer_letters: Set[str]) -> List[str]:
    """
    Run the Spelling Bee game with the provided input.
    
    Parameters:
        center_letter (str): The center letter that must be included in each word.
        outer_letters (Set[str]): A set of letters that can be used to form words, excluding the center letter.
    Returns:
        list[str]: A list of valid words that can be formed with the given letters, ordered by length
    """
    center_letter = center_letter.lower()
    outer_letters = {letter.lower() for letter in outer_letters}
    valid_words = []
    for word in get_common_word_set():
        if len(word) < 4:
            continue
        if center_letter not in word:
            continue
        if any(letter not in outer_letters and letter != center_letter for letter in word):
            continue
        valid_words.append(word)
    valid_words.sort(key=lambda word: spelling_bee_sort(word, center_letter, outer_letters), reverse=True)
    return valid_words


if __name__ == "__main__":
    res = run('a', {'p', 'l', 'e', 'b', 'n'})
    print(res)