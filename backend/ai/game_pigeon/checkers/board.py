from typing import Tuple, List, Optional, Dict
from dataclasses import dataclass
from ai.game_pigeon.checkers.enums import BoardSpace
from ai.game_pigeon.checkers.constants import BOARD_SIZE
from ai.game_pigeon.checkers.move import Move, MoveOutcome


EMPTY = (BoardSpace.EMPTY, False)
KING_DIRECTIONS = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
RED_BASE_DIRECTIONS = [(-1, -1), (-1, 1)] # red starts at high end of board range
BLACK_BASE_DIRECTIONS = [(1, -1), (1, 1)] # black starts at low end of board range
RED_KING_ROW = 0
BLACK_KING_ROW = BOARD_SIZE - 1

WIN_SCORE = 10_000
FRIENDLY_PIECE_SCORE_MULTIPLIER = 10
FRIENDLY_KING_PIECE_SCORE_MULTIPLIER = 10
ENEMY_PIECE_SCORE_MULTIPLIER = -8
ENEMY_KING_PIECE_SCORE_MULTIPLIER = -5



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
        # The board is represented as a dictionary mapping coordinates to a tuple of (is_red, is_king). We also maintain
        # separate sets of coordinates for red and black pieces to make it easier to iterate through them when needed.
        locations: Dict[Tuple[int, int], Tuple[bool, bool]] = {}
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
        self.locations = locations
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
    

    def order_available_moves(
            self,
            is_red:bool,
            starting_coord:Optional[Tuple[int, int]]=None,
            is_chain:bool=False
        ) -> List[MoveOutcome]:
        """
        Uses a heuristic to get the most promising moves for the given color to explore next. Does not chain jumps.

        Parameters:
            is_red (bool): whether to get moves for red pieces or black pieces
            starting_coord (Optional[Tuple[int, int]]): the starting coordinate of the piece to move, if specified. If None, will get moves for all pieces of the given color
            is_chain (bool): whether this move is in the middle of a jump chain. if True, will return empty list if no captures available, even if there are adjacent spots.
        Returns:
            moves (List[MoveOutcome]): a list of MoveOutcome objects for pieces of the given color
                that have promising moves to explore, ordered by priority (captures > king creation > normal moves)
        """      
        coords = [starting_coord] if starting_coord else (self.red_coords if is_red else self.black_coords)  
        move_outcomes: List[MoveOutcome] = []
        for coord in coords:
            move_outcomes.extend(self._get_move_outcomes(coord, is_chain=is_chain))

        if any(o.captured_coord for o in move_outcomes):
            # if possible to capture, remove all non-capture options
            moves_with_capture = [m for m in move_outcomes if m.captured_coord]
            move_outcomes = moves_with_capture
        
        # Sort by priority: captures > king creation > normal moves
        def move_priority(move: MoveOutcome) -> int:
            priority = 0
            if move.captured_coord:
                priority += 100  # Captures are most valuable
                if move.captured_king:
                    priority += 50  # Capturing kings even better
            if move.created_king:
                priority += 75  # Creating kings is valuable
            return priority
        
        # Sort in descending order (highest priority first)
        move_outcomes.sort(key=move_priority, reverse=True)

        return move_outcomes
    
    def in_range(self, coord: Tuple[int, int]) -> bool:
        """Checks if the given coordinate is within the bounds of the board."""
        return all(0 <= c < BOARD_SIZE for c in coord)

    def _get_move_outcomes(self, coord:Tuple[int, int], is_chain:bool=False) -> List[MoveOutcome]:
        """
        Get the possible outcomes from performing the available moves. Does not chain jumps.

        Parameters:
            coord (Tuple[int, int]): coordinate to check. Must not be empty
            is_chain (bool): whether this move is in the middle of a jump chain. if True, will return empty list if no captures available, even if there are adjacent spots.
        Returns:
            outcomes (List[MoveOutcome): A list of outcomes from performing the valid moves, containing information about end coordinate,
            captured piece, and king status
        """
                
        is_red, is_king = self.locations[coord]
        king_row_index = RED_KING_ROW if is_red else BLACK_KING_ROW
        dir_options = KING_DIRECTIONS if is_king else (
            RED_BASE_DIRECTIONS if is_red
            else BLACK_BASE_DIRECTIONS
        )
        outcomes = []
        for dir_opt in dir_options:
            adjacent_coord = (coord[0] + dir_opt[0], coord[1] + dir_opt[1])
            if not self.in_range(adjacent_coord):
                continue
            if adjacent_coord not in self.locations:
                # empty space, no capture
                if is_chain:
                    continue
                created_king = not is_king and adjacent_coord[0] == king_row_index
                outcome = MoveOutcome(
                    move=Move(
                        start_coord=coord,
                        end_coord=adjacent_coord
                    ),
                    created_king=created_king,
                    is_red=is_red,
                    captured_coord=None,
                    captured_king=None
                )
                outcomes.append(outcome)
            elif self.locations[adjacent_coord][0] != is_red:
                # piece is opponent, need to check if can be jumped
                jump_coord = (adjacent_coord[0] + dir_opt[0], adjacent_coord[1] + dir_opt[1])
                if self.in_range(jump_coord) and jump_coord not in self.locations:
                    # landing spot is empty and in range
                    created_king = not is_king and jump_coord[0] == king_row_index
                    outcome = MoveOutcome(
                        move=Move(
                            start_coord=coord,
                            end_coord=jump_coord
                        ),
                        created_king=created_king,
                        is_red=is_red,
                        captured_coord=adjacent_coord,
                        captured_king=self.locations[adjacent_coord][1]
                    )
                    outcomes.append(outcome)
        
        return outcomes

    
    def evaluate_board(self, is_red:bool) -> int:
        """
        Evaluates the board state from the perspective of the given color. Positive score is good for red, negative score is good for black.

        Parameters:
            is_red (bool): whether to evaluate the board from red's perspective or black's perspective
        Returns:
            score (int): the evaluation score of the board
        """
        friendly_pieces = 0
        enemy_pieces = 0
        friendly_kings = 0
        enemy_kings = 0
        for (is_piece_red, is_king) in self.locations.values():
            if is_piece_red == is_red:
                friendly_pieces += 1
                friendly_kings += 1 if is_king else 0
            else:
                enemy_pieces += 1
                enemy_kings += 1 if is_king else 0

        if friendly_pieces == 0:
            return -1 * WIN_SCORE
        elif enemy_pieces == 0:
            return WIN_SCORE
        else:
            #
            #
            #
            # TODO: should we use the self.red_pieces count instead? Maybe also track kings? Could make two variations of the board class, one that uses each, and see which is better
            #
            #
            #
            score = (friendly_pieces * FRIENDLY_PIECE_SCORE_MULTIPLIER +
                       friendly_kings * FRIENDLY_KING_PIECE_SCORE_MULTIPLIER +
                       enemy_pieces * ENEMY_PIECE_SCORE_MULTIPLIER +
                       enemy_kings * ENEMY_KING_PIECE_SCORE_MULTIPLIER)
            return score

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

    def perform_move_chain(self, move_outcomes:List[MoveOutcome]) -> None:
        """
        Performs a chain of moves on the board.

        Parameters:
            move_outcomes (List[MoveOutcome]): The list of move outcomes to perform.
        """
        for move_outcome in move_outcomes:
            self.perform_move(move_outcome)


    def perform_move(self, move_outcome:MoveOutcome) -> List[MoveOutcome]:
        """
        Performs the move and updates the board's locations accordingly.

        Parameters:
            move_outcome (MoveOutcome): the move to perform
        Returns:
            List[MoveOutcome]: if there are any additional jumps available for the same piece after performing this move, returns the list of MoveOutcomes for the next jumps. Otherwise, returns an empty list.
        """
        start_coord = move_outcome.move.start_coord
        end_coord = move_outcome.move.end_coord
        captured_coord = move_outcome.captured_coord
        is_red, is_king = self.locations[start_coord]
        self.locations[end_coord] = self.locations[start_coord]
        self.locations.pop(start_coord)
        self._update_coordinate_lists(is_red=is_red, prev_coord=start_coord, new_coord=end_coord)
        if captured_coord:
            self.locations.pop(captured_coord)
            self._update_coordinate_lists(is_red=(not is_red), prev_coord=captured_coord)
        if move_outcome.created_king:
            self.locations[end_coord] = (self.locations[end_coord][0], True)
            return [] # if piece was just made a king, it cannot make another jump, so return empty list
        return self._get_move_outcomes(end_coord, is_chain=True)        


    def copy(self) -> "CheckersBoard":
        """
        Copies the board into a new CheckersBoard instance

        Returns:
            new_board (CheckerBoard): duplicate CheckerBoard instance
        """
        red = []
        black = []
        for coord, attributes in self.locations.items():
            is_red, is_king = attributes
            if is_red:
                red.append((coord, is_king))
            else:
                black.append((coord, is_king))
        return CheckersBoard(red, black)
    
    def __str__(self) -> str:
        """
        String representation of the board for debugging purposes.

        Returns:
            board_str (str): the string representation of the board
        """
        output = ""
        for r in range(BOARD_SIZE):
            row_output = ""
            for c in range(BOARD_SIZE):
                coord = (r, c)
                piece = self.piece_at(coord)
                row_output += f"{piece} "
            output += row_output + "\n"
        return output


@dataclass
class BoardState:
    """Class containing the location of all pieces on the board"""
    red_locations: List[Tuple[int, int]]
    black_locations: List[Tuple[int, int]]
    red_king_locations: List[Tuple[int, int]]
    black_king_locations: List[Tuple[int, int]]