import React, { useState, useRef } from 'react';

import '../../../App.css'
import { ButtonGroupPicker } from '../../../atoms/ButtonGroupPicker';
import { PaginatedSolutionsSection } from '../../../atoms/PaginatedSolutionsSection';

const TOP = "top";
const RIGHT = "right";
const BOTTOM = "bottom";
const LEFT = "left";

type Side = typeof TOP | typeof RIGHT | typeof BOTTOM | typeof LEFT;
type LetterSides = {
    [key in Side]: string[];
};

const buttonStyle = "rounded-full border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-teal hover:border-teal focus-visible:text-white focus-visible:bg-dark-teal focus-visible:border-teal active:border-dark-teal active:text-white active:bg-dark-teal disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

const LetterBoxed = () => {
    const [hasSolved, setHasSolved] = useState(false); // if solve has run at least once
    const [solutions, setSolutions] = React.useState<string[][]>([[]]);
    const [maxSolutionLength, setMaxSolutionLength] = useState<number>(2);
    const [letterSides, setLetterSides] = useState<LetterSides>({
        top: [],
        right: [],
        bottom: [],
        left: [],
    });
    const [invalidInputSide, setInvalidInputSide] = useState<Side | undefined>();
    const [pageNumber, setPageNumber] = useState(0);
    const [loading, setLoading] = useState(false);
    const lettersInputRefs: React.RefObject<HTMLInputElement | null>[] = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const handleSolve = async () => {
        setHasSolved(true);
        setLoading(true);
        const res = await fetch('http://localhost:5001/api/nyt/letter_boxed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                letter_sides: [
                    ...Object.values(letterSides),
                ],
                max_solutions_length: maxSolutionLength
            })
        });

        const data = await res.json();
        setLoading(false);
        setSolutions(data.solutions);
        setPageNumber(0);
    };

    const triggerInvalidInputAnimation = (side: Side) => {
        setInvalidInputSide(side);
        setTimeout(() => setInvalidInputSide(undefined), 200); // Reset after animation
    }

    const onLettersChange = (value: string, side: Side) => {
        const allExistingLetters = new Set(
            Object.entries(letterSides)
                .filter(([key]) => key !== side)
                .flatMap(([, letters]) => letters)
        );
        const currentSideLetters = Array.from(
            new Set(
                value
                    .toUpperCase()
                    .replace(/[^A-Z]/g, '')
                    .split('')
                    .slice(0, 3)
            )
        ).filter(letter => !allExistingLetters.has(letter));
        if (currentSideLetters.length < value.length) {
            triggerInvalidInputAnimation(side);
        }
        const newLetters = { ...letterSides, [side]: currentSideLetters };
        setLetterSides(newLetters);

        // Automatically move focus to the next input box when the current box is full
        if (currentSideLetters.length === 3) {
            const sides = Object.keys(letterSides) as Side[];
            const currentIndex = sides.indexOf(side);
            if (currentIndex < sides.length - 1) {
                lettersInputRefs[currentIndex + 1]?.current?.focus();
            }
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-center text-3xl font-bold text-dark-teal mb-4">Letter Boxed!</h1>
            <InputSection
                letters={letterSides}
                onLettersChange={onLettersChange}
                onSolve={handleSolve}
                lettersInputRefs={lettersInputRefs}
                invalidInputSide={invalidInputSide}
                maxSolutionLength={maxSolutionLength}
                setMaxSolutionLength={setMaxSolutionLength}
            />
            <div className="flex flex-col md:flex-row transition-all duration-300 ease-in-out w-full">
                <div className={`flex-shrink-0 transition-all duration-500 w-full ${hasSolved ? 'md:w-3/5' : 'md:w-full'}`}>
                    <LetterBox letterSides={letterSides} />
                </div>
                {hasSolved && (
                    <div className="w-full md:w-2/5 transition-all duration-300">
                        <PaginatedSolutionsSection
                            solutions={solutions}
                            pageNumber={pageNumber}
                            setPageNumber={setPageNumber}
                            isLoading={loading}
                            includeNumbers={true}
                            useContinuousNumbers={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

interface LetterBoxProps {
    letterSides: LetterSides;
}

const LetterBox: React.FC<LetterBoxProps> = ({ letterSides }) => {
    return (
        <div className="flex justify-center items-center font-mono py-14">
            <div className="min-w-max relative w-64 h-64 border-4 border-black flex justify-center items-center">
                {/* Top Circles */}
                <div className="absolute top-[-22%] left-[16%] flex justify-between w-2/3">
                    {Array(3).fill(null).map((_, index) => (
                        <div key={`top-${index}`} className="flex flex-col items-center">
                            <span className="text-3xl mb-1">{letterSides[TOP][index] ?? '-'}</span>
                            <div className="w-6 h-6 rounded-full border-2 border-red-500 bg-white"></div>
                        </div>
                    ))}
                </div>

                {/* Right Circles */}
                <div className="absolute right-[-18%] top-[16%] flex flex-col justify-between h-2/3">
                    {Array(3).fill(null).map((_, index) => (
                        <div key={`right-${index}`} className="flex flex-row items-center">
                            <div className="w-6 h-6 rounded-full border-2 border-red-500 bg-white"></div>
                            <span className="text-3xl ml-3">{letterSides[RIGHT][index] ?? '-'}</span>
                        </div>
                    ))}
                </div>

                {/* Bottom Circles */}
                <div className="absolute bottom-[-22%] left-[16%] flex justify-between w-2/3">
                    {Array(3).fill(null).map((_, index) => (
                        <div key={`bottom-${index}`} className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full border-2 border-red-500 bg-white"></div>
                            <span className="text-3xl mt-1">{letterSides[BOTTOM][index] ?? '-'}</span>
                        </div>
                    ))}
                </div>

                {/* Left Circles */}
                <div className="absolute left-[-18%] top-[16%] flex flex-col justify-between h-2/3">
                    {Array(3).fill(null).map((_, index) => (
                        <div key={`left-${index}`} className="flex flex-row items-center">
                            <span className="text-3xl mr-3">{letterSides[LEFT][index] ?? '-'}</span>
                            <div className="w-6 h-6 rounded-full border-2 border-red-500 bg-white"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

interface InputSectionProps {
    letters: LetterSides;
    onLettersChange: (value: string, side: Side) => void;
    onSolve: () => void;
    lettersInputRefs: React.RefObject<HTMLInputElement | null>[];
    invalidInputSide: Side | undefined;
    maxSolutionLength: number;
    setMaxSolutionLength: (length: number) => void;
}

const InputSection: React.FC<InputSectionProps> = ({
    letters,
    onLettersChange,
    onSolve,
    lettersInputRefs,
    invalidInputSide,
    maxSolutionLength,
    setMaxSolutionLength,
}) => {
    return (
        <div className="flex flex-col gap-4">
            <LettersInputs
                letters={letters}
                onLettersChange={onLettersChange}
                lettersInputRefs={lettersInputRefs}
                invalidInputSide={invalidInputSide}
            />
            <ButtonGroupPicker
                options={[2, 3, 4, 5]}
                label="Max Words Per Solution"
                selectedValue={maxSolutionLength}
                setValue={setMaxSolutionLength}
            />
            <div className="flex justify-center">
                <button
                    disabled={!Object.values(letters).every((side) => side.length === 3)}
                    onClick={onSolve}
                    className={`${buttonStyle} w-48`}
                >Solve</button>
            </div>
        </div>
    );
}


interface LettersInputsProps {
    letters: LetterSides;
    onLettersChange: (value: string, side: Side) => void;
    lettersInputRefs: React.RefObject<HTMLInputElement | null>[];
    invalidInputSide: Side | undefined;
}

const LettersInputs: React.FC<LettersInputsProps> = ({
    letters,
    onLettersChange,
    lettersInputRefs,
    invalidInputSide
}) => {
    return (
        <div className='flex flex-wrap flex-row gap-2 justify-center'>
            <input
                type="text"
                value={letters[TOP].join('')}
                onChange={(e) => onLettersChange(e.target.value, TOP)}
                maxLength={3}
                placeholder="Top"
                className={`input-letter-box ${invalidInputSide === TOP ? 'shake' : ''} w-36 bg-transparent placeholder:text-slate-400 text-slate-800 text-sm border-2 border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-teal hover:border-sky-blue shadow-sm focus:shadow`}
                ref={lettersInputRefs[0]}
            />
            <input
                type="text"
                value={letters[RIGHT].join('')}
                onChange={(e) => onLettersChange(e.target.value, RIGHT)}
                maxLength={3}
                placeholder="Right"
                className={`input-letter-box ${invalidInputSide === RIGHT ? 'shake' : ''} w-36 bg-transparent placeholder:text-slate-400 text-slate-800 text-sm border-2 border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-teal hover:border-sky-blue shadow-sm focus:shadow`}
                ref={lettersInputRefs[1]}
            />
            <input
                type="text"
                value={letters[BOTTOM].join('')}
                onChange={(e) => onLettersChange(e.target.value, BOTTOM)}
                maxLength={3}
                placeholder="Bottom"
                className={`input-letter-box ${invalidInputSide === BOTTOM ? 'shake' : ''} w-36 bg-transparent placeholder:text-slate-400 text-slate-800 text-sm border-2 border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-teal hover:border-sky-blue shadow-sm focus:shadow`}
                ref={lettersInputRefs[2]}
            />
            <input
                type="text"
                value={letters[LEFT].join('')}
                onChange={(e) => onLettersChange(e.target.value, LEFT)}
                maxLength={3}
                placeholder="Left"
                className={`input-letter-box ${invalidInputSide === LEFT ? 'shake' : ''} w-36 bg-transparent placeholder:text-slate-400 text-slate-800 text-sm border-2 border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-teal hover:border-sky-blue shadow-sm focus:shadow`}
                ref={lettersInputRefs[3]}
            />
        </div>
    )
}


export default LetterBoxed;