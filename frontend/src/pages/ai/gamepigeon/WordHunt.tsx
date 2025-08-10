import React, { useState, useRef } from 'react';
import '../../../App.css'
import { ButtonGroupPicker, ButtonGroupPickerOption } from '../../../components/ButtonGroupPicker';
import { PaginatedSolutionsSection } from '../../../components/PaginatedSolutionsSection';
import { chunkArray } from '../../../utils/helpers';
import Input from '../../../atoms/Input';

type BoardType = "4x4" | "5x5" | "donut" | "cross";

type WordHuntSolution = {
    word: string;
    positions: number[];
}


const rowLengthsByBoardType: Record<BoardType, number[]> = {
    "4x4": [4, 4, 4, 4],
    "5x5": [5, 5, 5, 5, 5],
    "donut": [3, 5, 4, 5, 3],
    "cross": [4, 5, 3, 5, 4]
};
const WORDS_PER_PAGE = 1;
const buttonStyle = "rounded-full border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-text-contrast hover:bg-primary-base hover:border-primary-base focus-visible:text-text-contrast focus-visible:bg-primary-highlight focus-visible:border-primary-base active:border-primary-highlight active:text-text-contrast active:bg-primary-highlight disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"

const WordHunt = () => {
    const [hasSolved, setHasSolved] = useState(false); // if solve has run at least once
    const [inputLetters, setInputLetters] = useState<string[][]>([[], [], [], []]);
    const [boardType, setBoardType] = useState<BoardType>("4x4"); // Default board type
    const [solutions, setSolutions] = useState<WordHuntSolution[]>([]);
    const [pageNumber, setPageNumber] = useState(0);
    const lettersInputRefs: React.RefObject<HTMLInputElement | null>[] = ([
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null) // For 5th row in 5x5, donut, cross
    ]);


    const handleSolve = async () => {
        setHasSolved(true);
        const res = await fetch('http://localhost:5001/api/game_pigeon/word_hunt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                letters: inputLetters.flat(), //['a', 's', 'e', 'l', 't', 'r', 'o', 'n', 'e', 'p', 'i', 'c', 't', 'p', 'e', 'r'],//inputLetters.split(''),
                board_type: boardType.toLowerCase(),
                min_length: 3
            })
        });

        const data = await res.json();
        setSolutions(
            Object.entries(data.solutions).map(
                ([word, positions]) => ({
                    word,
                    positions,
                } as WordHuntSolution))
        );
        // setSolutions(chunkArray(data.words, WORDS_PER_PAGE));
        setPageNumber(0);
        console.log("found solutions")
        console.log(solutions);
    };


    const onLettersChange = (value: string, rowIndex: number) => {
        const lettersArray = [...inputLetters];
        lettersArray[rowIndex] = value.toUpperCase().replace(/[^A-Z]/g, '').split('');
        setInputLetters(lettersArray);
        if (value.length >= rowLengthsByBoardType[boardType][rowIndex] && rowIndex < rowLengthsByBoardType[boardType].length - 1) {
            // Move focus to the next input if available
            const nextInputIndex = rowIndex + 1;
            // if (nextInputIndex < lettersInputRefs.length && lettersInputRefs[nextInputIndex].current) {
            lettersInputRefs[nextInputIndex]?.current?.focus();
            // }
        }
    }

    const onBoardTypeChange = (value: BoardType) => {
        setBoardType(value);
        // Reset input letters based on new board type
        const newRowLengths = rowLengthsByBoardType[value];
        const numRows = newRowLengths.length;
        const newLetters = Array.from({ length: numRows }, (_, i) => []);
        setInputLetters(newLetters);
        setSolutions([]); // Clear solutions when changing board type
        setHasSolved(false); // Reset solved state
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-center text-3xl font-bold text-primary-highlight mb-4">Word Hunt!</h1>
            <InputSection
                letters={inputLetters}
                boardType={boardType}
                onBoardTypeChange={onBoardTypeChange}
                onLettersChange={onLettersChange}
                onSolve={handleSolve}
                lettersInputRefs={lettersInputRefs}
            />
            <div className="flex flex-col gap-6 md:gap-2 md:flex-row transition-all duration-300 ease-in-out">
                <div className={`flex flex-col gap-10 flex-shrink-0 transition-all duration-500 w-full ${hasSolved ? 'md:w-3/5' : 'md:w-full'}`}>
                    <BoardSection
                        letters={inputLetters} // Convert to 2D array for 4x4 board
                        boardType={boardType}
                        currentSolution={solutions.length > 0 ? solutions[WORDS_PER_PAGE * pageNumber] : undefined} // Show first solution if available
                    />
                    {/* <LettersSection
                        letters={inputLetters}
                        numLetters={numLetters}
                    /> */}
                </div>
                {hasSolved && (
                    <div className="w-full md:w-2/5 transition-all duration-300">
                        <PaginatedSolutionsSection
                            solutions={transformSolutionsForDisplay(solutions, WORDS_PER_PAGE)} // Convert to 2D array for compatibility
                            pageNumber={pageNumber}
                            setPageNumber={setPageNumber}
                            isLoading={false}
                            includeNumbers={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

interface InputSectionProps {
    letters: string[][];
    boardType: BoardType;
    onBoardTypeChange: (value: BoardType) => void;
    onLettersChange: (value: string, rowIndex: number) => void;
    onSolve: () => void;
    lettersInputRefs: React.RefObject<HTMLInputElement | null>[];
}

const InputSection: React.FC<InputSectionProps> = ({
    letters,
    boardType,
    onBoardTypeChange,
    onLettersChange,
    onSolve,
    lettersInputRefs
}) => {
    console.log("InputSection letters:", letters);
    const buttonGroupOptions = [
        { label: "4x4", value: "4x4" },
        { label: "5x5", value: "5x5" },
        { label: "Donut", value: "donut" },
        { label: "Cross", value: "cross" }
    ] as ButtonGroupPickerOption<BoardType>[];
    return (
        <div className="flex flex-col gap-4">
            <div className='flex flex-wrap flex-row gap-2 justify-center'>
                <Input
                    type="text"
                    value={letters[0].join('')}
                    onChange={(e) => onLettersChange(e.target.value, 0)}
                    maxLength={rowLengthsByBoardType[boardType][0]}
                    placeholder="Row 1"
                    // className={`input-box-transition ${invalidInputSide === TOP ? 'shake' : ''} w-36`}
                    ref={lettersInputRefs[0]}
                />
                <Input
                    type="text"
                    value={letters[1].join('')}
                    onChange={(e) => onLettersChange(e.target.value, 1)}
                    maxLength={rowLengthsByBoardType[boardType][1]}
                    placeholder="Row 2"
                    // className={`input-box-transition ${invalidInputSide === RIGHT ? 'shake' : ''} w-36`}
                    ref={lettersInputRefs[1]}
                />
                <Input
                    type="text"
                    value={letters[2].join('')}
                    onChange={(e) => onLettersChange(e.target.value, 2)}
                    maxLength={rowLengthsByBoardType[boardType][2]}
                    placeholder="Row 3"
                    // className={`input-box-transition ${invalidInputSide === BOTTOM ? 'shake' : ''} w-36`}
                    ref={lettersInputRefs[2]}
                />
                <Input
                    type="text"
                    value={letters[3].join('')}
                    onChange={(e) => onLettersChange(e.target.value, 3)}
                    maxLength={rowLengthsByBoardType[boardType][3]}
                    placeholder="Row 4"
                    // className={`input-box-transition ${invalidInputSide === LEFT ? 'shake' : ''} w-36`}
                    ref={lettersInputRefs[3]}
                />
                {
                    rowLengthsByBoardType[boardType].length === 5 &&
                    <Input
                        type="text"
                        value={letters[4].join('')}
                        onChange={(e) => onLettersChange(e.target.value, 4)}
                        maxLength={rowLengthsByBoardType[boardType][4]}
                        placeholder="Row 5"
                        // className={`input-box-transition ${invalidInputSide === LEFT ? 'shake' : ''} w-36`}
                        ref={lettersInputRefs[4]}
                    />
                }
            </div>
            <ButtonGroupPicker
                optionsWithLabels={buttonGroupOptions}
                label="Board Type"
                selectedValue={boardType}
                setValue={onBoardTypeChange}
            />
            <div className="flex justify-center">
                <button
                    // disabled={letters.length !== numLetters}
                    onClick={onSolve}
                    className={`${buttonStyle} w-48`}
                >Solve</button>
            </div>
        </div>
    );
}


interface BoardSectionProps {
    letters: string[][];
    boardType: BoardType;
    currentSolution?: WordHuntSolution;
}

const BoardSection: React.FC<BoardSectionProps> = ({
    letters,
    boardType,
    currentSolution
}) => {
    if (boardType === "4x4") {
        return <SmallSquareBoard letters={letters} currentSolution={currentSolution} />;
    } else if (boardType === "5x5") {
        return <LargeSquareBoard letters={letters} currentSolution={currentSolution} />;
    } else if (boardType === "donut") {
        return <DonutBoard letters={letters} currentSolution={currentSolution} />;
    } else if (boardType === "cross") {
        return <CrossBoard letters={letters} currentSolution={currentSolution} />;
    }
    return <div>Board type "{boardType}" not implemented yet.</div>;
}



const SmallSquareBoard: React.FC<Omit<BoardSectionProps, 'boardType'>> = ({
    letters,
    currentSolution
}) => {
    console.log("currentSolution.positions", currentSolution?.positions);
    return (
        <div className="grid grid-cols-4 gap-y-4 gap-x-4 w-fit mx-auto">
            {letters.map((row, rowIndex) =>
                row.concat(Array(4 - row.length).fill("")).map((letter, colIndex) => (
                    <LetterTile
                        key={`${rowIndex}-${colIndex}`}
                        letter={letter}
                        size="lg"
                        indexInSolution={currentSolution?.positions.indexOf(rowIndex * 4 + colIndex)}
                    />
                ))
            )}
        </div>
    );
}

const LargeSquareBoard: React.FC<Omit<BoardSectionProps, 'boardType'>> = ({
    letters,
    currentSolution
}) => {
    return (
        <div className="grid grid-cols-5 gap-y-4 gap-x-4 w-fit mx-auto">
            {letters.map((row, rowIndex) =>
                row.concat(Array(5 - row.length).fill("")).map((letter, colIndex) => (
                    <LetterTile
                        key={`${rowIndex}-${colIndex}`}
                        letter={letter}
                        size="sm"
                        indexInSolution={currentSolution?.positions.indexOf(rowIndex * 5 + colIndex)}
                    />
                ))
            )}
        </div>
    );
}

const DonutBoard: React.FC<Omit<BoardSectionProps, 'boardType'>> = ({
    letters,
    currentSolution
}) => {
    return (
        <div className="grid grid-cols-5 gap-y-4 gap-x-4 w-fit mx-auto">
            {letters.map((row, rowIndex) => {
                let adjustedRow = row;
                const desiredLength = rowIndex === 0 || rowIndex === 4 ? 3 : rowIndex === 1 || rowIndex === 3 ? 5 : 4;

                if (row.length < desiredLength) {
                    adjustedRow = [...row, ...Array(desiredLength - row.length).fill("")];
                }

                let positionOffset = 0;

                if (rowIndex === 2) {
                    positionOffset = 8;
                    return (
                        <>
                            <div className="col-start-1 col-end-3 flex flex-row gap-x-4">
                                {adjustedRow.slice(0, 2).map((letter, colIndex) => (
                                    <LetterTile
                                        key={`${rowIndex}-${colIndex}`}
                                        letter={letter}
                                        size="sm"
                                        indexInSolution={currentSolution?.positions.indexOf(positionOffset + colIndex)}
                                    />
                                ))}
                            </div>
                            <div className="col-start-4 col-end-6 flex flex-row gap-x-4">
                                {adjustedRow.slice(2, 4).map((letter, colIndex) => (
                                    <LetterTile
                                        key={`${rowIndex}-${colIndex}`}
                                        letter={letter}
                                        size="sm"
                                        indexInSolution={currentSolution?.positions.indexOf((positionOffset + 2) + colIndex)}
                                    />
                                ))}
                            </div>
                        </>)
                }

                if (rowIndex === 1) {
                    positionOffset = 3;
                } else if (rowIndex === 3) {
                    positionOffset = 12;
                } else if (rowIndex === 4) {
                    positionOffset = 17;
                }


                let gridLayout = "col-start-1 col-end-6";
                if (rowIndex === 0 || rowIndex === 4) {
                    gridLayout = "col-start-2 col-end-5";
                }

                return (
                    <div className={`${gridLayout} flex flex-row gap-x-4`}>
                        {adjustedRow.map((letter, colIndex) => (
                            <LetterTile
                                key={`${rowIndex}-${colIndex}`}
                                letter={letter}
                                size="sm"
                                indexInSolution={currentSolution?.positions.indexOf(positionOffset + colIndex)}
                            />
                        ))}
                    </div>
                )
            })}
        </div>
    );
}

const CrossBoard: React.FC<Omit<BoardSectionProps, 'boardType'>> = ({
    letters,
    currentSolution
}) => {
    return (
        <div className="grid grid-cols-5 gap-y-4 gap-x-4 w-fit mx-auto">
            {letters.map((row, rowIndex) => {
                let adjustedRow = row;
                const desiredLength = rowIndex === 0 || rowIndex === 4 ? 4 : rowIndex === 1 || rowIndex === 3 ? 5 : 3;

                if (row.length < desiredLength) {
                    adjustedRow = [...row, ...Array(desiredLength - row.length).fill("")];
                }

                let positionOffset = 0;
                if (rowIndex === 1) {
                    positionOffset = 4;
                } else if (rowIndex === 2) {
                    positionOffset = 9;
                } else if (rowIndex === 3) {
                    positionOffset = 12;
                } else if (rowIndex === 4) {
                    positionOffset = 17;
                }

                if (rowIndex === 0 || rowIndex === 4) {
                    return (
                        <>
                            <div className="col-start-1 col-end-3 flex flex-row gap-x-4">
                                {adjustedRow.slice(0, 2).map((letter, colIndex) => (
                                    <LetterTile
                                        key={`${rowIndex}-${colIndex}`}
                                        letter={letter}
                                        size="sm"
                                        indexInSolution={currentSolution?.positions.indexOf(positionOffset + colIndex)}
                                    />
                                ))}
                            </div>
                            <div className="col-start-4 col-end-6 flex flex-row gap-x-4">
                                {adjustedRow.slice(2, 4).map((letter, colIndex) => (
                                    <LetterTile
                                        key={`${rowIndex}-${colIndex}`}
                                        letter={letter}
                                        size="sm"
                                        indexInSolution={currentSolution?.positions.indexOf((positionOffset + 2) + colIndex)}
                                    />
                                ))}
                            </div>
                        </>)
                }


                let gridLayout = rowIndex === 2 ? "col-start-2 col-end-5" : "col-start-1 col-end-6";

                return (
                    <div className={`${gridLayout} flex flex-row gap-x-4`}>
                        {adjustedRow.map((letter, colIndex) => (
                            <LetterTile
                                key={`${rowIndex}-${colIndex}`}
                                letter={letter}
                                size="sm"
                                indexInSolution={currentSolution?.positions.indexOf(positionOffset + colIndex)}
                            />
                        ))}
                    </div>
                )
            })}
        </div>
    );
}




interface LetterTileProps {
    letter: string;
    size: 'sm' | 'lg';
    indexInSolution?: number;
    key: string
}

const LetterTile: React.FC<LetterTileProps> = ({
    letter,
    size,
    indexInSolution,
    key
}) => {
    const inSolution = indexInSolution !== undefined && indexInSolution >= 0;
    const isStartingLetter = indexInSolution === 0;
    const baseClasses = "rounded-md flex flex-col items-center justify-center text-xl font-bold text-slate-800";
    const sizeClasses = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
    const bgColor = inSolution ? 'bg-secondary-contrast' : 'bg-secondary-base';
    const borderColor = isStartingLetter ? 'border-2 border-text-base' : '';

    return (
        <div key={key} className={`${baseClasses} ${sizeClasses} ${bgColor} ${borderColor}`}>
            <span>{letter || ""}</span>
            <span className="text-xs text-text-base opacity-70">{inSolution && indexInSolution + 1}</span>
        </div>
    );
}

/**
 * Transforms the solutions array into a 2D array of just the words for display purposes.
 * @param solutions array of WordHuntSolution objects
 * @param wordsPerPage number of words to display per page
 */
function transformSolutionsForDisplay(
    solutions: WordHuntSolution[],
    wordsPerPage: number
): string[][] {
    const chunks: string[][] = [];
    for (let i = 0; i < solutions.length; i += wordsPerPage) {
        chunks.push(solutions.slice(i, i + wordsPerPage).map(s => s.word));
    }
    return chunks;
}


export default WordHunt;