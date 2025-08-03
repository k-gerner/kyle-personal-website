from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from utils.read_word_list import load_words
from utils.data_store import set_common_word_set, set_anagrams_words_tree, get_common_word_set, clear_data_store
from utils.anagrams.word_start_tree import build_tree
from routers import nyt_mini_games, game_pigeon

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the word set
    set_common_word_set(load_words('data/common_words.txt')) 
    set_anagrams_words_tree(build_tree(get_common_word_set()))
    logging.info("Word set loaded successfully.")
    yield
    # Clean up the word lists and release the resources
    clear_data_store()

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000",  # React dev server
]

# Allow frontend on localhost:3000 to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the grouped routers
app.include_router(nyt_mini_games.router, prefix="/api/nyt", tags=["NYT Mini Games"])
app.include_router(game_pigeon.router, prefix="/api/game_pigeon", tags=["GamePigeon"])