from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from typing import List, Dict
import logging
import ai.game_pigeon.anagrams as anagrams
import ai.game_pigeon.word_hunt.word_hunt as word_hunt
from utils.ai_runner import run
from utils.error import BackendError

router = APIRouter()

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