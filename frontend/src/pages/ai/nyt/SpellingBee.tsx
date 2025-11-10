import React, { useState, useRef } from 'react';
import { ActionButton } from '../../../atoms/ActionButton';
import { callEndpoint } from '../../../utils/helpers';
import { TitleWithInfo } from '../../../components/TitleWithInfo';
import { PaginatedSolutionsSection } from '../../../components/PaginatedSolutionsSection';
import { chunkArray } from '../../../utils/helpers';
import '../../../App.css'
import Input from '../../../atoms/Input';

const WORDS_PER_PAGE = 5;

const SpellingBee = () => {
    const [hasSolved, setHasSolved] = useState(false); // if solve has run at least once
    const [loading, setLoading] = useState(false);
    const [centerLetter, setCenterLetter] = useState('');
    const [outerLetters, setOuterLetters] = useState('');
    const [solutions, setSolutions] = useState<string[][]>([[]]);
    const [pageNumber, setPageNumber] = useState(0);
    const outerLettersRef = useRef<HTMLInputElement>(null);

    const handleSolve = async () => {
        setHasSolved(true);
        setLoading(true);
        const res = await callEndpoint('api/nyt/spelling_bee', {
            center_letter: centerLetter,
            outer_letters: outerLetters.split('')
        });

        setSolutions(chunkArray(res.words, WORDS_PER_PAGE));
        setLoading(false);
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
            <SpellingBeeTitleSection />
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
        <div className="flex flex-col gap-2 items-center">
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
            <ActionButton
                disabled={!centerLetter || outerLetters.length !== 6}
                label="Solve"
                onClick={onSolve}
                className="w-48"
                debounceMs={1000}
            />
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
            <div className="flex flex-col items-center gap-1 sm:gap-2 lg:gap-3 xl:gap-4 -mr-4 md:-mr-5 xl:-mr-7">
                <Letter letter={outerLetters[0] || ''} />
                <Letter letter={outerLetters[1] || ''} />
            </div>
            <div className="flex flex-col items-center gap-1 sm:gap-2 lg:gap-3 xl:gap-4">
                <Letter letter={outerLetters[2] || ''} />
                <Letter letter={centerLetter || ''} isCenter={true} />
                <Letter letter={outerLetters[3] || ''} />
            </div>
            <div className="flex flex-col items-center gap-1 sm:gap-2 lg:gap-3 xl:gap-4 -ml-4 md:-ml-5 xl:-ml-7">
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
    const textColorClass = isCenter ? "text-black" : "text-text-base"
    return (
        <div className={`hex ${background} ${textColorClass} flex items-center justify-center w-20 sm:w-24 md:w-28 lg:w-32 xl:w-40 transition-all duration-300`}>
            <span className="text-4xl bg-transparent px-3 py-1 rounded font-mono">
                {letter}
            </span>
        </div>
    );
}


const SpellingBeeTitleSection: React.FC = () => {
    return (
        <TitleWithInfo
            title="Spelling Bee!"
            infoTitle="How to Play Spelling Bee"
            objective="Find as many words as possible using the given letters. Longer words (and words that use all 7 letters) are worth more."
            rules={[
                "All words must include the center letter and be at least 4 letters long."
            ]}
            instructionsTitle="How to Use the Tool"
            toolInstructions={[
                "Enter a center letter and 6 unique outer letters (total 7 letters).",
                (<div>Click <b>Solve</b> to find all valid English words you can make that include the center letter.</div>),
                "Words are grouped by length and shown in pages. Words that include all letters (pangrams) are prioritized as well."
            ]}
        />
    )
}


export default SpellingBee;