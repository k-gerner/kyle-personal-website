from ai.game_pigeon.word_hunt.board import Board
from ai.game_pigeon.word_hunt.letter import Letter
from typing import List

# Class representing the 5x5 board
#	__________________________	<-- board index layout
#	|__0_|__1_|__2_|__3_|__4_|	_____________
#	|__5_|__6_|__7_|__8_|__9_|	|_0_|_1_|_2_|	<-- direction layout
#	|_10_|_11_|_12_|_13_|_14_|	|_7_|_X_|_3_|
#	|_15_|_16_|_17_|_18_|_19_|	|_6_|_5_|_4_|
#	|_20_|_21_|_22_|_23_|_24_|


class LargeSquareBoard(Board):
	diagram_output_height = 8
	row_sizes = [5, 5, 5, 5, 5]
	name = "5x5"

	def __init__(self, letters_arr: List[Letter]):
		super().__init__(letters_arr)

	def peek_upper_left(self, pos: int) -> Letter:
		if pos % 5 == 0 or pos <= 4:
			# if on left edge or on upper edge
			return -1
		return self.lb[pos - 6]

	def peek_up(self, pos: int) -> Letter:
		if pos <= 4:
			# if on upper edge
			return -1
		return self.lb[pos - 5]

	def peek_upper_right(self, pos: int) -> Letter:
		if pos <= 4 or pos % 5 == 4:
			# if on upper edge or on right edge
			return -1
		return self.lb[pos - 4]

	def peek_right(self, pos: int) -> Letter:
		if pos % 5 == 4:
			# if on right edge
			return -1
		return self.lb[pos + 1]

	def peek_lower_right(self, pos: int) -> Letter:
		if pos >= 20 or pos % 5 == 4:
			# if on lower edge or on right edge
			return -1
		return self.lb[pos + 6]

	def peek_down(self, pos: int) -> Letter:
		if pos >= 20:
			# if on lower edge
			return -1
		return self.lb[pos + 5]

	def peek_lower_left(self, pos: int) -> Letter:
		if pos % 5 == 0 or pos >= 20:
			# if on left edge or on lower edge
			return -1
		return self.lb[pos + 4]

	def peek_left(self, pos: int) -> Letter:
		if pos % 5 == 0:
			# if on left edge
			return -1
		return self.lb[pos - 1]
	