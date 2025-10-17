import React, { useState, useEffect } from 'react';
import '../../../App.css'
import { ActionButton } from '../../../atoms/ActionButton';
import { ButtonGroupPicker } from '../../../components/ButtonGroupPicker';
import { PaginatedSolutionsSection } from '../../../components/PaginatedSolutionsSection';
import { TitleWithInfo } from '../../../components/TitleWithInfo';
import { chunkArray } from '../../../utils/helpers';
import Input from '../../../atoms/Input';


const WORDS_PER_PAGE = 5;

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
            <AnagramsTitleSection />
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
        <div className="flex flex-col gap-4 items-center">
            <Input
                type="text"
                value={letters}
                onChange={onLettersChange}
                maxLength={numLetters}
                placeholder="Letters"
                className="w-36"
            />
            <ButtonGroupPicker
                options={[6, 7]}
                label="Number of Letters"
                selectedValue={numLetters}
                setValue={setNumLetters}
            />
            <ActionButton
                disabled={letters.length !== numLetters}
                label="Solve"
                onClick={onSolve}
                className="w-48"
            />
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
                <div key={index} className="bg-letter-tile rounded-md w-16 h-16 flex items-center justify-center text-xl font-bold text-letter-tile-text">
                    {letter}
                </div>
            ))}
        </div>
    );
}

const AnagramsTitleSection: React.FC = () => {
    return (
        <TitleWithInfo
            title="Anagrams!"
            infoTitle="How to Play Anagrams"
            objective="Find English words that can be made from the letters."
            rules={[
                "Words must be 3 letters or longer",
                "Longer words are worth more points."
            ]}
            instructionsTitle="How to Use the Tool"
            toolInstructions={[
                "Enter letters into the input box.",
                (<div>Click <b>Solve</b> to find all valid English words that can be made.</div>),
                "Words are grouped by length and shown in pages."
            ]}
        />
    );
}


export default Anagrams;