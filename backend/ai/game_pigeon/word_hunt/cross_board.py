from ai.game_pigeon.word_hunt.board import Board
from ai.game_pigeon.word_hunt.letter import Letter
from typing import List

# Class representing the X-Cross shaped board
#	___________    ___________	<-- board index layout
#	|__0_|__1_|____|__2_|__3_|	_____________
#	|__4_|__5_|__6_|__7_|__8_|	|_0_|_1_|_2_|	<-- direction layout
#	 ____|__9_|_10_|_11_|____  	|_7_|_X_|_3_|
#	|_12_|_13_|_14_|_15_|_16_|	|_6_|_5_|_4_|
#	|_17_|_18_|    |_19_|_20_|


class CrossBoard(Board):
	diagram_output_height = 8
	row_sizes = [4, 5, 3, 5, 4]
	name = "cross"

	def __init__(self, letters_arr: List[Letter]):
		super().__init__(letters_arr)

	def peek_upper_left(self, pos: int) -> Letter:
		if pos <= 4 or pos in {7, 12, 13, 17}:
			return -1
		elif pos in {8, 18}:
			return self.lb[pos - 6]
		else:
			return self.lb[pos - 5]

	def peek_up(self, pos: int) -> Letter:
		if pos <= 3 or pos in {6, 12, 16}:
			return -1
		elif pos in {7, 8, 17, 18}:
			return self.lb[pos - 5]
		else:
			return self.lb[pos - 4]

	def peek_upper_right(self, pos: int) -> Letter:
		if pos <= 3 or pos in {5, 8, 15, 16, 20}:
			return -1
		elif pos in {6, 7, 17, 18}:
			return self.lb[pos - 4]
		else:
			return self.lb[pos - 3]

	def peek_right(self, pos: int) -> Letter:
		if pos in {1, 3, 8, 11, 16, 18, 20}:
			return -1
		else:
			return self.lb[pos + 1]

	def peek_lower_right(self, pos: int) -> Letter:
		if pos >= 16 or pos in {3, 7, 8, 13}:
			return -1
		elif pos in {2, 12}:
			return self.lb[pos + 6]
		else:
			return self.lb[pos + 5]

	def peek_down(self, pos: int) -> Letter:
		if pos >= 17 or pos in {4, 8, 14}:
			return -1
		elif pos in {2, 3, 12, 13}:
			return self.lb[pos + 5]
		else:
			return self.lb[pos + 4]

	def peek_lower_left(self, pos: int) -> Letter:
		if pos >= 17 or pos in {0, 4, 5, 12, 15}:
			return -1
		elif pos in {2, 3, 13, 14}:
			return self.lb[pos + 4]
		else:
			return self.lb[pos + 3]

	def peek_left(self, pos: int) -> Letter:
		if pos in {0, 2, 4, 9, 12, 17, 19}:
			return -1
		else:
			return self.lb[pos - 1]
