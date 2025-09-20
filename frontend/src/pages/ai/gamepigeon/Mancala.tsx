import React, { useState, useEffect, useRef } from "react";

import { callEndpoint } from "../../../utils/helpers";
import { Player } from '../../../utils/classes';
import { ActionButton } from '../../../atoms/ActionButton';

const END_IN_BANK_ANIMATION_DELAY = 1000; // ms
const POCKET_ANIMATION_DELAY = 700; // ms

const PLAYER_BANK_INDEX = 6;
const AI_BANK_INDEX = 13;


const Mancala = () => {
    const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.User);
    const [playingAnimationActive, setPlayingAnimationActive] = useState(false);
    // Player pockets are indexed 0-5, player bank is index 6
    // AI pockets are indexed 7-12, AI bank is index 13
    // Initial state: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]
    // Full board state: [playerPockets..., playerBank, aiPockets..., aiBank]
    const [pockets, setPockets] = useState<number[]>([4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]);

    const getPlayerPockets = () => pockets.slice(0, 6);
    const getAiPockets = () => pockets.slice(7, 13);
    const getPlayerScore = () => pockets[PLAYER_BANK_INDEX];
    const getAiScore = () => pockets[AI_BANK_INDEX];

    const getAiMove = async () => {
        const response = await callEndpoint('api/game_pigeon/mancala_capture', {
            playerScore: getPlayerScore(),
            aiScore: getAiScore(),
            playerPockets: getPlayerPockets(),
            aiPockets: getAiPockets(),
            maxDepth: 10
        });
        console.log('getAiMove:', response);
        setPlayingAnimationActive(true);
        for (let boardState of response.boardStates) {
            await animateMove(boardState.recentMove, Player.AI); // AI pockets are offset by 7
            // set from board state to apply captures (if applicable)
            setPocketsFromBoardState(boardState);
            await pause(END_IN_BANK_ANIMATION_DELAY); // brief pause between moves
        }
        setPlayingAnimationActive(false);
        setCurrentPlayer(Player.User);
    }

    const setPocketsFromBoardState = (boardState: {
        playerScore: number;
        aiScore: number;
        playerPockets: number[];
        aiPockets: number[];
    }) => {
        const newPockets = [
            ...boardState.playerPockets,
            boardState.playerScore,
            ...boardState.aiPockets,
            boardState.aiScore
        ];
        setPockets(newPockets);
    }

    const handlePocketClick = async (index: number) => {
        if (currentPlayer === Player.User && getPlayerPockets()[index] > 0) {
            const response = await callEndpoint('api/game_pigeon/mancala_capture/player_move', {
                playerScore: getPlayerScore(),
                aiScore: getAiScore(),
                playerPockets: getPlayerPockets(),
                aiPockets: getAiPockets(),
                move: index
            });
            console.log('handlePocketClick:', response);
            setPlayingAnimationActive(true);
            await animateMove(response.boardState.recentMove, Player.User);
            // set from board state to apply captures (if applicable)
            setPocketsFromBoardState(response.boardState);
            setPlayingAnimationActive(false);
            if (!response.boardState.endInBank) {
                setCurrentPlayer(Player.AI);
            }

        }
    };

    const animateMove = async (pocketIndex: number, turn: Player) => {
        let scoreInHand = pockets[pocketIndex];
        console.log('animateMove:', pocketIndex, scoreInHand);
        setPockets(prev => {
            const newPockets = [...prev];
            newPockets[pocketIndex] = 0;
            return newPockets;
        });
        await pause(POCKET_ANIMATION_DELAY);
        let currentIndex = pocketIndex;
        while (scoreInHand > 0) {
            currentIndex = (currentIndex + 1) % 14;
            if (turn === Player.User && currentIndex === AI_BANK_INDEX) {
                currentIndex = (currentIndex + 1) % 14; // skip AI bank
            } else if (turn === Player.AI && currentIndex === PLAYER_BANK_INDEX) {
                currentIndex = (currentIndex + 1) % 14; // skip player bank
            }
            setPockets(prev => {
                const newPockets = [...prev];
                newPockets[currentIndex] += 1;
                return newPockets;
            });
            await pause(POCKET_ANIMATION_DELAY); // wait between each increment
            scoreInHand--;
        }
    }

    return (
        <div className="flex flex-col gap-4 bg-background-base min-h-screen items-center">
            <h1 className="text-center text-3xl font-bold text-primary-highlight mb-4">Mancala!</h1>
            <ActionButton
                onClick={getAiMove}
                label="Get AI Move"
                disabled={currentPlayer !== Player.AI || playingAnimationActive}
            />
            <MancalaBoard
                pockets={pockets}
                selectable={currentPlayer === Player.User && !playingAnimationActive}
                playerTurn={currentPlayer}
                onPocketClick={handlePocketClick}
            />
        </div>
    );
};


