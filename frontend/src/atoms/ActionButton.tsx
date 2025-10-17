import React from 'react';
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
    "hover:shadow-lg",
    "text-text-muted",
    // hover state styles
    "hover:text-text-contrast",
    "hover:bg-primary-base",
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
    "disabled:text-text-dull",
].join(" ");

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string | React.ReactNode;
    onClick: () => void;
    className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    label,
    onClick,
    disabled = false,
    className = "",
    ...props
}: ActionButtonProps) => {
    const combinedClasses = twMerge(defaultStyle, className);
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={combinedClasses}
            {...props}
        >
            {label}
        </button>
    );
}