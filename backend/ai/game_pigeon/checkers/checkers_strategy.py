import math
from typing import List, Tuple

from ai.game_pigeon.checkers.checkers_player import CheckersPlayer
from ai.game_pigeon.checkers.board import CheckersBoard
from ai.game_pigeon.checkers.constants import DEFAULT_MAX_DEPTH
from ai.game_pigeon.checkers.move import MoveOutcome

class CheckersStrategy(CheckersPlayer):

    def __init__(self, is_red: bool):
        self.is_red = is_red

    def get_move(self, board:CheckersBoard, max_depth: int) -> List[MoveOutcome]:
        """Gets the best move(s) for the AI on the given board"""
        best_moves, _ = self.minimax(
            is_red_turn=self.is_red,
            alpha=-math.inf,
            beta=math.inf,
            depth=0,
            board=board,
            max_depth=max_depth
        )
        return best_moves

    def minimax(
            self,
            is_red_turn: bool,
            alpha: int,
            beta: int,
            depth: int,
            board: CheckersBoard,
            max_depth: int = DEFAULT_MAX_DEPTH
    ) -> Tuple[List[MoveOutcome], int]:
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
            out (Tuple[List[MoveOutcome], int]): The computed best moves, and the score of the board after those moves
        """
        def _minimax_from_moves(
                available_moves: List[MoveOutcome],
                is_red_turn: bool,
                alpha: int,
                beta: int,
                depth: int,
                board: CheckersBoard,
                chain_prefix: List[MoveOutcome]
        ) -> Tuple[List[MoveOutcome], int]:
            """
            Helper function to perform minimax from a given list of available moves, used to handle chaining of jumps
            Parameters:
                available_moves (List[MoveOutcome]): the moves to evaluate from this position
                is_red_turn (bool): whether it is red's turn
                alpha (int): the alpha value for alpha-beta pruning
                beta (int): the beta value for alpha-beta pruning
                depth (int): the current depth in the search tree
                board (CheckersBoard): the current board state
                chain_prefix (List[MoveOutcome]): the moves made so far in the current chain
            Returns:
                out (Tuple[List[MoveOutcome], int]): the best move sequence starting with one of the available moves, and the score of the board after that move sequence
            """
            ai_turn_local = (is_red_turn == self.is_red)
            if depth == max_depth:
                # Base case: evaluate the board and return the score
                score = board.evaluate_board(is_red_turn)
                if not ai_turn_local:
                    score = -score # if it's the opponent's turn, negate the score to reflect that it's bad for the AI
                return chain_prefix, score

            if not available_moves:
                # if no moves available, skip to opponent's turn
                _, score = self.minimax(
                    not is_red_turn,
                    alpha,
                    beta,
                    depth + 1,
                    board,
                    max_depth
                )
                return chain_prefix, score

            if ai_turn_local:
                # maximize
                high_score = -math.inf
                best_moves = []
                for move in available_moves:
                    board_copy = board.copy()
                    next_chain_moves = board_copy.perform_move(move)
                    if move.captured_coord and next_chain_moves:
                        candidate_moves, score = _minimax_from_moves(
                            next_chain_moves,
                            is_red_turn,
                            alpha,
                            beta,
                            depth,
                            board_copy,
                            chain_prefix + [move]
                        )
                    else:
                        _, score = self.minimax(
                            not is_red_turn,
                            alpha,
                            beta,
                            depth + 1,
                            board_copy,
                            max_depth
                        )
                        candidate_moves = chain_prefix + [move]
                    if score > high_score:
                        high_score = score
                        best_moves = candidate_moves
                    alpha = max(alpha, score)
                    if alpha >= beta:
                        break # beta cut-off
                return best_moves, high_score
            else:
                # minimize
                low_score = math.inf
                best_moves = []
                for move in available_moves:
                    board_copy = board.copy()
                    next_chain_moves = board_copy.perform_move(move)
                    if move.captured_coord and next_chain_moves:
                        candidate_moves, score = _minimax_from_moves(
                            next_chain_moves,
                            is_red_turn,
                            alpha,
                            beta,
                            depth,
                            board_copy,
                            chain_prefix + [move]
                        )
                    else:
                        _, score = self.minimax(
                            not is_red_turn,
                            alpha,
                            beta,
                            depth + 1,
                            board_copy,
                            max_depth
                        )
                        candidate_moves = chain_prefix + [move]
                    if score < low_score:
                        low_score = score
                        best_moves = candidate_moves
                    beta = min(beta, score)
                    if alpha >= beta:
                        break # alpha cut-off
                return best_moves, low_score

        available_moves = board.order_available_moves(is_red_turn)
        if available_moves and any(move.captured_coord for move in available_moves):
            available_moves = [move for move in available_moves if move.captured_coord]

        return _minimax_from_moves(
            available_moves,
            is_red_turn,
            alpha,
            beta,
            depth,
            board,
            []
        )
