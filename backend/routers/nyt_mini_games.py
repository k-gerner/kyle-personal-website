from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import ai.nyt.spelling_bee as spelling_bee
import ai.nyt.letter_boxed as letter_boxed
import utils.profiling as pf
from utils.ai_runner import run

router = APIRouter()

class SpellingBeeInput(BaseModel):
    center_letter: str
    outer_letters: List[str]

@router.post("/spelling_bee")
async def solve_spelling_bee(input: SpellingBeeInput):
    """
    Solve the Spelling Bee puzzle with the provided center letter and outer letters.
    """
    lower_outer_letters = {letter.lower() for letter in input.outer_letters}
    valid_words = run(spelling_bee.run, input.center_letter.lower(), lower_outer_letters)
    return {"words": valid_words}


class LetterBoxedInput(BaseModel):
    letter_sides: List[List[str]]
    max_solutions_length: int

@router.post("/letter_boxed")
async def solve_letter_boxed(input: LetterBoxedInput):
    """
    Solve the Letter Boxed puzzle with the provided letter sides.
    """
    lower_letter_sides = [[letter.lower() for letter in side] for side in input.letter_sides]
    letter_sets = [set(side) for side in lower_letter_sides]

    solutions = run(letter_boxed.run, letter_sets, input.max_solutions_length)

    return {"solutions": solutions}