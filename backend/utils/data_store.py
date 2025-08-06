from typing import Set
from backend.utils.word_games.words_tree_node import WordsTreeNode

# A set of common English words typically used in word games
_common_word_set: Set[str] = set()

def set_common_word_set(words: set) -> None:
    """
    Sets the common word set to the provided set of words.
    
    Parameters:
        words (set): A set of words to be used as the common word set.
    """
    global _common_word_set
    _common_word_set = words

def get_common_word_set() -> set:
    return _common_word_set


# A tree structure to store words for Word Games. 
# Later letters in a word are stored as children of the previous letters.
_words_tree: WordsTreeNode = None

def set_words_tree(tree) -> None:
    """
    Sets the words tree to the provided tree structure.
    
    Parameters:
        tree: A tree structure containing words for Word Games.
    """
    global _words_tree
    _words_tree = tree

def get_words_tree() -> WordsTreeNode:
    return _words_tree


# Clear all data from data store
def clear_data_store() -> None:
    """
    Clears all data from the data store.
    """
    global _words_tree
    _common_word_set.clear()
    _words_tree = None