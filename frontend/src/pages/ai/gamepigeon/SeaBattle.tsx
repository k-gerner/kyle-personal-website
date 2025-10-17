import React, { useState, useEffect } from 'react';
import { VscDebugRestart } from "react-icons/vsc";
import { ImCross } from "react-icons/im";

import { ActionButton } from '../../../atoms/ActionButton';
import { callEndpoint } from '../../../utils/helpers';
import { ButtonGroupPicker } from '../../../components/ButtonGroupPicker';
import { BooleanSelector } from '../../../atoms/BooleanSelector';
import { TitleWithInfo } from '../../../components/TitleWithInfo';

enum PositionState {
    EMPTY,
    DESTROYED,
    HIT,
    MISSED,
    CLEARED
}

interface BoardState {
    destroyedLocations: number[][];
    hitLocations: number[][];
    missedLocations: number[][];
    clearedLocations: number[][];
    spaceDensities: number[][];
    shipsRemaining: { [key: number]: number };
    bestMoves: number[][];
    remainingShips: { [key: number]: number };
    boardSize: number;
}


const INITIAL_BOARD_STATE: BoardState = {
    destroyedLocations: [],
    hitLocations: [],
    missedLocations: [],
    clearedLocations: [],
    spaceDensities: [],
    shipsRemaining: {},
    bestMoves: [],
    remainingShips: {},
    boardSize: 10
}


