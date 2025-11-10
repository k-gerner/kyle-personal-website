import React, { useState, useEffect } from 'react';
import { VscDebugRestart } from "react-icons/vsc";

import { ActionButton } from '../../../atoms/ActionButton';
import { callEndpoint } from '../../../utils/helpers';
import { Player } from '../../../utils/classes';
import { ButtonGroupPicker } from '../../../components/ButtonGroupPicker';
import { BooleanSelector } from '../../../atoms/BooleanSelector';
import { TitleWithInfo } from '../../../components/TitleWithInfo';

const BOARD_SIZE = 8;
const INITIAL_BOARD_STATE = {
    player: [
        [Math.floor(BOARD_SIZE / 2) - 1, Math.floor(BOARD_SIZE / 2) - 1],
        [Math.floor(BOARD_SIZE / 2), Math.floor(BOARD_SIZE / 2)]
    ],
    ai: [
        [Math.floor(BOARD_SIZE / 2) - 1, Math.floor(BOARD_SIZE / 2)],
        [Math.floor(BOARD_SIZE / 2), Math.floor(BOARD_SIZE / 2) - 1]
    ]
};
const INITIAL_VALID_LOCATIONS = {
    player: [
        [Math.floor(BOARD_SIZE / 2) - 1, Math.floor(BOARD_SIZE / 2) + 1], // (3, 5)
        [Math.floor(BOARD_SIZE / 2) - 2, Math.floor(BOARD_SIZE / 2)],     // (2, 4)
        [Math.floor(BOARD_SIZE / 2), Math.floor(BOARD_SIZE / 2) - 2],     // (4, 2)
        [Math.floor(BOARD_SIZE / 2) + 1, Math.floor(BOARD_SIZE / 2) - 1]  // (5, 3)
    ],
    ai: [
        [Math.floor(BOARD_SIZE / 2) - 1, Math.floor(BOARD_SIZE / 2) - 2], // (3, 2)
        [Math.floor(BOARD_SIZE / 2) - 2, Math.floor(BOARD_SIZE / 2) - 1], // (2, 3)
        [Math.floor(BOARD_SIZE / 2), Math.floor(BOARD_SIZE / 2) + 1],     // (4, 5)
        [Math.floor(BOARD_SIZE / 2) + 1, Math.floor(BOARD_SIZE / 2)]      // (5, 4)
    ]
}

enum PieceType {
    EMPTY,
    PLAYER,
    AI
}

