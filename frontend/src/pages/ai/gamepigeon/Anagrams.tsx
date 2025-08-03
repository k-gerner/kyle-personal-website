import React, { useState, useEffect } from 'react';
import '../../../App.css'
import { ButtonGroupPicker } from '../../../atoms/ButtonGroupPicker';
import { PaginatedSolutionsSection } from '../../../atoms/PaginatedSolutionsSection';
import { chunkArray } from '../../../utils/helpers';


const WORDS_PER_PAGE = 5;
const buttonStyle = "rounded-full border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-teal hover:border-teal focus-visible:text-white focus-visible:bg-dark-teal focus-visible:border-teal active:border-dark-teal active:text-white active:bg-dark-teal disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"

const Anagrams = () => {
    const [hasSolved, setHasSolved] = useState(false); // if solve has run at least once
    const [inputLetters, setInputLetters] = useState('');
    const [numLetters, setNumLetters] = useState(6);
    const [solutions, setSolutions] = useState<string[][]>([[]]);
    const [pageNumber, setPageNumber] = useState(0);

    // Trim inputLetters if numLetters is reduced
    useEffect(() => {
        if (inputLetters.length > numLetters) {
            setInputLetters(inputLetters.slice(0, numLetters));
        }
    }, [numLetters]);

    const handleSolve = async () => {
        setHasSolved(true);
        const res = await fetch('http://localhost:5001/api/game_pigeon/anagrams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                letters: inputLetters.split(''),
            })
        });

        const data = await res.json();
        setSolutions(chunkArray(data.words, WORDS_PER_PAGE));
        setPageNumber(0);
    };
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-center text-3xl font-bold text-dark-teal mb-4">Anagrams!</h1>
            <div className="flex flex-col gap-6 md:gap-2 md:flex-row transition-all duration-300 ease-in-out">
                <div className={`flex flex-col gap-10 flex-shrink-0 transition-all duration-500 w-full ${hasSolved ? 'md:w-3/5' : 'md:w-full'}`}>
                    <InputSection
                        letters={inputLetters}
                        numLetters={numLetters}
                        setNumLetters={setNumLetters}
                        onLettersChange={(e) => setInputLetters(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                        onSolve={handleSolve}
                    />
                    <LettersSection
                        letters={inputLetters}
                        numLetters={numLetters}
                    />
                </div>
                {hasSolved && (
                    <div className="w-full md:w-2/5 transition-all duration-300">
                        <PaginatedSolutionsSection
                            solutions={solutions}
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
    letters: string;
    numLetters: number
    setNumLetters: (value: number) => void;
    onLettersChange: (value: any) => void;
    onSolve: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
    letters,
    numLetters,
    setNumLetters,
    onLettersChange,
    onSolve
}) => {
    return (
        <div className="flex flex-col gap-4">
            <div className='flex flex-row gap-2 justify-center'>
                <input
                    type="text"
                    value={letters}
                    onChange={onLettersChange}
                    maxLength={numLetters}
                    placeholder="Letters"
                    className="w-36 bg-transparent placeholder:text-slate-400 text-slate-800 text-sm border-2 border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-teal hover:border-sky-blue shadow-sm focus:shadow"
                />
            </div>
            <ButtonGroupPicker
                options={[6, 7]}
                label="Number of Letters"
                selectedValue={numLetters}
                setValue={setNumLetters}
            />
            <div className="flex justify-center">
                <button
                    disabled={letters.length !== numLetters}
                    onClick={onSolve}
                    className={`${buttonStyle} w-48`}
                >Solve</button>
            </div>
        </div>
    );
}

// sub component to display 6 or 7 letters, in a horizontal row of tan rounded boxes
interface LettersSectionProps {
    letters: string;
    numLetters: number
}

const LettersSection: React.FC<LettersSectionProps> = ({
    letters,
    numLetters
}) => {
    // Ensure all tiles show by padding with empty strings
    const numEmptyTiles = Math.max(0, numLetters - letters.length);
    const paddedLetters = letters.slice(0, numLetters).split('').concat(Array(numEmptyTiles).fill(''));

    return (
        <div className="flex flex-row gap-2 justify-center">
            {paddedLetters.map((letter, index) => (
                <div key={index} className="bg-orange-200 rounded-md w-16 h-16 flex items-center justify-center text-xl font-bold text-slate-800">
                    {letter}
                </div>
            ))}
        </div>
    );
}


export default Anagrams;