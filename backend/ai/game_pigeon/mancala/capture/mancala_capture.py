# Kyle Gerner
# Started 11.19.2022
# Mancala Capture, client facing
from typing import List
from dataclasses import dataclass
from ai.game_pigeon.mancala.capture.board_functions import get_index_of_opposite_hole, push_all_pebbles_to_bank, winning_player_bank_index, \
	is_board_terminal, perform_move
from ai.game_pigeon.mancala.capture.constants import POCKETS_PER_SIDE, BOARD_OUTPUT_HEIGHT, PLAYER_BANK_INDEX, AI_BANK_INDEX, \
	SIDE_INDENT_STR, LEFT_SIDE_ARROW, RIGHT_SIDE_ARROW, BOARD_SIZE, MAX_DEPTH
from ai.game_pigeon.mancala.capture.mancala_capture_strategy import MancalaStrategy

PLAYER_ID = 1
AI_ID = 2

@dataclass
class MancalaCaptureBoardState:
	"""Class to represent the state of the board"""
	player_score: int
	ai_score: int
	player_pockets: List[int]
	ai_pockets: List[int]
	recent_move: int
	end_in_bank: bool = False


def _debug_board(board, player_id=None, move=None):
	"""Prints the game board"""
	# orientation
	arrow_index = -1
	top_bank_index = AI_BANK_INDEX
	bottom_bank_index = PLAYER_BANK_INDEX
	left_side_player_id = PLAYER_ID
	top_left_pocket_index = 0
	if move is not None:
		arrow_index = move if move < POCKETS_PER_SIDE else get_index_of_opposite_hole(move)

	print()
	print(SIDE_INDENT_STR + " " * 5 + "AI")
	print(SIDE_INDENT_STR + " " * 5 + f"{board[top_bank_index]}")  # top bank
	print(SIDE_INDENT_STR + "___________")
	for index in range(top_left_pocket_index, top_left_pocket_index + POCKETS_PER_SIDE):
		left_side_str_prefix = SIDE_INDENT_STR  # may change to arrow
		right_side_str_suffix = ""  # may change to arrow
		if index == arrow_index:
			if player_id == left_side_player_id:
				left_side_str_prefix = LEFT_SIDE_ARROW
			else:
				right_side_str_suffix = RIGHT_SIDE_ARROW

		left_side_str = left_side_str_prefix + " " * 2 \
					  + f"{board[index]}" \
					  + (" " if board[index] >= 10 else "  ")
		right_side_str = (" " if board[get_index_of_opposite_hole(index)] >= 10 else "  ") \
					   + f"{board[get_index_of_opposite_hole(index)]}" \
					   + right_side_str_suffix
		print(SIDE_INDENT_STR + "     |     ")
		print(left_side_str + str(min(index, get_index_of_opposite_hole(index)) + 1) + right_side_str)
		print(SIDE_INDENT_STR + "_____|_____")
	print("\n" + SIDE_INDENT_STR + " " * 5 + f"{board[bottom_bank_index]}")  # bottom bank
	print(SIDE_INDENT_STR + " " * 5 + "Player\n")


def opponent_of(player_id):
	"""Gets the id opponent of the given id"""
	return PLAYER_ID if player_id == AI_ID else AI_ID


def build_board(player_score: int,
		ai_score: int,
		player_pockets: List[int],
		ai_pockets: List[int]) -> List[int]:
	"""Builds the board list from the given parameters"""
	return player_pockets + [player_score] + ai_pockets + [ai_score]


def run(
		player_score: int,
		ai_score: int,
		player_pockets: List[int],
		ai_pockets: List[int],
		max_depth: int = MAX_DEPTH
	) -> List[MancalaCaptureBoardState]:
	"""
	Main method to run the Mancala Capture game client.

	Parameters:
		player_score (int): The score of the player.
		ai_score (int): The score of the AI.
		player_pockets (List[int]): The pockets of the player.
		ai_pockets (List[int]): The pockets of the AI.
		max_depth (int): The maximum search depth for the AI strategy.

	Returns:
		board_states (List[MancalaCaptureBoardState]): The states of the board after each AI move.
	"""
	
	ai = MancalaStrategy(AI_BANK_INDEX)
	board = build_board(player_score, ai_score, player_pockets, ai_pockets)
	_debug_board(board, player_id=AI_ID)
	move = ai.get_move(board, max_depth)
	board_states = []
	final_pebble_location = perform_move(board, move, ai.bank_index)
	board_states.append(MancalaCaptureBoardState(
		player_score=board[PLAYER_BANK_INDEX],
		ai_score=board[AI_BANK_INDEX],
		player_pockets=board[0:PLAYER_BANK_INDEX].copy(),
		ai_pockets=board[PLAYER_BANK_INDEX + 1:AI_BANK_INDEX].copy(),
		recent_move=move
	))
	while final_pebble_location == ai.bank_index and not is_board_terminal(board):
		board_states[-1].end_in_bank = True
		print("AI's move ended in their bank, so they get another turn.\n")
		_debug_board(board, player_id=AI_ID, move=move)
		move = ai.get_move(board, max_depth)
		final_pebble_location = perform_move(board, move, ai.bank_index)
		board_states.append(MancalaCaptureBoardState(
			player_score=board[PLAYER_BANK_INDEX],
			ai_score=board[AI_BANK_INDEX],
			player_pockets=board[0:PLAYER_BANK_INDEX].copy(),
			ai_pockets=board[PLAYER_BANK_INDEX + 1:AI_BANK_INDEX].copy(),
			recent_move=move
		))
	_debug_board(board, player_id=AI_ID, move=move)
	return board_states


def evaluate_player_move(
		player_score: int,
		ai_score: int,
		player_pockets: List[int],
		ai_pockets: List[int],
		move: int
	) -> MancalaCaptureBoardState:
	"""
	Plays the given move for the AI on the given board state.

	Parameters:
		player_score (int): The score of the player.
		ai_score (int): The score of the AI.
		player_pockets (List[int]): The pockets of the player.
		ai_pockets (List[int]): The pockets of the AI.
		move (int): The move to play.

	Returns:
		board_state (MancalaCaptureBoardState): The state of the board after the player's move.
	"""

	board = build_board(player_score, ai_score, player_pockets, ai_pockets)
	final_pebble_location = perform_move(board, move, PLAYER_BANK_INDEX)
	_debug_board(board, player_id=PLAYER_ID, move=move)
	ended_in_bank = False
	if final_pebble_location == PLAYER_BANK_INDEX and not is_board_terminal(board):
		ended_in_bank = True
	return MancalaCaptureBoardState(
		player_score=board[PLAYER_BANK_INDEX],
		ai_score=board[AI_BANK_INDEX],
		player_pockets=board[0:PLAYER_BANK_INDEX].copy(),
		ai_pockets=board[PLAYER_BANK_INDEX + 1:AI_BANK_INDEX].copy(),
		recent_move=move,
		end_in_bank=ended_in_bank
	)
