# Kyle Gerner
# 3.12.2021
# Tool for Game Pigeon's 'Word Bites' puzzle game

from utils.data_store import get_words_tree
from utils.error import BackendError
from utils.word_games.words_tree_node import WordsTreeNode
from functools import cmp_to_key
from typing import List, Optional
from dataclasses import dataclass

# directional constants
HORIZONTAL = 'H'
VERTICAL = 'V'

# display mode constants
LIST = 0
DIAGRAM = 1

# globals
MAX_LENGTHS = {HORIZONTAL: 8, VERTICAL: 9}  # max length of the words in each direction
DISPLAY_MODE = DIAGRAM  # default display mode
horizPieces = []  # list of horizontal letter groupings
vertPieces = []   # list of vertical letter groupings
singleLetterPieces = []  # list of letter groupings made up of a single letter
englishWords = set()  # LARGE set that will contain every possible word. Using set for O(1) lookup
wordStarts = set()  # set that holds every starting character sequence of every valid word
validWordsOnly = set()  # set of only the valid word strings (no tuple pairing)
validsWithDetails = set()  # contains the words and direction, as well as index of list of pieces from piecesList if in DIAGRAM mode
piecesList = []  # used to keep the list of pieces for a valid word (in DIAGRAM mode), since lists cannot be hashed in the set

DEFAULT_MIN_LENGTH = 3

@dataclass(frozen=True)
class SolutionPiece:
	"""
	Class to represent a letter grouping in the solution.
	"""
	letters: str
	indices_in_use: List[int]

@dataclass
class WordBitesSolution:
	"""
	Class to represent a solution.
	"""
	word: str
	horizontal: bool
	pieces: List[SolutionPiece]


def build_word_bites_solutions(solutions_list: List[List[SolutionPiece]], is_horizontal: bool) -> List[WordBitesSolution]:
	"""
	Build WordBitesSolution objects from the list of solutions.

	Parameters:
		solutions_list (List[List[SolutionPiece]]): List of solutions represented as lists of SolutionPiece.
		is_horizontal (bool): Whether the solutions are horizontal or vertical.
	
	Returns:
		List[WordBitesSolution]: List of WordBitesSolution objects.
	"""
	word_bites_solutions = []
	for solution in solutions_list:
		word = ''
		for piece in solution:
			for index in piece.indices_in_use:
				word += piece.letters[index]
		word_bites_solutions.append(WordBitesSolution(word=word, horizontal=is_horizontal, pieces=solution))
	return word_bites_solutions



def find_words(
		single_pieces: List[str],
		horizontal_pieces: List[str],
		vertical_pieces: List[str],
		root_node: WordsTreeNode,
		min_length: Optional[int]
) -> List[WordBitesSolution]:
	"""
	Find all the valid words for a board given the pieces and the root node of the words tree.

	Parameters:
		single_pieces (List[str]): List of single letter pieces.
		horizontal_pieces (List[str]): List of horizontal letter groupings (each is 2 letters).
		vertical_pieces (List[str]): List of vertical letter groupings (each is 2 letters).
		root_node (WordsTreeNode): The root node of the words tree.
		min_length (Optional[int]): The minimum length of words to consider.
	"""
	solutions = []
	horizontal_solutions = find_words_in_direction(
		single_pieces=single_pieces, 
		one_of_pieces=vertical_pieces, 
		both_of_pieces=horizontal_pieces, 
		solution_pieces=[], 
		min_length=min_length, 
		current_node=root_node
	)
	vertical_solutions = find_words_in_direction(
		single_pieces=single_pieces, 
		one_of_pieces=horizontal_pieces, 
		both_of_pieces=vertical_pieces, 
		solution_pieces=[], 
		min_length=min_length, 
		current_node=root_node
	)
	solutions.extend(build_word_bites_solutions(horizontal_solutions, is_horizontal=True))
	solutions.extend(build_word_bites_solutions(vertical_solutions, is_horizontal=False))
	return solutions


