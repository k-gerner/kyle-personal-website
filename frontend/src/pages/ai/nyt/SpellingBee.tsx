import React, { useState, useRef } from 'react';
import { PaginatedSolutionsSection } from '../../../components/PaginatedSolutionsSection';
import { chunkArray } from '../../../utils/helpers';
import '../../../App.css'
import Input from '../../../atoms/Input';

const WORDS_PER_PAGE = 5;
const buttonStyle = "rounded-full border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-text-contrast hover:bg-primary-base hover:border-primary-base focus-visible:text-text-contrast focus-visible:bg-primary-highlight focus-visible:border-primary-base active:border-primary-highlight active:text-text-contrast active:bg-primary-highlight disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"

const SpellingBee = () => {
    const [hasSolved, setHasSolved] = useState(false); // if solve has run at least once
    const [centerLetter, setCenterLetter] = useState('');
    const [outerLetters, setOuterLetters] = useState('');
    const [solutions, setSolutions] = useState<string[][]>([[]]);
    const [pageNumber, setPageNumber] = useState(0);
    const outerLettersRef = useRef<HTMLInputElement>(null);

    const handleSolve = async () => {
        setHasSolved(true);
        const res = await fetch('http://localhost:5001/api/nyt/spelling_bee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                center_letter: centerLetter,
                outer_letters: outerLetters.split('')
            })
        });

        const data = await res.json();
        setSolutions(chunkArray(data.words, WORDS_PER_PAGE));
        setPageNumber(0);
    };

    const handleCenterLetterChange = (input: any) => {
        const val = input.target.value.toUpperCase().replace(/[^A-Z]/g, '');;
        setCenterLetter(val);

        // Automatically move focus to the outer letters input when the center letter is filled
        if (val.length === 1 && outerLettersRef.current) {
            outerLettersRef.current.focus();
        }
    }
    const handleOuterLettersChange = (input: any) => {
        const val = input.target.value.toUpperCase().replace(/[^A-Z]/g, '');
        const uniqueLetters = Array.from(new Set(val.split(''))).join('');
        setOuterLetters(uniqueLetters);
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-center text-3xl font-bold text-primary-highlight mb-4">Spelling Bee!</h1>
            <InputSection
                centerLetter={centerLetter}
                outerLetters={outerLetters}
                onCenterLetterChange={handleCenterLetterChange}
                onOuterLettersChange={handleOuterLettersChange}
                onSolve={handleSolve}
                outerLettersRef={outerLettersRef}
            />
            <div className="flex flex-col pt-2 gap-6 md:gap-0 md:flex-row transition-all duration-300 ease-in-out">
                <div className={`flex-shrink-0 transition-all duration-500 w-full ${hasSolved ? 'md:w-3/5' : 'md:w-full'}`}>
                    <LettersSection centerLetter={centerLetter} outerLetters={outerLetters.split('')} />
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
    centerLetter: string;
    outerLetters: string;
    onCenterLetterChange: (value: any) => void;
    onOuterLettersChange: (value: any) => void;
    onSolve: () => void;
    outerLettersRef: React.RefObject<HTMLInputElement | null>;
}

const InputSection: React.FC<InputSectionProps> = ({
    centerLetter,
    outerLetters,
    onCenterLetterChange,
    onOuterLettersChange,
    onSolve,
    outerLettersRef
}) => {
    return (
        <div className="flex flex-col gap-2">
            <div className='flex flex-row gap-2 justify-center'>
                <Input
                    type="text"
                    value={centerLetter}
                    onChange={onCenterLetterChange}
                    maxLength={1}
                    placeholder="Center Letter"
                    className="w-36"
                />
                <Input
                    type="text"
                    value={outerLetters}
                    onChange={onOuterLettersChange}
                    maxLength={6}
                    placeholder="Outer Letters"
                    className="w-36"
                    ref={outerLettersRef}
                />
            </div>
            <div className="flex justify-center">
                <button
                    disabled={!centerLetter || outerLetters.length !== 6}
                    onClick={onSolve}
                    className={`${buttonStyle} w-48`}
                >Solve</button>
            </div>
        </div>
    );
}

interface LettersSectionProps {
    centerLetter: string;
    outerLetters: string[];
}

const LettersSection: React.FC<LettersSectionProps> = ({ centerLetter, outerLetters }) => {
    return (
        <div className="flex flex-row items-center justify-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-4">
                <Letter letter={outerLetters[0] || ''} />
                <Letter letter={outerLetters[1] || ''} />
            </div>
            <div className="flex flex-col items-center gap-4">
                <Letter letter={outerLetters[2] || ''} />
                <Letter letter={centerLetter || ''} isCenter={true} />
                <Letter letter={outerLetters[3] || ''} />
            </div>
            <div className="flex flex-col items-center gap-4">
                <Letter letter={outerLetters[4] || ''} />
                <Letter letter={outerLetters[5] || ''} />
            </div>
        </div>
    );
};

interface LetterProps {
    letter: string;
    isCenter?: boolean;
}

const Letter: React.FC<LetterProps> = ({ letter, isCenter }) => {
    const background = isCenter ? 'bg-my-yellow' : 'bg-background-muted';
    return (
        <div className={`hex ${background} flex items-center justify-center w-20 sm:w-24 md:w-28 lg:w-32 xl:w-40 transition-all duration-300`}>
            <span className="text-4xl bg-transparent text-black px-3 py-1 rounded font-mono">
                {letter}
            </span>
        </div>
    );
}


export default SpellingBee;