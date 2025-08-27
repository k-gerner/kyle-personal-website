from enum import Enum
from typing import Literal

class BoardSpace(Enum):
    EMPTY = '.'
    RED = 'o'
    YELLOW = '@'

# Define the type for player board spaces
PlayerBoardSpace = Literal[BoardSpace.RED, BoardSpace.YELLOW]

class PlayerName(Enum):
    AI = "AI"
    USER = "User"