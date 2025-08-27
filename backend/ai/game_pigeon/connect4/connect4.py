# Kyle Gerner 
# Started 3.18.21
# Connect 4 Solver, client facing
from typing import List, Tuple
from ai.game_pigeon.connect4.connect4_strategy import Connect4Strategy, perform_move, check_if_game_over, find_winner
from ai.game_pigeon.connect4.enums import BoardSpace
from ai.game_pigeon.connect4.constants import NUM_ROWS, NUM_COLS, DEFAULT_MAX_DEPTH
from utils.error import BackendError


AI_PIECE = BoardSpace.RED  # AI will always be RED
USER_PIECE = BoardSpace.YELLOW  # User will always be YELLOW


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
    board = [[BoardSpace.EMPTY for _ in range(NUM_COLS)] for _ in range(NUM_ROWS)]
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
    print('-' * 13)


def run(
        player_locations: List[Tuple[int, int]], 
        ai_locations: List[Tuple[int, int]], 
        max_search_depth: int = DEFAULT_MAX_DEPTH
    ) -> Tuple[int, bool]:
    """
    Main method to run the Connect 4 game client.

    Parameters:
        player_locations (List[Tuple[int, int]]): The locations of the player's pieces.
        ai_locations (List[Tuple[int, int]]): The locations of the AI's pieces.
        max_search_depth (int): The maximum search depth for the AI strategy.

    Returns:
        Tuple[int, bool]: The column chosen by the AI and whether it resulted in a win.
    """
    board = _build_board_matrix(player_locations, ai_locations)
    ai = Connect4Strategy(AI_PIECE)
    best_move = ai.get_move(board, max_search_depth)
    if best_move is None:
        raise BackendError(ValueError(f"Board has no valid moves."))
    
    perform_move(board, best_move, AI_PIECE)
    is_win, _ = check_if_game_over(board)
    return best_move, is_win


def check_game_over(
        player_locations: List[Tuple[int, int]],
        ai_locations: List[Tuple[int, int]]
    ) -> Tuple[bool, bool, List[Tuple[int, int]]]:
    """
    Check if the Connect 4 game is over.
    Parameters:
        player_locations (List[Tuple[int, int]]): The locations of the player's pieces.
        ai_locations (List[Tuple[int, int]]): The locations of the AI's pieces.
    Returns:
        Tuple[bool, str, List[Tuple[int, int]]]: A tuple containing:
            - bool: True if the game is over, False otherwise.
            - bool: True if the player has won, False if the AI has won or no winner.
            - List[Tuple[int, int]]: Locations of the winning pieces, if any.
    """
    board = _build_board_matrix(player_locations, ai_locations)
    winner, winning_locations = find_winner(board)
    return winner is not None, winner == AI_PIECE, winning_locations