from typing import List, Tuple, Optional, Dict

from ai.game_pigeon.checkers.board import CheckersBoard, BoardState
from ai.game_pigeon.checkers.move import MoveOutcome
from ai.game_pigeon.checkers.constants import BOARD_SIZE
from ai.game_pigeon.checkers.enums import BoardSpace, Color
from ai.game_pigeon.checkers.constants import DEFAULT_MAX_DEPTH
from ai.game_pigeon.checkers.checkers_strategy import CheckersStrategy
from utils.error import BackendError
import ai.game_pigeon.checkers.cli_runner as cli_runner


def _debug_board(board:CheckersBoard) -> None:
    """
    Prints the current state of the board for debugging purposes.
    
    Parameters:
        board (BoardType): The game board to print.
    """
    print(str(board))


def _build_board(board_state:BoardState) -> CheckersBoard:
    """
    Build a CheckersBoard object from piece location data.

    Parameters:
        board_state: current state of the board containing all piece locations
    Returns:
        board (CheckersBoard)
    """
    board = CheckersBoard(
        red=[(rl, True) if (rl in board_state.red_king_locations) else (rl, False) for rl in board_state.red_locations],
        black=[(bl, True) if (bl in board_state.black_king_locations) else (bl, False) for bl in board_state.black_locations]
    )
    return board


def _build_board_state(board:CheckersBoard) -> BoardState:
    """
    Build a board state object, containing the locations of pieces on the board

    Parameters:
        board (CheckersBoard)
    Returns:
        board_state (BoardState): state of the board containing all piece locations
    """
    reds_after, blacks_after, red_kings_after, black_kings_after = [], [], [], []
    for coord, (is_red, is_king) in board.locations.items():
        if is_red:
            reds_after.append(coord)
            if is_king:
                red_kings_after.append(coord)
        else:
            blacks_after.append(coord)
            if is_king:
                black_kings_after.append(coord)

    board_state = BoardState(
        red_locations=reds_after,
        black_locations=blacks_after,
        red_king_locations=red_kings_after,
        black_king_locations=black_kings_after
    )
    return board_state


def run(
        board_state: BoardState,
        player_color: Color,
        max_search_depth: int = DEFAULT_MAX_DEPTH
) -> Tuple[BoardState, List[MoveOutcome]]:
    """
    Main method to run the Checkers game client.
    
    Parameters:
        board_state: current state of the board containing all piece locations
        player_color (Color): The color of the AI's opponent.
        max_search_depth (int): The maximum search depth for the AI strategy.
    
    Returns:
        out (Tuple[BoardState, List[MoveOutcome]]):
            - board_state: new state of the board containing all piece locations
            - moves (List[MoveOutcome]): The list of moves that were performed by the AI, including any jumps in the case of a multi-jump move.
    """
    board = _build_board(board_state)
    # print("before move:")
    # _debug_board(board)
    strategy = CheckersStrategy(is_red=(player_color==Color.BLACK))
    best_moves = strategy.get_move(board=board, max_depth=max_search_depth)
    # print("\nAI chose move:")
    # for move_outcome in best_moves:
    #     print(f"from {move_outcome.move.start_coord} to {move_outcome.move.end_coord}, " +
    #           f"captured {move_outcome.captured_coord}, " +
    #           f"created king: {move_outcome.created_king}")
    board.perform_move_chain(best_moves)
    # print("\nafter move:")
    # _debug_board(board)
    board_state = _build_board_state(board)

    return board_state, best_moves


def get_available_moves(
        board_state:BoardState,
        player_color: Color,
        is_chain: bool,
        starting_coord: Optional[Tuple[int, int]]
    ) -> List[MoveOutcome]:
    """
    Get the available moves for the player.

    Parameters:
        board_state: current state of the board containing all piece locations
        player_color (Color): The color of the player to get avaialble moves for.
        is_chain (bool): whether this move is in the middle of a jump chain. if True, will return empty list if no captures available, even if there are adjacent spots.
        starting_coordinate (Optional[Tuple[int, int]]): if present, will only return moves from this coordinate

    Returns:
        moves [List[MoveOutcome]]: all available moves for the player
    """
    if is_chain and not starting_coord:
        raise BackendError(ValueError("Missing starting coordinate when in jump chain."))
    board = _build_board(board_state)
    moves = board.order_available_moves(
        is_red=player_color==Color.RED,
        starting_coord=starting_coord,
        is_chain=is_chain
    )
    return moves


def perform_move(move:MoveOutcome, board_state:BoardState) -> BoardState:
    """
    Perform a move on the given board

    Parameters:
        move (moveOutcome): move to perform
        board_state (BoardState): current state of the board
    Returns:
        new_board_state (BoardState): new state of the board
    """
    board = _build_board(board_state)
    board.perform_move(move)
    return _build_board_state(board)



if __name__ == "__main__":
    cli_runner.play_cli()
