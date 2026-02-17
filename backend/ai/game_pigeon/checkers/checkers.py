
from ai.game_pigeon.checkers.board import CheckersBoard, BOARD_SIZE
from ai.game_pigeon.checkers.enums import BoardSpace, Board
from ai.game_pigeon.checkers.constants import DEFAULT_MAX_DEPTH



def _debug_board(board:CheckersBoard) -> None:
    """
    Prints the current state of the board for debugging purposes.
    
    Parameters:
        board (BoardType): The game board to print.
    """
    for r in range(BOARD_SIZE):
        row_output = ""
        for c in range(BOARD_SIZE):
            coord = (r, c)
            piece = board.piece_at(coord)
            row_output += f"{piece} "
        print(row_output)

