import React, { useState, useRef, useEffect } from "react";
import { MdExpandLess, MdExpandMore, MdOutlineDarkMode } from "react-icons/md";
import { PiSunHorizon } from "react-icons/pi";
import { GiGoblinHead, GiPumpkinLantern } from "react-icons/gi";
import { LuFlower2 } from "react-icons/lu";
import { VscFlame } from "react-icons/vsc";
import { GoDotFill } from "react-icons/go";
import { twMerge } from 'tailwind-merge';



const defaultButtonStyle = [
    "rounded-full",
    "py-2",
    "px-4",
    "inline-flex",
    "items-center",
    "gap-x-2",
    "text-center",
    "transition-all",
    "duration-300",
    "hover:bg-primary-base",
    "hover:text-text-light",
    "hover:bg-primary-base",
    "hover:border-primary-base",
].join(" ");

export const ThemePicker = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [alignLeft, setAlignLeft] = useState(true); // State to track alignment
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "theme-light-ocean-sun";
    });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

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

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!dropdownOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
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
        <div className="relative inline-block py-2">
            {/* Parent Button */}
            <button
                ref={buttonRef}
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
                    className={`absolute mt-2 bg-background-base border border-brd-muted rounded-3xl shadow-lg min-w-max animate-dropdown z-50 ${alignLeft ? "right-0" : "left-0"}`}
                >
                    <div className="px-4 py-2 border-b border-brd-muted font-semibold text-sm text-text-muted">Light Themes</div>
                    <SelectableOption
                        text="Ocean Sun"
                        icon={<PiSunHorizon />}
                        onClick={() => handleThemeChange("theme-light-ocean-sun")}
                        selected={theme === "theme-light-ocean-sun"}
                    />
                    <SelectableOption
                        text="Lavender Rose"
                        icon={<LuFlower2 />}
                        onClick={() => handleThemeChange("theme-light-lavender-rose")}
                        selected={theme === "theme-light-lavender-rose"}
                    />
                    <div className="px-4 py-2 border-b border-brd-muted font-semibold text-sm text-text-muted mt-2">Dark Themes</div>
                    <SelectableOption
                        text="Ocean Moon"
                        icon={<MdOutlineDarkMode />}
                        onClick={() => handleThemeChange("theme-dark-ocean-moon")}
                        selected={theme === "theme-dark-ocean-moon"}
                    />
                    <SelectableOption
                        text="Halloween"
                        icon={<GiPumpkinLantern />}
                        onClick={() => handleThemeChange("theme-dark-halloween")}
                        selected={theme === "theme-dark-halloween"}
                    />
                    <SelectableOption
                        text="Green Goblin"
                        icon={<GiGoblinHead />}
                        onClick={() => handleThemeChange("theme-dark-green-goblin")}
                        selected={theme === "theme-dark-green-goblin"}
                    />
                    <SelectableOption
                        text="Midnight Ember"
                        icon={<VscFlame />}
                        onClick={() => handleThemeChange("theme-dark-midnight-ember")}
                        selected={theme === "theme-dark-midnight-ember"}
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
    selected?: boolean;
}

const SelectableOption: React.FC<SelectableOptionProps> = ({
    text,
    icon,
    onClick,
    selected = false
}) => {
    const contents = icon
        ? (<div className="flex flex-row items-center gap-2">
            {icon}
            <span>{text}</span>
            {selected && <GoDotFill className="w-3 h-3" />}
        </div>)
        : text;
    const buttonClasses = twMerge(
        defaultButtonStyle,
        "block w-full text-left rounded border-none",
        "first:rounded-t-3xl last:rounded-b-3xl last:pb-3"
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