from fastapi import APIRouter
from pydantic import BaseModel, validator
from typing import List, Dict
import ai.game_pigeon.anagrams as anagrams
from utils.ai_runner import run

router = APIRouter()

class AnagramsInput(BaseModel):
    letters: List[str]

    @validator("letters", pre=True)
    def ensure_lowercase(cls, value: List[str]) -> List[str]:
        return [letter.lower() for letter in value]

@router.post("/anagrams")
async def solve_anagrams(input: AnagramsInput) -> Dict[str, List[str]]:
    """
    Solve the Anagrams puzzle with the provided letters.
    """
    valid_anagrams = run(anagrams.run, input.letters)
    return {"words": valid_anagrams}