from typing import Dict

class WordsTreeNode():
    """
    Represents a node in a tree structure for storing words.

    Attributes:
        letter (str): The letter associated with this node.
        endOfWord (bool): Indicates whether this node marks the end of a word.
        children (Dict[str, 'WordsTreeNode']): A dictionary mapping letters to their corresponding child nodes.
    """

    def __init__(self, letter: str, endOfWord: bool = False, children: Dict[str, 'WordsTreeNode'] = None):
        self.letter = letter
        self.endOfWord = endOfWord
        self.children = children if children is not None else {}

    def setEndOfWord(self, val: bool) -> None:
        self.endOfWord = val

    def isEndOfWord(self) -> bool:
        return self.endOfWord

    def addOrUpdateChild(self, child: 'WordsTreeNode') -> None:
        if child.letter not in self.children.keys():
            self.children[child.letter] = child
        elif child.isEndOfWord():
            self.children[child.letter].setEndOfWord(True)

    def getChild(self, letter: str) -> 'WordsTreeNode':
        return self.children.get(letter, None)
    
    def __str__(self) -> str:
        return f"WordsTreeNode(letter={self.letter}, endOfWord={self.endOfWord}, children={list(self.children.keys())})"