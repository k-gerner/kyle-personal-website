from typing import Tuple, List, Optional
from dataclasses import dataclass
from ai.game_pigeon.checkers.enums import BoardSpace
from ai.game_pigeon.checkers.constants import BOARD_SIZE


EMPTY = (BoardSpace.EMPTY, False)
KING_DIRECTIONS = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
RED_BASE_DIRECTIONS = [(-1, -1), (-1, 1)] # red starts at high end of board range
BLACK_BASE_DIRECTIONS = [(1, -1), (1, 1)] # black starts at low end of board range
RED_KING_ROW = 0
BLACK_KING_ROW = BOARD_SIZE

@dataclass
class MoveOutcome:
    """Class to represent the outcome of a move"""
    start_coord: Tuple[int, int]
    end_coord: Tuple[int, int]
    created_king: bool
    captured_coord: Optional[Tuple[int, int]]
    captured_king: Optional[bool]



class CheckersBoard:

    def __init__(
            self,
            red:List[Tuple[Tuple[int, int], bool]]=[],
            black:List[Tuple[Tuple[int, int], bool]]=[]):
        """
        Builds the Checkers board object.

        Parameters:
            red (List[Tuple[Tuple[int, int], bool]]): 
                List of tuples for red pieces, each containing the coordinates for the piece, and whether it is a king
            black (List[Tuple[Tuple[int, int], bool]]):
                List of tuples for black pieces, each containing the coordinates for the piece, and whether it is a king
        """
        locations = {}
        red_coords = set()
        black_coords = set()
        for r in red:
            coord, is_king = r
            locations[coord] = (True, is_king) # is_red = True
            red_coords.add(coord)
        for b in black:
            coord, is_king = b
            locations[coord] = (False, is_king) # is_red = False
            black_coords.add(coord)
        self.red_coords = red_coords
        self.black_coords = black_coords

    def piece_at(self, coord:Tuple[int, int]) -> BoardSpace:
        """
        Get the board space at the given coordinate.

        Parameters:
            coord (Tuple[int, int]): coordinate to check
        Returns:
            board_space (BoardSpace): the board space at the coordinate
        """
        if coord in self.locations:
            is_red, is_king = self.locations[coord]
            if is_red:
                return BoardSpace.RED_KING if is_king else BoardSpace.RED
            else:
                return BoardSpace.BLACK_KING if is_king else BoardSpace.BLACK
        return BoardSpace.EMPTY
    

    def get_move_outcomes(self, coord:Tuple[int, int]) -> List[MoveOutcome]:
        """
        Get the possible outcomes from performing the available moves. Does not chain jumps.

        Parameters:
            coord (Tuple[int, int]): coordinate to check. Must not be empty
        Returns:
            outcomes (List[MoveOutcome): A list of outcomes from performing the valid moves, containing information about end coordinate,
            captured piece, and king status
        """
        def in_range(coord: Tuple[int, int]) -> bool:
            return all(0 <= c < BOARD_SIZE for c in coord)
                
        piece = self.locations[coord]
        is_red, is_king = piece[0]
        king_row_index = RED_KING_ROW if is_red else BLACK_KING_ROW
        dir_options = KING_DIRECTIONS if is_king else (
            RED_BASE_DIRECTIONS if is_red
            else BLACK_BASE_DIRECTIONS
        )
        outcomes = []
        for dir_opt in dir_options:
            adjacent_coord = (coord[0] + dir_opt[0], coord[1] + dir_opt[1])
            if not in_range(adjacent_coord):
                continue
            if adjacent_coord not in self.locations:
                # empty space, no capture
                created_king = not is_king and adjacent_coord[0] == king_row_index
                outcome = MoveOutcome(
                    start_coord=coord,
                    end_coord=adjacent_coord,
                    created_king=created_king,
                    captured_coord=None,
                    captured_king=None
                )
                outcomes.append(outcome)
            elif self.locations[adjacent_coord][0] != is_red:
                # piece is opponent, need to check if can be jumped
                jump_coord = (adjacent_coord[0] + dir_opt[0], adjacent_coord[1] + dir_opt[1])
                if in_range(jump_coord) and jump_coord not in self.locations:
                    # landing spot is empty and in range
                    created_king = not is_king and jump_coord[0] == king_row_index
                    outcome = MoveOutcome(
                        start_coord=coord,
                        end_coord=jump_coord,
                        created_king=created_king,
                        captured_coord=adjacent_coord,
                        captured_king=self.locations[adjacent_coord][1]
                    )
                    outcomes.append((jump_coord, adjacent_coord))
        
        return outcomes
    
    def _update_coordinate_lists(self, is_red:bool, prev_coord: Tuple[int, int], new_coord:Optional[Tuple[int, int]]=None) -> None:
        """
        Updates the coordinate lists for the board

        Parameters:
            is_red (bool): whether the affected coordinate contains a red piece
            prev_coord (Tuple[int, int]): the coordinate to be removed from the list
            new_coord (Optional[Tuple[int, int]]): the coordinate to be added to the list, or None if the coordinate should not be re-added
        """
        if is_red:
            self.red_coords.remove(prev_coord)
            if new_coord:
                self.red_coords.add(new_coord)
        else:
            self.black_coords.remove(prev_coord)
            if new_coord:
                self.black_coords.add(new_coord)

    
    def perform_move(self, move:MoveOutcome) -> None:
        """
        Performs the move and updates the board's locations accordingly.

        Parameters:
            move (MoveOutcome): the move to perform
        """
        start_coord = move.start_coord
        end_coord = move.end_coord
        captured_coord = move.captured_coord
        is_red, is_king = self.locations[start_coord]
        self.locations[end_coord] = self.locations[start_coord]
        self.locations[start_coord] = EMPTY
        self._update_coordinate_lists(is_red=is_red, prev_coord=start_coord, new_coord=end_coord)
        if captured_coord:
            self.locations[captured_coord] = EMPTY
            self._update_coordinate_lists(is_red=(not is_red), prev_coord=captured_coord)
        if not is_king:
            king_row_index = RED_KING_ROW if is_red else BLACK_KING_ROW
            if end_coord[0] == king_row_index:
                # mark as king if reaching king row for first time
                self.locations[end_coord][1] = True


    def copy(self) -> "CheckersBoard":
        """
        Copies the board into a new CheckersBoard instance

        Returns:
            new_board (CheckerBoard): duplicate CheckerBoard instance
        """
        red = []
        black = []
        for coord, attributes in self.locations:
            is_red, is_king = attributes
            if is_red:
                red.append((coord, is_king))
            else:
                black.append((coord, is_king))
        return CheckersBoard(red, black)
        

    