const Othello = () => {
    // Game settings
    const [autoplay, setAutoplay] = useState(true);
    const [maxDepth, setMaxDepth] = useState(5);
    const [startingPlayer, setStartingPlayer] = useState<Player>(Player.User);
    // Game state
    const [gameActive, setGameActive] = useState(false);
    const [playerTurn, setPlayerTurn] = useState<Player>(Player.User);
    const [turnCount, setTurnCount] = useState(0);
    const [selectedPosition, setSelectedPosition] = useState<number[] | null>(null);
    const [pieceLocations, setPieceLocations] = useState<{
        player: number[][]; // Array of player locations
        ai: number[][];     // Array of AI locations
    }>(INITIAL_BOARD_STATE);
    const [validPlayerLocations, setValidPlayerLocations] = useState<number[][]>(INITIAL_VALID_LOCATIONS.player);
    const [loading, setLoading] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);
    const [recentAiMove, setRecentAiMove] = useState<number[] | null>(null);


    const triggerGameOver = (playerLocations: number[][], aiLocations: number[][]) => {
        if (playerLocations.length > aiLocations.length) {
            setWinner(Player.User);
        } else if (playerLocations.length < aiLocations.length) {
            setWinner(Player.AI);
        } else {
            setWinner(Player.NEITHER);
        }
        setValidPlayerLocations([]);
        setGameActive(false);
    }

    const getAiMove = async () => {
        setGameActive(true);
        setLoading(true);
        const res = await callEndpoint('api/game_pigeon/othello', {
            playerLocations: pieceLocations.player,
            aiLocations: pieceLocations.ai,
            maxSearchDepth: maxDepth
        });
        const selectedRow = res.row;
        const selectedColumn = res.column;
        const newAiLocation = [selectedRow, selectedColumn];
        const newAiLocations = res.newAiLocations;
        const newPlayerLocations = res.newPlayerLocations;
        setRecentAiMove(newAiLocation);
        setLoading(false);
        setPieceLocations({
            player: newPlayerLocations,
            ai: newAiLocations
        });
        setLoading(false);
    }

    const switchPlayerTurn = () => {
        const opposingPlayer = getOpposingPlayer(playerTurn);
        setPlayerTurn(opposingPlayer);
    }

    const advanceTurn = async () => {
        const validMovesRes = await callEndpoint('api/game_pigeon/othello/valid_moves', {
            playerLocations: pieceLocations.player,
            aiLocations: pieceLocations.ai,
        });
        const opposingPlayer = getOpposingPlayer(playerTurn);
        if ((
            opposingPlayer === Player.AI
            && validMovesRes.ai.length > 0)
            || (
                opposingPlayer === Player.User
                && validMovesRes.player.length > 0
            )) {
            if (playerTurn === Player.AI) {
                setValidPlayerLocations(validMovesRes.player);
            } else if (playerTurn === Player.User) {
                setValidPlayerLocations(validMovesRes.ai);
            }
            switchPlayerTurn();
        } else if (playerTurn === Player.User) {
            setValidPlayerLocations(validMovesRes.player);
        } else {
            setValidPlayerLocations(validMovesRes.ai);
        }
        setTurnCount(turnCount + 1);
    }

    const getOpposingPlayer = (player: Player): Player => {
        return player === Player.User ? Player.AI : Player.User;
    }

    const playPosition = async () => {
        setGameActive(true);
        const newPlayerLocation = selectedPosition || [0, 0];
        const newPieceLocations = await callEndpoint('api/game_pigeon/othello/perform_move', {
            playerLocations: pieceLocations.player,
            aiLocations: pieceLocations.ai,
            playerMove: newPlayerLocation
        });
        console.log('newPieceLocations', newPieceLocations);
        setPieceLocations(newPieceLocations);
        setSelectedPosition(null);
    }

    const resetGame = () => {
        setPieceLocations(INITIAL_BOARD_STATE);
        setRecentAiMove(null);
        setLoading(false);
        setPlayerTurn(startingPlayer);
        setWinner(null);
        setGameActive(false);
        setSelectedPosition(null);
        setTurnCount(0);
        setValidPlayerLocations(startingPlayer === Player.User
            ? INITIAL_VALID_LOCATIONS.player
            : INITIAL_VALID_LOCATIONS.ai
        );
    }

    useEffect(() => {
        if (!gameActive) {
            return;
        }
        if (pieceLocations.player.length + pieceLocations.ai.length === BOARD_SIZE * BOARD_SIZE) {
            triggerGameOver(pieceLocations.player, pieceLocations.ai);
            return;
        }
        advanceTurn()
    }, [pieceLocations]);

    useEffect(() => {
        if (playerTurn === Player.AI && !winner) {
            if (autoplay) {
                getAiMove();
            }
        }
    }, [turnCount, autoplay, playerTurn]);


    return (
        <div className="flex flex-col gap-4 bg-background-base items-center">
            <OthelloTitleSection />
            <div className="border border-brd-muted p-4 rounded-lg shadow-lg flex items-start flex-col md:flex-row gap-4 w-full">
                <ScoreBoard
                    playerScore={pieceLocations.player.length}
                    aiScore={pieceLocations.ai.length}
                />
                <div className="w-full md:w-1/2 transition min-w-fit flex-shrink-0">
                    <div className="flex flex-col gap-2 items-center transition-all duration-500 w-full">
                        <OthelloBoard
                            playerLocations={pieceLocations.player}
                            aiLocations={pieceLocations.ai}
                            selectedPosition={selectedPosition}
                            previewPosition={(pos) => {
                                if (playerTurn === Player.User && !winner) {
                                    setSelectedPosition(pos);
                                }
                            }}
                            allowInput={playerTurn === Player.User && !winner}
                            highlightedPositions={recentAiMove ? [recentAiMove] : []}
                            validPositions={validPlayerLocations}
                            playerTurn={playerTurn}
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
                            className={`w-48 h-12 text-md ${!gameActive && startingPlayer === Player.AI && turnCount === 0 ? 'animate-enlargeBounce' : ''}`}
                        />
                    </div>
                </div>
                <div className="flex flex-col w-full gap-2">
                    {winner && (
                        <div className="animate-revealFromTop overflow-hidden">
                            <WinnerSection winner={winner} onReset={resetGame} />
                        </div>
                    )}
                    <div className="border border-brd-muted p-4 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 w-full">
                        <div className="flex flex-col text-center gap-2">
                            <h2 className="text-text-base text-lg font-semibold">Game Settings</h2>
                        </div>
                        <InputSection
                            maxDepth={maxDepth}
                            setMaxDepth={setMaxDepth}
                            autoplay={autoplay}
                            setAutoplay={setAutoplay}
                            startingPlayer={startingPlayer}
                            setStartingPlayer={(player: Player) => {
                                if (!gameActive) {
                                    setValidPlayerLocations(player === Player.User
                                        ? INITIAL_VALID_LOCATIONS.player
                                        : INITIAL_VALID_LOCATIONS.ai
                                    );
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
                options={[4, 5, 6, 7]}
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


interface OthelloBoardProps {
    playerLocations: number[][];
    aiLocations: number[][];
    selectedPosition: number[] | null;
    previewPosition: (pos: number[] | null) => void;
    allowInput: boolean;
    highlightedPositions: number[][];
    validPositions: number[][];
    playerTurn: Player;
}

const OthelloBoard: React.FC<OthelloBoardProps> = ({
    playerLocations,
    aiLocations,
    selectedPosition,
    previewPosition,
    allowInput,
    highlightedPositions,
    validPositions,
    playerTurn
}) => {
    const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

    const selectedRow = selectedPosition ? selectedPosition[0] : null;
    const selectedCol = selectedPosition ? selectedPosition[1] : null;
    return (
        <div className="relative bg-othello-board p-5 rounded-3xl max-w-xs md:max-w-fit aspect-square">
            {board.map((r, rowIndex) => (
                <div key={rowIndex} className={`flex flex-row`}>
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

                        let borderRadiusClass = '';
                        if (rowIndex === 0 && colIndex === 0) {
                            // Top-left corner
                            borderRadiusClass = 'rounded-tl-lg';
                        } else if (rowIndex === 0 && colIndex === BOARD_SIZE - 1) {
                            // Top-right corner
                            borderRadiusClass = 'rounded-tr-lg';
                        } else if (rowIndex === BOARD_SIZE - 1 && colIndex === 0) {
                            // Bottom-left corner
                            borderRadiusClass = 'rounded-bl-lg';
                        } else if (rowIndex === BOARD_SIZE - 1 && colIndex === BOARD_SIZE - 1) {
                            // Bottom-right corner
                            borderRadiusClass = 'rounded-br-lg';
                        }
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`relative w-8 h-8 md:w-12 md:h-12 z-10 flex border border-black bg-othello-board flex justify-center items-center
                                    ${allowInput && locationsContain(validPositions, cellCoords) ? 'cursor-pointer' : ''}
                                    ${borderRadiusClass}`}
                                onClick={() => {
                                    if (allowInput && locationsContain(validPositions, cellCoords)) {
                                        previewPosition(cellCoords);
                                    }
                                }}
                            >
                                {/* Background animation */}
                                {locationsContain(validPositions, cellCoords) && (
                                    // Flash the cell if it's a valid position
                                    // Use a key based on playerTurn to retrigger animation when turn changes
                                    <div key={`${playerTurn}-${rowIndex}-${colIndex}`} className={`absolute inset-0 animate-customPulse ${playerTurn === Player.User ? 'bg-primary-base' : 'bg-secondary-base'} z-0`}></div>
                                )}

                                {pieceType !== PieceType.EMPTY ? (
                                    <Piece
                                        type={pieceType}
                                        highlighted={
                                            isSelected || locationsContain(highlightedPositions, cellCoords)
                                        }
                                    />
                                ) : (
                                    <Piece type={PieceType.EMPTY} />
                                )}
                            </div>
                            // </div>
                        )
                    })}
                </div>
            ))}
        </div>
    );
}


