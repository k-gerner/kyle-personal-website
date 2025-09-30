# Kyle Gerner    7.9.2020
from typing import List, Tuple
from ai.game_pigeon.mancala.avalanche.enums import PocketType

# class that represents the Player (of which, there are 2)
class AvalanchePlayer:
    def __init__(self, score=0):
        self.score = score

    def increment_score(self):
        self.score += 1

    def copy_player(self):
        p = AvalanchePlayer()
        p.score = self.score
        return p

################################################################################################
################################################################################################
################################################################################################


# Class that represents the board object.
class AvalancheBoard:

    # constructor
    def __init__(
            self,
            pebbles_in_each: List[int],
            player1: AvalanchePlayer,
            player2: AvalanchePlayer,
            player_one_turn: bool
        ):
        self.pebblesList = pebbles_in_each.copy()
        self.p1 = player1
        self.p2 = player2
        self.p1Turn = player_one_turn

    # Performs the moves on the board by calling the perform_move function for each move given
    def perform_move_set(self, move_list: List[int]) -> Tuple[int, int]:
        """
        Performs the given moveset on the board

        Parameters:
            move_list (List[int]): The list of moves to perform
        Returns:
            scores (Tuple[int, int]): The final scores of player 1 and player 2
        """
        continue_moves = True
        move_number = 1
        for boardSpot in move_list:
            if not continue_moves:
                print("Move #%d in the given move set was invalid (previous move did not end in player bank)" % move_number)
                print("The move set was:  " + str(move_list))
                break
            continue_moves = self.perform_move(boardSpot)
            move_number += 1
        self.switch_turn()
        return self.p1.score, self.p2.score

    # Performs the move on the board
    def perform_move(self, position: int) -> bool:
        """
        Performs the given move on the board
        Parameters:
            position (int): The index of the pocket to perform the move from
        Returns:
            turn_ended_in_player_bank (bool): Whether or not the turn ended in the player's bank
        """
        curr_bank_index, enemy_bank_index = self.get_bank_indexes()
        curr_player = self.p1 if self.p1Turn else self.p2
        num_pebbles = self.pebblesList[position]
        self.pebblesList[position] = 0
        turn_ended_in_player_bank = False
        while True:
            if num_pebbles == 0:
                end_of_move = self.end_of_current_move(position, curr_bank_index)
                if end_of_move != PocketType.PIT_WITH_PIECES:
                    turn_ended_in_player_bank = True if end_of_move == PocketType.BANK else False
                    break
                else:
                    num_pebbles = self.pebblesList[position]
                    self.pebblesList[position] = 0
            position = (position + 1) % 14 if (position + 1) != enemy_bank_index else (position + 2) % 14
            self.add_pebble_to_location(position, curr_bank_index, curr_player)
            num_pebbles -= 1
        return turn_ended_in_player_bank

    # checks which spot the last piece was placed
    def end_of_current_move(self, pos: int, curr_bank_index: int) -> PocketType:
        """
        Checks what type of pocket the last piece was placed in
        Parameters:
            pos (int): The index of the pocket to check
            curr_bank_index (int): The index of the current player's bank
        Returns:
            pocket_type (PocketType): The type of pocket the last piece was placed in
        """
        # note if this method is called, we already know numPebbles = 0
        if pos == curr_bank_index:
            return PocketType.BANK
        elif self.pebblesList[pos] == 1:
            return PocketType.EMPTY_PIT
        else:
            return PocketType.PIT_WITH_PIECES

    # places a piece in the specified spot, and increments score if applicable
    def add_pebble_to_location(
            self,
            index: int,
            curr_bank_index: int,
            curr_player: AvalanchePlayer
        ):
        """
        Places a pebble in the specified location, and increments score if applicable
        """
        self.pebblesList[index] += 1
        if index == curr_bank_index:
            curr_player.increment_score()

    # get the player and opponent bank indexes
    def get_bank_indexes(self):
        if self.p1Turn:
            return 6, 13
        else:
            return 13, 6

    # string representation of the board
    def __str__(self):
        enemy_row = "E\t|" + self.score_row_to_str_horiz(12, 6, -1) + "\n"
        bank_row = "%d\t-------------------------\t%d\n" % (self.p2.score, self.p1.score)
        player_row = "\t|" + self.score_row_to_str_horiz(0, 6, 1) + "\tP\n"
        return enemy_row + bank_row + player_row

    # string representation of one side of the board
    def score_row_to_str_horiz(self, start, end, direction):
        scores_str = ""
        for i in range(start, end, direction):  # loop thru indexes of side
            this_spot_str = "%d |" % self.pebblesList[i]
            if self.pebblesList[i] < 10:
                this_spot_str = " " + this_spot_str
            scores_str += this_spot_str
        return scores_str

    def switch_turn(self):
        """Switches whose turn it is"""
        self.p1Turn = not self.p1Turn

