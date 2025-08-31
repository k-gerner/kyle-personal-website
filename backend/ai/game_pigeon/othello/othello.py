# Kyle Gerner
# Started 7.15.22
from typing import List, Tuple

from ai.game_pigeon.othello.othello_strategy import OthelloStrategy, has_valid_moves, BOARD_DIMENSION, get_valid_moves, \
    play_move, current_locations
from ai.game_pigeon.othello.constants import DEFAULT_MAX_DEPTH
from ai.game_pigeon.othello.enums import BoardSpace, Board
from ai.game_pigeon.othello.othello_strategy import OthelloStrategy

from utils.error import BackendError


# Relevant to game state
AI_PIECE = BoardSpace.BLACK  # AI will always be BLACK
USER_PIECE = BoardSpace.WHITE  # User will always be WHITE


def _debug_board(board: Board) -> None:
    """
    Prints the current state of the board for debugging purposes.
    
    Parameters:
        board (BoardType): The game board to print.
    """
    for row in board:  # bottom row is at index 0
        print(' '.join(space.value for space in row))
    print('-' * 15)


def _build_board_matrix(
        player_locations: List[Tuple[int, int]], 
        ai_locations: List[Tuple[int, int]]
    ) -> Board:
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


def run(
        player_locations: List[Tuple[int, int]],
        ai_locations: List[Tuple[int, int]],
        max_search_depth: int = DEFAULT_MAX_DEPTH
) -> Tuple[int, int, List[Tuple[int, int]], List[Tuple[int, int]]]:
    """
    Main method to run the Othello game client.

    Parameters:
        player_locations (List[Tuple[int, int]]): The locations of the player's pieces.
        ai_locations (List[Tuple[int, int]]): The locations of the AI's pieces.
        max_search_depth (int): The maximum search depth for the AI strategy.

    Returns:
        Tuple[int, int, List[Tuple[int, int]], List[Tuple[int, int]]]: 
        [int, int] - The row and column indices of the AI's chosen move
        [List[Tuple[int, int]], List[Tuple[int, int]]] - Updated player and AI locations after the move
    """
    board = _build_board_matrix(player_locations, ai_locations)
    if not has_valid_moves(AI_PIECE, board):
        raise BackendError(ValueError(f"Board has no valid moves."))
    ai = OthelloStrategy(AI_PIECE)
    best_move_row, best_move_col = ai.get_move(board, max_search_depth)
    play_move(AI_PIECE, best_move_row, best_move_col, board)
    _debug_board(board)
    new_player_locations, new_ai_locations = current_locations(board, USER_PIECE, AI_PIECE)
    return best_move_row, best_move_col, new_player_locations, new_ai_locations


def get_valid_moves_for_players(
        player_locations: List[Tuple[int, int]],
        ai_locations: List[Tuple[int, int]]
) -> Tuple[List[Tuple[int, int]], List[Tuple[int, int]]]:
    """
    Determines if there is at least one valid move for the AI on the current board.

    Parameters:
        player_locations (List[Tuple[int, int]]): The locations of the player's pieces.
        ai_locations (List[Tuple[int, int]]): The locations of the AI's pieces.

    Returns:
        valids (Tuple[List[Tuple[int, int]], List[Tuple[int, int]]]): A tuple containing:
        - A list of valid moves for the Player.
        - A list of valid moves for the AI.
    """
    board = _build_board_matrix(player_locations, ai_locations)
    player_moves = get_valid_moves(USER_PIECE, board)
    ai_moves = get_valid_moves(AI_PIECE, board)
    return player_moves, ai_moves


def play_move_for_player(
        player_locations: List[Tuple[int, int]],
        ai_locations: List[Tuple[int, int]],
        player_move: Tuple[int, int]
) -> Tuple[List[Tuple[int, int]], List[Tuple[int, int]]]:
    """
    Plays a move for the specified player on the board.

    Parameters:
        player_locations (List[Tuple[int, int]]): The locations of the player's pieces.
        ai_locations (List[Tuple[int, int]]): The locations of the AI's pieces.
        player_move (Tuple[int, int]): The (row, col) coordinates of the player's move.

    Returns:
        new_moves (Tuple[List[Tuple[int, int]], List[Tuple[int, int]]]): A tuple containing:
        - Updated player locations after the move.
        - Updated AI locations after the move.
    """
    board = _build_board_matrix(player_locations, ai_locations)
    if not has_valid_moves(USER_PIECE, board):
        raise BackendError(ValueError(f"Board has no valid moves for player."))
    play_move(USER_PIECE, player_move[0], player_move[1], board)
    new_player_locations, new_ai_locations = current_locations(board, USER_PIECE, AI_PIECE)
    return new_player_locations, new_ai_locations
