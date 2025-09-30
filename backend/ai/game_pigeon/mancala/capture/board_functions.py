# Contains board manipulation methods
from typing import List, Union
from ai.game_pigeon.mancala.capture.constants import PLAYER_BANK_INDEX, AI_BANK_INDEX, POCKETS_PER_SIDE, BOARD_SIZE
from utils.error import BackendError


def push_all_pebbles_to_bank(board: List[int]):
    """Called when one side of the board has 0 pebbles. Moves all pebbles to the corresponding bank"""
    player_pebbles = 0
    for index, num_pebbles in enumerate(board[:PLAYER_BANK_INDEX]):
        player_pebbles += num_pebbles
        board[PLAYER_BANK_INDEX - POCKETS_PER_SIDE + index] = 0
    board[PLAYER_BANK_INDEX] += player_pebbles
    ai_pebbles = 0
    for index, num_pebbles in enumerate(board[PLAYER_BANK_INDEX + 1: AI_BANK_INDEX]):
        ai_pebbles += num_pebbles
        board[AI_BANK_INDEX - POCKETS_PER_SIDE + index] = 0
    board[AI_BANK_INDEX] += ai_pebbles


def is_board_terminal(board: List[int]) -> bool:
    """Checks if the board state represents games over"""
    return sum(board[:PLAYER_BANK_INDEX]) == 0 or sum(board[PLAYER_BANK_INDEX + 1: AI_BANK_INDEX]) == 0


def winning_player_bank_index(board: List[int]) -> Union[int, None]:
    """Returns the bank index of the player with the most pebbles, or none if it's tied"""
    if board[PLAYER_BANK_INDEX] > board[AI_BANK_INDEX]:
        return PLAYER_BANK_INDEX
    elif board[PLAYER_BANK_INDEX] < board[AI_BANK_INDEX]:
        return AI_BANK_INDEX
    else:
        return None


def perform_move(board: List[int], move: int, bank_index: int) -> int:
    """Performs a given move on the board. Returns the index of the final pebble placed"""
    if bank_index < move:
        raise BackendError(f"Invalid move: move index {move} is not on the side of the player with bank index {bank_index}.")
    num_pebbles = board[move]
    board[move] = 0
    curr_index = move
    while num_pebbles > 0:
        curr_index = (curr_index + 1) % BOARD_SIZE
        if (curr_index + POCKETS_PER_SIDE + 1) % BOARD_SIZE == bank_index:
            # if curr_index is the opposing player's bank
            continue
        board[curr_index] += 1
        num_pebbles -= 1
    # check if final pebble landed in empty spot on the caller's side of the board
    if board[curr_index] == 1 and (bank_index - POCKETS_PER_SIDE <= curr_index < bank_index) and board[get_index_of_opposite_hole(curr_index)] > 0:
        opposite_hole_index = get_index_of_opposite_hole(curr_index)
        board[bank_index] += board[opposite_hole_index] + board[curr_index]
        board[curr_index] = 0
        board[opposite_hole_index] = 0
    return curr_index


def get_index_of_opposite_hole(index: int) -> int:
    """Get the index of the hole on the opposite side of the board from the given index"""
    return (BOARD_SIZE - 2) - index


def get_valid_moves(board: List[int], bank_index: int) -> List[int]:
    """Gets the indices of the valid moves for the player with the given bank index"""
    moves = []
    for index in range(bank_index - POCKETS_PER_SIDE, bank_index):
        if board[index] > 0:
            moves.append(index)
    return moves
