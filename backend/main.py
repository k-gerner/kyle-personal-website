from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import logging
import os

from utils.read_word_list import load_words
from utils.data_store import set_common_word_set, set_words_tree, get_common_word_set, clear_data_store
from utils.word_games.word_start_tree import build_tree
from routers import nyt_mini_games, game_pigeon

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the word set
    set_common_word_set(load_words('data/common_words.txt')) 
    set_words_tree(build_tree(get_common_word_set()))
    logging.info("Word set loaded successfully.")
    yield
    # Clean up the word lists and release the resources
    clear_data_store()

load_dotenv()
local_dev = os.getenv("LOCAL_DEV") == "true"
app = FastAPI(lifespan=lifespan if local_dev else None)

origins = [
    "http://localhost:3000",  # React dev server (local)
    "https://kylegerner.vercel.app",  # Alternate production frontend URL
    "https://kylegerner.dev",      # Production frontend URL
]

# Allow frontend (localhost:3000 if local) to talk to backend
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