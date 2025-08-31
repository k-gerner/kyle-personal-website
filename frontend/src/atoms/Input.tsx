import React from "react";
import { twMerge } from 'tailwind-merge';

const defaultStyle = [
    "bg-transparent",
    "placeholder:text-text-muted",
    "text-text-base",
    "text-sm",
    "border-2",
    "border-slate-200",
    // "border-primary-accent",
    "rounded-md",
    "px-3",
    "py-2",
    "transition",
    "duration-300",
    "ease",
    "focus:outline-none",
    "focus:border-primary-base",
    "hover:border-primary-accent",
    "shadow-sm",
    "focus:shadow",
].join(" ");

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string; // Allows additional class overrides
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", ...props }, ref) => {
        const combinedClasses = twMerge(defaultStyle, className);
        return (
            <input
                ref={ref} // Forward the ref to the <input> element
                className={combinedClasses}
                {...props}
            />
        );
    }
);

export default Input;