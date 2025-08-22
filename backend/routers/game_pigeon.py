from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from typing import List, Dict
import logging
import ai.game_pigeon.anagrams as anagrams
import ai.game_pigeon.word_hunt.word_hunt as word_hunt
import ai.game_pigeon.word_bites.word_bites as word_bites
from utils.ai_runner import run
from utils.error import BackendError

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
class WordBitesInput(BaseModel):
    single_pieces: List[str]
    horizontal_pieces: List[str]
    vertical_pieces: List[str]
    min_length: int = 3
    max_length_horizontal: int = 8
    max_length_vertical: int = 9

    @validator("single_pieces", "horizontal_pieces", "vertical_pieces", pre=True)
    def ensure_lowercase(cls, value: List[str]) -> List[str]:
        return [letter.lower() for letter in value]

class WordBitesSolutionPiece(BaseModel):
    letters: str
    indices_in_use: List[int]  # indices of the letters that are in use in the solution
    
class WordBitesSolution(BaseModel):
    word: str
    pieces: List[WordBitesSolutionPiece]
    horizontal: bool
    
class WordBitesOutput(BaseModel):
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