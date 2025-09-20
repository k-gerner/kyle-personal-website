import React, { useState, useEffect, useRef } from "react";

import { callEndpoint } from "../../../utils/helpers";
import { Player } from '../../../utils/classes';
import { ActionButton } from '../../../atoms/ActionButton';
import { VscDebugRestart } from "react-icons/vsc";
import { ButtonGroupPicker } from '../../../components/ButtonGroupPicker';
import { BooleanSelector } from '../../../atoms/BooleanSelector';

const END_IN_BANK_ANIMATION_DELAY = 1000; // ms
const POCKET_ANIMATION_DELAY = 500; // ms

const PLAYER_BANK_INDEX = 6;
const AI_BANK_INDEX = 13;

enum GameMode {
    Capture = "capture",
    Avalanche = "avalanche"
}

const CAPTURE_STARTING_POCKETS = [
    4, 4, 4, 4, 4, 0, // User Pockets
    0, // User Score
    4, 4, 4, 4, 4, 4, // AI Pockets
    0 // AI Score
];


const Mancala = () => {
    // Game settings state
    const [maxDepth, setMaxDepth] = useState(10);
    const [gameMode, setGameMode] = useState<GameMode>(GameMode.Capture);
    const [autoplay, setAutoplay] = useState(true);
    const [startingPlayer, setStartingPlayer] = useState<Player>(Player.User);

    // Game state
    const [gameStarted, setGameStarted] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.User);
    const [playingAnimationActive, setPlayingAnimationActive] = useState(false);
    // Player pockets are indexed 0-5, player bank is index 6
    // AI pockets are indexed 7-12, AI bank is index 13
    // Initial state: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]
    // Full board state: [playerPockets..., playerBank, aiPockets..., aiBank]
    const [pockets, setPockets] = useState<number[]>(CAPTURE_STARTING_POCKETS.concat([0], CAPTURE_STARTING_POCKETS));
    const [loading, setLoading] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);

    const getPlayerPockets = () => pockets.slice(0, 6);
    const getAiPockets = () => pockets.slice(7, 13);
    const getPlayerScore = () => pockets[PLAYER_BANK_INDEX];
    const getAiScore = () => pockets[AI_BANK_INDEX];

    const getAiMove = async () => {
        setGameStarted(true);
        setLoading(true);
        const response = await callEndpoint('api/game_pigeon/mancala_capture', {
            playerScore: getPlayerScore(),
            aiScore: getAiScore(),
            playerPockets: getPlayerPockets(),
            aiPockets: getAiPockets(),
            maxDepth: maxDepth
        });
        setPlayingAnimationActive(true);
        for (let i = 0; i < response.boardStates.length; i++) {
            const boardState = response.boardStates[i];
            await animateMove(boardState.recentMove, Player.AI); // AI pockets are offset by 7
            // set from board state to apply captures (if applicable)
            await setPocketsFromBoardState(boardState);
            if (i < response.boardStates.length - 1) {
                await pause(END_IN_BANK_ANIMATION_DELAY); // brief pause between moves
            }
        }
        setPlayingAnimationActive(false);
        setCurrentPlayer(Player.User);
        setLoading(false);
    }

    const setPocketsFromBoardState = async (boardState: {
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
        if (newPockets !== pockets) {
            setPockets(newPockets);
            await pause(POCKET_ANIMATION_DELAY);
        }
    }

    const handlePocketClick = async (index: number) => {
        setGameStarted(true);
        setLoading(true);
        if (currentPlayer === Player.User && getPlayerPockets()[index] > 0) {
            const response = await callEndpoint('api/game_pigeon/mancala_capture/player_move', {
                playerScore: getPlayerScore(),
                aiScore: getAiScore(),
                playerPockets: getPlayerPockets(),
                aiPockets: getAiPockets(),
                move: index
            });
            setPlayingAnimationActive(true);
            await animateMove(response.boardState.recentMove, Player.User);
            // set from board state to apply captures (if applicable)
            await setPocketsFromBoardState(response.boardState);
            setPlayingAnimationActive(false);
            if (!response.boardState.endInBank) {
                setCurrentPlayer(Player.AI);
            }
        }
        setLoading(false);
    };

    const animateMove = async (pocketIndex: number, turn: Player) => {
        let scoreInHand = pockets[pocketIndex];
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

    const resetGame = () => {
        setGameStarted(false);
        setPockets(CAPTURE_STARTING_POCKETS);
        setCurrentPlayer(startingPlayer);
        setPlayingAnimationActive(false);
        setWinner(null);
        setLoading(false);
    }

    useEffect(() => {
        if (winner) {
            return;
        }
        if (currentPlayer === Player.AI && autoplay && !loading) {
            getAiMove();
        }
    }, [currentPlayer, winner, autoplay, loading]);

    return (
        <div className="flex flex-col gap-4 bg-background-base min-h-screen items-center">
            <h1 className="text-center text-3xl font-bold text-primary-highlight mb-4">Mancala!</h1>
            <div className="border p-4 rounded-lg shadow-lg flex flex-col md:flex-row flex-wrap gap-4 sm:gap-8 items-center justify-center transition duration-500">
                <div className="flex flex-col items-center gap-4 min-w-fit flex-0 relative min-h-[48rem] sm:min-h-[24rem]">
                    <div className="text-lg font-semibold text-secondary-base">AI</div>
                    <div className="hidden sm:block w-full">
                        <HorizontalArrow pointLeft={true} isActive={currentPlayer === Player.AI} />
                    </div>
                    <div className="flex flex-row items-stretch gap-4 h-[39rem] sm:h-auto">
                        <div className="block sm:hidden h-full">
                            <VerticalArrow pointDown={false} isActive={currentPlayer === Player.User} />
                        </div>
                        <MancalaBoard
                            pockets={pockets}
                            selectable={currentPlayer === Player.User && !playingAnimationActive}
                            playerTurn={currentPlayer}
                            turnInProgress={loading}
                            onPocketClick={handlePocketClick}
                        />
                        <div className="block sm:hidden h-full">
                            <VerticalArrow pointDown={true} isActive={currentPlayer === Player.AI} />
                        </div>
                    </div>
                    <div className="hidden sm:block w-full">
                        <HorizontalArrow pointLeft={false} isActive={currentPlayer === Player.User} />
                    </div>
                    <div className="text-lg font-semibold text-primary-base">Player</div>
                    {currentPlayer === Player.AI && !autoplay
                        ?
                        <div className="absolute left-0 right-0 bottom-0 w-full flex justify-center">
                            {
                                !autoplay && (
                                    <ActionButton
                                        label={loading
                                            ? playingAnimationActive
                                                ? "AI is placing moves..."
                                                : "AI is thinking..."
                                            : "Get AI Move"}
                                        onClick={getAiMove}
                                        disabled={loading || winner !== null}
                                        className={`w-48 h-12 text-md 
                                            ${!gameStarted && startingPlayer === Player.AI
                                                ? 'animate-enlargeBounce'
                                                : ''}`
                                        }
                                    />
                                )
                            }
                        </div>
                        : null
                    }
                </div>
                <div className="border p-4 rounded-lg shadow-lg">
                    <InputSection
                        maxDepth={maxDepth}
                        setMaxDepth={setMaxDepth}
                        gameMode={gameMode}
                        setGameMode={setGameMode}
                        autoplay={autoplay}
                        setAutoplay={setAutoplay}
                        startingPlayer={startingPlayer}
                        setStartingPlayer={(player: Player) => {
                            if (!gameStarted) {
                                setCurrentPlayer(player);
                            }
                            setStartingPlayer(player);
                        }}
                        loading={loading}
                        gameStarted={gameStarted}
                        onReset={resetGame}
                    />
                </div>
            </div>
        </div>
    );
};

interface InputSectionProps {
    maxDepth: number;
    setMaxDepth: (depth: number) => void;
    gameMode: GameMode;
    setGameMode: (mode: GameMode) => void;
    autoplay: boolean;
    setAutoplay: (autoplay: boolean) => void;
    startingPlayer: Player;
    setStartingPlayer: (player: Player) => void;
    loading: boolean;
    gameStarted: boolean;
    onReset: () => void;
}


const InputSection: React.FC<InputSectionProps> = ({
    maxDepth,
    setMaxDepth,
    gameMode,
    setGameMode,
    autoplay,
    setAutoplay,
    startingPlayer,
    setStartingPlayer,
    loading,
    gameStarted,
    onReset,
}) => {
    const restartButtonLabel = (
        <div className="flex flex-row justify-center items-center gap-2">
            <span>Restart</span>
            <VscDebugRestart />
        </div>
    )

    return (
        <div className="flex flex-col items-center gap-6 mb-4">
            <ButtonGroupPicker
                optionsWithLabels={[{ label: "Capture", value: GameMode.Capture }, { label: "Avalanche", value: GameMode.Avalanche }]}
                label="Game Mode"
                selectedValue={gameMode}
                setValue={setGameMode}
            />
            <ButtonGroupPicker
                options={[9, 10, 11]}
                label="Max AI Search Depth"
                selectedValue={maxDepth}
                setValue={setMaxDepth}
            />
            <ButtonGroupPicker
                optionsWithLabels={[{ label: "AI", value: Player.AI }, { label: "User", value: Player.User }]}
                label="Starting Player"
                selectedValue={startingPlayer}
                setValue={setStartingPlayer}
            />
            <BooleanSelector
                selected={autoplay}
                label="AI Autoplay"
                onChange={() => {
                    setAutoplay(!autoplay);
                }}
                labelOnBottom={true}
            />
            <ActionButton
                label={restartButtonLabel}
                onClick={onReset}
                className=""
                disabled={loading || !gameStarted}
            />
        </div>
    );
}


interface MancalaBoardProps {
    pockets: number[];
    selectable: boolean;
    playerTurn: Player;
    turnInProgress: boolean;
    onPocketClick: (index: number) => void;
}

const MancalaBoard: React.FC<MancalaBoardProps> = ({
    pockets,
    selectable,
    playerTurn,
    turnInProgress,
    onPocketClick
}) => {
    const playerOutlineAnimates = useOutlineAnimateArray(pockets.slice(0, 6));
    const aiOutlineAnimates = useOutlineAnimateArray(pockets.slice(7, 13).reverse());
    const playerScore = pockets[6];
    const aiScore = pockets[13];
    const playerPockets = pockets.slice(0, 6);
    const aiPockets = pockets.slice(7, 13);
    return (
        <div className="flex flex-col sm:flex-row items-center">
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-mancala-board p-4 rounded-3xl shadow-lg items-stretch">
                <div
                    key={`ai-score-pocket-${aiScore}`}
                    className="bg-secondary rounded-3xl bg-mancala-pocket flex items-center justify-center text-3xl font-bold text-white w-full sm:w-16 h-12 sm:h-auto transition animate-secondaryOutlineBounce"
                >
                    <span key={`ai-score-${aiScore}`} className="transition animate-enlargeBounceBigger text">
                        {aiScore}
                    </span>
                </div>
                <div className="flex flex-row-reverse sm:flex-col items-center gap-2">
                    <div className="grid grid-rows-6 sm:grid-cols-6 sm:grid-rows-1 gap-4">
                        {aiPockets.slice().reverse().map((count, index) => {
                            const opacityClass = playerTurn === Player.AI || turnInProgress ? '' : 'opacity-30'
                            const outlineAnimateClass = aiOutlineAnimates[index]
                                ? playerTurn === Player.User
                                    ? 'transition animate-primaryOutlineBounce'
                                    : 'transition animate-secondaryOutlineBounce'
                                : '';
                            return (
                                <div
                                    key={`ai-${index}-${count}-pocket`}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white bg-mancala-pocket
                                        ${opacityClass}
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
                    <div className="grid grid-rows-6 sm:grid-cols-6 sm:grid-rows-1 gap-4">
                        {playerPockets.map((count, index) => {
                            const pocketActive = selectable && count > 0;
                            const animationClass = pocketActive
                                ? 'transition duration-300 ease-in-out hover:scale-110 cursor-pointer'
                                : turnInProgress
                                    ? ''
                                    : 'transition duration-500 opacity-30'
                            const outlineAnimateClass = playerOutlineAnimates[index]
                                ? playerTurn === Player.User
                                    ? 'transition animate-primaryOutlineBounce'
                                    : 'transition animate-secondaryOutlineBounce'
                                : '';

                            return (
                                <div
                                    key={`player-${index}-${count}-pocket`}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white bg-mancala-pocket
                                        ${animationClass} 
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
                <div key={`player-score-pocket-${playerScore}`} className="bg-secondary rounded-3xl bg-mancala-pocket flex items-center justify-center text-3xl font-bold text-white w-full sm:w-16 h-12 sm:h-auto transition animate-primaryOutlineBounce">
                    <span key={`player-score-${playerScore}`} className="transition animate-enlargeBounceBigger">
                        {playerScore}
                    </span>
                </div>
            </div>
        </div>
    );
}


const HorizontalArrow: React.FC<{ pointLeft: boolean, isActive: boolean }> = ({ pointLeft, isActive }) => {
    return (
        <div className={`flex flex-row justify-center items-center w-full px-8 transition-all duration-500
            ${pointLeft
                ? 'flex-row-reverse'
                : ''}
            ${isActive
                ? ''
                : 'opacity-30'}`}>
            <div
                className={`h-2 w-full 
                    ${pointLeft
                        ? 'bg-secondary-base mr-[-2px]'
                        : 'bg-primary-base ml-[-2px]'}`}
            />
            <div
                className={`h-0 w-0 border-y-8 border-y-transparent 
                ${pointLeft
                        ? 'border-r-[16px] border-r-secondary-base'
                        : 'border-l-[16px] border-l-primary-base'}`}>
            </div>
        </div>
    );
}

const VerticalArrow: React.FC<{ pointDown: boolean, isActive: boolean }> = ({ pointDown, isActive }) => {
    return (
        <div className={`flex flex-col justify-center items-center h-full py-8 transition-all duration-500
            ${pointDown
                ? 'flex-col-reverse'
                : ''}
            ${isActive
                ? ''
                : 'opacity-50'}`}>
            <div
                className={`w-2 h-full 
                    ${pointDown
                        ? 'bg-secondary-base mb-[-2px]'
                        : 'bg-primary-base mt-[-2px]'}`}
            />
            <div
                className={`h-0 w-0 border-x-8 border-x-transparent 
                ${pointDown
                        ? 'border-b-[16px] border-b-secondary-base'
                        : 'border-t-[16px] border-t-primary-base'}`}>
            </div>
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