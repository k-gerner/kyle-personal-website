import React, { useState, useEffect } from 'react';
import { VscDebugRestart } from "react-icons/vsc";

import Input from "../../../atoms/Input";
import { ActionButton } from '../../../atoms/ActionButton';
import { callEndpoint } from '../../../utils/helpers';
import { Player } from '../../../utils/classes';
import { ButtonGroupPicker } from '../../../components/ButtonGroupPicker';
import { BooleanSelector } from '../../../atoms/BooleanSelector';

const BOARD_SIZE = 13;

const Gomoku = () => {
    // Game settings
    const [autoplay, setAutoplay] = useState(true);
    const [maxDepth, setMaxDepth] = useState(4);
    const [startingPlayer, setStartingPlayer] = useState<Player>(Player.User);
    // Game state
    const [gameStarted, setGameStarted] = useState(false);
    const [playerTurn, setPlayerTurn] = useState<Player>(Player.User);
    const [selectedPosition, setSelectedPosition] = useState<number[] | null>(null);
    const [playerLocations, setPlayerLocations] = useState<number[][]>([]);
    const [aiLocations, setAiLocations] = useState<number[][]>([]);
    const [winningLocations, setWinningLocations] = useState<number[][]>([]); // This can be used to highlight winning locations
    const [loading, setLoading] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);
    const [recentAiMove, setRecentAiMove] = useState<number[] | null>(null);

    const getAiMove = async () => {
        setLoading(true);
        const res = await callEndpoint('api/game_pigeon/gomoku', {
            playerLocations,
            aiLocations,
            maxSearchDepth: maxDepth
        });
        const selectedRow = res.row;
        const selectedColumn = res.column;
        const newAiLocation = [selectedRow, selectedColumn];
        const newAiLocations = [...aiLocations, newAiLocation];
        if (res.isWin) {
            const gameOverResponse = await checkGameOver(playerLocations, newAiLocations);
            setWinningLocations(gameOverResponse.winningLocations);
            setWinner(Player.AI);
        }
        setRecentAiMove(newAiLocation);
        setAiLocations(newAiLocations);
        setGameStarted(true);
    }

    const checkGameOver = async (playerLocations: number[][], aiLocations: number[][]) => {
        const response = await callEndpoint('api/game_pigeon/gomoku/game_over', {
            playerLocations,
            aiLocations,
        });
        return response;
    };

    const playPosition = () => {
        setGameStarted(true);
        const newPlayerLocation = selectedPosition || [0, 0];
        const newPlayerLocations = [...playerLocations, newPlayerLocation];
        setPlayerLocations(newPlayerLocations);
        setSelectedPosition(null);
    }

    const resetGame = () => {
        setPlayerLocations([]);
        setAiLocations([]);
        setWinningLocations([]);
        setRecentAiMove(null);
        setLoading(false);
        setPlayerTurn(startingPlayer);
        setWinner(null);
        setGameStarted(false);
        setSelectedPosition(null);
    }

    useEffect(() => {
        const checkWinAndUpdate = async () => {
            const gameOverResponse = await checkGameOver(playerLocations, aiLocations);
            if (gameOverResponse.isOver) {
                setWinningLocations(gameOverResponse.winningLocations);
                setWinner(gameOverResponse.aiWins ? Player.AI : Player.User);
            }
            else {
                setPlayerTurn(Player.AI);
            }
        };

        if (playerLocations.length >= 5 || aiLocations.length >= 5) {
            checkWinAndUpdate();
        } else if (playerLocations.length > 0) {
            setPlayerTurn(Player.AI);
        }
    }, [playerLocations]);

    useEffect(() => {
        if (aiLocations.length === 0) {
            return;
        }
        setPlayerTurn(Player.User);
        setLoading(false);
    }, [aiLocations]);

    useEffect(() => {
        if (winner) {
            return;
        }
        if (playerTurn === Player.AI && autoplay && !loading) {
            getAiMove();
        }
    }, [playerTurn, winner, autoplay, loading]);


    return (
        <div className="flex flex-col gap-4 bg-background-base min-h-screen items-center">
            <h1 className="text-center text-3xl font-bold text-primary-highlight mb-4">Gomoku!</h1>
            <div className="border p-4 rounded-lg shadow-lg flex flex-col md:flex-row gap-4 w-full">
                <div className="flex flex-col gap-2 items-center flex-shrink-0 transition-all duration-500 w-full md:w-1/2 transition min-w-fit">
                    <GomokuBoard
                        playerLocations={playerLocations}
                        aiLocations={aiLocations}
                        selectedPosition={selectedPosition}
                        previewPosition={(pos) => {
                            if (playerTurn === Player.User && !winner) {
                                setSelectedPosition(pos);
                            }
                        }}
                        allowInput={playerTurn === Player.User && !winner}
                        highlightedPositions={winningLocations?.length ? winningLocations : recentAiMove ? [recentAiMove] : []}
                    />
                    <ActionButton
                        label={playerTurn === Player.User
                            ? "Place Piece"
                            : loading
                                ? "AI is thinking..."
                                : "Get AI Move"}
                        onClick={playerTurn === Player.User ? playPosition : getAiMove}
                        disabled={
                            (playerTurn === Player.User && !selectedPosition) ||
                            loading ||
                            winner !== null
                        }
                        className={`w-48 h-12 text-md ${!gameStarted && startingPlayer === Player.AI ? 'animate-enlargeBounce' : ''}`}
                    />
                </div>
                <div className="flex flex-col w-full gap-2">
                    {winner && (
                        <div className="animate-revealFromTop overflow-hidden">
                            <WinnerSection winner={winner} onReset={resetGame} />
                        </div>
                    )}
                    <div className="border p-4 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 w-full">
                        <div className="flex flex-col text-center gap-2">
                            <h2 className="text-lg font-semibold">Game Settings</h2>
                        </div>
                        <InputSection
                            maxDepth={maxDepth}
                            setMaxDepth={setMaxDepth}
                            autoplay={autoplay}
                            setAutoplay={setAutoplay}
                            startingPlayer={startingPlayer}
                            setStartingPlayer={(player: Player) => {
                                if (!gameStarted) {
                                    setPlayerTurn(player);
                                }
                                setStartingPlayer(player);
                            }}
                            onReset={resetGame}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface InputSectionProps {
    maxDepth: number;
    setMaxDepth: (depth: number) => void;
    autoplay: boolean;
    setAutoplay: (autoplay: boolean) => void;
    startingPlayer: Player;
    setStartingPlayer: (player: Player) => void;
    onReset: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
    maxDepth,
    setMaxDepth,
    autoplay,
    setAutoplay,
    startingPlayer,
    setStartingPlayer,
    onReset
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
                options={[3, 4, 5]}
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
            />
        </div>
    );
}


