# Kyle Gerner
# 2.24.2021
# Tool for Game Pigeon's 'Word Hunt' puzzle game

from utils.data_store import get_words_tree
from utils.error import BackendError
from ai.game_pigeon.word_hunt.small_square_board import SmallSquareBoard
from ai.game_pigeon.word_hunt.large_square_board import LargeSquareBoard
from ai.game_pigeon.word_hunt.donut_board import DonutBoard
from ai.game_pigeon.word_hunt.cross_board import CrossBoard
from ai.game_pigeon.word_hunt.board import Board
from ai.game_pigeon.word_hunt.letter import Letter
from utils.word_games.words_tree_node import WordsTreeNode
from functools import cmp_to_key
from typing import List, Optional, Set, Dict
from dataclasses import dataclass

# Direction Constants #
UP_LEFT = 0 	# _____________
UP = 1 			# |_0_|_1_|_2_|	<-- direction layout
UP_RIGHT = 2    # |_7_|_X_|_3_|
RIGHT = 3 		# |_6_|_5_|_4_|
DOWN_RIGHT = 4
DOWN = 5
DOWN_LEFT = 6
LEFT = 7
DIRECTIONS = [UP_LEFT, UP, UP_RIGHT, RIGHT, DOWN_RIGHT, DOWN, DOWN_LEFT, LEFT]
########################
ALL_BOARD_CLASSES = [
	SmallSquareBoard, 
	LargeSquareBoard, 
	CrossBoard, 
	DonutBoard
]

DEFAULT_MIN_LENGTH = 3

@dataclass
class WordHuntSolution:
    """
    Class to represent a solution with a word and its positions.
    """
    word: str
    positions: List[int]


def word_compare(a: WordHuntSolution, b: WordHuntSolution) -> int:
	"""
	Compare two words for sorting. Prioritize longer solutions, then alphabetically.
	"""
	if len(a.positions) > len(b.positions):
		return -1
	elif len(a.positions) < len(b.positions):
		return 1
	else:
		if a.word < b.word:
			return -1
		elif a.word > b.word:
			return 1


def is_valid_next_move(letter: Letter) -> bool:
	"""
	Check if the next move is valid based on the letter's position.

	Parameters:
		letter (Letter): The letter object to check.
	Returns:
		bool: True if the move is valid, False otherwise.
	"""
	return not letter.visited


def find_valid_words(
		board: Board, 
		root_node: WordsTreeNode, 
		min_length: Optional[int] = None
	) -> List[WordHuntSolution]:
	"""
	Find all valid words on the board starting from each letter.

	Parameters:
		board (Board): The board object containing letters.
		root_node (WordsTreeNode): The root node of the words tree.
		min_length (Optional[int]): The minimum length of words to consider.
	"""
	solutions = []
	for letter in board.lb:
		letter.markVisited()
		solutions.extend(find_valid_from(
			board, 
			letter.char, 
			letter, 
			[letter.pos], 
			root_node.getChild(letter.char), 
			min_length
		))
		letter.visited = False  # so later iterations don't have it marked already
	return solutions


def find_valid_from(
		board: Board, 
		word: str, 
		current_letter: Letter, 
		positions: List[int], 
		current_node: WordsTreeNode,
		min_length: Optional[int] = None
	) -> List[WordHuntSolution]:
	"""
	Find all valid words starting from a given letter.

	Parameters:
		board (Board): The board object containing letters.
		word (str): The current word being formed.
		current_letter (Letter): The current letter being visited.
		positions (List[int]): The list of positions of letters in the current word.
		current_node (WordsTreeNode): The current node in the words tree.
		min_length (Optional[int]): The minimum length of words to consider.
	"""
	if current_node is None:
		return []
	
	solutions = []
	if current_node.isEndOfWord() and len(positions) >= min_length:
		solutions.append(WordHuntSolution(word, positions.copy()))

	for dir in DIRECTIONS:
		if board.tile_is_available(current_letter.pos, dir):
			# if the letter in the specified direction exists and hasn't been visited
			board_copy = board.copy_board()
			neighbor_letter = board_copy.visit_direction(current_letter.pos, dir)
			new_positions = positions.copy()
			new_positions.append(neighbor_letter.pos)
			solutions.extend(find_valid_from(
				board_copy, 
				word + neighbor_letter.char, 
				neighbor_letter, 
				new_positions, 
				current_node.getChild(neighbor_letter.char), 
				min_length
			))
	return solutions


def transform_to_dict(solutions: Set[WordHuntSolution]) -> dict:
	"""
	Transform a set of WordHuntSolution objects into a dictionary.

	Parameters:
		solutions (Set[WordHuntSolution]): The set of solutions to transform.
	
	Returns:
		dict: A dictionary where keys are words and values are their positions.
	"""
	return {solution.word: solution.positions for solution in solutions}


def get_board_class(board_type: str):
	"""
	Get the board class based on the board type string.

	Parameters:
		board_type (str): The type of the board (e.g., "4x4", "5x5", "cross", "donut").
	
	Returns:
		Board: The corresponding board class.
	Raises:
		BackendError: If the board type is invalid.
	"""
	for cls in ALL_BOARD_CLASSES:
		if cls.name == board_type:
			return cls
		
	raise BackendError(ValueError(f"Invalid board type: {board_type}"))


def run(
		letters: List[str], 
		board_type: str, 
		min_length: int = DEFAULT_MIN_LENGTH
	) -> Dict[str, List[int]]:
	"""
	Run the Word Hunt solver with a given list of letters and board class.
	
	Parameters:
		letters (List[str]): List of letters to populate the board.
		board_type (str): The class of the board to use (e.g., "SmallSquareBoard").
		min_length (int): The minimum length of words to consider.
	"""
	letter_objs = [Letter(letter, i) for i, letter in enumerate(letters)]
	board = get_board_class(board_type)(letter_objs)
	solutions = find_valid_words(board, get_words_tree(), min_length)
	deduped_solutions = list({s.word: s for s in solutions}.values())
	valid_words_sorted = sorted(deduped_solutions, key=cmp_to_key(word_compare))
	return transform_to_dict(valid_words_sorted)
