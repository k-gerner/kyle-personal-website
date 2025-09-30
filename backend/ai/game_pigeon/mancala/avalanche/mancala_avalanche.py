# Kyle Gerner    7.9.2020
# The class that contains the main method that runs the solver.
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
	recent_move: int
	end_in_bank: bool = False


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
) -> List[MancalaAvalancheBoardState]:
	"""
	Main method to run the Mancala Avalanche game client.

	Parameters:
		player_score (int): The score of the player.
		ai_score (int): The score of the AI.
		player_pockets (List[int]): The pockets of the player.
		ai_pockets (List[int]): The pockets of the AI.

	Returns:
		board_states (List[MancalaAvalancheBoardState]): The states of the board after each AI move.
	"""
	ai = AvalanchePlayer(score=ai_score)
	player = AvalanchePlayer(score=player_score)
	board_vals = player_pockets + [player_score] + ai_pockets + [ai_score]
	board = AvalancheBoard(
		pebbles_in_each=board_vals,
		player1=player,
		player2=ai,
		player_one_turn=False
	)
	# _debug_board(board)
	solver = AvalancheSolver(board=board, is_player1=False)
	_, best_moves = solver.find_best_move(board, 0)
	if best_moves is None:
		raise BackendError(ValueError("AI could not find a valid move."))
	board_states = []
	for move in best_moves:
		_, ended_in_bank = solver.make_move(move, board)
		# _debug_board(board)
		board_states.append(MancalaAvalancheBoardState(
			player_score=board.p1.score,
			ai_score=board.p2.score,
			player_pockets=board.pebblesList[0:PLAYER_BANK_INDEX].copy(),
			ai_pockets=board.pebblesList[PLAYER_BANK_INDEX + 1:AI_BANK_INDEX].copy(),
			recent_move=move,
			end_in_bank=ended_in_bank
		))
	return board_states


def evaluate_player_move(
		player_score: int,
		ai_score: int,
		player_pockets: List[int],
		ai_pockets: List[int],
		move: int
	) -> MancalaAvalancheBoardState:
	"""
	Evaluates the player's move and returns the resulting board state.

	Parameters:
		player_score (int): The score of the player.
		ai_score (int): The score of the AI.
		player_pockets (List[int]): The pockets of the player.
		ai_pockets (List[int]): The pockets of the AI.
		move (int): The index of the pocket the player is moving from.

	Returns:
		board_state (MancalaAvalancheBoardState): The state of the board after the player's move.
	"""
	player = AvalanchePlayer(score=player_score)
	ai = AvalanchePlayer(score=ai_score)
	board_vals = player_pockets + [player_score] + ai_pockets + [ai_score]
	board = AvalancheBoard(
		pebbles_in_each=board_vals,
		player1=player,
		player2=ai,
		player_one_turn=True
	)
	if move < 0 or move >= PLAYER_BANK_INDEX or board.pebblesList[move] == 0:
		raise BackendError(ValueError("Invalid move by player."))
	solver = AvalancheSolver(board=board, is_player1=True)
	_, ended_in_bank = solver.make_move(move, board)
	# _debug_board(board)
	return MancalaAvalancheBoardState(
		player_score=board.p1.score,
		ai_score=board.p2.score,
		player_pockets=board.pebblesList[0:PLAYER_BANK_INDEX].copy(),
		ai_pockets=board.pebblesList[PLAYER_BANK_INDEX + 1:AI_BANK_INDEX].copy(),
		recent_move=move,
		end_in_bank=ended_in_bank
	)
