import React, { useState, useRef, useEffect } from "react";
import { MdExpandLess, MdExpandMore, MdOutlineDarkMode } from "react-icons/md";
import { PiSunHorizon } from "react-icons/pi";
import { twMerge } from 'tailwind-merge';



const defaultButtonStyle = [
    "rounded-lg",
    "py-2",
    "px-4",
    "inline-flex",
    "items-center",
    "gap-x-2",
    "border",
    "border-brd-muted",
    "hover:bg-primary-base",
    "text-center",
    "text-sm",
    "bg-background-base",
    "text-primary-highlight",
    "transition-all",
    "shadow-sm",
    "hover:shadow-lg",
    "text-text-muted",
    "hover:text-text-light",
    "hover:bg-primary-base",
    "hover:border-primary-base",
    "focus:text-text-light",
    "focus:bg-primary-highlight",
    "focus:border-primary-base",
    "active:border-primary-highlight",
    "active:text-text-light",
    "active:bg-primary-highlight"
].join(" ");

export const ThemePicker = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [alignLeft, setAlignLeft] = useState(true); // State to track alignment
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "theme-light";
    });
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.className = newTheme;
        setDropdownOpen(false);
    };

    useEffect(() => {
        // Apply the theme from state to the <html> element on component mount
        document.documentElement.className = theme;
    }, [theme]);

    useEffect(() => {
        if (dropdownOpen && dropdownRef.current) {
            const dropdownRect = dropdownRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Check if the dropdown overflows the viewport
            if (dropdownRect.right > viewportWidth) {
                setAlignLeft(true); // Align left if it overflows
            } else {
                setAlignLeft(false); // Align right otherwise
            }
        }
    }, [dropdownOpen]);

    const toggleDropdown = () => {
        setDropdownOpen((prev) => {
            if (!prev) {
                // Reset alignLeft when opening the dropdown
                setAlignLeft(false);
            }
            return !prev;
        });
    };

    return (
        <div className="relative inline-block">
            {/* Parent Button */}
            <button
                onClick={toggleDropdown}
                className={`${defaultButtonStyle}`}
            >
                <div className="flex flex-row gap-2 items-center">
                    <span>Theme</span>
                    {dropdownOpen ? <MdExpandLess /> : <MdExpandMore />}
                </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
                <div
                    ref={dropdownRef}
                    className={`absolute mt-2 bg-background-base border border-brd-muted rounded shadow-lg min-w-max animate-dropdown ${alignLeft ? "right-0" : "left-0"
                        }`}
                >
                    <SelectableOption
                        text="Ocean Sun"
                        icon={<PiSunHorizon />}
                        onClick={() => handleThemeChange("theme-light")}
                    />
                    <SelectableOption
                        text="Ocean Moon"
                        icon={<MdOutlineDarkMode />}
                        onClick={() => handleThemeChange("theme-dark")}
                    />
                    <SelectableOption
                        text="Test"
                        onClick={() => handleThemeChange("theme-test")}
                    />
                </div>
            )}
        </div>
    );
};

interface SelectableOptionProps {
    text: string;
    icon?: React.ReactNode;
    onClick: () => void;
}

const SelectableOption: React.FC<SelectableOptionProps> = ({
    text,
    icon,
    onClick
}) => {
    const contents = icon
        ? (<div className="flex flex-row items-center gap-2">
            {icon}
            <span>{text}</span>
        </div>)
        : text;
    const buttonClasses = twMerge(
        defaultButtonStyle,
        "block w-full text-left rounded border-none"
    );
    return (
        <button
            className={buttonClasses}
            onClick={onClick}
        >
            {contents}
        </button>
    );
}