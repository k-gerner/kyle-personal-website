import { Link } from "react-router-dom";
import AnagramsSampleImage from "../assets/ai/anagrams_sample.png";
import Connect4SampleImage from "../assets/ai/connect4_sample.png";
import GomokuSampleImage from "../assets/ai/gomoku_sample.png";
import MancalaSampleImage from "../assets/ai/mancala_sample.png";
import OthelloSampleImage from "../assets/ai/othello_sample.png";
import SeaBattleSampleImage from "../assets/ai/sea_battle_sample.png";
import WordBitesSampleImage from "../assets/ai/word_bites_sample.png";
import WordHuntSampleImage from "../assets/ai/word_hunt_sample.png";
import SpellingBeeSampleImage from "../assets/ai/spelling_bee_sample.png";
import LetterBoxedSampleImage from "../assets/ai/letter_boxed_sample.png";
import { pageRoutes } from "../utils/urls";
import React from "react";



const GameHome = () => {
    return (
        <div className="min-h-screen flex flex-col items-center gap-4 pt-4">
            <div className="flex flex-col items-center gap-6 border border-brd-muted rounded-lg p-8 bg-background-muted shadow-lg">
                <h1 className="text-4xl font-extrabold text-text-base mb-4">Game Pigeon AIs</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl w-full">
                    <GameLink to={pageRoutes.Anagrams} label="Anagrams" image={AnagramsSampleImage} />
                    <GameLink to={pageRoutes.Connect4} label="Connect 4" image={Connect4SampleImage} />
                    <GameLink to={pageRoutes.Gomoku} label="Gomoku" image={GomokuSampleImage} />
                    <GameLink to={pageRoutes.Mancala} label="Mancala" image={MancalaSampleImage} />
                    <GameLink to={pageRoutes.Othello} label="Othello" image={OthelloSampleImage} />
                    <GameLink to={pageRoutes.SeaBattle} label="Sea Battle" image={SeaBattleSampleImage} />
                    <GameLink to={pageRoutes.WordBites} label="Word Bites" image={WordBitesSampleImage} />
                    <GameLink to={pageRoutes.WordHunt} label="Word Hunt" image={WordHuntSampleImage} />
                </div>
            </div>
            <div className="flex flex-col items-center gap-6 border border-brd-muted rounded-lg p-8 bg-background-muted shadow-lg">
                <h1 className="text-4xl font-extrabold text-text-base mb-4">NYT Mini Game AIs</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl w-full">
                    <GameLink to={pageRoutes.SpellingBee} label="Spelling Bee" image={SpellingBeeSampleImage} />
                    <GameLink to={pageRoutes.LetterBoxed} label="Letter Boxed" image={LetterBoxedSampleImage} />
                </div>
            </div>
            <div className="bg-background-muted shadow-lg rounded-lg p-8 max-w-2xl text-center text-text-base">
                <h1 className="text-4xl font-extrabold text-primary-base-600 mb-4">About</h1>
                <p className="text-lg mb-4">
                    <span>This project solves </span>
                    <span className="font-semibold">NYT mini games</span>
                    <span> and </span>
                    <span className="font-semibold">GamePigeon games</span>
                    <span> using AI!</span>
                </p>
                <p className="text-lg">
                    Click the links above to try them out!
                </p>
            </div>
        </div>
    );
};

interface GameLinkProps {
    to: string;
    label: string;
    image?: string;
}

const GameLink: React.FC<GameLinkProps> = ({ to, label, image }) => {
    return (
        <Link
            to={to}
            className="relative flex items-center justify-center aspect-square rounded-xl px-4 py-2 text-text-light hover:bg-primary-base transition-colors transition-transform shadow group transform hover:scale-105 duration-300"
        >
            {image && (
                <img
                    src={image}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                />
            )}
            <span className="relative z-10 text-xl font-bold text-center px-2 py-1 rounded bg-gray-900 bg-opacity-60 group-hover:bg-primary-base group-hover:bg-opacity-100 transition-colors duration-150 whitespace-nowrap">
                {label}
            </span>
            {image && (
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl" />
            )}
        </Link>
    );
};

export default GameHome;