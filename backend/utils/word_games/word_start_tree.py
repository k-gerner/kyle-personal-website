from typing import Collection
from utils.word_games.words_tree_node import WordsTreeNode


def build_tree(words: Collection[str]) -> WordsTreeNode:
    """
    Builds a tree structure from a list of words.

    Parameters:
        words (List[str]): A list of words to be added to the tree.

    Returns:
        WordsTreeNode: The root node of the tree.
    """
    root = WordsTreeNode('', False)
    for word in words:
        current_node = root
        for letter in word:
            if letter not in current_node.children:
                new_node = WordsTreeNode(letter, False)
                current_node.addOrUpdateChild(new_node)
            current_node = current_node.children[letter]
        current_node.setEndOfWord(True)
    return root


