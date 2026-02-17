from typing import List

from ai.game_pigeon.checkers.checkers_player import CheckersPlayer
from ai.game_pigeon.checkers.board import CheckersBoard, MoveOutcome
from ai.game_pigeon.checkers.constants import DEFAULT_MAX_DEPTH

class CheckersStrategy(CheckersPlayer):

    def __init__(self, is_red: bool):
        self.is_red = is_red

    def get_move(board:CheckersBoard, max_depth: int) -> List[MoveOutcome]:
        """Gets the best move(s) for the AI on the given board"""
        pass

    def minimax(
            self,
            is_red_turn: bool,
            alpha: int,
            beta: int,
            depth: int,
            board: CheckersBoard,
            max_depth: int = DEFAULT_MAX_DEPTH
    ) -> List[MoveOutcome]:
        """
        Minimax algorithm with alpha-beta pruning to determine the best move for the AI
        Parameters:
            is_red_turn (bool): Whether it is currently red player's turn
            alpha (int): The best score that the maximizer currently can guarantee at that level or above
            beta (int): The best score that the minimizer currently can guarantee at that level or above
            depth (int): The current depth of the search tree
            board (CheckersBoard): The current board state
            max_depth (int): The maximum depth to search
        Returns:
            moves (List[MoveOutcome]): The computed best moves
        """
        pass