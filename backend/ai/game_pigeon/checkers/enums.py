from enum import Enum
from typing import Literal, List

class BoardSpace(Enum):
    EMPTY = '.'
    BLACK = 'X'
    BLACK_KING = 'B'
    RED = 'O'
    RED_KING = 'R'

    def __str__(self):
        return self.value

# Define the type for player board spaces
PlayerBoardSpace = Literal[
    BoardSpace.BLACK,
    BoardSpace.RED,
    BoardSpace.BLACK_KING,
    BoardSpace.RED_KING
]

Board = List[List[BoardSpace]]
