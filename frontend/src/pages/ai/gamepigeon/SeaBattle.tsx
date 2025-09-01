import React, { useState, useEffect } from 'react';
import { VscDebugRestart } from "react-icons/vsc";

import { ActionButton } from '../../../atoms/ActionButton';
import { callEndpoint } from '../../../utils/helpers';
import { ButtonGroupPicker } from '../../../components/ButtonGroupPicker';
import { BooleanSelector } from '../../../atoms/BooleanSelector';


const SeaBattle = () => {
    // Game settings
    const [boardSize, setBoardSize] = useState(10);
    const [showDensities, setShowDensities] = useState(false);

    // Game state
    const [selectedPosition, setSelectedPosition] = useState<number[] | null>(null);
    const [bestMoves, setBestMoves] = useState<number[][]>([]);
    const [shipsRemaining, setShipsRemaining] = useState<{ [key: number]: number }>({});
    const [destroyedLocations, setDestroyedLocations] = useState<number[][]>([]);
    const [hitLocations, setHitLocations] = useState<number[][]>([]);
    const [missedLocations, setMissedLocations] = useState<number[][]>([]);
    const [spaceDensities, setSpaceDensities] = useState<number[][]>([]);

    const getSpaceDensities = async () => {
        const res = await callEndpoint('api/game_pigeon/sea_battle', {
            size: boardSize,
            shipsRemaining,
            destroyedLocations,
            hitLocations,
            missedLocations
        });
        setSpaceDensities(res.spaceDensities);
        setBestMoves(res.bestMoves);
    }

    const populateInitialShipsRemaining = async () => {
        const res = await callEndpoint('api/game_pigeon/sea_battle/initial_ships', {
            size: boardSize
        });
        setShipsRemaining(
            Object.fromEntries(
                Object.entries(res.remainingShips).map(([key, value]) => [parseInt(key, 10), value])
            ) as { [key: number]: number }
        );
    }

    const resetGame = () => {
        setDestroyedLocations([]);
        setHitLocations([]);
        setMissedLocations([]);
        setSpaceDensities([]);
        populateInitialShipsRemaining();
    }

    useEffect(() => {
        populateInitialShipsRemaining();
    }, [boardSize]);

    return (
        <div className="flex flex-col gap-4 bg-background-base min-h-screen items-center">
            <h1 className="text-center text-3xl font-bold text-primary-highlight mb-4">Sea Battle!</h1>
            <div className='flex flex-col p-4 border rounded-lg'>
                <InputSection
                    boardSize={boardSize}
                    setBoardSize={setBoardSize}
                    showDensities={showDensities}
                    setShowDensities={setShowDensities}
                    onReset={resetGame}
                />
            </div>
            <div className='border p-4 rounded-lg shadow-lg w-full flex flex-col items-center md:flex-row gap-8 transition-all duration-500 justify-center'>
                <SeaBattleBoard
                    boardSize={boardSize}
                    spaceDensities={spaceDensities}
                    selectedPosition={selectedPosition}
                    destroyedLocations={destroyedLocations}
                    hitLocations={hitLocations}
                    missedLocations={missedLocations}
                    onCellClick={(row, col) => { setSelectedPosition([row, col]) }}
                />
                <div className='border p-4 rounded-lg'>
                    <RemainingShipsSection
                        shipsRemaining={shipsRemaining}
                    />
                </div>
            </div>
            <ActionButton
                label="Get Space Densities"
                onClick={getSpaceDensities}
            />
        </div>
    );
}

interface SeaBattleBoardProps {
    boardSize: number;
    spaceDensities: number[][];
    destroyedLocations: number[][];
    selectedPosition: number[] | null;
    hitLocations: number[][];
    missedLocations: number[][];
    onCellClick: (row: number, col: number) => void;
}

const SeaBattleBoard: React.FC<SeaBattleBoardProps> = ({
    boardSize,
    spaceDensities,
    selectedPosition,
    destroyedLocations,
    hitLocations,
    missedLocations,
    onCellClick
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
                        const isDestroyed = destroyedLocations.some(
                            ([r, c]) => r === row && c === col
                        );
                        const isHit = hitLocations.some(
                            ([r, c]) => r === row && c === col
                        );
                        const isMissed = missedLocations.some(
                            ([r, c]) => r === row && c === col
                        );
                        const isSelected = selectedPosition && selectedPosition[0] === row && selectedPosition[1] === col;
                        const density = spaceDensities[row]?.[col] || 0;
                        const selectable = !isDestroyed && !isHit && !isMissed;
                        const cursorClasses = selectable
                            ? 'cursor-pointer'
                            : 'cursor-not-allowed';
                        const colorClasses = isDestroyed
                            ? 'bg-success'
                            : isHit
                                ? 'bg-warning'
                                : isMissed
                                    ? 'bg-sea-battle-board opacity-50'
                                    : isSelected
                                        ? 'bg-primary-base opacity-50 border-background-contrast border-2'
                                        : 'bg-sea-battle-board';
                        return (
                            <div
                                key={`${row}-${col}`}
                                className={`w-10 h-10 flex items-center justify-center border 
                                    ${cursorClasses}
                                    ${colorClasses}
                        `}
                                onClick={() => onCellClick(row, col)}
                                title={`Density: ${density.toFixed(2)}`}
                            >
                                {isDestroyed ? 'X' : isHit ? 'H' : isMissed ? 'M' : ''}
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
    console.log('shipsRemaining in RemainingShipsSection', shipsRemaining);
    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-center">Remaining Ships</h2>
            <div className="flex flex-row gap-6 justify-center">
                {Object.entries(shipsRemaining).map(([size, count]) => (
                    <div key={size} className="flex flex-col items-center gap-1">
                        {/* <span className="font-semibold">{size}-deck</span> */}
                        <span className="text-lg">{count}</span>
                        <Ship key={size} size={parseInt(size, 10)} isHorizontal={isHorizontal} />
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
}

const Ship: React.FC<ShipProps> = ({ size, isHorizontal }) => {
    const shipOrientationStyle = isHorizontal
        ? `flex-row`
        : `flex-col`;

    return (
        <div
            className={`bg-gray-800 ${shipOrientationStyle} rounded-xl border-2 border-black flex items-center justify-center gap-1 p-1`}
        >
            {Array.from({ length: size }).map((_, index) => (
                <div
                    key={index}
                    className="bg-gray-500 rounded-full w-6 h-6 border border-black"
                />
            ))}
        </div>
    );
};


function locationsContain(locations: number[][], position: number[]): boolean {
    return locations.some(([row, col]) => row === position[0] && col === position[1]);
}


export default SeaBattle;