# Constant values to be used across multiple files
MAX_DEPTH = 10  # max number of moves ahead to calculate

# Board size
POCKETS_PER_SIDE = 6  # excludes bank pockets
BOARD_SIZE = (POCKETS_PER_SIDE * 2) + 2  # total # pockets on each side plus the banks

# Pebble count
STARTING_PEBBLES_PER_POCKET = 4
TOTAL_PEBBLES = STARTING_PEBBLES_PER_POCKET * POCKETS_PER_SIDE * 2

# Bank indices
PLAYER_BANK_INDEX = int(BOARD_SIZE/2 - 1)  # 6
AI_BANK_INDEX = int(BOARD_SIZE - 1)    # 13

# Board printing
SIDE_INDENT_STR = "          "  # default 10 spaces
LEFT_SIDE_ARROW   = "    -->   "
RIGHT_SIDE_ARROW   = "   <--"
BOARD_OUTPUT_HEIGHT = 3 * (POCKETS_PER_SIDE + 2)  # how many lines are printed when printing the board


# Default board layout
#   __13__
# 0   |   12
# 1   |   11
# 2   |   10
# 3   |   9
# 4   |   8
# 5 __|__ 7
#     6
