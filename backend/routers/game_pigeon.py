from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from typing import List, Dict, Tuple
import logging
import ai.game_pigeon.anagrams as anagrams
import ai.game_pigeon.word_hunt.word_hunt as word_hunt
import ai.game_pigeon.word_bites.word_bites as word_bites
import ai.game_pigeon.connect4.connect4 as connect4
import ai.game_pigeon.gomoku.gomoku as gomoku
from utils.ai_runner import run
from utils.error import BackendError
from utils.model import CamelAliasModel

router = APIRouter()

############
# Anagrams #
############
class AnagramsInput(BaseModel):
    letters: List[str]

    @validator("letters", pre=True)
    def ensure_lowercase(cls, value: List[str]) -> List[str]:
        return [letter.lower() for letter in value]
    
class AnagramsOutput(BaseModel):
    words: List[str]  # Example: ["apple", "banana", "cherry"]

@router.post("/anagrams")
async def solve_anagrams(input: AnagramsInput) -> AnagramsOutput:
    """
    Solve the Anagrams puzzle with the provided letters.
    """
    valid_anagrams = run(anagrams.run, input.letters)
    return AnagramsOutput(words=valid_anagrams)


#############
# Word Hunt #
#############
class WordHuntInput(BaseModel):
    letters: List[str]
    board_type: str
    min_length: int = 3

    @validator("letters", pre=True)
    def ensure_lowercase(cls, value: List[str]) -> List[str]:
        return [letter.lower() for letter in value]
    
class WordHuntOutput(BaseModel):
    solutions: Dict[str, List[int]]  # Example: {"word": [0, 1, 2, 3], ...}

@router.post("/word_hunt")
async def solve_word_hunt(input: WordHuntInput) -> WordHuntOutput:
    """
    Solve the Anagrams puzzle with the provided letters.
    """
    try :
        solutions = run(
            word_hunt.run, 
            letters=input.letters, 
            board_type=input.board_type, 
            min_length=input.min_length)
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in word hunt:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return WordHuntOutput(solutions=solutions)

##############
# Word Bites #
##############
class WordBitesInput(CamelAliasModel):
    single_pieces: List[str]
    horizontal_pieces: List[str]
    vertical_pieces: List[str]
    min_length: int = 3
    max_length_horizontal: int = 8
    max_length_vertical: int = 9

    @validator("single_pieces", "horizontal_pieces", "vertical_pieces", pre=True)
    def ensure_lowercase(cls, value: List[str]) -> List[str]:
        return [letter.lower() for letter in value]

class WordBitesSolutionPiece(CamelAliasModel):
    letters: str
    indices_in_use: List[int]  # indices of the letters that are in use in the solution
    
class WordBitesSolution(CamelAliasModel):
    word: str
    pieces: List[WordBitesSolutionPiece]
    horizontal: bool
    
class WordBitesOutput(CamelAliasModel):
    solutions: List[WordBitesSolution]


