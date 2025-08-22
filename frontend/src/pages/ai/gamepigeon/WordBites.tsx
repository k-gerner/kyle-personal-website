import React, { useState, useRef, useEffect } from 'react';
import Input from '../../../atoms/Input';
import { PageButtons, NoSolutions } from '../../../components/PaginatedSolutionsSection';
import { MdOutlineCancel } from "react-icons/md";
import { LoadingSpinner } from "../../../atoms/LoadingSpinner";


const INPUT_DELAY_MS = 500; // Delay in milliseconds for input reset
type PieceType = "single" | "horizontal" | "vertical";
type Pieces = {
    single: string[];
    horizontal: string[];
    vertical: string[];
}

type SolutionPiece = {
    letters: string;
    indicesInUse: number[];
}
type Solution = {
    word: string;
    isHorizontal: boolean;
    pieces: SolutionPiece[];
}

type LetterTileBufferProps = {
    bufferFront: boolean;
    bufferBack: boolean;
    solutionIsHorizontal: boolean
}

const buttonStyle = "rounded-full border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-text-contrast hover:bg-primary-base hover:border-primary-base focus-visible:text-text-contrast focus-visible:bg-primary-highlight focus-visible:border-primary-base active:border-primary-highlight active:text-text-contrast active:bg-primary-highlight disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"