def find_words_in_direction(
		single_pieces: List[str], 
		one_of_pieces: List[str], 
		both_of_pieces: List[str], 
		solution_pieces: List[SolutionPiece],
		min_length: Optional[int],
		current_node: WordsTreeNode,
	) -> List[List[SolutionPiece]]:
	"""
	Find all the valid words for a board in a certain direction.

	Parameters:
		single_pieces (List[str]): List of single letter pieces.
		one_of_pieces (List[str]): List of pieces in which only one letter can be used if part of solution.
		both_of_pieces (List[str]): List of pieces in which both letters must be used if part of solution.
		solution_pieces (List[SolutionPiece]): The current solution pieces being formed.
		min_length (Optional[int]): The minimum length of words to consider.
		current_node (WordsTreeNode): The current node in the words tree.
	Returns:
		List[List[SolutionPiece]]: List of solutions represented as lists of SolutionPiece.
	"""
	if current_node is None:
		return []
	
	solutions = []
	if current_node.isEndOfWord() and (min_length is None or sum(len(piece.indices_in_use) for piece in solution_pieces) >= min_length):
		# shallow copy is okay because SolutionPiece is immutable
		solutions.append(solution_pieces.copy())

	for piece_index, letter in enumerate(single_pieces):
		new_single_pieces = single_pieces[:piece_index] + single_pieces[piece_index+1:]
		next_node = current_node.getChild(letter)
		new_solution_pieces = solution_pieces.copy()
		new_solution_pieces.append(SolutionPiece(letters=letter, indices_in_use=[0]))
		solutions_from_expansion = find_words_in_direction(
			new_single_pieces, one_of_pieces, both_of_pieces, new_solution_pieces, min_length, next_node
		)
		solutions.extend(solutions_from_expansion)
	
	for piece_index, piece in enumerate(one_of_pieces):
		new_one_of_pieces = one_of_pieces[:piece_index] + one_of_pieces[piece_index+1:]
		for letter_index in range(2):
			# letter_index 0 is first letter, 1 is second letter
			next_node = current_node.getChild(piece[letter_index])
			new_solution_pieces = solution_pieces.copy()
			new_solution_pieces.append(SolutionPiece(letters=piece, indices_in_use=[letter_index]))
			solutions_from_expansion = find_words_in_direction(
				single_pieces, new_one_of_pieces, both_of_pieces, new_solution_pieces, min_length, next_node
			)
			solutions.extend(solutions_from_expansion)

	for piece_index, piece in enumerate(both_of_pieces):
		new_both_of_pieces = both_of_pieces[:piece_index] + both_of_pieces[piece_index+1:]
		intermediate_node = current_node.getChild(piece[0])
		if intermediate_node is None:
			continue
		next_node = intermediate_node.getChild(piece[1])
		new_solution_pieces = solution_pieces.copy()
		new_solution_pieces.append(SolutionPiece(letters=piece, indices_in_use=[0, 1]))
		solutions_from_expansion = find_words_in_direction(
			single_pieces, one_of_pieces, new_both_of_pieces, new_solution_pieces, min_length, next_node
		)
		solutions.extend(solutions_from_expansion)

	return solutions


def word_compare(a: WordBitesSolution, b: WordBitesSolution) -> int:
	"""
	Compare two words for sorting. Prioritize longer solutions, then alphabetically.
	"""	
	if len(a.word) > len(b.word):
		return -1
	elif len(a.word) < len(b.word):
		return 1
	else:
		if a.word < b.word:
			return -1
		elif a.word > b.word:
			return 1


def transform_to_dict(solutions: List[WordBitesSolution]) -> List[dict]:
	"""
	Transform the list of WordBitesSolution objects into a list of dictionaries.
	
	Parameters:
		solutions (List[WordBitesSolution]): List of WordBitesSolution objects.
	
	Returns:
		List[dict]: List of dictionaries representing the solutions.
	"""
	return [
		{
			'word': solution.word,
			'horizontal': solution.horizontal,
			'pieces': [
				{
					'letters': piece.letters, 
					'indices_in_use': piece.indices_in_use
				} for piece in solution.pieces
			]
		}
		for solution in solutions
	]


def validate_input(single_pieces: List[str], horizontal_pieces: List[str], vertical_pieces: List[str]):
	"""
	Validate the input pieces for the Word Bites solver.
	
	Parameters:
		single_pieces (List[str]): List of single letter pieces.
		horizontal_pieces (List[str]): List of horizontal letter groupings (each is 2 letters).
		vertical_pieces (List[str]): List of vertical letter groupings (each is 2 letters).
	
	Raises:
		BackendError: If any input is invalid.
	"""
	for piece in single_pieces:
		if not piece.isalpha() or not piece.islower() or len(piece) != 1:
			raise BackendError(ValueError(f"Invalid single letter piece: {piece}. Each piece must be a single lowercase letter."))
	for piece in horizontal_pieces:
		if not piece.isalpha() or not piece.islower() or len(piece) != 2:
			raise BackendError(ValueError(f"Invalid horizontal piece: {piece}. Each piece must be two lowercase letters."))
	for piece in vertical_pieces:
		if not piece.isalpha() or not piece.islower() or len(piece) != 2:
			raise BackendError(ValueError(f"Invalid horizontal piece: {piece}. Each piece must be two lowercase letters."))


def run(
		single_pieces: List[str], 
		horizontal_pieces: List[str], 
		vertical_pieces: List[str], 
		min_length: int = DEFAULT_MIN_LENGTH
	) -> List[dict]:
	"""
	Run the Word Bites solver with the given pieces.
	
	Parameters:
		single_pieces (List[str]): List of single letter pieces.
		horizontal_pieces (List[str]): List of horizontal letter groupings (each is 2 letters).
		vertical_pieces (List[str]): List of vertical letter groupings (each is 2 letters).
		min_length (int): The minimum length of words to consider.
	"""
	validate_input(single_pieces, horizontal_pieces, vertical_pieces)
	solutions = find_words(
		single_pieces=single_pieces,
		horizontal_pieces=horizontal_pieces,
		vertical_pieces=vertical_pieces,
		root_node=get_words_tree(),
		min_length=min_length
	)
	deduped_solutions = list({s.word: s for s in solutions}.values())
	ordered_solutions = sorted(deduped_solutions, key=cmp_to_key(word_compare))
	return transform_to_dict(ordered_solutions)
