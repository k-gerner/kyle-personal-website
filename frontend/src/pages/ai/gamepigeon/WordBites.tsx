import React, { useState, useEffect } from 'react';
import Input from '../../../atoms/Input';
import { MdOutlineCancel } from "react-icons/md";


const INPUT_DELAY_MS = 500; // Delay in milliseconds for input reset
type PieceType = "single" | "horizontal" | "vertical";
type Pieces = {
    single: string[];
    horizontal: string[];
    vertical: string[];
}
const buttonStyle = "rounded-full border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-text-contrast hover:bg-primary-base hover:border-primary-base focus-visible:text-text-contrast focus-visible:bg-primary-highlight focus-visible:border-primary-base active:border-primary-highlight active:text-text-contrast active:bg-primary-highlight disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"


const WordBites = () => {
    const [hasSolved, setHasSolved] = useState(false); // if solve has run at least once
    const [inputPieces, setInputPieces] = useState<Pieces>({
        single: [],
        horizontal: [],
        vertical: []
    });
    const [currentInputLetters, setCurrentInputLetters] = useState<ActiveInputData>({
        single: '',
        horizontal: '',
        vertical: ''
    });

    const handleSolve = async () => {
        setHasSolved(true);
        const res = await fetch('http://localhost:5001/api/game_pigeon/word_bites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                single_pieces: inputPieces.single,
                horizontal_pieces: inputPieces.horizontal,
                vertical_pieces: inputPieces.vertical,
                min_length: 3,
            })
        });

        const data = await res.json();
        console.log(data);
    };

    const handleInputChange = (value: string, pieceType: PieceType) => {
        const normalizedValue = value.toUpperCase().replace(/[^A-Z]/g, '');
        if (pieceType === "single") {
            setInputPieces(prev => ({ ...prev, single: prev.single.concat(normalizedValue) }));
            setCurrentInputLetters(prev => ({
                ...prev,
                single: normalizedValue
            }));
            setTimeout(() => {
                setCurrentInputLetters(prev => ({
                    ...prev,
                    single: ""
                }));
            }, INPUT_DELAY_MS);
        } else {
            setCurrentInputLetters(prev => ({
                ...prev,
                [pieceType]: normalizedValue
            }));
            if (normalizedValue.length < 2) {
                return;
            }
            setInputPieces(prev => ({
                ...prev,
                [pieceType]: prev[pieceType].concat(normalizedValue)
            }));
            setTimeout(() => {
                setCurrentInputLetters(prev => ({
                    ...prev,
                    [pieceType]: ""
                }));
            }, INPUT_DELAY_MS);
        }
        console.log("Input changed:", pieceType, normalizedValue);
        console.log("Current pieces:", inputPieces);
    }


    const deleteInputPiece = (index: number, type: PieceType) => {
        setInputPieces((prev: Pieces) => {
            const updatedPieces = { ...prev };
            updatedPieces[type] = [
                ...updatedPieces[type].slice(0, index),
                ...updatedPieces[type].slice(index + 1),
            ];
            return updatedPieces;
        });
    }


    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-center text-3xl font-bold text-primary-highlight mb-4">Word Bites!</h1>
            <InputSection
                currentInputLetters={currentInputLetters}
                onLettersChange={handleInputChange}
                onSolve={handleSolve}
            />
            <LetterTilesSection pieces={inputPieces} deleteInputPiece={deleteInputPiece} />
        </div>
    );
}


type ActiveInputData = {
    single: string;
    horizontal: string;
    vertical: string;
}

interface InputSectionProps {
    currentInputLetters: ActiveInputData;
    onLettersChange: (value: string, pieceType: PieceType) => void;
    onSolve: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
    currentInputLetters,
    onLettersChange,
    onSolve
}) => {
    return (
        <div className="flex flex-col gap-4">
            <div className='flex flex-wrap flex-row gap-2 justify-center'>
                <Input
                    type="text"
                    value={currentInputLetters.single}
                    onChange={(e) => onLettersChange(e.target.value, "single")}
                    maxLength={1}
                    placeholder="Single Pieces"
                />
                <Input
                    type="text"
                    value={currentInputLetters.vertical}
                    onChange={(e) => onLettersChange(e.target.value, "vertical")}
                    maxLength={2}
                    placeholder="Vertical Pieces"
                />
                <Input
                    type="text"
                    value={currentInputLetters.horizontal}
                    onChange={(e) => onLettersChange(e.target.value, "horizontal")}
                    maxLength={2}
                    placeholder="Horizontal Pieces"
                />
            </div>
            <div className="flex justify-center">
                <button
                    // disabled={letters.flat().length !== rowLengthsByBoardType[boardType].reduce((a, b) => a + b, 0)}
                    onClick={onSolve}
                    className={`${buttonStyle} w-48`}
                >Solve</button>
            </div>
        </div>
    );
}


interface LetterTilesSectionProps {
    pieces: Pieces;
    deleteInputPiece: (index: number, type: PieceType) => void;
}


