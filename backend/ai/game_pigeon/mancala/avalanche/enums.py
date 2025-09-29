from enum import Enum

class PocketType(Enum):
    BANK = 0
    EMPTY_PIT = 1
    PIT_WITH_PIECES = 2

    def __str__(self):
        return self.name