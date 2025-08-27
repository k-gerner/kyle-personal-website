# Kyle Gerner
# Started 3.22.2021
# Gomoku solver, client facing
from datetime import datetime
from typing import List, Tuple
from util.terminaloutput.colors import GREEN_COLOR, RED_COLOR, NO_COLOR, \
	DARK_GREY_BACKGROUND as MOST_RECENT_HIGHLIGHT_COLOR, color_text
from ai.game_pigeon.gomoku.constants import DEFAULT_MAX_DEPTH, BOARD_DIMENSION
from ai.game_pigeon.gomoku.enums import BoardSpace


from gomoku.gomoku_strategy import GomokuStrategy, opponent_of, perform_move, copy_of_board
import time
import os
import sys
from gomoku.gomoku_player import GomokuPlayer

AI_PIECE = BoardSpace.BLACK  # AI will always be BLACK
USER_PIECE = BoardSpace.WHITE  # User will always be WHITE
game_board = []  # created later
user_piece = None


# class for the Human player
def _build_board_matrix(
        player_locations: List[Tuple[int, int]], 
        ai_locations: List[Tuple[int, int]]
    ) -> List[List[BoardSpace]]:
    """
    Builds a game board matrix from player and opponent locations.

    Parameters:
        player_locations (List[Tuple[int, int]]): The locations of the player's pieces.
        ai_locations (List[Tuple[int, int]]): The locations of the AI's pieces.

    Returns:
        List[List[BoardSpace]]: A 2D list representing the game board.
    """
    board = [[BoardSpace.EMPTY for _ in range(BOARD_DIMENSION)] for _ in range(BOARD_DIMENSION)]
    for row, col in player_locations:
        board[row][col] = USER_PIECE
    for row, col in ai_locations:
        board[row][col] = AI_PIECE
    return board


def _debug_board(board: List[List[BoardSpace]]) -> None:
    """
    Prints the current state of the board for debugging purposes.
    
    Parameters:
        board (List[List[BoardSpace]]): The game board to print.
    """
    for row in board[::-1]:  # bottom row is at index 0
        print(' '.join(space.value for space in row))
    print('-' * 27)


def run(
		player_locations: List[Tuple[int, int]],
		ai_locations: List[Tuple[int, int]],
		max_search_depth: int = DEFAULT_MAX_DEPTH
) -> Tuple[int, int, bool]:
	"""
	Main method to run the Gomoku game client.

	Parameters:
		player_locations (List[Tuple[int, int]]): The locations of the player's pieces.
		ai_locations (List[Tuple[int, int]]): The locations of the AI's pieces.
		max_search_depth (int): The maximum search depth for the AI strategy.

	Returns:
		Tuple[int, int, bool]: The row and column chosen by the AI and whether it resulted in a win.
	"""
	board = _build_board_matrix(player_locations, ai_locations)
	ai = GomokuStrategy(WHITE if len(ai_locations) <= len(player_locations) else BLACK, len(board))
	best_move = ai.get_move(board, max_search_depth)
	if best_move is None:
		raise BackendError(ValueError(f"Board has no valid moves."))

	perform_move(board, best_move[0], best_move[1], ai.color)
	is_win, _ = ai.is_terminal(board)
	return best_move[0], best_move[1], is_win