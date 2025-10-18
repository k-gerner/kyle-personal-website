import React, { useState, useRef, useEffect } from "react";
import { MdExpandLess, MdExpandMore, MdOutlineDarkMode } from "react-icons/md";
import { PiSunHorizon } from "react-icons/pi";
import { GiGoblinHead, GiPumpkinLantern } from "react-icons/gi";
import { LuFlower2 } from "react-icons/lu";
import { VscFlame } from "react-icons/vsc";
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
    "bg-background-base",
    "text-center",
    "text-sm",
    "bg-background-base",
    "text-primary-highlight",
    "transition-all",
    "shadow-sm",
    "hover:bg-primary-base",
    "hover:shadow-lg",
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
                    className={`absolute mt-2 bg-background-base border border-brd-muted rounded shadow-lg min-w-max animate-dropdown z-50 ${alignLeft ? "right-0" : "left-0"}`}
                >
                    <div className="px-4 py-2 border-b border-brd-muted font-semibold text-sm text-text-muted">Light Themes</div>
                    <SelectableOption
                        text="Ocean Sun"
                        icon={<PiSunHorizon />}
                        onClick={() => handleThemeChange("theme-light-ocean-sun")}
                    />
                    <SelectableOption
                        text="Lavender Rose"
                        icon={<LuFlower2 />}
                        onClick={() => handleThemeChange("theme-light-lavender-rose")}
                    />
                    <div className="px-4 py-2 border-b border-brd-muted font-semibold text-sm text-text-muted mt-2">Dark Themes</div>
                    <SelectableOption
                        text="Ocean Moon"
                        icon={<MdOutlineDarkMode />}
                        onClick={() => handleThemeChange("theme-dark-ocean-moon")}
                    />
                    <SelectableOption
                        text="Halloween"
                        icon={<GiPumpkinLantern />}
                        onClick={() => handleThemeChange("theme-dark-halloween")}
                    />
                    <SelectableOption
                        text="Green Goblin"
                        icon={<GiGoblinHead />}
                        onClick={() => handleThemeChange("theme-dark-green-goblin")}
                    />
                    <SelectableOption
                        text="Midnight Ember"
                        icon={<VscFlame />}
                        onClick={() => handleThemeChange("theme-dark-midnight-ember")}
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