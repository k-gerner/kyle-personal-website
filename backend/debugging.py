import ai.game_pigeon.gomoku.gomoku as gomoku


def run_gomoku_test():
    player_locations = [[6,6],[7,6],[8,6],[9,6]]
    ai_locations = [[5,6]]
    row, col, is_win = gomoku.run(player_locations, ai_locations, 4)
    print(f"AI chose to place at ({row}, {col}), Win: {is_win}")

if __name__ == "__main__":
    run_gomoku_test()
