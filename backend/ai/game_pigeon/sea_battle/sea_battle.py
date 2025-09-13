# Kyle Gerner
# Started 9.5.2021
# Sea Battle AI (Battleship clone)
from typing import Tuple, List, Dict, Optional
import math

from ai.game_pigeon.sea_battle.board import SeaBattleBoard
from utils.error import BackendError


def _debug_board(board: SeaBattleBoard):
	"""
	Prints out the space densities chart in a readable format
	"""
	space_densities = board.generate_space_densities()
	max_score, min_score = -1, 100000
	for row in space_densities:
		for val in row:
			if val > 0:
				if val < min_score:
					min_score = val
				if val > max_score:
					max_score = val
	print("\n   ", end='')
	for letter in list(map(chr, range(65, 65 + SIZE))):
		print(f"    {letter}", end='')
	print("\n   %s" % ("-"*55))
	for row_index in range(len(space_densities)):
		row = space_densities[row_index]
		print("%s%d |   " % (" " if row_index < 9 else "", row_index + 1), end='')
		for value in row:
			if value == 0:
				print("0    ", end='')
			else:
				output = str(int(value)) + (4-int(math.log10(value)))*" "
				print(output, end='')
		print("|")
	print("   %s\n" % ("-"*55))


def _get_max_density_locations(space_densities: List[List[float]]) -> List[Tuple[int, int]]:
	"""
	Get the locations with the highest density values
	"""
	max_density = -1
	max_locations = []
	for row_index in range(len(space_densities)):
		row = space_densities[row_index]
		for col_index in range(len(row)):
			value = row[col_index]
			if value > max_density:
				max_density = value
				max_locations = [(row_index, col_index)]
			elif value == max_density:
				max_locations.append((row_index, col_index))
	return max_locations


def _build_run_output(
		board: SeaBattleBoard,
		space_densities: List[List[float]],
		best_moves: List[Tuple[int, int]]
	) -> Dict:
	"""
	Build the output dictionary for the run function

	Parameters:
		board (SeaBattleBoard): The current state of the board
		space_densities (List[List[float]]): The space densities for the current board state
		best_moves (List[Tuple[int, int]]): The best move locations based on space densities
	Returns:
		Dict: A dictionary containing the space densities, best moves, and board state information
	"""
	return {
		"space_densities": space_densities,
		"best_moves": best_moves,
		"destroyed_locations": board.destroyed_locations,
		"hit_locations": board.hit_locations,
		"missed_locations": board.missed_locations,
		"cleared_locations": board.cleared_locations,
		"remaining_ships": board.remaining_ships
	}


def run(
		size: int,
		recent_move: Optional[Tuple[int, int]],
		ships_remaining: Dict[int, int],
		destroyed_locations: List[Tuple[int, int]],
		hit_locations: List[Tuple[int, int]],
		missed_locations: List[Tuple[int, int]],
		cleared_locations: List[Tuple[int, int]] = []
	) -> Tuple[List[List[float]], List[Tuple[int, int]]]:
	"""
	Generate space densities for a given board state

	Parameters:
		size (int): The size of the board (8, 9, or 10)
		recent_move (Tuple[int, int]): The most recent move made (row, col), or empty if no moves have been made
		ships_remaining (Dict[int, int]): A mapping of ship lengths to the number of ships remaining of that length
		destroyed_locations (List[Tuple[int, int]]): A list of locations where ships have been destroyed
		hit_locations (List[Tuple[int, int]]): A list of locations where ships have been hit but not destroyed
		missed_locations (List[Tuple[int, int]]): A list of locations where shots have missed
		cleared_locations (List[Tuple[int, int]]): A list of locations that have been cleared by being next to a sunken ship (no ship present)
	Returns:
		(space_densities, best_moves) (Tuple[List[List[float]], List[Tuple[int, int]]]): A tuple containing the space densities and the best move locations
	"""
	board = SeaBattleBoard(
		size=size,
		remaining_ships=ships_remaining,
		destroyed_locations=destroyed_locations,
		hit_locations=hit_locations,
		missed_locations=missed_locations,
		cleared_locations=cleared_locations
	)
	space_densities = board.get_space_densities(recent_move)
	best_moves = _get_max_density_locations(space_densities)
	return _build_run_output(board, space_densities, best_moves)


def initial_board_state(size: int):
	"""
	Get the initial ship counts for a given board size
	"""
	remaining_ships = {}
	if size == 10:
		remaining_ships = {  # ship_length: num_remaining
			1: 4,
			2: 3,
			3: 2,
			4: 1
		}
	elif size == 9:
		remaining_ships = {
			3: 5,
			4: 3
		}
	elif size == 8:
		remaining_ships = {
			2: 3,
			3: 3,
			4: 1
		}
	else:
		raise BackendError(ValueError(f"Invalid board size {size}. Must be 8, 9, or 10."))
	return remaining_ships