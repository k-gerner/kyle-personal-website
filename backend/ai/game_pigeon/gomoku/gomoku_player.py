# The super class that player objects will inherit from

from typing import List, Tuple


class GomokuPlayer:

    def __init__(self, color: str):
        """Sets the color for this player"""
        self.color = color

    def get_move(self, board: List[List[str]]) -> Tuple[int, int]:
        """Returns the chosen move for a given board, in [rowIndex, columnIndex] format"""
        print("\n<!> Function 'get_move' has not been implemented.\n" +
              "The program has been terminated.\n" +
              "Please make sure that you have implemented 'get_move' from the Player super class.\n")
        exit(0)
        return -1, -1 # to satisfy the return type hint warning
