import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

const defaultStyle = [
    "rounded-full",
    "border",
    "border-brd-muted",
    "py-2",
    "px-4",
    "text-center",
    "text-sm",
    "transition-all",
    "shadow-sm",
    "font-semibold",
    "text-text-contrast",
    "bg-primary-base",
    // hover state styles
    "hover:shadow-lg",
    "hover:text-text-contrast",
    "hover:bg-primary-highlight",
    "hover:border-primary-base",
    // focus state styles
    "focus-visible:text-text-contrast",
    "focus-visible:bg-primary-highlight",
    "focus-visible:border-primary-base",
    // active state styles
    "active:border-primary-highlight",
    "active:text-text-contrast",
    "active:bg-primary-highlight",
    // disabled state styles
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    "disabled:shadow-none",
    "disabled:bg-background-muted",
    "disabled:border-brd-muted",
    "disabled:text-text-muted",
].join(" ");

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string | React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    debounceMs?: number;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    label,
    onClick,
    disabled = false,
    className = "",
    debounceMs,
    ...props
}: ActionButtonProps) => {
    const [lastClicked, setLastClicked] = useState<number>(0);

    const onClickDebounced = () => {
        const now = Date.now();
        if (now - lastClicked < (debounceMs || 1000)) {
            return;
        }
        setLastClicked(now);
        onClick();
    };
    const combinedClasses = twMerge(defaultStyle, className);
    return (
        <button
            onClick={debounceMs ? onClickDebounced : onClick}
            disabled={disabled}
            className={combinedClasses}
            {...props}
        >
            {label}
        </button>
    );
}