interface ScoreBoardProps {
    playerScore: number;
    aiScore: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ playerScore, aiScore }) => {
    return (
        <div className="px-10 gap-12 flex flex-row md:flex-col gap-4 justify-center items-center bg-primary-base rounded-3xl max-w-fit max-h-fit py-2 md:py-10 self-center">
            <div className="flex flex-col items-center gap-2">
                <span className="text-lg font-semibold text-text-contrast">Player</span>
                <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center z-10">
                    <Piece type={PieceType.PLAYER} />
                </div>
                <span className="text-2xl font-bold text-text-contrast">{playerScore}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <span className="text-lg font-semibold text-text-contrast">AI</span>
                <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center z-10">
                    <Piece type={PieceType.AI} />
                </div>
                <span className="text-2xl font-bold text-text-contrast">{aiScore}</span>
            </div>
        </div>
    );
}



interface PieceProps {
    type: PieceType;
    hover?: boolean;
    highlighted?: boolean;
}

const Piece: React.FC<PieceProps> = ({
    type,
    hover = false,
    highlighted = false,
}) => {
    let gradientStr = '';
    if (type === PieceType.AI) {
        // Black piece with a convex gradient
        gradientStr = 'bg-gradient-to-b from-gray-600 via-gray-800 to-othello-piece-black';
    } else if (type === PieceType.PLAYER) {
        // White piece with a convex gradient
        gradientStr = 'bg-gradient-to-b from-othello-piece-white via-gray-200 to-gray-400';
    } else if (type === PieceType.EMPTY) {
        gradientStr = 'bg-transparent';
    }
    const outlineStr = highlighted
        ? `outline outline-2 ${type === PieceType.AI
            ? 'outline-secondary-base'
            : 'outline-primary-base'}`
        : '';
    const shadowStr = type === PieceType.EMPTY ? '' : 'shadow-lg shadow-black/50';

    return (
        <div
            className={`w-[90%] h-[90%] ${gradientStr} ${outlineStr} ${shadowStr} rounded-full z-50`}
        ></div>
    );
};


