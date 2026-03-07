from typing import Tuple, Optional
from dataclasses import dataclass

@dataclass
class Move:
    """Class to represent a move"""
    start_coord: Tuple[int, int]
    end_coord: Tuple[int, int]

@dataclass
class MoveOutcome:
    """Class to represent the outcome of a move"""
    move: Move
    created_king: bool
    is_red: bool
    captured_coord: Optional[Tuple[int, int]]
    captured_king: Optional[bool]