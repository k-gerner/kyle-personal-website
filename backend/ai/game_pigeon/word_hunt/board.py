from ai.game_pigeon.word_hunt.letter import Letter
from typing import List


class Board(object):
	"""
	Base class for different representations of a Word Hunt board.
	Attributes:
		lb (List[Letter]): A list of Letter objects representing the board.
		directionDict (dict): A dictionary mapping direction indices to methods for peeking at letters.
		row_sizes (List[int]): Sizes of each row in the board.
		name (str): Name of the board type.
	"""
	row_sizes = None
	name = None

	def __init__(self, letters_arr: List[Letter]):
		"""
		Parameters:
			letters_arr (List[Letter]): An array of Letter objects that represent the board
		"""
		self.lb = letters_arr  # lb = letter board
		self.directionDict = {
			0: self.peek_upper_left,
			1: self.peek_up,
			2: self.peek_upper_right,
			3: self.peek_right,
			4: self.peek_lower_right,
			5: self.peek_down,
			6: self.peek_lower_left,
			7: self.peek_left
		}

	def copy_board(self) -> 'Board':
		"""
		Creates a copy of the board with new Letter objects

		Returns:
			Board: a 'deep copy' of the board
		"""
		new_arr = []
		for i in self.lb:
			new_arr.append(i.copyLetter())
		return self.__class__(new_arr)

	def peek_upper_left(self, pos: int) -> Letter:
		"""
		Look at letter to the upper left but do not mark as visited.

		Parameters:
			pos (int): the position to look from
		Returns:
			Letter: Letter or -1
		"""
		raise NotImplementedError

	def peek_up(self, pos: int) -> Letter:
		"""
		Look at letter above but do not mark as visited.

		Parameters:
			pos (int): the position to look from
		Returns:
			Letter: Letter or -1
		"""
		raise NotImplementedError

	def peek_upper_right(self, pos: int) -> Letter:
		"""
		Look at letter to the upper right but do not mark as visited.

		Parameters:
			pos (int): the position to look from
		Returns:
			Letter: Letter or -1
		"""
		raise NotImplementedError

	def peek_right(self, pos: int) -> Letter:
		"""
		Look at letter to the right but do not mark as visited.

		Parameters:
			pos (int): the position to look from
		Returns:
			Letter: Letter or -1
		"""
		raise NotImplementedError

	def peek_lower_right(self, pos: int) -> Letter:
		"""
		Look at letter to the lower right but do not mark as visited.

		Parameters:
			pos (int): the position to look from
		Returns:
			Letter: Letter or -1
		"""
		raise NotImplementedError

	def peek_down(self, pos: int) -> Letter:
		"""
		Look at letter below but do not mark as visited.

		Parameters:
			pos (int): the position to look from
		Returns:
			Letter: Letter or -1
		"""
		raise NotImplementedError

	def peek_lower_left(self, pos: int) -> Letter:
		"""
		Look at letter to the lower left but do not mark as visited.

		Parameters:
			pos (int): the position to look from
		Returns:
			Letter: Letter or -1
		"""
		raise NotImplementedError

	def peek_left(self, pos: int) -> Letter:
		"""
		Look at letter to the left but do not mark as visited.

		Parameters:
			pos (int): the position to look from
		Returns:
			Letter: Letter or -1
		"""
		raise NotImplementedError
	

	def tile_is_available(self, pos: int, direction: int) -> bool:
		"""
		Check if the letter in the specified direction exists and hasn't been visited.

		Parameters:
			pos (int): the position to check from
			direction (int): the direction to check in, 0-7, starting from upper left and going clockwise

		Returns:
			bool: True if the letter exists and hasn't been visited, False otherwise.
		"""
		visited_letter = self.directionDict[direction](pos)
		return visited_letter != -1 and not visited_letter.visited


	def visit_direction(self, pos: int, direction: int) -> Letter:
		"""
		Look at letter in specified direction and mark as visited.

		Parameters:
			pos (int): the position to look from
			direction (int): the direction to look in, 0-7, starting from upper left and going clockwise
		"""
		visited_letter = self.directionDict[direction](pos)
		visited_letter.markVisited()
		return visited_letter