const SeaBattle = () => {
    // Game settings
    const [showDensities, setShowDensities] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    // Game state
    const [gameActive, setGameActive] = useState(false);
    const [boardState, setBoardState] = useState<BoardState>(INITIAL_BOARD_STATE);
    const [selectedPosition, setSelectedPosition] = useState<number[] | null>(null);
    const [gameOver, setGameOver] = useState(false);

    const getSpaceDensities = async (selectedPositionState?: PositionState) => {
        const currentDestroyedLocations = [...boardState.destroyedLocations];
        const currentHitLocations = [...boardState.hitLocations];
        const currentMissedLocations = [...boardState.missedLocations];
        const currentClearedLocations = [...boardState.clearedLocations];
        if (selectedPosition && selectedPositionState !== undefined) {
            if (selectedPositionState === PositionState.DESTROYED) {
                currentDestroyedLocations.push(selectedPosition);
            } else if (selectedPositionState === PositionState.HIT) {
                currentHitLocations.push(selectedPosition);
            } else if (selectedPositionState === PositionState.MISSED) {
                currentMissedLocations.push(selectedPosition);
            } else if (selectedPositionState === PositionState.CLEARED) {
                currentClearedLocations.push(selectedPosition);
            }
        }
        const res = await callEndpoint('api/game_pigeon/sea_battle', {
            size: boardState.boardSize,
            shipsRemaining: boardState.remainingShips,
            destroyedLocations: currentDestroyedLocations,
            hitLocations: currentHitLocations,
            missedLocations: currentMissedLocations,
            clearedLocations: currentClearedLocations,
            ...(selectedPosition ? { recentMove: selectedPosition } : {})
        });
        // Check if any value in res.remainingShips is negative
        // If this is the case, the user has incorrectly marked a ship as destroyed
        if (Object.values(res.remainingShips).some(value => value as number < 0)) {
            return;
        }
        const newRemainingShips = Object.fromEntries(
            Object.entries(res.remainingShips).map(([key, value]) => [parseInt(key, 10), value])
        ) as { [key: number]: number };
        setBoardState(prevState => ({
            ...prevState,
            destroyedLocations: res.destroyedLocations,
            hitLocations: res.hitLocations,
            missedLocations: res.missedLocations,
            clearedLocations: res.clearedLocations,
            spaceDensities: res.spaceDensities,
            remainingShips: newRemainingShips,
            bestMoves: res.bestMoves
        }));
        if (Object.values(res.remainingShips).every(value => value === 0)) {
            setBoardState(prevState => ({
                ...prevState,
                bestMoves: []
            }));
            setGameOver(true);
        }
    }

    const getInitialRemainingShips = async (size: number) => {
        const res = await callEndpoint('api/game_pigeon/sea_battle/initial_ships', {
            size: size
        });
        const remainingShips = Object.fromEntries(
            Object.entries(res.remainingShips).map(([key, value]) => [parseInt(key, 10), value])
        ) as { [key: number]: number }
        return remainingShips;
    }

    const resetGame = async (size: number) => {
        setGameActive(false);
        setInitialized(false);
        setSelectedPosition(null);
        const initialRemainingShips = await getInitialRemainingShips(size);
        setBoardState({
            ...INITIAL_BOARD_STATE,
            boardSize: size,
            remainingShips: initialRemainingShips
        });
        setGameOver(false);
    }

    useEffect(() => {
        if (initialLoad) {
            setInitialLoad(false);
            return;
        }
        if (!initialized) {
            getSpaceDensities();
            setInitialized(true);
        }
    }, [boardState.remainingShips])

    useEffect(() => {
        resetGame(10);
    }, []);


    return (
        <div className="flex flex-col gap-4 bg-background-base min-h-screen items-center">
            <SeaBattleTitleSection />
            <div className='border p-4 rounded-lg shadow-lg w-full flex flex-col items-center md:flex-row gap-8 transition-all duration-500 justify-center'>
                <div className='flex flex-col gap-2'>
                    <SeaBattleBoard
                        board={boardState}
                        selectedPosition={selectedPosition}
                        onCellClick={(row, col) => { setSelectedPosition([row, col]) }}
                        showDensities={showDensities}
                        gameOver={gameOver}
                    />
                    <BoardMarkingSection
                        enabled={selectedPosition !== null && !gameOver}
                        onMarkDestroyed={() => {
                            if (selectedPosition) {
                                setGameActive(true);
                                getSpaceDensities(PositionState.DESTROYED);
                                setSelectedPosition(null);
                            }
                        }}
                        onMarkHit={() => {
                            if (selectedPosition) {
                                setGameActive(true);
                                getSpaceDensities(PositionState.HIT);
                                setSelectedPosition(null);
                            }
                        }}
                        onMarkMissed={() => {
                            if (selectedPosition) {
                                setGameActive(true);
                                getSpaceDensities(PositionState.MISSED);
                                setSelectedPosition(null);
                            }
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    {gameOver && (
                        <div className="animate-revealFromTop overflow-hidden">
                            <GameOverSection
                                onReset={() => resetGame(boardState.boardSize)}
                                numHits={boardState.hitLocations.length + boardState.destroyedLocations.length}
                                numMisses={boardState.missedLocations.length}
                            />
                        </div>
                    )}
                    <div className='border p-4 rounded-lg shadow-md'>
                        <RemainingShipsSection
                            shipsRemaining={boardState.remainingShips}
                        />
                    </div>
                    <div className='flex flex-col p-4 border rounded-lg shadow-md'>
                        <InputSection
                            boardSize={boardState.boardSize}
                            setBoardSize={(size) => resetGame(size)}
                            showDensities={showDensities}
                            setShowDensities={setShowDensities}
                            gameActive={gameActive}
                            onReset={() => resetGame(boardState.boardSize)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface SeaBattleBoardProps {
    board: BoardState,
    selectedPosition: number[] | null;
    onCellClick: (row: number, col: number) => void;
    showDensities: boolean;
    gameOver: boolean
}

const SeaBattleBoard: React.FC<SeaBattleBoardProps> = ({
    board,
    selectedPosition,
    onCellClick,
    showDensities,
    gameOver
}) => {
    const {
        boardSize,
        spaceDensities,
        bestMoves,
        destroyedLocations,
        hitLocations,
        missedLocations,
        clearedLocations
    } = board;
    const turnNumber = destroyedLocations.length + hitLocations.length + missedLocations.length + clearedLocations.length + 1;
    return (
        <div className="flex flex-col gap-1 flex-shrink-0 min-w-fit overflow-visible">
            {Array.from({ length: boardSize }).map((_, row) => (
                <div key={row} className="flex gap-1">
                    {Array.from({ length: boardSize }).map((_, col) => {
                        const isDestroyed = locationsContain(destroyedLocations, [row, col]);
                        const isHit = locationsContain(hitLocations, [row, col]);
                        const isMissed = locationsContain(missedLocations, [row, col]);
                        const isCleared = locationsContain(clearedLocations, [row, col]);
                        const isSelected = selectedPosition && selectedPosition[0] === row && selectedPosition[1] === col;
                        const density = spaceDensities[row]?.[col] || 0;
                        const selectable = !isDestroyed && !isHit && !isMissed && !isCleared && !gameOver;
                        const cursorClasses = selectable
                            ? 'cursor-pointer'
                            : 'cursor-not-allowed';
                        const cellStyleClasses = isDestroyed
                            ? 'bg-success'
                            : isHit
                                ? 'bg-warning'
                                : isMissed
                                    ? 'bg-danger opacity-50 text-white font-extrabold text-xl'
                                    : isCleared
                                        ? 'bg-sea-battle-board opacity-50'
                                        : isSelected
                                            ? 'bg-primary-base opacity-50 border-background-contrast border-2'
                                            : 'bg-sea-battle-board';
                        const label = isDestroyed || isHit
                            ? <ImCross className="text-white" />
                            : isMissed
                                ? 'M'
                                : isCleared
                                    ? '•'
                                    : showDensities && !gameOver
                                        ? density.toFixed(1)
                                        : '';

                        const pulseClass = locationsContain(bestMoves, [row, col]) ? 'animate-customPulse bg-primary-base' : '';
                        return (
                            <div
                                // Use a key with turnNumber to force re-rendering when turn changes to synchronize animations
                                key={`${row}-${col}-${turnNumber}`}
                                className={`w-10 h-10 flex items-center justify-center border 
                                    ${cursorClasses}
                                    ${cellStyleClasses}
                                    ${pulseClass}
                        `}
                                onClick={() => selectable && onCellClick(row, col)}
                                title={`Density: ${density.toFixed(1)}`}
                            >
                                {label}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}


interface BoardMarkingSectionProps {
    enabled: boolean;
    onMarkDestroyed: () => void;
    onMarkHit: () => void;
    onMarkMissed: () => void;
}

const BoardMarkingSection: React.FC<BoardMarkingSectionProps> = ({
    enabled,
    onMarkDestroyed,
    onMarkHit,
    onMarkMissed
}) => {
    return (
        <div className="flex flex-col gap-2 border rounded-lg p-2 shadow-lg">
            <h2 className="text-lg font-bold text-center text-text-base">Mark Selected Cell As:</h2>
            <div className="flex flex-row gap-4 justify-center">
                <ActionButton
                    label="Destroyed"
                    onClick={onMarkDestroyed}
                    disabled={!enabled}
                    className="bg-success border-success text-text-contrast"
                />
                <ActionButton
                    label="Hit"
                    onClick={onMarkHit}
                    disabled={!enabled}
                    className="bg-warning border-warning text-text-muted"
                />
                <ActionButton
                    label="Missed"
                    onClick={onMarkMissed}
                    disabled={!enabled}
                    className="bg-danger border-danger text-text-contrast"
                />
            </div>
        </div>
    );
}


interface RemainingShipsSectionProps {
    shipsRemaining: { [key: number]: number };
}

const RemainingShipsSection: React.FC<RemainingShipsSectionProps> = ({
    shipsRemaining
}) => {
    const [isHorizontal, setIsHorizontal] = useState(false);

    useEffect(() => {
        // Define a media query for smaller viewports
        const mediaQuery = window.matchMedia("(max-width: 768px)");

        // Update `isHorizontal` based on the media query
        const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsHorizontal(e.matches); // `true` if viewport is smaller than 768px
        };

        // Add listener for media query changes
        handleMediaChange(mediaQuery); // Set initial value
        mediaQuery.addEventListener("change", handleMediaChange);

        // Cleanup listener on unmount
        return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }, []);
    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-center text-text-base">Remaining Ships</h2>
            <div className="flex flex-row gap-6 justify-center">
                {Object.entries(shipsRemaining).map(([size, count]) => (
                    <div key={size} className="flex flex-col items-center gap-1">
                        <span className="text-lg text-text-base">x{count}</span>
                        <Ship key={size} size={parseInt(size, 10)} isHorizontal={isHorizontal} noneRemaining={count === 0} />
                    </div>
                ))}
            </div>
        </div>
    );
}


interface InputSectionProps {
    boardSize: number;
    setBoardSize: (depth: number) => void;
    showDensities: boolean;
    setShowDensities: (show: boolean) => void;
    gameActive: boolean;
    onReset: (boardSize: number) => void;
}

const InputSection: React.FC<InputSectionProps> = ({
    boardSize,
    setBoardSize,
    showDensities,
    setShowDensities,
    gameActive,
    onReset
}) => {
    const restartButtonLabel = (
        <div className="flex flex-row justify-center items-center gap-2">
            <span>Restart</span>
            <VscDebugRestart />
        </div>
    )

    return (
        <div className="flex flex-row md:flex-col items-center gap-6">
            <ButtonGroupPicker
                options={[8, 9, 10]}
                label="Board Size"
                selectedValue={boardSize}
                setValue={setBoardSize}
                disabled={gameActive}
                showSelectedOnDisabled={true}
            />
            <BooleanSelector
                selected={showDensities}
                label="Show Densities"
                onChange={() => {
                    setShowDensities(!showDensities);
                }}
                labelOnBottom={true}
            />
            <ActionButton
                label={restartButtonLabel}
                onClick={() => onReset(boardSize)}
                className=""
            />
        </div>
    );
}


interface ShipProps {
    size: number;
    isHorizontal: boolean;
    noneRemaining: boolean;
}

const Ship: React.FC<ShipProps> = ({ size, isHorizontal, noneRemaining }) => {
    const shipOrientationStyle = isHorizontal
        ? `flex-row`
        : `flex-col`;

    return (
        <div
            className={`bg-sea-battle-ship-base ${shipOrientationStyle} rounded-xl border-2 border-sea-battle-ship-border flex items-center justify-center gap-1 p-1 ${noneRemaining ? 'opacity-30' : 'opacity-100'}`}
        >
            {Array.from({ length: size }).map((_, index) => (
                <div
                    key={index}
                    className={`bg-sea-battle-ship-inner rounded-full w-6 h-6 border border-sea-battle-ship-border
                        
                    `}
                />
            ))}
        </div>
    );
};

interface GameOverSectionProps {
    onReset: () => void;
    numHits: number;
    numMisses: number;
}

const GameOverSection: React.FC<GameOverSectionProps> = ({ onReset, numHits, numMisses }) => {
    return (
        <div className={`border p-4 rounded-lg flex flex-col items-center justify-center gap-4 bg-success`}>
            <div className="flex flex-col gap-2 items-center">
                <h2 className="text-2xl font-bold text-text-contrast">
                    Game Over!
                </h2>
                <span className="text-xs text-text-contrast">
                    Hits: {numHits}  |  Misses: {numMisses}
                </span>
            </div>
            <ActionButton
                label="Play Again"
                onClick={onReset}
                className="text-text-contrast border-text-contrast"
            />
        </div>
    );
};


const SeaBattleTitleSection: React.FC = () => {
    return (
        <TitleWithInfo
            title="Sea Battle!"
            infoTitle="How to Play Sea Battle"
            objective="Sink all enemy ships."
            rules={[
                "Players take turns guessing the location of enemy ships.",
                "The first player to sink all enemy ships wins."
            ]}
            instructionsTitle="How to Use the Tool"
            toolInstructions={[
                (
                    <div><b>Note</b>: This is a tool to help you play the optimal moves in Sea Battle. You are not playing against an AI opponent.</div>
                ),
                "Select the size of the board (8x8, 9x9, or 10x10).",
                "Click on a cell to select it.",
                "Use the buttons below the board to mark the selected cell as 'Destroyed', 'Hit', or 'Missed'.",
                "The tool will update the density map and suggest the best moves based on your markings.",
                "Continue marking cells until all ships are sunk."
            ]}
        />
    );
}


function locationsContain(locations: number[][], position: number[]): boolean {
    return locations.some(([row, col]) => row === position[0] && col === position[1]);
}


export default SeaBattle;