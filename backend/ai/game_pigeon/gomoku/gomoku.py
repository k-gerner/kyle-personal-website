# Kyle Gerner
# Started 3.22.2021
# Gomoku solver, client facing
from datetime import datetime
from typing import List, Tuple
from ai.game_pigeon.gomoku.constants import DEFAULT_MAX_DEPTH, BOARD_DIMENSION
from ai.game_pigeon.gomoku.enums import BoardSpace
from ai.game_pigeon.gomoku.gomoku_strategy import GomokuStrategy, find_winner

from utils.error import BackendError


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
	ai = GomokuStrategy(AI_PIECE)
	best_move_row, best_move_col = ai.get_move(board, max_search_depth)
	if best_move_row is None or best_move_col is None:
		raise BackendError(ValueError(f"Board has no valid moves."))

	winner, winning_locations = find_winner(board)
	return best_move_row, best_move_col, winner is not None


def check_game_over(
		player_locations: List[Tuple[int, int]],
		ai_locations: List[Tuple[int, int]]
) -> Tuple[bool, List[Tuple[int, int]]]:
	"""
	Check if the game is over and if there is a winner.

	Parameters:
		player_locations (List[Tuple[int, int]]): The locations of the player's pieces.
		ai_locations (List[Tuple[int, int]]): The locations of the AI's pieces.

	Returns:
		Tuple[bool, bool, List[Tuple[int, int]]]: A tuple containing:
			- A boolean indicating if the game is over.
			- A boolean indicating if the AI won (True) or the player won (False). If no winner, this is False.
			- A list of tuples representing the coordinates of the winning pieces. Empty if no winner.
	"""
	board = _build_board_matrix(player_locations, ai_locations)
	winner, winning_locations = find_winner(board)
	return winner is not None, winner == AI_PIECE, winning_locations