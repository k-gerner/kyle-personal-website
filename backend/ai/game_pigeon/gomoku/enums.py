from enum import Enum
from typing import Literal

class BoardSpace(Enum):
    EMPTY = '.'
    BLACK = 'X'
    WHITE = 'O'

    def __str__(self):
        return self.value

# Define the type for player board spaces
PlayerBoardSpace = Literal[BoardSpace.BLACK, BoardSpace.WHITE]
