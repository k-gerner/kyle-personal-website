from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from typing import List, Dict, Tuple, Optional
import logging
import ai.game_pigeon.anagrams as anagrams
import ai.game_pigeon.word_hunt.word_hunt as word_hunt
import ai.game_pigeon.word_bites.word_bites as word_bites
import ai.game_pigeon.connect4.connect4 as connect4
import ai.game_pigeon.gomoku.gomoku as gomoku
import ai.game_pigeon.othello.othello as othello
import ai.game_pigeon.sea_battle.sea_battle as sea_battle
import ai.game_pigeon.mancala.capture.mancala_capture as mancala_capture
import ai.game_pigeon.mancala.avalanche.mancala_avalanche as mancala_avalanche
from ai.game_pigeon.mancala.capture.mancala_capture import MancalaCaptureBoardState
from ai.game_pigeon.mancala.avalanche.mancala_avalanche import MancalaAvalancheBoardState
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
async def solve_gomoku(input: GomokuInput) -> GomokuOutput:
    """
    Solve the Gomoku puzzle with the provided player and opponent locations.
    """
    try:
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


@router.post("/gomoku/game_over")
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


###########
# Othello #
###########
class OthelloInput(CamelAliasModel):
    player_locations: List[Tuple[int, int]]  # List of [row, col] for player's pieces
    ai_locations: List[Tuple[int, int]]  # List of [row, col] for AI's pieces
    max_search_depth: int = 7  # Default search depth

    @validator("player_locations", "ai_locations", pre=True)
    def ensure_valid_locations(cls, value: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        if not all(isinstance(loc, list) and len(loc) == 2 for loc in value):
            raise ValueError("Each location must be a tuple of two integers [row, col].")
        return value
    
class OthelloOutput(CamelAliasModel):
    row: int # The row chosen by the AI (0-indexed)
    column: int  # The column chosen by the AI (0-indexed)
    new_player_locations: List[Tuple[int, int]]  # Updated player locations after the move
    new_ai_locations: List[Tuple[int, int]]  # Updated AI locations after the move
    

@router.post("/othello")
async def solve_othello(input: OthelloInput) -> OthelloOutput:
    """
    Solve the Othello puzzle with the provided player and opponent locations.
    """
    try:
        row, column, new_player_locations, new_ai_locations = run(
            othello.run, 
            player_locations=input.player_locations, 
            profile=True,
            ai_locations=input.ai_locations,
            max_search_depth=input.max_search_depth
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in othello:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return OthelloOutput(row=row, 
                        column=column, 
                        new_player_locations=new_player_locations, 
                        new_ai_locations=new_ai_locations)


class OthelloValidMovesInput(CamelAliasModel):
    player_locations: List[Tuple[int, int]]  # List of [row, col] for player's pieces
    ai_locations: List[Tuple[int, int]]  # List of [row, col] for AI's pieces

    @validator("player_locations", "ai_locations", pre=True)
    def ensure_valid_locations(cls, value: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        if not all(isinstance(loc, list) and len(loc) == 2 for loc in value):
            raise ValueError("Each location must be a tuple of two integers [row, col].")
        return value
    
class OthelloValidMovesOutput(CamelAliasModel):
    player: List[Tuple[int, int]]  # Valid moves for the player
    ai: List[Tuple[int, int]]  # Valid moves for the AI


@router.post("/othello/valid_moves")
async def get_valid_moves_othello(input: OthelloValidMovesInput) -> OthelloValidMovesOutput:
    """
    Get valid moves for both the player and AI in Othello.
    
    Parameters:
        input (OthelloValidMovesInput): The current game state.
        
    Returns:
        OthelloValidMovesOutput: Valid moves for both the player and AI.
    """
    try:
        valid_player_moves, valid_ai_moves = run(
            othello.get_valid_moves_for_players, 
            player_locations=input.player_locations, 
            ai_locations=input.ai_locations
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in othello valid moves:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return OthelloValidMovesOutput(
        player=valid_player_moves, 
        ai=valid_ai_moves
    )


class OthelloPerformMoveInput(CamelAliasModel):
    player_locations: List[Tuple[int, int]]  # List of [row, col] for player's pieces
    ai_locations: List[Tuple[int, int]]  # List of [row, col] for AI's pieces
    player_move: Tuple[int, int]  # The move to perform [row, col]

    @validator("player_locations", "ai_locations", pre=True)
    def ensure_valid_locations(cls, value: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        if not all(isinstance(loc, list) and len(loc) == 2 for loc in value):
            raise ValueError("Each location must be a tuple of two integers [row, col].")
        return value
    
class OthelloPerformMoveOutput(CamelAliasModel):
    player: List[Tuple[int, int]]  # new player locations after the move
    ai: List[Tuple[int, int]]  # new AI locations after the move


@router.post("/othello/perform_move")
async def perform_move_othello(input: OthelloPerformMoveInput) -> OthelloPerformMoveOutput:
    """
    Perform a move for the AI in Othello and return the updated locations.
    
    Parameters:
        input (OthelloPerformMoveInput): The current game state and the move to perform.
        
    Returns:
        OthelloPerformMoveOutput: Updated player and AI locations after the move.
    """
    try:
        new_player_locations, new_ai_locations = run(
            othello.play_move_for_player,
            player_locations=input.player_locations, 
            ai_locations=input.ai_locations,
            player_move=input.player_move
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in othello perform move:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return OthelloPerformMoveOutput(
        player=new_player_locations, 
        ai=new_ai_locations
    )


##############
# Sea Battle #
##############
class SeaBattleInput(CamelAliasModel):
    size: int
    recent_move: Optional[Tuple[int, int]] = None # The most recent move played
    ships_remaining: Dict[str, int]  # Dictionary mapping ship sizes to their remaining counts
    destroyed_locations: List[Tuple[int, int]]  # List of [row, col] for destroyed locations
    hit_locations: List[Tuple[int, int]]  # List of [row, col] for hit locations
    missed_locations: List[Tuple[int, int]]  # List of [row, col] for missed locations
    cleared_locations: List[Tuple[int, int]]  # List of [row, col] for cleared locations

    @validator("size", pre=True)
    def ensure_size(cls, value: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        if not 8 <= value <= 10:
            raise ValueError("Size must be 8, 9, or 10.")
        return value

    @validator("destroyed_locations", "hit_locations", "missed_locations", "cleared_locations", pre=True)
    def ensure_valid_locations(cls, value: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        if not all(isinstance(loc, list) and len(loc) == 2 for loc in value):
            raise ValueError("Each location must be a tuple of two integers [row, col].")
        return value
    
    @validator("ships_remaining", pre=True)
    def ensure_valid_ships_remaining(cls, value: Dict[int, int]) -> Dict[int, int]:
        if not all(size.isdigit() and isinstance(count, int) and int(size) > 0 and count >= 0 for size, count in value.items()):
            raise ValueError("Each ship size must be a positive integer and count must be a non-negative integer.")
        return value
    

class SeaBattleOutput(CamelAliasModel):
    space_densities: List[List[float]]  # 2D list representing space densities
    best_moves: List[Tuple[int, int]]   # List of best move locations,
    destroyed_locations: List[Tuple[int, int]]  # List of locations of sunk ships
    hit_locations: List[Tuple[int, int]]  # List of locations of hit ships
    missed_locations: List[Tuple[int, int]]  # List of locations of missed shots
    cleared_locations: List[Tuple[int, int]]  # List of cleared locations
    remaining_ships: Dict[int, int]  # Remaining ships after the move
    

@router.post("/sea_battle")
async def solve_sea_battle(input: SeaBattleInput) -> SeaBattleOutput:
    """
    Solve the Sea Battle puzzle with the provided player and opponent locations.
    """
    converted_ships_remaining = {int(key): value for key, value in input.ships_remaining.items()}
    try:
        output_dict = run(
            sea_battle.run, 
            size=input.size,
            recent_move=input.recent_move,
            ships_remaining=converted_ships_remaining,
            destroyed_locations=input.destroyed_locations,
            hit_locations=input.hit_locations,
            missed_locations=input.missed_locations,
            cleared_locations=input.cleared_locations
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in sea battle:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return SeaBattleOutput(
        space_densities=output_dict["space_densities"],
        best_moves=output_dict["best_moves"],
        destroyed_locations=output_dict["destroyed_locations"],
        hit_locations=output_dict["hit_locations"],
        missed_locations=output_dict["missed_locations"],
        cleared_locations=output_dict["cleared_locations"],
        remaining_ships=output_dict["remaining_ships"]
    )


class SeaBattleInitialStateInput(CamelAliasModel):
    size: int

    @validator("size", pre=True)
    def ensure_size(cls, value: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        if not 8 <= value <= 10:
            raise ValueError("Size must be 8, 9, or 10.")
        return value
    
class SeaBattleInitialStateOutput(CamelAliasModel):
    remaining_ships: Dict[int, int]  # Dictionary mapping ship sizes to their remaining counts


@router.post("/sea_battle/initial_ships")
async def get_initial_state_sea_battle(input: SeaBattleInitialStateInput) -> SeaBattleInitialStateOutput:
    """
    Get the initial ship counts for a given board size in Sea Battle.
    """
    try:
        remaining_ships = run(
            sea_battle.initial_board_state, 
            size=input.size
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in sea battle initial state:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return SeaBattleInitialStateOutput(remaining_ships=remaining_ships)


###################
# Mancala Capture #
###################

class MancalaCaptureInput(CamelAliasModel):
    player_score: int
    ai_score: int
    player_pockets: List[int]  # List of integers representing the number of pebbles in each of the player's pockets
    ai_pockets: List[int]  # List of integers representing the number of pebbles in each of the AI's pockets
    max_depth: int = 11  # Default search depth

class MancalaCaptureOutput(CamelAliasModel):
    board_states: List[MancalaCaptureBoardState]  # The states of the board after each AI move

@router.post("/mancala_capture")
async def solve_mancala_capture(input: MancalaCaptureInput) -> MancalaCaptureOutput:
    """
    Solve the Mancala Capture puzzle with the provided board state.
    """
    try :
        board_states = run(
            mancala_capture.run, 
            player_score=input.player_score, 
            ai_score=input.ai_score,
            player_pockets=input.player_pockets,
            ai_pockets=input.ai_pockets,
            max_depth=input.max_depth
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in mancala capture:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return MancalaCaptureOutput(board_states=board_states)


class MancalaCapturePlayerMoveInput(CamelAliasModel):
    player_score: int
    ai_score: int
    player_pockets: List[int]  # List of integers representing the number of pebbles in each of the player's pockets
    ai_pockets: List[int]  # List of integers representing the number of pebbles in each of the AI's pockets
    move: int  # The move to play (index of the pocket to pick from)

class MancalaCapturePlayerMoveOutput(CamelAliasModel):
    board_state: MancalaCaptureBoardState  # The state of the board after the player's move

@router.post("/mancala_capture/player_move")
async def evaluate_player_move_mancala_capture(input: MancalaCapturePlayerMoveInput) -> MancalaCapturePlayerMoveOutput:
    """
    Evaluate a player's move in the Mancala Capture game and return the resulting board state.
    """
    try :
        board_state = run(
            mancala_capture.evaluate_player_move, 
            player_score=input.player_score, 
            ai_score=input.ai_score,
            player_pockets=input.player_pockets,
            ai_pockets=input.ai_pockets,
            move=input.move
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in mancala capture player move:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return MancalaCapturePlayerMoveOutput(board_state=board_state)


#####################
# Mancala Avalanche #
#####################

class MancalaAvalancheInput(CamelAliasModel):
    player_score: int
    ai_score: int
    player_pockets: List[int]  # List of integers representing the number of pebbles in each of the player's pockets
    ai_pockets: List[int]  # List of integers representing the number of pebbles in each of the AI's pockets

class MancalaAvalancheOutput(CamelAliasModel):
    board_states: List[MancalaAvalancheBoardState]  # The states of the board after each AI move

@router.post("/mancala_avalanche")
async def solve_mancala_avalanche(input: MancalaAvalancheInput) -> MancalaAvalancheOutput:
    """
    Solve the Mancala Avalanche puzzle with the provided board state.
    """
    try :
        board_states = run(
            mancala_avalanche.run, 
            player_score=input.player_score, 
            ai_score=input.ai_score,
            player_pockets=input.player_pockets,
            ai_pockets=input.ai_pockets
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in mancala avalanche:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return MancalaAvalancheOutput(board_states=board_states)


class MancalaAvalanchePlayerMoveInput(CamelAliasModel):
    player_score: int
    ai_score: int
    player_pockets: List[int]  # List of integers representing the number of pebbles in each of the player's pockets
    ai_pockets: List[int]  # List of integers representing the number of pebbles in each of the AI's pockets
    move: int  # The move to play (index of the pocket to pick from)

class MancalaAvalanchePlayerMoveOutput(CamelAliasModel):
    board_state: MancalaAvalancheBoardState  # The state of the board after the player's move

@router.post("/mancala_avalanche/player_move")
async def evaluate_player_move_mancala_avalanche(input: MancalaAvalanchePlayerMoveInput) -> MancalaAvalanchePlayerMoveOutput:
    """
    Evaluate a player's move in the Mancala Avalanche game and return the resulting board state.
    """
    try :
        board_state = run(
            mancala_avalanche.evaluate_player_move, 
            player_score=input.player_score, 
            ai_score=input.ai_score,
            player_pockets=input.player_pockets,
            ai_pockets=input.ai_pockets,
            move=input.move
        )
    except BackendError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Unexpected error in mancala avalanche player move:", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return MancalaAvalanchePlayerMoveOutput(board_state=board_state)
