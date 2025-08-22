# strategy.py sort of working
# Kyle Gerner 3.18.21
# Contains AI strategy and board manipulation methods

from typing import List, Union, Tuple
from typing_extensions import Annotated
import math  # for infinities
import random  # for randomizing valid moves list in minimax
from ai.game_pigeon.connect4.connect4_player import Connect4Player  # super class
from ai.game_pigeon.connect4.enums import BoardSpace, PlayerBoardSpace
from ai.game_pigeon.connect4.constants import NUM_ROWS, NUM_COLS


MAX_DEPTH = 6  # max number of moves ahead to calculate
WIN_SCORE = 1000000  # large enough to always be the preferred outcome


class Connect4Strategy(Connect4Player):

	def __init__(self, color: PlayerBoardSpace):
		super().__init__(color)
		self.AI_COLOR = color
		self.HUMAN_COLOR = opponent_of(color)

	def get_move(self, board: List[List[str]], max_depth: int) -> Union[int, None]:
		"""
		Calculates the best move for the AI based on the current board state.

		Parameters:
			board (List[List[str]]): The current game board
			max_depth (int): The maximum depth to search for the AI strategy
		Returns:
			int | None: The column index for the AI's move, or None if no valid moves
		"""
		move, score = -123, -123  # placeholders
		for i in range(1, max_depth + 1):  # iterative deepening
			# this will prioritize game winning move sequences that finish in less moves
			move, score = self.minimax(board, 0, True, -math.inf, math.inf, i)
			if score == WIN_SCORE:
				break
		return move

	def minimax(
			self, 
			board: List[List[str]], 
			depth: int, 
			is_max: bool, 
			alpha: int, 
			beta: int, 
			local_max_depth: int
		) -> Tuple[Union[int, None], int]:
		"""
		Recursively finds the best move for a given board

		Parameters:
			board (List[List[str]]): The current game board
			depth (int): The current depth in the recursion
			is_max (bool): True if maximizing player's turn, False if minimizing player's turn
			alpha (int): The best score that the maximizing player can guarantee at this level or above
			beta (int): The best score that the minimizing player can guarantee at this level or above
			local_max_depth (int): The maximum depth to search for this call
		Returns:
			tuple[int | None, int]: A tuple where the first element is the best move (or None if no valid moves),
									  and the second element is the score of that move
		"""
		valid_moves = get_valid_moves(board)
		random.shuffle(valid_moves)
		game_over, winner = check_if_game_over(board)
		if game_over:
			if winner == self.AI_COLOR:
				return None, WIN_SCORE
			elif winner == self.HUMAN_COLOR:
				return None, -1 * WIN_SCORE
			else:
				# no winner
				return None, 0
		if depth == local_max_depth:
			return None, score_board(board, self.AI_COLOR)
		if is_max:
			# want to maximize this move
			score = -math.inf
			best_move = valid_moves[0]  # default best move
			for move in valid_moves:
				board_copy = copy_of_board(board)
				perform_move(board_copy, move, self.AI_COLOR)
				_, updated_score = self.minimax(board_copy, depth + 1, False, alpha, beta, local_max_depth)
				if updated_score > score:
					score = updated_score
					best_move = move
				alpha = max(alpha, score)
				if alpha >= beta:
					break  # pruning
			return best_move, score
		else:
			# want to minimize this move
			score = math.inf
			best_move_for_human = valid_moves[0]
			for move in valid_moves:
				board_copy = copy_of_board(board)
				perform_move(board_copy, move, self.HUMAN_COLOR)
				_, updated_score = self.minimax(board_copy, depth + 1, True, alpha, beta, local_max_depth)
				if updated_score < score:
					score = updated_score
					best_move_for_human = move
				beta = min(beta, score)
				if beta <= alpha:
					break  # pruning
			return best_move_for_human, score


