from typing import List, Tuple, Optional

from ai.game_pigeon.checkers.board import CheckersBoard, MoveOutcome
from ai.game_pigeon.checkers.constants import BOARD_SIZE
from ai.game_pigeon.checkers.constants import DEFAULT_MAX_DEPTH
from ai.game_pigeon.checkers.checkers_strategy import CheckersStrategy

"""
This module provides a command-line interface (CLI) for playing a game of Checkers against the AI.
It includes functions to print the board, build the starting board, filter mandatory captures,
describe moves, and choose moves from user input.
The main function `play_cli` allows a human player to play against the AI in the terminal.
"""

def _print_board(board: CheckersBoard) -> None:
    header = "   " + " ".join(str(c) for c in range(BOARD_SIZE))
    print(header)
    for r in range(BOARD_SIZE):
        row_output = f"{r}  "
        for c in range(BOARD_SIZE):
            coord = (r, c)
            piece = board.piece_at(coord)
            row_output += f"{piece} "
        print(row_output)

def _build_starting_board() -> CheckersBoard:
    red = []
    black = []
    for r in range(BOARD_SIZE):
        for c in range(BOARD_SIZE):
            if (r + c) % 2 == 1:
                if r < 3:
                    black.append(((r, c), False))
                elif r > BOARD_SIZE - 4:
                    red.append(((r, c), False))
    return CheckersBoard(red=red, black=black)


def _describe_move(move: MoveOutcome) -> str:
    capture = f", capture={move.captured_coord}" if move.captured_coord else ""
    created_king = ", king" if move.created_king else ""
    return f"{move.move.start_coord} -> {move.move.end_coord}{capture}{created_king}"

def _choose_move(moves: List[MoveOutcome]) -> Optional[MoveOutcome]:
    for idx, move in enumerate(moves):
        print(f"{idx}: {_describe_move(move)}")
    while True:
        raw = input("Choose move # (or 'q' to quit): ").strip().lower()
        if raw in {"q", "quit", "exit"}:
            return None
        if raw.isdigit():
            idx = int(raw)
            if 0 <= idx < len(moves):
                return moves[idx]
        print("Invalid choice. Try again.")

def run(
        red_locations: List[Tuple[int, int]],
        black_locations: List[Tuple[int, int]],
        red_kings: List[Tuple[int, int]],
        black_kings: List[Tuple[int, int]],
        is_red_turn: bool,
        max_search_depth: int = DEFAULT_MAX_DEPTH
) -> List[Tuple[int, int]]:
    """
    Main method to run the Checkers game client.
    
    Parameters:
        red_locations (List[Tuple[int, int]]): The locations of the red pieces.
        black_locations (List[Tuple[int, int]]): The locations of the black pieces.
        red_kings (List[Tuple[int, int]]): The locations of the red kings.
        black_kings (List[Tuple[int, int]]): The locations of the black kings.
        is_red_turn (bool): Whether it is currently red player's turn.
        max_search_depth (int): The maximum search depth for the AI strategy.
    
    Returns:
        List[Tuple[int, int]]: A list of coordinates representing the move(s) chosen by the AI. For a normal move, this will be a list of two coordinates (start and end). For a jump move, this will be a list of three or more coordinates representing the start, any intermediate jump landings, and the final landing position.
    """
    board = CheckersBoard(
        red=[(rl, True) if (rl in red_kings) else (rl, False) for rl in red_locations],
        black=[(bl, True) if (bl in black_kings) else (bl, False) for bl in black_locations]
    )
    print("before move:")
    _debug_board(board)
    strategy = CheckersStrategy(is_red=is_red_turn)
    best_moves = strategy.get_move(board=board, max_depth=max_search_depth)
    print("\nAI chose move:")
    for move_outcome in best_moves:
        print(f"from {move_outcome.move.start_coord} to {move_outcome.move.end_coord}, " +
              f"captured {move_outcome.captured_coord}, " +
              f"created king: {move_outcome.created_king}")
    board.perform_move_chain(best_moves)
    print("\nafter move:")
    _debug_board(board)
    return [move_outcome.move.end_coord for move_outcome in best_moves]

def play_cli(
        max_search_depth: int = DEFAULT_MAX_DEPTH,
        human_is_red: bool = True,
        start_red_turn: bool = False
) -> None:
    """
    Play a local CLI game against the AI.

    Parameters:
        max_search_depth (int): The maximum search depth for the AI strategy.
        human_is_red (bool): Whether the human plays red.
        start_red_turn (bool): Whether red moves first.
    """
    board = _build_starting_board()
    ai_is_red = not human_is_red
    strategy = CheckersStrategy(is_red=ai_is_red)
    is_red_turn = start_red_turn

    while True:
        print("\nCurrent board:")
        _print_board(board)

        if not board.red_coords:
            print("Black wins (red has no pieces).")
            return
        if not board.black_coords:
            print("Red wins (black has no pieces).")
            return

        available_moves = board.order_available_moves(is_red_turn)
        if not available_moves:
            winner = "Red" if not is_red_turn else "Black"
            print(f"{winner} wins (opponent has no moves).")
            return
        
        if is_red_turn == human_is_red:
            print("\nYour turn.")
            move_chain: List[MoveOutcome] = []
            while True:
                chosen = _choose_move(available_moves)
                if chosen is None:
                    print("Exiting game.")
                    return
                move_chain.append(chosen)
                next_chain_moves = board.perform_move(chosen)
                if chosen.captured_coord and next_chain_moves:
                    available_moves = next_chain_moves
                    print("\nContinue jump chain:")
                    continue
                break
            print("You played:")
            for m in move_chain:
                print(f"- {_describe_move(m)}")
        else:
            print("\nAI thinking...")
            ai_moves = strategy.get_move(board=board, max_depth=max_search_depth)
            print("AI played:")
            for m in ai_moves:
                print(f"- {_describe_move(m)}")
            board.perform_move_chain(ai_moves)

        is_red_turn = not is_red_turn