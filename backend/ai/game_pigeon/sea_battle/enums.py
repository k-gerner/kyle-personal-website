from enum import Enum
from typing import List

class BoardSpace(Enum):
    DESTROY = "D"
    EMPTY = "-"
    CLEAR = "C"
    HIT = "H"
    MISS = "^"

    def __str__(self):
        return self.value
    

Board = List[List[BoardSpace]]