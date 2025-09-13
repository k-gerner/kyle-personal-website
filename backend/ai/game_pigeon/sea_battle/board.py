from typing import Dict, List, Tuple, Optional
from ai.game_pigeon.sea_battle.enums import BoardSpace
from utils.error import BackendError


class SeaBattleBoard:

    def __init__(
            self, 
            size: int, 
            remaining_ships: Dict[int, int], 
            destroyed_locations: List[Tuple[int, int]], 
            hit_locations: List[Tuple[int, int]], 
            missed_locations: List[Tuple[int, int]],
            cleared_locations: List[Tuple[int, int]]
        ):
        self.size = size
        self.remaining_ships = remaining_ships
        self.destroyed_locations = destroyed_locations
        self.hit_locations = hit_locations
        self.missed_locations = missed_locations
        self.cleared_locations = cleared_locations
        self.board = create_board_grid(
            size, 
            destroyed_locations, 
            hit_locations, 
            missed_locations,
            cleared_locations
        )
        self.density_pyramid = []
        self.update_density_pyramid()


    def mark_hit(self, row: int, col: int):
        self.board[row][col] = BoardSpace.HIT
        self.hit_locations.append((row, col))

    
    def mark_miss(self, row: int, col: int):
        self.board[row][col] = BoardSpace.MISS
        self.missed_locations.append((row, col))

    def mark_cleared(self, row: int, col: int):
        self.board[row][col] = BoardSpace.CLEAR
        self.cleared_locations.append((row, col))
        if (row, col) in self.missed_locations:
            self.missed_locations.remove((row, col))
        if (row, col) in self.hit_locations:
            self.hit_locations.remove((row, col))
        if (row, col) in self.destroyed_locations:
            self.destroyed_locations.remove((row, col))


    def mark_destroy(self, row: int, col: int):
        self.board[row][col] = BoardSpace.DESTROY
        self.destroyed_locations.append((row, col))


    def board_space_at(self, row: int, col: int) -> BoardSpace:
        return self.board[row][col]


    def sink_ship(self, row: int, col: int):
        """
        Changes the game board to display that a ship has sunk
        Updates the density pyramid
        Updates the ships remaining totals
        """
        self.mark_destroy(row, col)
        dir_increments = [
            [0, -1],  # left
            [0, 1],   # right
            [-1, 0],  # down
            [1, 0] 	  # up
        ]
        sunken_coordinates = [[row, col]]
        for direction_pair in dir_increments:
            vert_add, horiz_add = direction_pair
            row_incremented, col_incremented = row, col
            while 0 <= (row_incremented + vert_add) < self.size and 0 <= col_incremented + horiz_add < self.size:
                # while in range of board
                new_row = row_incremented + vert_add
                new_col = col_incremented + horiz_add
                spot = self.board_space_at(new_row, new_col)
                if spot == BoardSpace.HIT:
                    self.mark_destroy(new_row, new_col)
                    # game_board[row_incremented + vert_add][col_incremented + horiz_add] = BoardSpace.DESTROY
                    sunken_coordinates.append([new_row, new_col])
                    row_incremented += vert_add
                    col_incremented += horiz_add
                else:
                    break
        try:
            sunken_ship_size = len(sunken_coordinates)
            self.remaining_ships[sunken_ship_size] -= 1
            self.update_density_pyramid()
        except KeyError:
            raise BackendError(KeyError, f"Ship of size {sunken_ship_size} not found in remaining ships list. Remaining ships: {self.remaining_ships}")

        sunken_neighbor_distances = [
            [0, -1],   # left
            [0, 1],    # right
            [-1, 0],   # down
            [1, 0],    # up
            [-1, -1],  # lower left
            [-1, 1],   # lower right
            [1, -1],   # upper left
            [1, 1]     # upper right
        ]
        # clear the surrounding coordinates because ships can't be adjacent
        for coord in sunken_coordinates:
            for increment in sunken_neighbor_distances:
                new_row, new_col = coord[0] + increment[0], coord[1] + increment[1]
                if 0 <= new_row < self.size and 0 <= new_col < self.size and self.board_space_at(new_row, new_col) == BoardSpace.EMPTY:
                    self.mark_cleared(new_row, new_col)


    def update_density_pyramid(self):
        """
        Create a pyramid-shaped 2D list that contains the scores for each index given an open sequence of n spaces.
        This will make the generate_space_densities function faster
        """
        remaining_ships = []
        for key in self.remaining_ships:
            num_remaining = self.remaining_ships[key]
            if num_remaining > 0:
                remaining_ships.append([key, num_remaining])
        density_pyramid = []
        for level in range(1, self.size+1):
            row = [0] * level
            for ship_data in remaining_ships:
                ship_size, num_remaining = ship_data
                for index in range(level + 1 - ship_size):
                    right_index = index + ship_size - 1
                    for space in range(index, right_index + 1):
                        row[space] += num_remaining
            density_pyramid.append(row)
        self.density_pyramid = density_pyramid


    def get_space_densities(self, recent_move: Optional[Tuple[int, int]]) -> List[List[float]]:
        """
        Generate a board where each space has densities that relate to the number of ways ships could be placed there.
        NOTE: There is room for improvement in this implementation. It was written quickly and could be optimized.

        Parameters:
            recent_move (Optional[Tuple[int, int]]): The most recent move made (row, col), or None if no moves have been made
        Returns:
            densities (List[List[float]]): A 2D list of floats representing the density of each space on the board, where each inner list is a row.
        """
        space_densities = []
        for i in range(self.size):
            space_densities.append([0]*self.size)
        
        if recent_move and recent_move in self.destroyed_locations:
            self.sink_ship(recent_move[0], recent_move[1])
            if all(num_left == 0 for num_left in self.remaining_ships.values()):
                return space_densities
            
        def fill_list_with_density_pyramid_data(arr: List[int], start_index: int, sequence_length:int):
            """
            Take data from the density pyramid and populate a portion of the given list with that data
            """
            data = self.density_pyramid[sequence_length - 1]
            for i in range(sequence_length):
                arr[i + start_index] += data[i]

        def get_num_open_neighbors_in_direction(arr: List[int], start_index: int, ship_size: int):
            """
            Find the number of open spaces in each direction from the starting index
            Returns a tuple of the # spaces in the positive direction, and negative direction respectively
            """
            pos, neg = 0, 0
            hits_in_pos_dir = 1
            hits_in_neg_dir = 1

            index = start_index + 1
            while index < len(arr) and arr[index] == BoardSpace.HIT and hits_in_pos_dir < ship_size - 1:
                hits_in_pos_dir += 1
                index += 1
            index = start_index - 1
            while index >= 0 and arr[index] == BoardSpace.HIT and hits_in_neg_dir < ship_size - 1:
                hits_in_neg_dir += 1
                index -= 1

            index = start_index + 1
            while index < len(arr) and arr[index] == BoardSpace.EMPTY and pos < ship_size - hits_in_neg_dir:
                pos += 1
                index += 1
            index = start_index - 1
            while index >= 0 and arr[index] == BoardSpace.EMPTY and neg < ship_size - hits_in_pos_dir:
                neg += 1
                index -= 1
            return pos, neg

        def get_num_immediate_neighbors(row: int, col: int) -> int:
            """
            Find the number of open spaces that are immediately next to the specified coordinate.
            0 < num_open < 8
            """
            num_open = 0
            for row_add in [-1, 0, 1]:
                for col_add in [-1, 0, 1]:
                    if row_add == col_add == 0:
                        continue
                    if (
                        0 <= row + row_add < self.size 
                        and 0 <= col + col_add < self.size 
                        and self.board_space_at(row + row_add, col + col_add) == BoardSpace.EMPTY
                    ):
                        num_open += 1
            return num_open

        # Look at horizontal open space and fill space_densities accordingly
        for row_index in range(self.size):
            row = self.board[row_index]
            next_unavailable_index = 0
            next_open_spot = 0
            evaluating_row = True
            while evaluating_row:
                while next_open_spot < self.size and row[next_open_spot] in [BoardSpace.MISS, BoardSpace.DESTROY]:
                    next_open_spot += 1
                if next_open_spot == self.size:
                    break
                while next_unavailable_index < self.size and row[next_unavailable_index] in [BoardSpace.EMPTY, BoardSpace.HIT]:
                    next_unavailable_index += 1
                fill_list_with_density_pyramid_data(space_densities[row_index], next_open_spot, next_unavailable_index - next_open_spot)
                if next_unavailable_index == self.size:
                    evaluating_row = False
                next_open_spot = next_unavailable_index + 1
                next_unavailable_index += 1

        # Look at vertical open space and fill space_densities accordingly
        for col_index in range(self.size):
            col = [row[col_index] for row in self.board]
            next_unavailable_index = 0
            next_open_spot = 0
            evaluating_col = True
            while evaluating_col:
                while next_open_spot < self.size and col[next_open_spot] in [BoardSpace.MISS, BoardSpace.DESTROY]:
                    next_open_spot += 1
                if next_open_spot == self.size:
                    break
                while next_unavailable_index < self.size and col[next_unavailable_index] in [BoardSpace.EMPTY, BoardSpace.HIT]:
                    next_unavailable_index += 1
                density_col = [0] * self.size
                fill_list_with_density_pyramid_data(density_col, next_open_spot, next_unavailable_index - next_open_spot)
                for row_index in range(self.size):
                    space_densities[row_index][col_index] += density_col[row_index]
                if next_unavailable_index == self.size:
                    evaluating_col = False
                next_open_spot = next_unavailable_index + 1
                next_unavailable_index += 1

        # Give preference to spots where a hit/sink would clear the most space on the board (spaces with more open immediate neighbors)
        for row_index in range(self.size):
            for col_index in range(self.size):
                space_densities[row_index][col_index] *= (1 + 0.05 * get_num_immediate_neighbors(row_index, col_index))

        # high scores for partially-sunken ships; also change hits to 0 scores
        largest_remaining_ship_size = max(ship_size for ship_size, num_left in self.remaining_ships.items() if num_left > 0)
        max_density = max(max(val) for val in space_densities)
        for row_index in range(self.size):
            for col_index in range(self.size):
                spot = self.board_space_at(row_index, col_index)
                if spot == BoardSpace.HIT:
                    space_densities[row_index][col_index] = 0
                    if (
                        (
                            0 <= row_index - 1 
                            and self.board_space_at(row_index - 1, col_index) == BoardSpace.HIT
                        ) 
                        or (
                            row_index + 1 < self.size 
                            and self.board_space_at(row_index + 1, col_index) == BoardSpace.HIT
                        )
                    ):
                        # ship aligned vertically
                        col = [row[col_index] for row in self.board]
                        downward_space, upward_space = get_num_open_neighbors_in_direction(
                            col, row_index, largest_remaining_ship_size
                        )
                        if 0 <= row_index - 1 and self.board_space_at(row_index-1, col_index) == BoardSpace.EMPTY:
                            space_densities[row_index - 1][col_index] = (
                                (max_density + upward_space) 
                                * (1 + 0.02 * get_num_immediate_neighbors(row_index-1, col_index))
                            )
                        if row_index + 1 < self.size and self.board_space_at(row_index+1, col_index) == BoardSpace.EMPTY:
                            space_densities[row_index + 1][col_index] = (max_density + downward_space) * (1 + 0.02 * get_num_immediate_neighbors(row_index+1, col_index))
                    elif (
                        (
                            0 <= col_index - 1 
                            and self.board_space_at(row_index, col_index - 1) == BoardSpace.HIT
                        ) 
                        or (
                            col_index + 1 < self.size 
                            and self.board_space_at(row_index, col_index + 1) == BoardSpace.HIT
                        )
                    ):
                        # ship aligned horizontally
                        rightward_space, leftward_space = get_num_open_neighbors_in_direction(
                            self.board[row_index], col_index, largest_remaining_ship_size
                        )
                        if 0 <= col_index - 1 and self.board_space_at(row_index, col_index - 1) == BoardSpace.EMPTY:
                            space_densities[row_index][col_index - 1] = (max_density + leftward_space) * (1 + 0.02 * get_num_immediate_neighbors(row_index, col_index-1))
                        if col_index + 1 < self.size and self.board_space_at(row_index, col_index + 1) == BoardSpace.EMPTY:
                            space_densities[row_index][col_index + 1] = (max_density + rightward_space) * (1 + 0.02 * get_num_immediate_neighbors(row_index, col_index+1))
                    else:
                        # no neighboring spaces have been hit, so we don't know the alignment of the ship
                        col = [row[col_index] for row in self.board]
                        downward_space, upward_space = get_num_open_neighbors_in_direction(
                            col, row_index, largest_remaining_ship_size
                        )
                        rightward_space, leftward_space = get_num_open_neighbors_in_direction(
                            self.board[row_index], col_index, largest_remaining_ship_size
                        )
                        if 0 <= row_index - 1 and self.board_space_at(row_index-1, col_index) == BoardSpace.EMPTY:
                            space_densities[row_index - 1][col_index] = (max_density + upward_space) * (1 + 0.02 * get_num_immediate_neighbors(row_index-1, col_index))
                        if row_index + 1 < self.size and self.board_space_at(row_index+1, col_index) == BoardSpace.EMPTY:
                            space_densities[row_index + 1][col_index] = (max_density + downward_space) * (1 + 0.02 * get_num_immediate_neighbors(row_index+1, col_index))
                        if 0 <= col_index - 1 and self.board_space_at(row_index, col_index - 1) == BoardSpace.EMPTY:
                            space_densities[row_index][col_index - 1] = (max_density + leftward_space) * (1 + 0.02 * get_num_immediate_neighbors(row_index, col_index-1))
                        if col_index + 1 < self.size and self.board_space_at(row_index, col_index + 1) == BoardSpace.EMPTY:
                            space_densities[row_index][col_index + 1] = (max_density + rightward_space) * (1 + 0.02 * get_num_immediate_neighbors(row_index, col_index+1))

        return space_densities

    

def create_board_grid(
        size: int, 
        destroyed_locations: List[Tuple[int, int]], 
        hit_locations: List[Tuple[int, int]], 
        missed_locations: List[Tuple[int, int]],
        cleared_locations: List[Tuple[int, int]]
    ) -> List[List[BoardSpace]]:
    grid = [[BoardSpace.EMPTY for _ in range(size)] for _ in range(size)]
    
    for x, y in destroyed_locations:
        grid[x][y] = BoardSpace.DESTROY  # Destroyed ship part
    
    for x, y in hit_locations:
        grid[x][y] = BoardSpace.HIT  # Hit ship part
    
    for x, y in missed_locations:
        grid[x][y] = BoardSpace.MISS  # Missed shot

    for x, y in cleared_locations:
        grid[x][y] = BoardSpace.CLEAR # Cleared space (next to a sunk ship)
    
    return grid