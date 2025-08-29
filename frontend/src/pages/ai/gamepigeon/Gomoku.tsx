import React, { useState } from 'react';

import Input from "../../../atoms/Input";
import { ActionButton } from '../../../atoms/ActionButton';
import { callEndpoint } from '../../../utils/helpers';


const Gomoku = () => {
    const [row, setRow] = React.useState(0);
    const [col, setCol] = React.useState(0);
    const [playerLocations, setPlayerLocations] = useState<number[][]>([]);
    const [aiLocations, setAiLocations] = useState<number[][]>([]);

    const getAiMove = async () => {
        // setLoading(true);
        const res = await callEndpoint('api/game_pigeon/gomoku', {
            playerLocations,
            aiLocations,
            maxSearchDepth: 6
        });
        const selectedRow = res.row;
        const selectedColumn = res.column;
        setRow(selectedRow);
        setCol(selectedColumn);
        console.log(`AI selected row ${selectedRow}, column ${selectedColumn}`);
        const newAiLocation = [selectedRow, selectedColumn];
        const newAiLocations = [...aiLocations, newAiLocation];
        // if (res.isWin) {
        //     const gameOverResponse = await checkGameOver(playerLocations, newAiLocations);
        //     setWinningLocations(gameOverResponse.winningLocations);
        //     setWinner(Player.AI);
        // }
        setAiLocations(newAiLocations);
    }

    return (
        <div className="flex flex-col gap-4">
            <Input
                type="number"
                value={row}
                onChange={(e) => setRow(Number(e.target.value))}
                placeholder="Row"
                className="w-36"
                min={0}
                max={12}
            />
            <Input
                type="number"
                value={col}
                onChange={(e) => setCol(Number(e.target.value))}
                placeholder="Column"
                className="w-36"
                min={0}
                max={12}
            />
            <div className='flex flex-row'>
                <ActionButton
                    onClick={() => {
                        // Call your backend API here with row and col
                        console.log(`Placing HUMAN piece at row ${row}, column ${col}`);
                        const newPlayerLocation = [row, col];
                        const newPlayerLocations = [...playerLocations, newPlayerLocation];
                        setPlayerLocations(newPlayerLocations);
                    }}
                    disabled={row < 0 || row > 12 || col < 0 || col > 12}
                    className="w-30"
                    label={"Place human piece"}
                />
                <ActionButton
                    onClick={() => {
                        console.log(`Placing HUMAN piece at row ${row}, column ${col}`);
                        const newAiLocation = [row, col];
                        const newAiLocations = [...aiLocations, newAiLocation];
                        setAiLocations(newAiLocations);
                    }}
                    disabled={row < 0 || row > 12 || col < 0 || col > 12}
                    className="w-30"
                    label={"Place AI piece"}
                />
            </div>
            <ActionButton
                onClick={() => {
                    getAiMove();
                }}
                disabled={row < 0 || row > 12 || col < 0 || col > 12}
                className="w-48"
                label={"Get AI Move"}
            />
            <p>Player Locations: {JSON.stringify(playerLocations)}</p>
            <p>AI Locations: {JSON.stringify(aiLocations)}</p>
            <GomokuBoard
                playerLocations={playerLocations}
                aiLocations={aiLocations}
                row={row}
                col={col}
                setRow={setRow}
                setCol={setCol}
            />
        </div>
    )
}


interface GomokuBoardProps {
    playerLocations: number[][];
    aiLocations: number[][];
    row: number;
    col: number;
    setRow: (row: number) => void;
    setCol: (col: number) => void;
}

const GomokuBoard: React.FC<GomokuBoardProps> = ({
    playerLocations,
    aiLocations,
    row,
    col,
    setRow,
    setCol }) => {
    const size = 13; // 13x13 board
    const board = Array.from({ length: size }, () => Array(size).fill(null));

    // playerLocations.forEach(([row, col]) => {
    //     board[row][col] = 'X'; // Player piece
    // });

    // aiLocations.forEach(([row, col]) => {
    //     board[row][col] = 'O'; // AI piece
    // });

    return (
        <div className="relative bg-gomoku-board p-5 rounded-lg max-w-fit">
            {board.map((r, rowIndex) => (
                <div key={rowIndex} className="flex flex-row">
                    {r.map((cell, colIndex) => {
                        let pieceType: PieceType = PieceType.EMPTY;
                        let isSelected = false;

                        if (aiLocations.some(([aiRow, aiCol]) => aiRow === rowIndex && aiCol === colIndex)) {
                            pieceType = PieceType.AI;
                        } else if (playerLocations.some(([playerRow, playerCol]) => playerRow === rowIndex && playerCol === colIndex)) {
                            pieceType = PieceType.PLAYER;
                        } else if (rowIndex === row && colIndex === col) {
                            pieceType = PieceType.PLAYER;
                            isSelected = true;
                        }
                        return (
                            <div key={`${rowIndex}-${colIndex}`} className="relative">
                                {/* Square */}
                                <div
                                    className={`w-8 h-8 ${rowIndex === size - 1 || colIndex === size - 1 ? 'hidden' : 'border border-black bg-gomoku-board'}`}
                                    onClick={() => {
                                        setRow(rowIndex);
                                        setCol(colIndex);
                                    }}
                                >
                                    {cell}
                                </div>

                                {/* Intersection */}
                                <div
                                    className='absolute w-7 h-7'
                                    style={{
                                        top: '0%',
                                        left: '0%',
                                    }}
                                >
                                    {pieceType !== PieceType.EMPTY
                                        ? <Piece type={pieceType} selected={isSelected} />
                                        : <Piece type={PieceType.EMPTY} onClick={() => {
                                            setRow(rowIndex);
                                            setCol(colIndex);
                                        }} />

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
    selected?: boolean
}

const Piece: React.FC<PieceProps> = ({
    type,
    onClick,
    hover = false,
    selected = false
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
    const outlineStr = selected ? 'outline outline-2 outline-primary-base' : '';
    const shadowStr = type === PieceType.EMPTY ? '' : 'shadow-lg shadow-black/50';
    const cursorStr = type === PieceType.EMPTY ? 'cursor-pointer' : ''

    return (
        <div
            className={`absolute w-7 h-7 ${gradientStr} ${outlineStr} ${shadowStr} ${cursorStr} rounded-full transform -translate-x-1/2 -translate-y-1/2`}
            {...(onClick ? { onClick } : {})}
        ></div>
    );
};

// const Piece: React.FC<PieceProps> = ({
//     type,
//     hover = false,
//     selected = false
// }) => {
//     let colorStr;
//     if (type === PieceType.AI) {
//         colorStr = 'bg-gomoku-piece-black';
//     } else if (type === PieceType.PLAYER) {
//         colorStr = 'bg-gomoku-piece-white';
//     }
//     const opacityStr = hover ? 'opacity-50' : selected ? 'opacity-75' : 'opacity-100';
//     const borderStr = selected ? 'border-2 border-primary-base' : ''

//     return (
//         <div
//             className={`absolute w-7 h-7 ${colorStr} ${opacityStr} ${borderStr} rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-black/50`}
//         ></div>
//     );
// };


export default Gomoku;