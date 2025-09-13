import React, { useState, useEffect } from 'react';
import { VscDebugRestart } from "react-icons/vsc";

import { ActionButton } from '../../../atoms/ActionButton';
import { callEndpoint } from '../../../utils/helpers';
import { ButtonGroupPicker } from '../../../components/ButtonGroupPicker';
import { BooleanSelector } from '../../../atoms/BooleanSelector';

enum PositionState {
    EMPTY,
    DESTROYED,
    HIT,
    MISSED,
    CLEARED
}


const SeaBattle = () => {
    // Game settings
    const [boardSize, setBoardSize] = useState(10);
    const [showDensities, setShowDensities] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Game state
    const [selectedPosition, setSelectedPosition] = useState<number[] | null>(null);
    const [bestMoves, setBestMoves] = useState<number[][]>([]);
    const [shipsRemaining, setShipsRemaining] = useState<{ [key: number]: number }>({});
    const [destroyedLocations, setDestroyedLocations] = useState<number[][]>([]);
    const [hitLocations, setHitLocations] = useState<number[][]>([]);
    const [missedLocations, setMissedLocations] = useState<number[][]>([]);
    const [clearedLocations, setClearedLocations] = useState<number[][]>([]);
    const [spaceDensities, setSpaceDensities] = useState<number[][]>([]);
    const [gameOver, setGameOver] = useState(false);

    const getSpaceDensities = async (selectedPositionState?: PositionState) => {
        console.log('calling getSpaceDensities')
        const currentDestroyedLocations = [...destroyedLocations];
        const currentHitLocations = [...hitLocations];
        const currentMissedLocations = [...missedLocations];
        const currentClearedLocations = [...clearedLocations];
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
            size: boardSize,
            shipsRemaining,
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
        setSpaceDensities(res.spaceDensities);
        setDestroyedLocations(res.destroyedLocations);
        setHitLocations(res.hitLocations);
        setMissedLocations(res.missedLocations);
        setClearedLocations(res.clearedLocations);
        setShipsRemaining(
            Object.fromEntries(
                Object.entries(res.remainingShips).map(([key, value]) => [parseInt(key, 10), value])
            ) as { [key: number]: number }
        );
        if (Object.values(res.remainingShips).every(value => value === 0)) {
            setGameOver(true);
            alert('Congratulations! You have destroyed all ships!');
        }
        setBestMoves(res.bestMoves);
    }

    const initialize = async () => {
        const res = await callEndpoint('api/game_pigeon/sea_battle/initial_ships', {
            size: boardSize
        });
        setShipsRemaining(
            Object.fromEntries(
                Object.entries(res.remainingShips).map(([key, value]) => [parseInt(key, 10), value])
            ) as { [key: number]: number }
        );
        console.log('setting ships remaining to', res.remainingShips);
        setInitialized(true);
    }

    const resetGame = () => {
        setInitialized(false);
        setDestroyedLocations([]);
        setHitLocations([]);
        setMissedLocations([]);
        setClearedLocations([]);
        setSpaceDensities([]);
        setSelectedPosition(null);
        setBestMoves([]);
        setGameOver(false);
        initialize();
    }

    useEffect(() => {
        initialize();
    }, [boardSize]);

    useEffect(() => {
        if (initialized) {
            getSpaceDensities();
        }
    }, [initialized]);

    //
    //
    //
    //
    //
    //
    // TODO: fix race condition of shipsRemaining when switching between board sizes
    // sometimes the space densities call with happen before the ships have updated, and 
    // it will cause the game to use the old shipsRemaining for the new board size
    //
    //
    //
    //
    //
    //
    //


    return (
        <div className="flex flex-col gap-4 bg-background-base min-h-screen items-center">
            <h1 className="text-center text-3xl font-bold text-primary-highlight mb-4">Sea Battle!</h1>
            <div className='flex flex-col p-4 border rounded-lg'>
                <InputSection
                    boardSize={boardSize}
                    setBoardSize={(size) => {
                        setBoardSize(size);
                        resetGame();

                    }}
                    showDensities={showDensities}
                    setShowDensities={setShowDensities}
                    onReset={resetGame}
                />
            </div>
            <div className='border p-4 rounded-lg shadow-lg w-full flex flex-col items-center md:flex-row gap-8 transition-all duration-500 justify-center'>
                <div className='flex flex-col'>
                    <SeaBattleBoard
                        boardSize={boardSize}
                        spaceDensities={spaceDensities}
                        bestMoves={bestMoves}
                        selectedPosition={selectedPosition}
                        destroyedLocations={destroyedLocations}
                        hitLocations={hitLocations}
                        missedLocations={missedLocations}
                        clearedLocations={clearedLocations}
                        onCellClick={(row, col) => { setSelectedPosition([row, col]) }}
                        showDensities={showDensities}
                    />
                    <BoardMarkingSection
                        enabled={selectedPosition !== null}
                        onMarkDestroyed={() => {
                            if (selectedPosition) {
                                getSpaceDensities(PositionState.DESTROYED);
                                setSelectedPosition(null);
                            }
                        }}
                        onMarkHit={() => {
                            if (selectedPosition) {
                                getSpaceDensities(PositionState.HIT);
                                setSelectedPosition(null);
                            }
                        }}
                        onMarkMissed={() => {
                            if (selectedPosition) {
                                getSpaceDensities(PositionState.MISSED);
                                setSelectedPosition(null);
                            }
                        }}
                    />
                </div>
                <div className='border p-4 rounded-lg'>
                    <RemainingShipsSection
                        shipsRemaining={shipsRemaining}
                    />
                </div>
            </div>
            <ActionButton
                label={showDensities ? "Hide Space Densities" : "Get Space Densities"}
                onClick={getSpaceDensities}
                disabled={selectedPosition === null}
            />
        </div>
    );
}

