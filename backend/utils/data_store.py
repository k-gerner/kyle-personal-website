from typing import Set
from utils.anagrams.anagrams_tree_node import AnagramsTreeNode

# A set of common English words typically used in word games
_common_word_set: Set[str] = set()

def set_common_word_set(words: set) -> None:
    """
    Sets the common word set to the provided set of words.
    
    Args:
        words (set): A set of words to be used as the common word set.
    """
    global _common_word_set
    _common_word_set = words

def get_common_word_set() -> set:
    return _common_word_set


# A tree structure to store words for Anagrams. 
# Later letters in a word are stored as children of the previous letters.
_anagrams_words_tree: AnagramsTreeNode = None

def set_anagrams_words_tree(tree) -> None:
    """
    Sets the Anagrams words tree to the provided tree structure.
    
    Args:
        tree: A tree structure containing words for Anagrams.
    """
    global _anagrams_words_tree
    _anagrams_words_tree = tree

def get_anagrams_words_tree() -> AnagramsTreeNode:
    return _anagrams_words_tree


# Clear all data from data store
def clear_data_store() -> None:
    """
    Clears all data from the data store.
    """
    global _anagrams_words_tree
    _common_word_set.clear()
    _anagrams_words_tree = None