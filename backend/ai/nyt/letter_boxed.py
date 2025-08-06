from typing import Set, List, Dict, Optional
from utils.data_store import get_common_word_set

DEFAULT_MAX_WORDS_IN_SOLUTION = 5

def get_valid_words(letter_dict: Dict[str, Set[str]]) -> List[str]:
    """
    Get potential words that can be formed with the given letters.
    
    Parameters:
        letter_dict (Dict[str, Set[str]]): A dictionary mapping letters to sets of letters they can match with.
        
    Returns:
        list[str]: A list of valid words that can be formed with the given letters.
    """
    words = []
    all_letters = letter_dict.keys()
    for word in get_common_word_set():
        if len(word) < 3 or any(letter not in all_letters for letter in word):
            continue
        has_consecutive_duplicates = any(word[i] == word[i + 1] for i in range(len(word) - 1))
        if has_consecutive_duplicates:
            continue
        valid = True
        for i, letter in enumerate(word):
            if i == len(word) - 1:
                valid = True
                break
            next_letter = word[i + 1]
            if next_letter not in letter_dict.get(letter, set()):
                valid = False
                break
        if valid:
            words.append(word)
    return words


def build_letter_dict(letter_sides: List[Set[str]]) -> dict:
    """
    Map letters to a set of letters they can be matched with next.
    
    Parameters:
        letter_sides (List[Set[str]]): A list of sets of letters from each side of the box.
    Returns:
        dict: A dictionary where keys are letters and values are sets of letters they can match with.
    """
    letter_dict = {}
    for side in letter_sides:
        for letter in side:
            if letter not in letter_dict:
                letter_dict[letter] = set()
            # Add all letters from other sides to the current letter's set
            for other_side in letter_sides:
                if other_side != side:
                    letter_dict[letter].update(other_side)
    return letter_dict


def get_valid_next_words(potential_words: List[str], unused_letters: Set[str]) -> List[str]:
    """
    Get valid next words that can be formed with the next letter and unused letters.
    
    Parameters:
        potential_words (List[str]): A list of all potentially valid words.
        unused_letters (Set[str]): A set of letters that have not been used yet.
        
    Returns:
        list[str]: A list of valid next words that can be formed.
    """
    valid_next_words = []
    for word in potential_words:
        # only consider words that start with the next letter and contain at least one unused letter
        if any(letter in unused_letters for letter in word):
            valid_next_words.append(word)
    return valid_next_words


def solve_words(
        words_found: List[str], 
        unused_letters: Set[str], 
        letters_to_words: Dict[str, List[str]],
        max_solutions_length: int = DEFAULT_MAX_WORDS_IN_SOLUTION
    ) -> Optional[List[str]]:
    """
    Recursive. Find the best valid word list that includes all words in words_found.
    
    Parameters:
        words_found (List[str]): A list of words that have been found so far.
        unused_letters (Set[str]): A set of letters that have not been used yet.
        letters_to_words (Dict[str, List[str]]): A dictionary where keys are letters and values are lists of words starting with that letter.
        max_solutions_length (int): The maximum number of words allowed in the solution.
        
    Returns:
        list[str]: A list of valid words that can be formed with the given letters, or None if no valid combination is found.
    """
    if len(words_found) >= max_solutions_length:
        # If we have already used the maximum number of words, there's no point in searching further
        return None
    
    next_letter = words_found[-1][-1]
    valid_next_words = get_valid_next_words(letters_to_words[next_letter], unused_letters)

    
    if not valid_next_words:
        return None
    
    best_solution_length = max_solutions_length + 1
    best_solution = None
    for word in valid_next_words:
        new_unused_letters = unused_letters - set(word)
        new_words_found = words_found + [word]

        if not new_unused_letters:
            # If no unused letters left, we have a valid solution
            return new_words_found
        
        result = solve_words(new_words_found, new_unused_letters, letters_to_words, best_solution_length - 1)
        if result is not None and len(result) < best_solution_length:
            best_solution_length = len(result)
            best_solution = result
    
    return best_solution


def solve(all_words: List[str], letters_to_words: Dict[str, List[str]], all_letters: Set[str], max_solutions_length: int = DEFAULT_MAX_WORDS_IN_SOLUTION) -> List[List[str]]:
    """
    Solve the Letter Boxed puzzle by finding all valid combinations of words.
    
    Parameters:
        all_words (List[str]): A list of all potentially valid words that can be formed with the letters.
        letters_to_words (Dict[str, List[str]]): A dictionary where keys are letters and values are lists of words starting with that letter.
        all_letters (Set[str]): A set of letters that can be used to form words.
        max_solutions_length (int): The maximum number of words allowed in the solution.
        
    Returns:
        list[list[str]]: A list of valid word combinations that use all letters.
    """
    solutions = []
    for word in all_words:
        words_found = [word]
        unused_letters = all_letters - set(word)
        solution = solve_words(words_found, unused_letters, letters_to_words, max_solutions_length)
        if solution is not None:
            solutions.append(solution)

    return sorted(solutions, key=lambda x: (len(x), sum(len(word) for word in x)))


def run(letter_sides: List[Set[str]], max_solutions_length: int = DEFAULT_MAX_WORDS_IN_SOLUTION) -> List[List[str]]:
    """
    Run the Letter Boxed game with the provided input.
    
    Parameters:
        letter_sides (List[Set[str]]): A list of sets of letters from each side of the box
        only_length_two (bool): If True, only consider solutions of length 2.
    Returns:
        list[list[str]]: A list of valid word combinations to finish the puzzle
    """
    all_letters = {letter for letter in set.union(*letter_sides)}
    letter_dict = build_letter_dict(letter_sides)
    # Sorts words by number of unique letters, and then by length (shorter is better)
    words_from_given_letters = sorted(
        get_valid_words(letter_dict),
        key=lambda word: (len(set(word)), -len(word)),
        reverse=True
    )

    letters_to_words = {letter: [] for letter in all_letters}
    for word in words_from_given_letters:
        letters_to_words[word[0]].append(word)

    return solve(words_from_given_letters, letters_to_words, all_letters, max_solutions_length)