const LetterTilesSection: React.FC<LetterTilesSectionProps> = ({
    pieces,
    deleteInputPiece
}) => {
    const singleSection = (
        <div className="flex flex-col gap-4 p-2 border border-primary-base rounded-lg shadow-lg">
            <h2 className="text-center text-lg font-semibold text-primary-highlight">Single Pieces</h2>
            {
                pieces.single.length === 0 ?
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <p className="text-sm text-text-base opacity-70">No pieces yet</p>
                        <div className="w-16 h-16 border-2 border-dashed border-text-base opacity-30 rounded-lg"></div>
                    </div>
                    :
                    <div className="grid grid-cols-4 gap-4 justify-items-center">
                        {pieces.single.map((value, index) => (
                            <LetterTile
                                key={`single-${index}`}
                                value={value}
                                type="single"
                                canDelete={true}
                                tileIndex={index}
                                onDelete={() => deleteInputPiece(index, "single")}
                            />
                        ))}
                    </div>
            }
        </div>
    );
    const horizontalSection = (
        <div className="flex flex-col gap-4 p-2 border border-primary-base rounded-lg shadow-lg">
            <h2 className="text-center text-lg font-semibold text-primary-highlight">Horizontal Pieces</h2>
            {
                pieces.horizontal.length === 0 ?
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <p className="text-sm text-text-base opacity-70">No pieces yet</p>
                        <div className="w-32 h-16 border-2 border-dashed border-text-base opacity-30 rounded-lg"></div>
                    </div>
                    :
                    <div className="grid grid-cols-2 gap-4 justify-items-center">
                        {pieces.horizontal.map((value, index) => (
                            <LetterTile
                                key={`horizontal-${index}`}
                                value={value}
                                type="horizontal"
                                canDelete={true}
                                tileIndex={index}
                                onDelete={() => deleteInputPiece(index, "horizontal")}
                            />
                        ))}
                    </div>
            }
        </div>
    );
    const verticalSection = (
        <div className="flex flex-col gap-4 p-2 border border-primary-base rounded-lg shadow-lg">
            <h2 className="text-center text-lg font-semibold text-primary-highlight">Vertical Pieces</h2>
            {
                pieces.vertical.length === 0 ?
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <p className="text-sm text-text-base opacity-70">No pieces yet</p>
                        <div className="w-16 h-32 border-2 border-dashed border-text-base opacity-30 rounded-lg"></div>
                    </div>
                    :
                    <div className="grid grid-cols-4 gap-4 justify-items-center">
                        {pieces.vertical.map((value, index) => (
                            <LetterTile
                                key={`vertical-${index}`}
                                value={value}
                                type="vertical"
                                canDelete={true}
                                tileIndex={index}
                                onDelete={() => deleteInputPiece(index, "vertical")}
                            />
                        ))}
                    </div>
            }
        </div>
    );
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row flex-wrap gap-4">
                <div className="flex-1 min-w-fit">
                    {singleSection}
                </div>
                <div className="flex-1 min-w-fit">
                    {verticalSection}
                </div>
                <div className="flex-1 min-w-fit">
                    {horizontalSection}
                </div>
            </div>
        </div>
    );
}


interface LetterTileProps {
    value: string;
    type: PieceType;
    canDelete?: boolean;
    onDelete?: () => void;
    tileIndex: number;
}

const LetterTile: React.FC<LetterTileProps> = ({
    value,
    type,
    canDelete = false,
    onDelete,
    tileIndex
}) => {
    const baseClasses = "flex items-center justify-center text-xl font-bold text-text-base";
    const sizeClasses = 'w-16 h-16' //size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
    // const deleteButtonClasses = 'bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors';
    const deleteButtonClasses = 'bg-background-base text-danger flex items-center justify-center hover:bg-danger hover:text-background-base transition-colors border-danger border-2 rounded-b-md';
    const deleteIconClasses = 'w-8 h-8';
    // const deleteIconClasses = 'w-4 h-4'; // Adjust size of the delete icon
    const bgColor = 'bg-secondary-base' // inSolution || beforeSolve ? 'bg-secondary-base' : 'bg-secondary-base opacity-50';


    let parentDivWidthClass = 'w-16';
    let groupingClasses = '';
    let letterPairFlexClasses = '';
    let tileComponent = null;
    if (type === "single") {
        groupingClasses = 'first:rounded-t-md first:ms-0 last:rounded-b-md';
        tileComponent = (
            <div key={`${value}-${tileIndex}`} className={`${baseClasses} ${sizeClasses} ${bgColor} ${groupingClasses}`}>
                <span>{value}</span>
            </div>
        );
    } else {
        if (type === "horizontal") {
            parentDivWidthClass = 'w-32';
            letterPairFlexClasses = 'flex flex-row';
            groupingClasses = `first:rounded-tl-md last:rounded-tr-md ${!canDelete && 'first:rounded-bl-md last:rounded-br-md'}`;
        } else {
            letterPairFlexClasses = 'flex flex-col';
            groupingClasses = `first:rounded-t-md ${!canDelete && 'last:rounded-b-md'}`;
        }
        tileComponent = (
            <div className={letterPairFlexClasses}>
                {
                    value.split('').map((char, charIndex) => (
                        <div key={`${value}-${tileIndex}-${charIndex}-${type}`} className={`${baseClasses} ${sizeClasses} ${bgColor} ${groupingClasses}`}>
                            <span>{char}</span>
                        </div>
                    ))
                }
            </div>
        );
    }

    const id = `${value}-${tileIndex}-${type}`;
    const deleteButton = canDelete ? (
        <button
            className={deleteButtonClasses}
            // onClick={() => onDelete && onDelete()}
            onClick={() => {
                // Trigger the animation before deleting
                const tileElement = document.getElementById(id);
                if (tileElement && onDelete) {
                    tileElement.classList.add("animate-pop");
                    setTimeout(() => {
                        onDelete();
                    }, 300); // Match the animation duration
                    // Remove the animation class after it completes, 
                    // in case the IDs update and another element in the
                    // list has the same ID
                    tileElement.addEventListener('animationend', () => {
                        tileElement.classList.remove("animate-pop");
                    });
                }
            }}
        >
            <MdOutlineCancel className={`${deleteIconClasses}`} />
        </button>
    ) : null;

    return (
        <div id={id} key={id} className={`flex flex-col gap-0 ${parentDivWidthClass}`}>
            {tileComponent}
            {deleteButton}
        </div>
    );
};


export default WordBites;