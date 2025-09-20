# Contains AI strategy
import math  # for infinities
from typing import List, Tuple
import random  # for randomizing valid moves list in minimax
from ai.game_pigeon.mancala.capture.board_functions import get_valid_moves, perform_move, is_board_terminal, push_all_pebbles_to_bank, \
	winning_player_bank_index
from ai.game_pigeon.mancala.capture.constants import TOTAL_PEBBLES, POCKETS_PER_SIDE, BOARD_SIZE, MAX_DEPTH
from ai.game_pigeon.mancala.capture.mancala_player import MancalaPlayer  # super class

# class for the A.I.
class MancalaStrategy(MancalaPlayer):

	def __init__(self, bank_index: int = 13):
		super().__init__(bank_index)
		self.opponent_bank_index = (bank_index + POCKETS_PER_SIDE + 1) % BOARD_SIZE

	def get_move(self, board: List[int], max_depth: int) -> int:
		"""Calculates the best move for the AI for the given board"""
		move, score = -123, -123  # placeholders
		for i in range(1, max_depth + 1):  # iterative deepening
			# this will prioritize game winning move sequences that finish in less moves
			move, score = self.minimax(board, 0, True, -math.inf, math.inf, i)
			if score > 900:
				break
		return move

	def score_board(self, board: List[int]) -> int:
		"""Scores the board"""
		player_bank_score = board[self.bank_index]
		opponent_bank_score = board[self.opponent_bank_index]
		if player_bank_score > TOTAL_PEBBLES / 2:
			player_bank_score += 1000
		elif opponent_bank_score > TOTAL_PEBBLES / 2:
			opponent_bank_score += 1000
		player_pockets = board[self.bank_index - POCKETS_PER_SIDE: self.bank_index]
		opponent_pockets = board[self.opponent_bank_index - POCKETS_PER_SIDE: self.opponent_bank_index]
		player_score = player_bank_score + score_pockets(player_pockets)
		opponent_score = opponent_bank_score + score_pockets(opponent_pockets)
		return player_score - opponent_score

	def minimax(
			self, 
			board: List[int],
			depth: int,
			is_max: bool,
			alpha: float,
			beta: float,
			local_max_depth: int
		) -> Tuple[int, float]:
		"""
		Finds the best move for the current player using the minimax algorithm with alpha-beta pruning
		Parameters:
			board (List[int]): current board state
			depth (int): current depth in the game tree
			is_max (bool): whether the current layer is maximizing or minimizing
			alpha (float): best score that the maximizer currently can guarantee at that level or above
			beta (float): best score that the minimizer currently can guarantee at that level or above
			local_max_depth (int): the maximum depth to search in this call
		Returns:
			move_and_score (Tuple[int, float]): the best move index and its score
		"""
		# random.shuffle(valid_moves)
		if is_board_terminal(board):
			push_all_pebbles_to_bank(board)
			winning_bank_index = winning_player_bank_index(board)
			if winning_bank_index == self.bank_index:
				return None, 2000
			elif winning_bank_index is None:
				return None, 0
			else:
				return None, -2000
		if depth == local_max_depth:
			return None, self.score_board(board)
		if is_max:
			# want to maximize this move
			valid_moves = get_valid_moves(board, self.bank_index)
			score = -math.inf
			best_move = valid_moves[0]  # default best move
			for move in valid_moves:
				board_copy = board.copy()
				perform_move(board_copy, move, self.bank_index)
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
			valid_moves = get_valid_moves(board, self.opponent_bank_index)
			score = math.inf
			best_move_for_opponent = valid_moves[0]
			for move in valid_moves:
				board_copy = board.copy()
				perform_move(board_copy, move, self.opponent_bank_index)
				_, updated_score = self.minimax(board_copy, depth + 1, True, alpha, beta, local_max_depth)
				if updated_score < score:
					score = updated_score
					best_move_for_opponent = move
				beta = min(beta, score)
				if beta <= alpha:
					break  # pruning
			return best_move_for_opponent, score


def score_pockets(pockets: List[int]) -> float:
	"""Assigns a score for the given pocket layout. Favors pebbles further away from player bank"""
	score = 0
	multiplier = 0.3
	step_down = (multiplier - 0.1) / POCKETS_PER_SIDE
	for pebbles in pockets:
		score += pebbles * multiplier
		multiplier -= step_down
	return score
