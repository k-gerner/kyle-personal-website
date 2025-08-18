import React, { useEffect } from "react";
import { LoadingSpinner } from "../atoms/LoadingSpinner";
import { GoInfo } from "react-icons/go";

const pageButtonStyle = [
    // General styles
    "rounded-full", "border", "border-slate-300", "py-2", "px-4", "text-center", "text-sm",
    "transition-all", "shadow-sm", "text-slate-600",

    // Hover styles
    "hover:shadow-lg", "hover:text-text-contrast", "hover:bg-primary-base", "hover:border-primary-base",

    // Focus styles
    "focus-visible:text-text-contrast", "focus-visible:bg-primary-highlight", "focus-visible:border-primary-base",

    // Active styles
    "active:border-primary-highlight", "active:text-text-contrast", "active:bg-primary-highlight",

    // Disabled styles
    "disabled:pointer-events-none", "disabled:opacity-50", "disabled:shadow-none",
].join(" ");

export interface PaginatedSolutionsSectionProps {
    solutions: string[][];
    pageNumber: number;
    setPageNumber: (page: number) => void;
    isLoading?: boolean;
    includeNumbers?: boolean;
    useContinuousNumbers?: boolean;
}

export const PaginatedSolutionsSection: React.FC<PaginatedSolutionsSectionProps> = ({
    solutions,
    pageNumber,
    setPageNumber,
    isLoading = false,
    includeNumbers = false,
    useContinuousNumbers = false
}) => {

    const getAbsolutePositionInSolutions = (page: number, index: number) => {
        let absolutePosition = 0;
        for (let i = 0; i < page; i++) {
            absolutePosition += solutions[i].length;
        }
        return absolutePosition + index + 1;
    }

    return (
        <div className="min-w-max flex flex-col w-full border-2 border:black rounded items-center">
            <h2 className="rounded text-lg font-bold text-center p-2 bg-primary-highlight text-text-contrast w-full">
                {isLoading
                    ? "Checking..."
                    : `Potential Solutions (${solutions.reduce((total, subArray) => total + subArray.length, 0)})`}
            </h2>
            {isLoading
                ? (
                    <div className="p-10">
                        <LoadingSpinner />
                    </div>
                ) : (solutions.length > 0
                    ? <>
                        <div className="w-full gap-4 flex flex-col px-2 py-4 justify-start items-center">
                            {solutions[pageNumber].map((word, index) => (
                                <div className="flex items-center" key={`${pageNumber}-${index}`}>
                                    {includeNumbers && (
                                        <div className="font-bold rounded-s-lg bg-primary-base text-text-contrast text-center py-4 pl-6 pr-2">
                                            {useContinuousNumbers
                                                ? getAbsolutePositionInSolutions(pageNumber, index)
                                                : index + 1}
                                        </div>
                                    )}
                                    <div className={`font-bold bg-primary-base p-4 text-text-contrast min-w-max text-center tracking-widest ${includeNumbers ? "rounded-e-lg" : "rounded-lg"}`}>
                                        {word.toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <PageButtons
                            pageNumber={pageNumber}
                            setPageNumber={setPageNumber}
                            totalPages={solutions.length}
                        />
                    </>
                    : <NoSolutions />
                )
            }
        </div>
    );
}


export interface PageButtonsProps {
    pageNumber: number;
    setPageNumber: (page: number) => void;
    totalPages: number;
}

export const PageButtons: React.FC<PageButtonsProps> = ({
    pageNumber,
    setPageNumber,
    totalPages
}) => {
    const previousActive = pageNumber > 0;
    const nextActive = pageNumber < totalPages - 1;
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight" && nextActive) {
                setPageNumber(pageNumber + 1);
            } else if (event.key === "ArrowLeft" && previousActive) {
                setPageNumber(pageNumber - 1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [pageNumber, setPageNumber, totalPages]);

    return (
        <div className="w-full flex flex-row py-2 px-6 gap-6">
            <button
                disabled={!previousActive}
                onClick={() => setPageNumber(pageNumber - 1)}
                className={`${pageButtonStyle} w-full`}
            >{"< Previous"}</button>
            <button
                disabled={!nextActive}
                onClick={() => setPageNumber(pageNumber + 1)}
                className={`${pageButtonStyle} w-full`}
            >{"Next >"}</button>
        </div>
    );
}


export const NoSolutions = () => {
    return (
        <div className="flex gap-2 items-center justify-center w-full h-40 bg-gray-100 rounded-lg shadow-md">
            <GoInfo />
            <span className="text-xl text-gray-600 font-semibold">
                No solutions found!
            </span>
        </div>
    );
}