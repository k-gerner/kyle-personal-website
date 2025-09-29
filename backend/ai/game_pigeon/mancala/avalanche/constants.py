# Board size
POCKETS_PER_SIDE = 6  # excludes bank pockets
BOARD_SIZE = (POCKETS_PER_SIDE * 2) + 2  # total # pockets on each side plus the banks

# Bank indices
PLAYER_BANK_INDEX = int(BOARD_SIZE/2 - 1)  # 6
AI_BANK_INDEX = int(BOARD_SIZE - 1)    # 13