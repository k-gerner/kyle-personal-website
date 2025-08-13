from functools import cmp_to_key
from utils.data_store import get_words_tree
from utils.word_games.words_tree_node import WordsTreeNode
from typing import List, Set


def find_words(
    remaining_letters: List[str],
    current_str: str,
    current_node: WordsTreeNode
) -> Set[str]:	
	"""
	Finds all the words that can be made with the given letters.

	Parameters:
		remaining_letters (List[str]): The letters that can still be used to form words.
		current_str (str): The current string being formed.
		current_node (WordsTreeNode): The current node in the tree structure.
	"""
	if current_node is None:
		return set()
	found_words = set()
	if current_node.isEndOfWord() and len(current_str) >= 3:
		found_words.add(current_str)
	for index, letter in enumerate(remaining_letters):
		found_words.update(find_words(
			remaining_letters=remaining_letters[:index] + remaining_letters[index+1:],
			current_str=current_str + letter,
			current_node=current_node.getChild(letter)
		))
	return found_words


def compare_words(a, b):
	"""The comparison function used for sorting words. Sorts by length, then alphabetically"""
	if len(a) < len(b):
		return 1
	elif len(a) == len(b):
		return -1 if a < b else 1
	return -1
	

def run(letters: List[str]):
	found_words = find_words(letters, "", get_words_tree())
	word_cmp_key = cmp_to_key(compare_words)
	valid_words = sorted(list(found_words), key=word_cmp_key)
	return valid_words