interface SeaBattleBoardProps {
    boardSize: number;
    spaceDensities: number[][];
    bestMoves: number[][];
    destroyedLocations: number[][];
    selectedPosition: number[] | null;
    hitLocations: number[][];
    missedLocations: number[][];
    clearedLocations: number[][];
    onCellClick: (row: number, col: number) => void;
    showDensities: boolean;
}

const SeaBattleBoard: React.FC<SeaBattleBoardProps> = ({
    boardSize,
    spaceDensities,
    bestMoves,
    selectedPosition,
    destroyedLocations,
    hitLocations,
    missedLocations,
    clearedLocations,
    onCellClick,
    showDensities
}) => {
    const gridColsClass = boardSize === 8
        ? 'grid-cols-8'
        : boardSize === 9
            ? 'grid-cols-9'
            : 'grid-cols-10';
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
                        const selectable = !isDestroyed && !isHit && !isMissed && !isCleared;
                        const cursorClasses = selectable
                            ? 'cursor-pointer'
                            : 'cursor-not-allowed';
                        const colorClasses = isDestroyed
                            ? 'bg-success'
                            : isHit
                                ? 'bg-warning'
                                : isMissed || isCleared
                                    ? 'bg-sea-battle-board opacity-50'
                                    : isSelected
                                        ? 'bg-primary-base opacity-50 border-background-contrast border-2'
                                        : 'bg-sea-battle-board';
                        const label = showDensities
                            ? density.toFixed(1)
                            : isDestroyed
                                ? 'X'
                                : isHit
                                    ? 'H'
                                    : isMissed
                                        ? 'M'
                                        : '';

                        const pulseClass = locationsContain(bestMoves, [row, col]) ? 'animate-customPulse bg-primary-base' : '';
                        return (
                            <div
                                key={`${row}-${col}`}
                                className={`w-10 h-10 flex items-center justify-center border 
                                    ${cursorClasses}
                                    ${colorClasses}
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
{/* <div className={`grid ${gridColsClass} gap-1 flex-shrink-0 min-w-fit overflow-visible`}>
            {Array.from({ length: boardSize }).map((_, row) =>
                Array.from({ length: boardSize }).map((_, col) => {
                    const isDestroyed = destroyedLocations.some(
                        ([r, c]) => r === row && c === col
                    );
                    const isHit = hitLocations.some(
                        ([r, c]) => r === row && c === col
                    );
                    const isMissed = missedLocations.some(
                        ([r, c]) => r === row && c === col
                    );
                    const density = spaceDensities[row]?.[col] || 0;
                    return (
                        <div
                            key={`${row}-${col}`}
                            className={`w-10 h-10 flex items-center justify-center border cursor-pointer 
                                ${isDestroyed ? 'bg-red-600' : isHit ? 'bg-yellow-400' : isMissed ? 'bg-gray-400' : 'bg-blue-200 hover:bg-blue-300'}
                            `}
                            onClick={() => onCellClick(row, col)}
                            title={`Density: ${density.toFixed(2)}`}
                        >
                            {isDestroyed ? 'X' : isHit ? 'H' : isMissed ? 'M' : ''}
                        </div>
                    );
                })
            )}
        </div> */}


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
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-center">Mark Selected Cell As:</h2>
            <div className="flex flex-row gap-4 justify-center">
                <ActionButton
                    label="Destroyed"
                    onClick={onMarkDestroyed}
                    disabled={!enabled}
                    className="bg-success"
                />
                <ActionButton
                    label="Hit"
                    onClick={onMarkHit}
                    disabled={!enabled}
                    className="bg-warning"
                />
                <ActionButton
                    label="Missed"
                    onClick={onMarkMissed}
                    disabled={!enabled}
                    className="bg-gray-400"
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
            <h2 className="text-lg font-bold text-center">Remaining Ships</h2>
            <div className="flex flex-row gap-6 justify-center">
                {Object.entries(shipsRemaining).map(([size, count]) => (
                    <div key={size} className="flex flex-col items-center gap-1">
                        {/* <span className="font-semibold">{size}-deck</span> */}
                        <span className="text-lg">x{count}</span>
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
    onReset: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
    boardSize,
    setBoardSize,
    showDensities,
    setShowDensities,
    onReset
}) => {
    const restartButtonLabel = (
        <div className="flex flex-row justify-center items-center gap-2">
            <span>Restart</span>
            <VscDebugRestart />
        </div>
    )

    return (
        <div className="flex flex-row items-start gap-6">
            <ButtonGroupPicker
                options={[8, 9, 10]}
                label="Board Size"
                selectedValue={boardSize}
                setValue={setBoardSize}
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
                onClick={onReset}
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


function locationsContain(locations: number[][], position: number[]): boolean {
    return locations.some(([row, col]) => row === position[0] && col === position[1]);
}


export default SeaBattle;