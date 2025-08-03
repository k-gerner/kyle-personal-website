from typing import Dict

class AnagramsTreeNode():
    """
    Represents a node in a tree structure for storing words.

    Attributes:
        letter (str): The letter associated with this node.
        endOfWord (bool): Indicates whether this node marks the end of a word.
        children (Dict[str, 'AnagramsTreeNode']): A dictionary mapping letters to their corresponding child nodes.
    """

    def __init__(self, letter: str, endOfWord: bool = False, children: Dict[str, 'AnagramsTreeNode'] = None):
        self.letter = letter
        self.endOfWord = endOfWord
        self.children = children if children is not None else {}

    def setEndOfWord(self, val: bool) -> None:
        self.endOfWord = val

    def isEndOfWord(self) -> bool:
        return self.endOfWord

    def addOrUpdateChild(self, child: 'AnagramsTreeNode') -> None:
        if child.letter not in self.children.keys():
            self.children[child.letter] = child
        elif child.isEndOfWord():
            self.children[child.letter].setEndOfWord(True)

    def getChild(self, letter: str) -> 'AnagramsTreeNode':
        return self.children.get(letter, None)
    
    def __str__(self) -> str:
        return f"AnagramsTreeNode(letter={self.letter}, endOfWord={self.endOfWord}, children={list(self.children.keys())})"