def score_board(board: List[List[str]], color: PlayerBoardSpace) -> int:
	"""
	Scores the entire board for a given color

	Parameters:
		board (List[List[str]]): The game board
		color (PlayerBoardSpace): The color to score for

	Returns:
		int: The score of the board for the given color
	"""
	score = 0

	# Give a slight bonus to pieces in the center column
	for r in range(NUM_ROWS):
		if board[r][NUM_COLS // 2] == color:
			score += 2

	# Check horizontal
	for c in range(NUM_COLS - 3):
		for r in range(NUM_ROWS):
			score += score_section(board[r][c:c + 4], color)

	# Check vertical
	for c in range(NUM_COLS):
		for r in range(NUM_ROWS - 3):
			section = []
			for i in range(4):
				section.append(board[r + i][c])
			score += score_section(section, color)

	# Check diagonal from bottom left to top right
	for c in range(NUM_COLS - 3):
		for r in range(NUM_ROWS - 3):
			section = []
			for i in range(4):
				section.append(board[r + i][c + i])
			score += score_section(section, color)

	# Check diagonal from bottom right to top left
	for c in range(NUM_COLS - 3):
		for r in range(3, NUM_ROWS):
			section = []
			for i in range(4):
				section.append(board[r - i][c + i])
			score += score_section(section, color)

	return score


def score_section(section: Annotated[List[str], 4], color: PlayerBoardSpace) -> int:
	"""
	Scores a given length 4 section of the board

	Parameters:
		section (List[str]): A length 4 list representing a section of the board
		color (PlayerBoardSpace): The color to score for
	Returns:
		int: The score of the section
	"""
	opponent_color = opponent_of(color)
	num_my_color = section.count(color)
	num_opp_color = section.count(opponent_color)
	num_empty = section.count(BoardSpace.EMPTY)

	if num_my_color == 4:
		return WIN_SCORE
	elif num_my_color == 3 and num_empty == 1:
		return 10
	elif num_my_color == 2 and num_empty == 2:
		return 5
	elif num_opp_color == 3 and num_empty == 1:
		return -8
	elif num_opp_color == 2 and num_empty == 2:
		return -3
	else:
		return 0


def find_winner(board: List[List[str]]) -> Union[PlayerBoardSpace, None]:
	"""
	Determines if there is a winner on the board

	Returns:
		PlayerBoardSpace | None: The color of the winner if there is one, otherwise None
	"""
	# Check horizontal
	for c in range(NUM_COLS - 3):
		for r in range(NUM_ROWS):
			if board[r][c] == board[r][c + 1] == board[r][c + 2] == board[r][c + 3] != BoardSpace.EMPTY:
				return board[r][c]

	# Check vertical
	for c in range(NUM_COLS):
		for r in range(NUM_ROWS - 3):
			if board[r][c] == board[r + 1][c] == board[r + 2][c] == board[r + 3][c] != BoardSpace.EMPTY:
				return board[r][c]

	# Check diagonal from bottom left to top right
	for c in range(NUM_COLS - 3):
		for r in range(NUM_ROWS - 3):
			if board[r][c] == board[r + 1][c + 1] == board[r + 2][c + 2] == board[r + 3][c + 3] != BoardSpace.EMPTY:
				return board[r][c]

	# Check diagonal from bottom right to top left
	for c in range(NUM_COLS - 3):
		for r in range(3, NUM_ROWS):
			if board[r][c] == board[r - 1][c + 1] == board[r - 2][c + 2] == board[r - 3][c + 3] != BoardSpace.EMPTY:
				return board[r][c]

	return None


def is_valid_move(board, col: int) -> bool:
	"""Checks if the column is full"""
	return board[NUM_ROWS - 1][col] == BoardSpace.EMPTY


def get_valid_moves(board: List[List[str]]) -> List[int]:
	"""Checks which columns are valid moves"""
	valid_cols = []
	for c in range(NUM_COLS):
		if is_valid_move(board, c):
			valid_cols.append(c)
	return valid_cols


def check_if_game_over(board: List[List[str]]) -> Tuple[bool, Union[str, None]]:
	"""
	Determine whether the game is over

	Parameters:
		board (List[List[str]]): The game board

	Returns:
		tuple[bool, str | None]: A tuple where the first element is True if the game is over,
								  and the second element is the winning color (None if no winner)
	"""
	winner = find_winner(board)
	if winner is not None:
		return True, winner
	elif len(get_valid_moves(board)) == 0:
		return True, None
	else:
		return False, None


def opponent_of(color: PlayerBoardSpace) -> PlayerBoardSpace:
	"""Get the opposing color"""
	return BoardSpace.RED if color == BoardSpace.YELLOW else BoardSpace.YELLOW


def perform_move(board: List[List[str]], col: int, color: PlayerBoardSpace) -> None:
	"""
	Performs a given move on the board

	Parameters:
		board (List[List[str]]): The game board
		col (int): The column to place the piece in
		color (PlayerBoardSpace): The color of the piece to place
	"""
	row_of_placement = 0
	for row in board:
		if row[col] == BoardSpace.EMPTY:
			break
		row_of_placement += 1
	board[row_of_placement][col] = color


def copy_of_board(board: List[List[str]]) -> List[List[str]]:
	"""Creates a copy of the given board"""
	return list(map(list, board))
