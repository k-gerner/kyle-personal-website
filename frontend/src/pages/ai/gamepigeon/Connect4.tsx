import React, { useState, useRef, useEffect } from 'react';
import { ButtonGroupPicker, ButtonGroupPickerOption } from '../../../components/ButtonGroupPicker';
import { BooleanSelector } from '../../../atoms/BooleanSelector';
import { RiRobot2Line } from "react-icons/ri";
import { LuCrown } from "react-icons/lu";
import { VscDebugRestart } from "react-icons/vsc";
import { callEndpoint } from '../../../utils/helpers';

const ROWS = 6;
const COLUMNS = 7;

enum Player {
    User = "user",
    AI = "ai"
}

const buttonStyle = "rounded-full border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-text-contrast hover:bg-primary-base hover:border-primary-base focus-visible:text-text-contrast focus-visible:bg-primary-highlight focus-visible:border-primary-base active:border-primary-highlight active:text-text-contrast active:bg-primary-highlight disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:opacity-50 disabled:bg-slate-200 disabled:border-slate-200 disabled:text-slate-400"

const Connect4 = () => {
    const [autoplay, setAutoplay] = useState(true);
    const [maxDepth, setMaxDepth] = useState(6);
    const [playerLocations, setPlayerLocations] = useState<number[][]>([]);
    const [aiLocations, setAiLocations] = useState<number[][]>([]);
    const [allowInput, setAllowInput] = useState(true);
    const [loading, setLoading] = useState(false);
    const [playerTurn, setPlayerTurn] = useState(true);
    const [winner, setWinner] = useState<Player | null>(null);
    const [startingPlayer, setStartingPlayer] = useState<Player>(Player.User);
    const [gameStarted, setGameStarted] = useState(false);
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    // TODO: Cleanup any duplicative / complicated logic for all the similar vars
    // e.g. playerturn, allowInput, gameStarted
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //

    const getCoordinateFromColumn = (column: number) => {
        // Find the lowest empty row in the selected column
        let lowestRow = 0;
        [...playerLocations, ...aiLocations].forEach(([row, col]) => {
            if (col === column) {
                if (lowestRow === undefined || row >= lowestRow) {
                    lowestRow = row + 1;
                }
            }
        });
        return [lowestRow, column];
    }

    const getAiMove = async () => {
        setAllowInput(false);
        setLoading(true);
        const res = await callEndpoint('api/game_pigeon/connect4', {
            playerLocations,
            aiLocations,
            maxSearchDepth: maxDepth
        });
        const isWin = res.isWin;
        const selectedColumn = res.column;
        const newAiLocation = getCoordinateFromColumn(selectedColumn);
        const newAiLocations = [...aiLocations, newAiLocation];
        setAiLocations(newAiLocations);
        if (isWin) {
            setWinner(Player.AI);
        } else {
            setAllowInput(true);
        }
    }

    const selectColumn = (column: number) => {
        if (!allowInput || getCoordinateFromColumn(column)[0] >= ROWS) {
            return;
        }
        setGameStarted(true);
        const newPlayerLocation = getCoordinateFromColumn(column);
        const newPlayerLocations = [...playerLocations, newPlayerLocation];
        setPlayerLocations(newPlayerLocations);
        setPlayerTurn(false);
    }

    const resetGame = () => {
        setPlayerLocations([]);
        setAiLocations([]);
        setAllowInput(true);
        setLoading(false);
        setPlayerTurn(true);
        setWinner(null);
        setGameStarted(false);
    }

    useEffect(() => {
        if (!playerTurn && autoplay) {
            getAiMove();
        }
    }, [playerLocations]); // Trigger when playerLocations changes

    useEffect(() => {
        setPlayerTurn(true);
        setLoading(false);
    }, [aiLocations]); // Reset player turn when AI locations change

    useEffect(() => {
        if (winner) {
            setAllowInput(false);
        }
    }, [winner]); // Disable input if there's a winner

    useEffect(() => {
        if (!playerTurn) {
            setAllowInput(false);
        }
    }, [playerTurn]); // Disable input if it's AI's turn

    return (
        <div className="flex flex-col gap-4 bg-background-base min-h-screen">
            <h1 className="text-center text-3xl font-bold text-primary-highlight mb-4">Connect 4!</h1>
            <div className="border p-4 rounded-lg shadow-lg flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0 transition-all duration-500 w-full md:w-1/2 transition">
                    <Board
                        playerLocations={playerLocations}
                        aiLocations={aiLocations}
                        selectColumn={selectColumn}
                        allowInput={allowInput}
                    />
                </div>
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
                                console.log(`Setting starting player to ${player}`);
                                setPlayerTurn(player === "user");
                                setStartingPlayer(player);
                            }
                        }}
                        onReset={resetGame}
                    />
                </div>
            </div>
            <button
                onClick={getAiMove}
                disabled={playerTurn || loading}
                className={`${buttonStyle} w-48`}
            >Ai moves REMOVE ME</button>
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
    return (
        <div className="flex flex-col items-center gap-6 mb-4">
            <ButtonGroupPicker
                options={[3, 4, 5, 6]}
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
            <div className="flex justify-center">
                <button
                    onClick={onReset}
                    className={`${buttonStyle} w-48`}
                >
                    <div className="flex flex-row justify-center items-center gap-2">
                        <span>Restart</span>
                        {<VscDebugRestart />}
                    </div>
                </button>
            </div>
        </div>
    );
}


interface BoardProps {
    playerLocations: number[][]; // Array of player locations, each sub-array contains [row, column]
    aiLocations: number[][]; // Array of AI locations, each sub-array contains [row, column]
    selectColumn: (column: number) => void;
    allowInput: boolean; // Whether the player can input moves
}

const Board: React.FC<BoardProps> = ({
    playerLocations,
    aiLocations,
    selectColumn,
    allowInput
}) => {
    // State to track the hovered column
    const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

    // Function to check if a location exists in the array
    const locationExists = (locations: number[][], row: number, col: number) => {
        return locations.some(loc => loc[0] === row && loc[1] === col);
    };


    return (
        <div className="flex flex-row justify-center">
            <div className="relative bg-primary-base rounded-lg p-2 grid grid-cols-7 gap-1 w-full max-w-[34rem] aspect-[7/6]">
                {Array.from({ length: ROWS * COLUMNS }).map((_, index) => {
                    const colIndex = index % COLUMNS;
                    const rowIndex = ROWS - 1 - Math.floor(index / COLUMNS); // Reverse the row index

                    return (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`flex items-center justify-center rounded-full border-4 border-primary-base bg-background-base transition-transform duration-200 ${allowInput && hoveredColumn === colIndex
                                ? "border-primary-highlight scale-105 cursor-pointer"
                                : ""
                                } ${locationExists(aiLocations, rowIndex, colIndex) ? "bg-red-500" : ""} ${locationExists(playerLocations, rowIndex, colIndex) ? "bg-green-500" : ""}`}
                            style={{
                                clipPath: "circle(50%)",
                            }}
                            onMouseEnter={() => setHoveredColumn(colIndex)}
                            onMouseLeave={() => setHoveredColumn(null)}
                            onClick={() => selectColumn(colIndex)}
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

export default Connect4;