interface GomokuBoardProps {
    playerLocations: number[][];
    aiLocations: number[][];
    selectedPosition: number[] | null;
    previewPosition: (position: number[]) => void;
    allowInput: boolean;
    highlightedPositions: number[][];
}

const GomokuBoard: React.FC<GomokuBoardProps> = ({
    playerLocations,
    aiLocations,
    selectedPosition,
    previewPosition,
    allowInput,
    highlightedPositions }) => {

    const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

    const selectedRow = selectedPosition ? selectedPosition[0] : null;
    const selectedCol = selectedPosition ? selectedPosition[1] : null;
    return (
        <div className="relative bg-gomoku-board pl-5 pt-5 rounded-lg max-w-fit">
            {board.map((r, rowIndex) => (
                // Using negative margins to offset the extra padding caused by having edge row/cols
                // Without the negative margins, the board would be extra padded on the right/bottom
                <div key={rowIndex} className={`flex flex-row ${rowIndex === BOARD_SIZE - 1 ? '-mb-3' : ''}`}>
                    {r.map((cell, colIndex) => {
                        const cellCoords = [rowIndex, colIndex];
                        let pieceType: PieceType = PieceType.EMPTY;
                        let isSelected = false;

                        if (locationsContain(aiLocations, cellCoords)) {
                            pieceType = PieceType.AI;
                        } else if (locationsContain(playerLocations, cellCoords)) {
                            pieceType = PieceType.PLAYER;
                        } else if (rowIndex === selectedRow && colIndex === selectedCol) {
                            pieceType = PieceType.PLAYER;
                            isSelected = true;
                        }
                        return (
                            // Using negative margins to offset the extra padding caused by having edge row/cols
                            // Without the negative margins, the board would be extra padded on the right/bottom
                            <div key={`${rowIndex}-${colIndex}`} className={`relative ${colIndex === BOARD_SIZE - 1 ? '-mr-3' : ''}`}>
                                {/* Square */}
                                <div
                                    className={`w-8 h-8
                                        ${rowIndex === BOARD_SIZE - 1 || colIndex === BOARD_SIZE - 1
                                            ? ''
                                            : 'border border-black bg-gomoku-board'}`}
                                />

                                {/* Intersection (potential piece position) */}
                                <div
                                    className='absolute w-7 h-7'
                                    style={{
                                        top: '0%',
                                        left: '0%',
                                    }}
                                >
                                    {pieceType !== PieceType.EMPTY
                                        ? <Piece type={pieceType} highlighted={isSelected || locationsContain(highlightedPositions, cellCoords)} />
                                        : <Piece
                                            type={PieceType.EMPTY}
                                            allowSelect={allowInput}
                                            onClick={() => {
                                                previewPosition(cellCoords);
                                            }}
                                        />

                                    }
                                </div>
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    );
}


enum PieceType {
    EMPTY,
    PLAYER,
    AI
}

interface PieceProps {
    type: PieceType;
    onClick?: () => void;
    hover?: boolean;
    highlighted?: boolean;
    allowSelect?: boolean;
}

const Piece: React.FC<PieceProps> = ({
    type,
    onClick,
    hover = false,
    highlighted = false,
    allowSelect = false
}) => {
    let gradientStr = '';
    if (type === PieceType.AI) {
        // Black piece with a convex gradient
        gradientStr = 'bg-gradient-to-b from-gray-600 via-gray-800 to-gomoku-piece-black';
    } else if (type === PieceType.PLAYER) {
        // White piece with a convex gradient
        gradientStr = 'bg-gradient-to-b from-gomoku-piece-white via-gray-200 to-gray-400';
    } else if (type === PieceType.EMPTY) {
        gradientStr = 'bg-transparent';
    }
    const outlineStr = highlighted
        ? `outline outline-2 ${type === PieceType.AI
            ? 'outline-secondary-base'
            : 'outline-primary-base'}`
        : '';
    const shadowStr = type === PieceType.EMPTY ? '' : 'shadow-lg shadow-black/50';
    const cursorStr = type === PieceType.EMPTY && allowSelect ? 'cursor-pointer' : ''

    return (
        <div
            className={`w-7 h-7 ${gradientStr} ${outlineStr} ${shadowStr} ${cursorStr} rounded-full transform -translate-x-1/2 -translate-y-1/2`}
            {...(onClick ? { onClick } : {})}
        ></div>
    );
};


interface WinnerSectionProps {
    winner: Player;
    onReset: () => void;
}

const WinnerSection: React.FC<WinnerSectionProps> = ({ winner, onReset }) => {
    const backgroundColor = winner === Player.User ? "bg-success" : "bg-danger";
    return (
        <div className={`border p-4 rounded-lg flex flex-col items-center justify-center gap-4 ${backgroundColor}`}>
            <h2 className="text-2xl font-bold text-text-contrast">
                {winner === Player.User ? "You Win!" : "AI Wins!"}
            </h2>
            <ActionButton
                label="Play Again"
                onClick={onReset}
                className="text-text-contrast"
            />
        </div>
    );
};


function locationsContain(locations: number[][], position: number[]): boolean {
    return locations.some(([row, col]) => row === position[0] && col === position[1]);
}


export default Gomoku;