@router.post("/word_bites")
async def solve_word_bites(input: WordBitesInput) -> WordBitesOutput:
    """
    Solve the Word Bites puzzle with the provided pieces.
    """
    # Placeholder for actual implementation
    try :
        solutions = run(
            word_bites.run, 
            single_pieces=input.single_pieces, 
            horizontal_pieces=input.horizontal_pieces,
            vertical_pieces=input.vertical_pieces, 
            min_length=input.min_length,
            horizontal_max_length=input.max_length_horizontal,
            vertical_max_length=input.max_length_vertical
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in word bites:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return WordBitesOutput(solutions=solutions)


#############
# Connect 4 #
#############
class Connect4Input(CamelAliasModel):
    player_locations: List[Tuple[int, int]]  # List of [row, col] for player's pieces
    ai_locations: List[Tuple[int, int]]  # List of [row, col] for AI's pieces
    max_search_depth: int = 6  # Default search depth

    @validator("player_locations", "ai_locations", pre=True)
    def ensure_valid_locations(cls, value: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        if not all(isinstance(loc, list) and len(loc) == 2 for loc in value):
            raise ValueError("Each location must be a tuple of two integers [row, col].")
        return value
    
class Connect4Output(CamelAliasModel):
    column: int  # The column chosen by the AI (0-indexed)
    is_win: bool  # Whether the move results in a win
    

@router.post("/connect4")
async def solve_connect4(input: Connect4Input) -> Connect4Output:
    """
    Solve the Connect 4 puzzle with the provided player and opponent locations.
    """
    try:
        # Placeholder for actual Connect 4 implementation
        column, is_win = run(
            connect4.run, 
            player_locations=input.player_locations, 
            ai_locations=input.ai_locations,
            max_search_depth=input.max_search_depth
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in connect 4:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return Connect4Output(column=column, is_win=is_win)


class Connect4GameOverInput(CamelAliasModel):
    player_locations: List[Tuple[int, int]]  # List of [row, col] for player's pieces
    ai_locations: List[Tuple[int, int]]  # List of [row, col] for AI's pieces

    @validator("player_locations", "ai_locations", pre=True)
    def ensure_valid_locations(cls, value: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        if not all(isinstance(loc, list) and len(loc) == 2 for loc in value):
            raise ValueError("Each location must be a tuple of two integers [row, col].")
        return value
    
class Connect4GameOverOutput(CamelAliasModel):
    is_over: bool  # True if the game is over, False otherwise
    ai_wins: bool  # True if the AI has won, False if the player has won or no winner
    winning_locations: List[Tuple[int, int]] = []  # Locations of the winning pieces, if any


@router.post("/connect4/game_over")
async def check_game_over_connect4(input: Connect4GameOverInput) -> Connect4GameOverOutput:
    """
    Check if the Connect 4 game is over.
    
    Parameters:
        input (Connect4Input): The current game state.
        
    Returns:
        Connect4GameOverOutput: The game over status, winner, and winning locations.
    """
    try:
        is_win, ai_wins, winning_locations = run(
            connect4.check_game_over, 
            player_locations=input.player_locations, 
            ai_locations=input.ai_locations
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in connect 4:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return Connect4GameOverOutput(
        is_over=is_win, 
        ai_wins=ai_wins, 
        winning_locations=winning_locations
    )

##########
# Gomoku #
##########
class GomokuInput(CamelAliasModel):
    player_locations: List[Tuple[int, int]]  # List of [row, col] for player's pieces
    ai_locations: List[Tuple[int, int]]  # List of [row, col] for AI's pieces
    max_search_depth: int = 6  # Default search depth

    @validator("player_locations", "ai_locations", pre=True)
    def ensure_valid_locations(cls, value: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        if not all(isinstance(loc, list) and len(loc) == 2 for loc in value):
            raise ValueError("Each location must be a tuple of two integers [row, col].")
        return value
    
class GomokuOutput(CamelAliasModel):
    row: int # The row chosen by the AI (0-indexed)
    column: int  # The column chosen by the AI (0-indexed)
    is_win: bool  # Whether the move results in a win
    

@router.post("/gomoku")
async def solve_connect4(input: GomokuInput) -> GomokuOutput:
    """
    Solve the Gomoku puzzle with the provided player and opponent locations.
    """
    try:
        # Placeholder for actual Connect 4 implementation
        row, column, is_win = run(
            gomoku.run, 
            player_locations=input.player_locations, 
            ai_locations=input.ai_locations,
            max_search_depth=input.max_search_depth
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in gomoku:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return GomokuOutput(row=row, column=column, is_win=is_win)


class GomokuGameOverInput(CamelAliasModel):
    player_locations: List[Tuple[int, int]]  # List of [row, col] for player's pieces
    ai_locations: List[Tuple[int, int]]  # List of [row, col] for AI's pieces

    @validator("player_locations", "ai_locations", pre=True)
    def ensure_valid_locations(cls, value: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        if not all(isinstance(loc, list) and len(loc) == 2 for loc in value):
            raise ValueError("Each location must be a tuple of two integers [row, col].")
        return value
    
class GomokuGameOverOutput(CamelAliasModel):
    is_over: bool  # True if the game is over, False otherwise
    ai_wins: bool  # True if the AI has won, False if the player has won or no winner
    winning_locations: List[Tuple[int, int]] = []  # Locations of the winning pieces, if any


@router.post("/connect4/game_over")
async def check_game_over_gomoku(input: GomokuGameOverInput) -> GomokuGameOverOutput:
    """
    Check if the Gomoku game is over.
    
    Parameters:
        input (GomokuGameOverInput): The current game state.
        
    Returns:
        GomokuGameOverOutput: The game over status, winner, and winning locations.
    """
    try:
        is_win, ai_wins, winning_locations = run(
            gomoku.check_game_over, 
            player_locations=input.player_locations, 
            ai_locations=input.ai_locations
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in gomoku:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return GomokuGameOverOutput(
        is_over=is_win, 
        ai_wins=ai_wins, 
        winning_locations=winning_locations
    )