interface MancalaBoardProps {
    pockets: number[];
    selectable: boolean;
    playerTurn: Player;
    onPocketClick: (index: number) => void;
}

const MancalaBoard: React.FC<MancalaBoardProps> = ({
    pockets,
    selectable,
    playerTurn,
    onPocketClick
}) => {
    const playerOutlineAnimates = useOutlineAnimateArray(pockets.slice(0, 6));
    const aiOutlineAnimates = useOutlineAnimateArray(pockets.slice(7, 13).reverse());
    const playerScore = pockets[6];
    const aiScore = pockets[13];
    const playerPockets = pockets.slice(0, 6);
    const aiPockets = pockets.slice(7, 13);
    return (
        <div className="flex flex-col items-center">
            <div className="mb-4 text-lg font-semibold text-primary-highlight">AI</div>
            <div className="flex flex-row gap-4 items-center bg-mancala-board p-4 rounded-3xl shadow-lg items-stretch">
                <div
                    key={`ai-score-pocket-${aiScore}`}
                    className="bg-secondary rounded-3xl bg-mancala-pocket flex items-center justify-center text-3xl font-bold text-white w-16 transition animate-secondaryOutlineBounce"
                >
                    <span key={`ai-score-${aiScore}`} className="transition animate-enlargeBounceBigger text">
                        {aiScore}
                    </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="grid grid-cols-6 gap-4">
                        {aiPockets.slice().reverse().map((count, index) => {
                            const outlineAnimateClass = aiOutlineAnimates[index]
                                ? playerTurn === Player.User
                                    ? 'transition animate-primaryOutlineBounce'
                                    : 'transition animate-secondaryOutlineBounce'
                                : '';
                            return (
                                <div
                                    key={`ai-${index}-${count}-pocket`}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white bg-mancala-pocket
                                        ${outlineAnimateClass}
                                        `}
                                >
                                    <span
                                        key={`ai-${index}-${count}-value`} // remounts when count changes
                                        className="transition animate-enlargeBounceBigger"
                                    >
                                        {count}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="grid grid-cols-6 gap-4">
                        {playerPockets.map((count, index) => {
                            const pocketActive = selectable && count > 0;
                            const selectableAnimateClass = pocketActive ? 'animate-pulse' : '';
                            const hoverClass = pocketActive ? 'transition duration-300 ease-in-out hover:scale-110 cursor-pointer' : '';
                            const outlineAnimateClass = playerOutlineAnimates[index]
                                ? playerTurn === Player.User
                                    ? 'transition animate-primaryOutlineBounce'
                                    : 'transition animate-secondaryOutlineBounce'
                                : '';

                            return (
                                <div
                                    key={`player-${index}-${count}-pocket`}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white bg-mancala-pocket 
                                        ${selectableAnimateClass} 
                                        ${hoverClass} 
                                        ${outlineAnimateClass}
                                    `}
                                    onClick={() => pocketActive && onPocketClick(index)}
                                >
                                    <span
                                        key={`player-${index}-${count}-value`} // remounts when count changes
                                        className="transition animate-enlargeBounceBigger"
                                    >
                                        {count}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div key={`player-score-pocket-${playerScore}`} className="bg-secondary rounded-3xl bg-mancala-pocket flex items-center justify-center text-3xl font-bold text-white w-16 transition animate-primaryOutlineBounce">
                    <span key={`player-score-${playerScore}`} className="transition animate-enlargeBounceBigger">
                        {playerScore}
                    </span>
                </div>
            </div>
            <div className="mt-4 text-lg font-semibold text-primary-highlight">Player</div>
        </div>
    );
}

const pause = async (duration: number) => {
    return new Promise(resolve => setTimeout(resolve, duration));
};


// Custom hook to trigger animation when a value changes
// Duration should match the duration defined for the Tailwind animation
// We need to use this for arrays of values, since we can't call hooks conditionally or in loops
function useOutlineAnimateArray(values: number[], duration = POCKET_ANIMATION_DELAY) {
    const prev = useRef<number[]>(values);
    const [animates, setAnimates] = useState<boolean[]>(values.map(() => false));

    useEffect(() => {
        const newAnimates = values.map((val, i) => prev.current[i] !== val);
        setAnimates(newAnimates);

        prev.current = values;
        if (newAnimates.some(Boolean)) {
            const timeout = setTimeout(() => setAnimates(values.map(() => false)), duration);
            return () => clearTimeout(timeout);
        }
    }, [values.join(",")]);

    return animates;
}


export default Mancala;