import { GoInfo } from "react-icons/go";
import { MdOutlineCancel } from "react-icons/md";
import React, { useState } from "react";

export interface TitleWithInfoProps {
    title: string;
    infoTitle: string;
    objective: string | React.ReactNode;
    rules: string[] | React.ReactNode[];
    instructionsTitle?: string | React.ReactNode;
    toolInstructions?: string[] | React.ReactNode[];
}


export const TitleWithInfo: React.FC<TitleWithInfoProps> = ({
    title,
    infoTitle,
    objective,
    rules,
    instructionsTitle,
    toolInstructions,
}) => {
    const [showInfo, setShowInfo] = useState(false);
    return (
        <div>
            <div className="flex items-center justify-center mb-4">
                <h1 className="text-3xl font-bold text-primary-highlight">{title}</h1>
                <div className="relative group">
                    <button
                        className="ml-2 p-2 rounded-full hover:bg-background-muted transition"
                        aria-label="Show info"
                        onClick={() => setShowInfo(true)}
                    >
                        <GoInfo className="text-xl text-primary-highlight hover:text-primary-contrast w-6 h-6" />
                    </button>
                    <div className="absolute top-1/2 left-full ml-2 -translate-y-1/2 px-2 py-1 rounded bg-background-contrast text-text-contrast text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-10">
                        Show info
                    </div>
                </div>
            </div>
            {/* Info Overlay */}
            {showInfo && (
                <InfoOverlay
                    setShowInfo={setShowInfo}
                    title={infoTitle}
                    objective={objective}
                    rules={rules}
                    instructionsTitle={instructionsTitle}
                    toolInstructions={toolInstructions}
                />
            )}
        </div>
    );
}


export interface InfoOverlayProps {
    setShowInfo: (show: boolean) => void;
    title: string;
    objective: string | React.ReactNode;
    rules: string[] | React.ReactNode[];
    instructionsTitle?: string | React.ReactNode;
    toolInstructions?: string[] | React.ReactNode[];
}

export const InfoOverlay: React.FC<InfoOverlayProps> = ({
    setShowInfo,
    title,
    objective,
    rules,
    instructionsTitle,
    toolInstructions,
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-background-base rounded-lg shadow-lg p-8 max-w-xl w-full relative max-h-[90vh] overflow-y-auto">
                <button
                    className="absolute rounded-full top-2 right-2 text-xl font-bold text-danger bg-background-base hover:bg-danger hover:text-background-base transition-colors"
                    onClick={() => setShowInfo(false)}
                    aria-label="Close info"
                >
                    <MdOutlineCancel className='w-8 h-8' />
                </button>
                <h2 className="text-xl text-text-base font-bold mb-2">{title}</h2>
                <ul className="list-disc pl-5 mb-2 text-text-muted">
                    <li><b>Objective:</b> {objective}</li>
                    <li><b>Rules:</b></li>
                    <ul className="list-disc pl-5 mb-2 text-text-muted">
                        {rules.map((rule, index) => (
                            <li key={index}>{rule}</li>
                        ))}
                    </ul>

                </ul>
                {toolInstructions && toolInstructions.length > 0 && (
                    <>
                        <h3 className="text-lg text-text-base font-bold mb-1">{instructionsTitle}</h3>
                        <ul className="list-disc pl-5 mb-2 text-text-muted">
                            {toolInstructions.map((instruction, index) => (
                                <li key={index}>{instruction}</li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}