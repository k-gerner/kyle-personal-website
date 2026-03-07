# The super class that player objects will inherit from

from typing import List, Tuple
from ai.game_pigeon.checkers.board import CheckersBoard, MoveOutcome


class CheckersPlayer:

    def __init__(self, is_red: str, is_ai: bool = True):
        """Sets the color for this player, and indicates whether it is an AI"""
        self.is_red = is_red
        self.is_ai = is_ai

    def get_move(self, board: CheckersBoard, max_depth: int) -> List[MoveOutcome]:
        """Returns the chosen move(s) for a given board"""
        print("\n<!> Function 'get_move' has not been implemented.\n" +
              "The program has been terminated.\n" +
              "Please make sure that you have implemented 'get_move' from the Player super class.\n")
        exit(0)
        return -1, -1 # to satisfy the return type hint warning