################################################################################################
################################################################################################
################################################################################################


# Class that contains the methods that calculate the best moves for a given board
class AvalancheSolver:

    # constructor
    def __init__(self, board: AvalancheBoard, is_player1: bool = True):
        self.board = board
        self.is_player1 = is_player1

    # Returns a copy of the game board
    def copy_board(self, board_to_copy: AvalancheBoard) -> AvalancheBoard:
        return AvalancheBoard(
            pebbles_in_each=board_to_copy.pebblesList, 
            player1=board_to_copy.p1.copy_player(), 
            player2=board_to_copy.p2.copy_player(), 
            player_one_turn=board_to_copy.p1Turn
        )

    # Performs the moves of a given moveset on the given board
    def make_moves_on_moveset(self, move_list: List[int], board: AvalancheBoard) -> int:
        """
        Performs the given moveset on the given board
        Parameters:
            move_list (List[int]): The list of moves to perform
            board (AvalancheBoard): The board to perform the moves on
        Returns:
            score_increase (int): The increase in score for player 1 after performing the moves"""
        prev_score = board.p1.score if self.is_player1 else board.p2.score
        board.perform_move_set(move_list)
        score_increase = board.p1.score - prev_score if self.is_player1 else board.p2.score - prev_score
        return score_increase

    # Perform a single move on a given board
    # returns the score for this turn, and whether or not the turn ended in the player's bank
    def make_move(self, index: int, board: AvalancheBoard) -> Tuple[int, bool]:
        """
        Performs the given move on the given board
        Parameters:
            index (int): The index of the pocket to perform the move from
            board (AvalancheBoard): The board to perform the move on
        Returns:
            results (Tuple[int, bool]): The score increase from the move, and whether or not
                                        the turn ended in the player's bank
        """
        prev_score = board.p1.score if self.is_player1 else board.p2.score
        ended_in_bank = board.perform_move(index)
        score_increase = board.p1.score - prev_score if self.is_player1 else board.p2.score - prev_score
        return score_increase, ended_in_bank


    def find_best_move(self, board: AvalancheBoard, curr_val: int) -> Tuple[int, List[int]]:
        """
        Finds the best move for the player for a given board
        Parameters:
            board (AvalancheBoard): The current board state
            curr_val (int): The current score value
        Returns:
            results (Tuple[int, List[int]]): The best score increase and the list of moves
        """
        index_options = self.get_list_of_non_zero_indexes(board)
        if len(index_options) == 0:
            # if no available moves
            return curr_val, []
        best_increase = -1
        best_move_list = [0]
        # loop through each available move
        for index in index_options:
            this_move_list = []
            board_copy = self.copy_board(board)
            make_move_results = self.make_move(index, board_copy)
            points_gained, ended_in_bank = make_move_results[0], make_move_results[1]
            if ended_in_bank:
                this_run_increase, this_move_list = self.find_best_move(board_copy, points_gained)
            else:
                this_run_increase = points_gained
            if this_run_increase > best_increase:
                best_increase = this_run_increase
                best_move_list = this_move_list.copy()
                best_move_list.insert(0, index)
        return best_increase + curr_val, best_move_list

    def get_list_of_non_zero_indexes(self, board: AvalancheBoard) -> List[int]:
        """
        Returns a list of the indexes that have pieces in them (and therefore are available to be played)
        """
        non_zeros = []
        pocket_indices = range(0, 6) if self.board.p1Turn else range(7, 13)
        for i in pocket_indices:
            if board.pebblesList[i] != 0:
                non_zeros.append(i)
        return non_zeros
