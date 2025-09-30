import { InfoOverlay } from "./InfoOverlay";
import { GoInfo } from "react-icons/go";
import React, { useState } from "react";

export interface TitleWithInfoProps {
    title: string;
    infoTitle: string;
    infoBody: React.ReactNode;
}


export const TitleWithInfo: React.FC<TitleWithInfoProps> = ({
    title,
    infoTitle,
    infoBody
}) => {
    const [showInfo, setShowInfo] = useState(false);
    return (
        <div>
            <div className="flex items-center justify-center mb-4">
                <h1 className="text-3xl font-bold text-primary-highlight">{title}</h1>
                <div className="relative group">
                    <button
                        className="ml-2 p-2 rounded-full hover:bg-slate-200 transition"
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
                    body={infoBody}
                />
            )}
        </div>
    );
}