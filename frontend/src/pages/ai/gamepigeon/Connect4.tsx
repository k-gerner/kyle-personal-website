import React, { useState, useRef, useEffect } from 'react';
import { ButtonGroupPicker, ButtonGroupPickerOption } from '../../../components/ButtonGroupPicker';
import { BooleanSelector } from '../../../atoms/BooleanSelector';
import { ActionButton } from '../../../atoms/ActionButton';
import { RiRobot2Line } from "react-icons/ri";
import { LuCrown } from "react-icons/lu";
import { VscDebugRestart } from "react-icons/vsc";
import { callEndpoint } from '../../../utils/helpers';
import { Player } from '../../../utils/classes';

const ROWS = 6;
const COLUMNS = 7;


const Connect4 = () => {
    // Game settings
    const [autoplay, setAutoplay] = useState(true);
    const [maxDepth, setMaxDepth] = useState(6);
    const [startingPlayer, setStartingPlayer] = useState<Player>(Player.User);
    // Game state
    const [gameStarted, setGameStarted] = useState(false);
    const [playerTurn, setPlayerTurn] = useState<Player>(Player.User);
    const [playerLocations, setPlayerLocations] = useState<number[][]>([]);
    const [aiLocations, setAiLocations] = useState<number[][]>([]);
    const [winningLocations, setWinningLocations] = useState<number[][]>([]); // This can be used to highlight winning locations
    const [loading, setLoading] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);


    const getAiMove = async () => {
        setLoading(true);
        const res = await callEndpoint('api/game_pigeon/connect4', {
            playerLocations,
            aiLocations,
            maxSearchDepth: maxDepth
        });
        const selectedColumn = res.column;
        const newAiLocation = getCoordinateFromColumn(selectedColumn, [...playerLocations, ...aiLocations]);
        const newAiLocations = [...aiLocations, newAiLocation];
        if (res.isWin) {
            const gameOverResponse = await checkGameOver(playerLocations, newAiLocations);
            setWinningLocations(gameOverResponse.winningLocations);
            setWinner(Player.AI);
        }
        setAiLocations(newAiLocations);
        setGameStarted(true);
    }

    const checkGameOver = async (playerLocations: number[][], aiLocations: number[][]) => {
        const response = await callEndpoint('api/game_pigeon/connect4/game_over', {
            playerLocations,
            aiLocations,
        });
        return response;
    };

    const selectColumn = (column: number) => {
        if (getCoordinateFromColumn(column, [...playerLocations, ...aiLocations])[0] >= ROWS) {
            return;
        }
        setGameStarted(true);
        const newPlayerLocation = getCoordinateFromColumn(column, [...playerLocations, ...aiLocations]);
        const newPlayerLocations = [...playerLocations, newPlayerLocation];
        setPlayerLocations(newPlayerLocations);
    }

    const resetGame = () => {
        setPlayerLocations([]);
        setAiLocations([]);
        setWinningLocations([]);
        setLoading(false);
        setPlayerTurn(startingPlayer);
        setWinner(null);
        setGameStarted(false);
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

        if (playerLocations.length >= 4 || aiLocations.length >= 4) {
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
            <h1 className="text-center text-3xl font-bold text-primary-highlight mb-4">Connect 4!</h1>
            <div className="border p-4 rounded-lg shadow-lg flex flex-col md:flex-row gap-4 w-full">
                <div className="flex-shrink-0 transition-all duration-500 w-full md:w-1/2 transition">
                    <Board
                        playerLocations={playerLocations}
                        aiLocations={aiLocations}
                        selectColumn={selectColumn}
                        allowInput={playerTurn === Player.User && !winner}
                        winningLocations={winningLocations}
                    />
                </div>
                <div className="flex flex-col w-full gap-2">
                    {winner && (
                        <div className="animate-revealFromTop overflow-hidden h-full">
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
                            onGetAiMove={getAiMove}
                            disableAiMove={playerTurn === Player.User || loading || winner !== null}
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
    onGetAiMove: () => void;
    disableAiMove: boolean;
    onReset: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
    maxDepth,
    setMaxDepth,
    autoplay,
    setAutoplay,
    startingPlayer,
    setStartingPlayer,
    onGetAiMove,
    disableAiMove,
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
                options={[4, 5, 6]}
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
            {
                !autoplay && (
                    <ActionButton
                        label="Get AI Move"
                        onClick={onGetAiMove}
                        disabled={disableAiMove}
                    />
                )
            }
            <ActionButton
                label={restartButtonLabel}
                onClick={onReset}
                className=""
            />
        </div>
    );
}


interface BoardProps {
    playerLocations: number[][]; // Array of player locations, each sub-array contains [row, column]
    aiLocations: number[][]; // Array of AI locations, each sub-array contains [row, column]
    selectColumn: (column: number) => void;
    allowInput: boolean; // Whether the player can input moves
    winningLocations?: number[][]; // to highlight winning locations
}

const Board: React.FC<BoardProps> = ({
    playerLocations,
    aiLocations,
    selectColumn,
    allowInput,
    winningLocations = [],
}) => {
    // State to track the hovered column
    const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

    // Function to check if a location exists in the array
    const locationExists = (locations: number[][], row: number, col: number) => {
        return locations.some(loc => loc[0] === row && loc[1] === col);
    };

    const getCellClasses = (rowIndex: number, colIndex: number) => {
        const classes = [];
        const nextOpenRowForColumn = getCoordinateFromColumn(colIndex, [...playerLocations, ...aiLocations])[0];
        const isAiLocation = locationExists(aiLocations, rowIndex, colIndex);
        const isPlayerLocation = locationExists(playerLocations, rowIndex, colIndex);
        const isWinningLocation = locationExists(winningLocations, rowIndex, colIndex);

        if (allowInput && hoveredColumn === colIndex) {
            if (rowIndex === nextOpenRowForColumn) {
                classes.push("border-connect-4-board-highlight", "scale-105", "cursor-pointer");
            } else {
                classes.push("cursor-pointer");
            }
        }

        if (isAiLocation) {
            classes.push("bg-connect-4-piece-red");
        }

        if (isPlayerLocation) {
            classes.push("bg-connect-4-piece-yellow");
        }

        if (isWinningLocation) {
            classes.push("border-connect-4-board-highlight");
        }

        return classes.join(" ");
    };


    return (
        <div className="flex flex-row justify-center">
            <div className="relative bg-connect-4-board rounded-lg p-2 grid grid-cols-7 gap-1 w-full max-w-[34rem] aspect-[7/6]">
                {Array.from({ length: ROWS * COLUMNS }).map((_, index) => {
                    const colIndex = index % COLUMNS;
                    const rowIndex = ROWS - 1 - Math.floor(index / COLUMNS); // Reverse the row index
                    const cellClasses = getCellClasses(rowIndex, colIndex);

                    return (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`flex items-center justify-center rounded-full border-4 border-connect-4-board bg-background-base transition-transform duration-200 ${cellClasses}`}
                            style={{
                                clipPath: "circle(50%)",
                            }}
                            onMouseEnter={() => setHoveredColumn(colIndex)}
                            onMouseLeave={() => setHoveredColumn(null)}
                            onClick={() => allowInput && selectColumn(colIndex)}
                        >
                            <span className="absolute flex items-center justify-center">
                                {locationExists(aiLocations, rowIndex, colIndex) ? (
                                    <RiRobot2Line className="w-full h-full" />
                                ) : locationExists(playerLocations, rowIndex, colIndex) ? (
                                    <LuCrown className="w-full h-full" />
                                ) : null}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
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

/**
 * Get the coordinate for the next available row in the specified column.
 * @param column specified column
 * @param existingLocations array of existing locations, each sub-array contains [row, column]
 * @returns 
 */
function getCoordinateFromColumn(column: number, existingLocations: number[][]): [number, number] {
    let lowestRow = 0;
    existingLocations.forEach(([row, col]) => {
        if (col === column) {
            if (lowestRow === undefined || row >= lowestRow) {
                lowestRow = row + 1;
            }
        }
    });
    return [lowestRow, column];
}

export default Connect4;