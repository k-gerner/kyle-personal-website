from ai.game_pigeon.word_hunt.board import Board
from ai.game_pigeon.word_hunt.letter import Letter
from typing import List

# Class representing the donut shaped board
#	     ________________		<-- board index layout
#	 ____|__0_|__1_|__2_|____	_____________
#	|__3_|__4_|__5_|__6_|__7_|	|_0_|_1_|_2_|	<-- direction layout
#	|__8_|__9_|    |_10_|_11_|	|_7_|_X_|_3_|
#	|_12_|_13_|_14_|_15_|_16_|	|_6_|_5_|_4_|
#	     |_17_|_18_|_19_|


class DonutBoard(Board):
	diagram_output_height = 8
	row_sizes = [3, 5, 4, 5, 3]
	name = "donut"

	def __init__(self, letters_arr: List[Letter]):
		super().__init__(letters_arr)

	def peek_upper_left(self, pos: int) -> Letter:
		if pos <= 4 or pos in {8, 12, 15}:
			return -1
		elif pos in {9, 16}:
			return self.lb[pos - 6]
		else:
			return self.lb[pos - 5]

	def peek_up(self, pos: int) -> Letter:
		if pos <= 3 or pos in {7, 14}:
			return -1
		elif pos in {8, 9, 15, 16}:
			return self.lb[pos - 5]
		else:
			return self.lb[pos - 4]

	def peek_upper_right(self, pos: int) -> Letter:
		if pos <= 2 or pos in {6, 7, 11, 13, 16}:
			return -1
		elif pos in {8, 9, 14, 15}:
			return self.lb[pos - 4]
		else:
			return self.lb[pos - 3]

	def peek_right(self, pos: int) -> Letter:
		if pos in {2, 7, 9, 11, 16, 19}:
			return -1
		else:
			return self.lb[pos + 1]

	def peek_lower_right(self, pos: int) -> Letter:
		if pos >= 15 or pos in {4, 7, 11}:
			return -1
		elif pos in {3, 10}:
			return self.lb[pos + 6]
		else:
			return self.lb[pos + 5]

	def peek_down(self, pos: int) -> Letter:
		if pos >= 16 or pos in {5, 12}:
			return -1
		elif pos in {3, 4, 10, 11}:
			return self.lb[pos + 5]
		else:
			return self.lb[pos + 4]

	def peek_lower_left(self, pos: int) -> Letter:
		if pos >= 17 or pos in {3, 6, 8, 12, 13}:
			return -1
		elif pos in {4, 5, 10, 11}:
			return self.lb[pos + 4]
		else:
			return self.lb[pos + 3]

	def peek_left(self, pos: int) -> Letter:
		if pos in {0, 3, 8, 10, 12, 17}:
			return -1
		else:
			return self.lb[pos - 1]
