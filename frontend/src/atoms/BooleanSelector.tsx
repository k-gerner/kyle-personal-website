import React from "react";

export interface BooleanSelectorProps {
    selected: boolean;
    label: string | React.ReactNode;
    onChange: (value: boolean) => void;
    labelOnBottom?: boolean;
}


export const BooleanSelector: React.FC<BooleanSelectorProps> = ({
    selected,
    label,
    onChange,
    labelOnBottom = false
}) => {
    return (
        <label
            className={`gap-2 inline-flex items-center cursor-pointer ${labelOnBottom ? 'flex-col' : 'flex-row'
                }`}
        >
            <input type="checkbox" value="" className="sr-only" />
            <div
                onClick={() => onChange(!selected)}
                className={`relative w-11 h-6 rounded-full transition-all ${selected ? 'bg-primary-highlight' : 'bg-primary-accent'
                    }`}
            >
                <div
                    className={`absolute top-0.5 start-0.5 h-5 w-5 rounded-full border transition-all bg-background-base border-background-base ${selected ? 'translate-x-full' : 'translate-x-0'
                        }`}
                ></div>
            </div>
            <span className="text-sm text-text-primary">{label}</span>
        </label>
    )
}