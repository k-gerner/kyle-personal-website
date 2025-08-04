import React from "react";

const buttonClassName = [
    "bg-transparent",
    "placeholder:text-text-muted",
    "text-text-base",
    "text-sm",
    "border-2",
    "border-slate-200",
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
        return (
            <input
                ref={ref} // Forward the ref to the <input> element
                className={`${buttonClassName} ${className}`} // TODO: use tailwind merge
                {...props}
            />
        );
    }
);

export default Input;