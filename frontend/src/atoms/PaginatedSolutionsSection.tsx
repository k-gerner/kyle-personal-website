import { LoadingSpinner } from "./LoadingSpinner";
import { GoInfo } from "react-icons/go";

const pageButtonStyle = "rounded-full border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-teal hover:border-teal focus-visible:text-white focus-visible:bg-dark-teal focus-visible:border-teal active:border-dark-teal active:text-white active:bg-dark-teal disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";


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
            <h2 className="rounded text-lg font-bold text-center p-2 bg-dark-teal text-white w-full">
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
                                        <div className="font-bold rounded-s-lg bg-teal text-white text-center py-4 pl-6 pr-2">
                                            {useContinuousNumbers
                                                ? getAbsolutePositionInSolutions(pageNumber, index)
                                                : index + 1}
                                        </div>
                                    )}
                                    <div className={`font-bold bg-teal p-4 text-white min-w-max text-center tracking-widest ${includeNumbers ? "rounded-e-lg" : "rounded-lg"}`}>
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


interface PageButtonsProps {
    pageNumber: number;
    setPageNumber: (page: number) => void;
    totalPages: number;
}

const PageButtons: React.FC<PageButtonsProps> = ({
    pageNumber,
    setPageNumber,
    totalPages
}) => {
    return (
        <div className="w-full flex flex-row py-2 px-6 gap-6">
            <button
                disabled={pageNumber === 0}
                onClick={() => setPageNumber(pageNumber - 1)}
                className={`${pageButtonStyle} w-full`}
            >{"< Previous"}</button>
            <button
                disabled={pageNumber === totalPages - 1}
                onClick={() => setPageNumber(pageNumber + 1)}
                className={`${pageButtonStyle} w-full`}
            >{"Next >"}</button>
        </div>
    );
}


const NoSolutions = () => {
    return (
        <div className="flex gap-2 items-center justify-center w-full h-40 bg-gray-100 rounded-lg shadow-md">
            <GoInfo />
            <span className="text-xl text-gray-600 font-semibold">
                No solutions found!
            </span>
        </div>
    );
}