interface WinnerSectionProps {
    winner: Player;
    onReset: () => void;
}

const WinnerSection: React.FC<WinnerSectionProps> = ({ winner, onReset }) => {
    const backgroundColor = winner === Player.User
        ? "bg-success"
        : winner === Player.AI
            ? "bg-danger"
            : "bg-primary-base";
    const winnerText = winner === Player.User
        ? "You Win!"
        : winner === Player.AI
            ? "AI Wins!"
            : "It's a Tie!";
    return (
        <div className={`border border-brd-muted p-4 rounded-lg flex flex-col items-center justify-center gap-4 ${backgroundColor}`}>
            <h2 className="text-2xl font-bold text-text-light">
                {winnerText}
            </h2>
            <ActionButton
                label="Play Again"
                onClick={onReset}
                className="text-text-light border-text-light"
            />
        </div>
    );
};


const OthelloTitleSection: React.FC = () => {
    return (
        <TitleWithInfo
            title="Othello!"
            infoTitle="How to Play Othello"
            objective="Have the most pieces on the board when the game ends."
            rules={[
                "Players take turns placing pieces on the board.",
                "When a piece is placed, all of the opponent's pieces that are in a straight line (horizontal, vertical, or diagonal) and bounded by the placed piece and another piece of the current player's color are flipped to the current player's color.",
                "If a player cannot make a valid move, they must pass their turn.",
                "The game ends when the board is full.",
                "The player with the most pieces on the board at the end of the game wins."
            ]}
            instructionsTitle="Game Settings"
            toolInstructions={[
                (
                    <div><b>Max AI Search Depth</b>: How deep the AI will search for the best move.</div>
                ),
                (
                    <div><b>Starting Player</b>: Which player goes first.</div>
                ),
                (
                    <div><b>AI Autoplay</b>: Whether to automatically play the best moves for the AI.</div>
                ),
            ]}
        />
    );
}


function locationsContain(locations: number[][], position: number[]): boolean {
    return locations.some(([row, col]) => row === position[0] && col === position[1]);
}

export default Othello;