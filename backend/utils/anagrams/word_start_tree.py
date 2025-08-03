from typing import Collection
from utils.anagrams.anagrams_tree_node import AnagramsTreeNode


def build_tree(words: Collection[str]) -> AnagramsTreeNode:
    """
    Builds a tree structure from a list of words.

    Args:
        words (List[str]): A list of words to be added to the tree.

    Returns:
        AnagramsTreeNode: The root node of the tree.
    """
    root = AnagramsTreeNode('', False)
    for word in words:
        current_node = root
        for letter in word:
            if letter not in current_node.children:
                new_node = AnagramsTreeNode(letter, False)
                current_node.addOrUpdateChild(new_node)
            current_node = current_node.children[letter]
        current_node.setEndOfWord(True)
    return root


