import { MdOutlineCancel } from "react-icons/md";
import React from "react";

export interface InfoOverlayProps {
    setShowInfo: (show: boolean) => void;
    title: string;
    body: React.ReactNode;
}

export const InfoOverlay: React.FC<InfoOverlayProps> = ({
    setShowInfo,
    title,
    body
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-background-base rounded-lg shadow-lg p-8 max-w-md w-full relative">
                <button
                    className="absolute top-2 right-2 text-xl font-bold text-danger hover:opacity-70 transition"
                    onClick={() => setShowInfo(false)}
                    aria-label="Close info"
                >
                    <MdOutlineCancel className='w-8 h-8' />
                </button>
                <h2 className="text-xl text-text-base font-bold mb-2">{title}</h2>
                {body}
            </div>
        </div>
    );
}