const WordBites = () => {
    const [hasSolved, setHasSolved] = useState(false); // if solve has run at least once
    const [showSolutions, setShowSolutions] = useState(false);
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
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [pageNumber, setPageNumber] = useState(0);

    const handleSolve = async () => {
        setHasSolved(true);
        const res = await fetch('http://localhost:5001/api/game_pigeon/word_bites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                singlePieces: inputPieces.single,
                horizontalPieces: inputPieces.horizontal,
                verticalPieces: inputPieces.vertical,
                minLength: 3,
                maxLengthHorizontal: 8,
                maxLengthVertical: 9
            })
        });

        const data = await res.json();
        setPageNumber(0);
        setShowSolutions(true);
        setSolutions(convertBackendResponseToSolutions(data));
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
                hasSolved={hasSolved}
                showSolutions={showSolutions}
                setShowSolutions={setShowSolutions}
            />
            <div className="relative">
                <div
                    className={`transition-opacity duration-500 ${showSolutions ? 'opacity-0 pointer-events-none' : 'opacity-100'
                        }`}
                >
                    <LetterTilesSection
                        pieces={inputPieces}
                        deleteInputPiece={deleteInputPiece}
                    />
                </div>
                <div
                    className={`absolute top-0 left-0 w-full transition-opacity duration-500 ${showSolutions ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    <SolutionsSection
                        solutions={solutions}
                        isLoading={false}
                        pageNumber={pageNumber}
                        setPageNumber={setPageNumber}
                    />
                </div>
            </div>
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
    hasSolved: boolean;
    showSolutions: boolean;
    setShowSolutions: (show: boolean) => void;
}

const InputSection: React.FC<InputSectionProps> = ({
    currentInputLetters,
    onLettersChange,
    onSolve,
    hasSolved,
    showSolutions,
    setShowSolutions
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
            {
                hasSolved &&
                <div className="flex justify-center">
                    <label className=" gap-2 inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only" />
                        <div
                            onClick={() => setShowSolutions(!showSolutions)}
                            className={`relative w-11 h-6 rounded-full transition-all ${showSolutions ? 'bg-primary-highlight' : 'bg-primary-accent'}`}
                        >
                            <div
                                className={`absolute top-0.5 start-0.5 h-5 w-5 rounded-full border transition-all bg-background-base border-background-base ${showSolutions
                                    ? 'translate-x-full'
                                    : 'translate-x-0'
                                    }`}
                            ></div>
                        </div>
                        <span className="text-sm text-text-primary">Show Solutions</span>
                    </label>
                </div>
            }
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
    bufferProps?: LetterTileBufferProps;
}

const LetterTile: React.FC<LetterTileProps> = ({
    value,
    type,
    canDelete = false,
    onDelete,
    tileIndex,
    bufferProps
}) => {
    const baseClasses = "flex items-center justify-center text-xl font-bold text-text-base";
    const sizeClasses = 'w-16 h-16' //size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
    // const deleteButtonClasses = 'bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors';
    const deleteButtonClasses = 'bg-background-base text-danger flex items-center justify-center hover:bg-danger hover:text-background-base transition-colors border-danger border-2 rounded-b-md';
    const deleteIconClasses = 'w-8 h-8';
    // const deleteIconClasses = 'w-4 h-4'; // Adjust size of the delete icon
    const bgColor = 'bg-secondary-base' // inSolution || beforeSolve ? 'bg-secondary-base' : 'bg-secondary-base opacity-50';


    let parentDivWidthClass = (bufferProps && !bufferProps.solutionIsHorizontal) ? 'w-48' : 'w-16';
    let groupingClasses = '';
    let letterPairFlexClasses = '';
    let tileComponent = null;
    if (type === "single") {
        groupingClasses = canDelete ? 'first:rounded-t-md first:ms-0 last:rounded-b-md' : "rounded-md";
        tileComponent = (
            <div key={`${value}-${tileIndex}`} className={`${baseClasses} ${sizeClasses} ${bgColor} ${groupingClasses}`}>
                <span>{value}</span>
            </div>
        );
    } else {
        if (type === "horizontal") {
            parentDivWidthClass = (bufferProps && !bufferProps.solutionIsHorizontal) ? 'w-48' : 'w-32';
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

    // Invisible buffer tile to enable offsetting the visible tile in the solutions view
    const bufferTile = (
        <div className={`${baseClasses} ${sizeClasses}`}>
        </div>
    )

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
            <div className={`flex ${bufferProps?.solutionIsHorizontal ? "flex-col" : "flex-row"}`}>
                {bufferProps?.bufferFront && bufferTile}
                {tileComponent}
                {bufferProps?.bufferBack && bufferTile}
            </div>
            {deleteButton}
        </div>
    );
};


interface SolutionsSectionProps {
    solutions: Solution[];
    isLoading: boolean;
    pageNumber: number;
    setPageNumber: (page: number) => void;
}

const SolutionsSection: React.FC<SolutionsSectionProps> = ({
    solutions,
    isLoading,
    pageNumber,
    setPageNumber
}) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const [scaleFactor, setScaleFactor] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const container = containerRef.current;
                const parent = container.parentElement;

                if (parent) {
                    const parentWidth = parent.clientWidth;
                    const parentHeight = parent.clientHeight;
                    const containerWidth = container.scrollWidth;
                    const containerHeight = container.scrollHeight;

                    // Calculate scale factor to fit within parent bounds
                    const widthScale = (parentWidth / containerWidth) * 0.9;
                    const heightScale = parentHeight / containerHeight;
                    const newScaleFactor = Math.min(1, widthScale, heightScale);
                    setScaleFactor(newScaleFactor);
                }
            }
        };

        handleResize(); // Initial calculation
        window.addEventListener("resize", handleResize); // Recalculate on window resize
        return () => window.removeEventListener("resize", handleResize);
    }, [pageNumber]);



    if (isLoading) {
        return (
            <div className="flex justify-center items-center pt-20">
                <LoadingSpinner />
            </div>
        );
    }

    if (solutions.length === 0) {
        return <NoSolutions />;
    }


    return (
        <div className="flex flex-col gap-4 rounded-lg items-center">
            <h2 className="text-center text-lg font-semibold text-primary-highlight">{`Solutions (${solutions.length})`}</h2>
            <div className="flex flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
                <PageButtons
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    totalPages={solutions.length} // Since we are showing only one solution at a time
                />
            </div>
            <div className={`font-bold bg-primary-base p-4 text-text-contrast min-w-max text-center tracking-widest rounded-lg`}>
                {solutions[pageNumber].word.toUpperCase()}
            </div>
            <div className="gap-4 flex justify-center items-center overflow-hidden w-screen">
                <div
                    ref={containerRef}
                    className="relative"
                    style={{
                        transform: `scale(${scaleFactor})`,
                        transformOrigin: "center",
                    }}
                >
                    <SolutionTiles solution={solutions[pageNumber]} />
                </div>
            </div>
        </div>
    );
}


const SolutionTiles: React.FC<{ solution: Solution }> = ({ solution }) => {
    const tileComponents: React.ReactElement<LetterTileProps>[] = []
    solution.pieces.forEach((piece, index) => {
        let tileType: PieceType;
        if (piece.letters.length === 1) {
            tileType = "single";
        } else {
            const isSingleIndex = piece.indicesInUse.length === 1;
            tileType = solution.isHorizontal
                ? (isSingleIndex ? "vertical" : "horizontal")
                : (isSingleIndex ? "horizontal" : "vertical");
        }
        let bufferFront;
        let bufferBack;
        const isPrimaryDirection = solution.isHorizontal
            ? tileType === "horizontal" || tileType === "single"
            : tileType === "vertical" || tileType === "single";

        if (isPrimaryDirection) {
            bufferFront = true;
            bufferBack = true;
        } else {
            bufferFront = piece.indicesInUse.includes(0);
            bufferBack = piece.indicesInUse.includes(1);
        }
        const bufferProps: LetterTileBufferProps = {
            bufferFront: bufferFront,
            bufferBack: bufferBack,
            solutionIsHorizontal: solution.isHorizontal
        };
        const tile = <LetterTile
            key={`${solution.word}-${index}`}
            value={piece.letters.toUpperCase()}
            type={tileType}
            canDelete={false}
            tileIndex={index}
            bufferProps={bufferProps}
        />
        tileComponents.push(tile);
    });
    return (
        <div className={`flex ${solution.isHorizontal ? "flex-row" : "flex-col"} gap-2 items-center justify-center`}>
            {tileComponents}
        </div>
    );
}


function convertBackendResponseToSolutions(response: any): Solution[] {
    return response.solutions.map((sol: any) => ({
        word: sol.word,
        isHorizontal: sol.horizontal,
        pieces: sol.pieces.map((piece: any) => ({
            letters: piece.letters,
            indicesInUse: piece.indicesInUse
        }))
    }));
}
//
//
//
//
//
//
// TODO: ConfigDict alais_generator=to_camel?? 
//
//
//
//
//

export default WordBites;