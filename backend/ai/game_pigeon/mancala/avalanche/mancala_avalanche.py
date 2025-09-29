# Kyle Gerner    7.9.2020
# The class that contains the main method that runs the solver. Also contains
from typing import List
from dataclasses import dataclass
from ai.game_pigeon.mancala.avalanche.classes import AvalancheBoard, AvalanchePlayer, AvalancheSolver
from ai.game_pigeon.mancala.avalanche.constants import PLAYER_BANK_INDEX, AI_BANK_INDEX
from utils.error import BackendError


ONE_BY_ONE = 1
ALL_AT_ONCE = 2


@dataclass
class MancalaAvalancheBoardState:
	"""Class to represent the state of the board"""
	player_score: int
	ai_score: int
	player_pockets: List[int]
	ai_pockets: List[int]
	moves: List[int]


def create_solver(pocket_pebbles: List[int]) -> AvalancheSolver:
	"""Creates the AvalancheSolver object"""
	p1 = AvalanchePlayer()
	p2 = AvalanchePlayer()
	board = AvalancheBoard(pocket_pebbles, p1, p2, True)
	solver = AvalancheSolver(board)
	return solver


def _debug_board(board: AvalancheBoard):
	print(board)


def run(
		player_score: int,
		ai_score: int,
		player_pockets: List[int],
		ai_pockets: List[int],
) -> MancalaAvalancheBoardState:
	"""
	Main method to run the Mancala Avalanche game client.

	Parameters:
		player_score (int): The score of the player.
		ai_score (int): The score of the AI.
		player_pockets (List[int]): The pockets of the player.
		ai_pockets (List[int]): The pockets of the AI.

	Returns:
		board_state (MancalaAvalancheBoardState): The state of the board after all AI moves.
	"""
	ai = AvalanchePlayer()
	player = AvalanchePlayer()
	board_vals = player_pockets + [player_score] + ai_pockets + [ai_score]
	board = AvalancheBoard(board_vals, ai, player, True)
	_debug_board(board)
	solver = AvalancheSolver(board)
	best_moves = solver.find_best_move(board, 0)[1]
	if best_moves is None:
		raise BackendError(ValueError("AI could not find a valid move."))
	points_gained = solver.make_moves_on_moveset(best_moves, board)
	_debug_board(board)
	board_state = MancalaAvalancheBoardState(
		player_score=board.p2.score,
		ai_score=board.p1.score,
		player_pockets=board_vals[0:PLAYER_BANK_INDEX].copy(),
		ai_pockets=board_vals[PLAYER_BANK_INDEX + 1:AI_BANK_INDEX].copy(),
		moves=best_moves
	)
	return board_state