import React, { useState, useRef } from 'react';
import '../../../App.css'
import { ActionButton } from '../../../atoms/ActionButton';
import { ButtonGroupPicker, ButtonGroupPickerOption } from '../../../components/ButtonGroupPicker';
import { callEndpoint } from '../../../utils/helpers';
import { PaginatedSolutionsSection } from '../../../components/PaginatedSolutionsSection';
import Input from '../../../atoms/Input';
import { TitleWithInfo } from '../../../components/TitleWithInfo';

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

const WordHunt = () => {
    const [hasSolved, setHasSolved] = useState(false); // if solve has run at least once
    const [loading, setLoading] = useState(false);
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
        setLoading(true);
        const res = await callEndpoint('api/game_pigeon/word_hunt', {
            letters: inputLetters.flat(),
            board_type: boardType.toLowerCase(),
            min_length: 3
        });

        setSolutions(
            Object.entries(res.solutions).map(
                ([word, positions]) => ({
                    word,
                    positions,
                } as WordHuntSolution))
        );
        setLoading(false);
        setPageNumber(0);
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
            <WordHuntTitleSection />
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
                </div>
                {hasSolved && (
                    <div className="w-full md:w-2/5 transition-all duration-300">
                        <PaginatedSolutionsSection
                            solutions={transformSolutionsForDisplay(solutions, WORDS_PER_PAGE)} // Convert to 2D array for compatibility
                            pageNumber={pageNumber}
                            setPageNumber={setPageNumber}
                            isLoading={loading}
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
    const buttonGroupOptions = [
        { label: "4x4", value: "4x4" },
        { label: "5x5", value: "5x5" },
        { label: "Donut", value: "donut" },
        { label: "Cross", value: "cross" }
    ] as ButtonGroupPickerOption<BoardType>[];
    return (
        <div className="flex flex-col gap-4 items-center">
            <div className='flex flex-wrap flex-row gap-2 justify-center'>
                <Input
                    type="text"
                    value={letters[0].join('')}
                    onChange={(e) => onLettersChange(e.target.value, 0)}
                    maxLength={rowLengthsByBoardType[boardType][0]}
                    placeholder="Row 1"
                    ref={lettersInputRefs[0]}
                />
                <Input
                    type="text"
                    value={letters[1].join('')}
                    onChange={(e) => onLettersChange(e.target.value, 1)}
                    maxLength={rowLengthsByBoardType[boardType][1]}
                    placeholder="Row 2"
                    ref={lettersInputRefs[1]}
                />
                <Input
                    type="text"
                    value={letters[2].join('')}
                    onChange={(e) => onLettersChange(e.target.value, 2)}
                    maxLength={rowLengthsByBoardType[boardType][2]}
                    placeholder="Row 3"
                    ref={lettersInputRefs[2]}
                />
                <Input
                    type="text"
                    value={letters[3].join('')}
                    onChange={(e) => onLettersChange(e.target.value, 3)}
                    maxLength={rowLengthsByBoardType[boardType][3]}
                    placeholder="Row 4"
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
            <ActionButton
                disabled={letters.flat().length !== rowLengthsByBoardType[boardType].reduce((a, b) => a + b, 0)} label="Solve"
                onClick={onSolve}
                className="w-48"
                debounceMs={1000}
            />
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
    return (
        <div className="grid grid-cols-4 gap-y-4 gap-x-4 w-fit mx-auto">
            {letters.map((row, rowIndex) =>
                row.concat(Array(4 - row.length).fill("")).map((letter, colIndex) => (
                    <LetterTile
                        tileKey={`${rowIndex}-${colIndex}`}
                        letter={letter}
                        size="lg"
                        beforeSolve={!currentSolution}
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
                        tileKey={`${rowIndex}-${colIndex}`}
                        letter={letter}
                        size="sm"
                        beforeSolve={!currentSolution}
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
                                        tileKey={`${rowIndex}-${colIndex}`}
                                        letter={letter}
                                        size="sm"
                                        beforeSolve={!currentSolution}
                                        indexInSolution={currentSolution?.positions.indexOf(positionOffset + colIndex)}
                                    />
                                ))}
                            </div>
                            <div className="col-start-4 col-end-6 flex flex-row gap-x-4">
                                {adjustedRow.slice(2, 4).map((letter, colIndex) => (
                                    <LetterTile
                                        tileKey={`${rowIndex}-${colIndex}`}
                                        letter={letter}
                                        size="sm"
                                        beforeSolve={!currentSolution}
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
                                tileKey={`${rowIndex}-${colIndex}`}
                                letter={letter}
                                size="sm"
                                beforeSolve={!currentSolution}
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
                                        tileKey={`${rowIndex}-${colIndex}`}
                                        letter={letter}
                                        size="sm"
                                        beforeSolve={!currentSolution}
                                        indexInSolution={currentSolution?.positions.indexOf(positionOffset + colIndex)}
                                    />
                                ))}
                            </div>
                            <div className="col-start-4 col-end-6 flex flex-row gap-x-4">
                                {adjustedRow.slice(2, 4).map((letter, colIndex) => (
                                    <LetterTile
                                        tileKey={`${rowIndex}-${colIndex}`}
                                        letter={letter}
                                        size="sm"
                                        beforeSolve={!currentSolution}
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
                                tileKey={`${rowIndex}-${colIndex}`}
                                letter={letter}
                                size="sm"
                                beforeSolve={!currentSolution}
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
    beforeSolve: boolean;
    tileKey: string
}

const LetterTile: React.FC<LetterTileProps> = ({
    letter,
    size,
    indexInSolution,
    beforeSolve,
    tileKey
}) => {
    const inSolution = indexInSolution !== undefined && indexInSolution >= 0;
    const isStartingLetter = indexInSolution === 0;
    const baseClasses = "rounded-md flex flex-col items-center justify-center text-xl font-bold text-letter-tile-text";
    const sizeClasses = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
    const bgColor = inSolution || beforeSolve ? 'bg-letter-tile' : 'bg-letter-tile opacity-50';
    const borderColor = isStartingLetter ? 'border-4 border-text-base' : '';

    return (
        <div key={tileKey} className={`${baseClasses} ${sizeClasses} ${bgColor} ${borderColor}`}>
            <span>{letter || ""}</span>
            <span className="text-xs text-text-dark opacity-70">{inSolution && indexInSolution + 1}</span>
        </div>
    );
}

const WordHuntTitleSection: React.FC = () => {
    return (
        <TitleWithInfo
            title="Word Hunt!"
            infoTitle="How to Play Word Hunt"
            objective="Find English words that can be made from connecting the letters."
            rules={[
                "Only neighboring letters can be connected (vertical, horizontal, or diagonal).",
                "A tile can only be used once in a word (no backtracking).",
                "Words must be 3 letters or longer.",
                "Longer words are worth more points."
            ]}
            instructionsTitle="How to Use the Tool"
            toolInstructions={[
                "Choose the layout of the board.",
                "Enter letters into the input boxes.",
                (<div>Click <b>Solve</b> to find all valid English words that can be made.</div>),
            ]}
        />
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