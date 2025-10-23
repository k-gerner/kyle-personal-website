import React, { useState, useRef, useEffect } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { Link } from "react-router-dom";
import { pageRoutes } from "../../utils/urls";

const defaultLinkButtonClasses = [
    "px-4",
    "py-2",
    "text-primary-highlight",
    "hover:bg-primary-base",
    "hover:text-text-light",
    "rounded",
    "transition-colors",
    "first:pt-3",
    "first:rounded-t-3xl",
    "last:rounded-b-3xl",
    "last:pb-3"
].join(" ");

const GameNavigation: React.FC = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

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

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-primary-highlight rounded-full py-2 px-4 hover:bg-primary-base hover:text-text-light hover:bg-primary-base hover:border-primary-base transition-all duration-300"
            >
                <div className="flex flex-row gap-2 items-center">
                    <span>AI Solvers</span>
                    {dropdownOpen ? <MdExpandLess /> : <MdExpandMore />}
                </div>
            </button>
            {dropdownOpen && (
                <div className="absolute left-0 mt-2 bg-background-base border border-brd-muted rounded-3xl shadow-lg min-w-[12rem] z-40 flex flex-col animate-dropdown" onClick={() => setDropdownOpen(false)} ref={dropdownRef}>
                    <Link to={pageRoutes.GameHome} className={defaultLinkButtonClasses}>Game Home</Link>
                    <div className="px-4 py-2 border-b border-brd-muted font-semibold text-sm text-text-muted mt-2">Game Pigeon</div>
                    <Link to={pageRoutes.Anagrams} className={defaultLinkButtonClasses}>Anagrams</Link>
                    <Link to={pageRoutes.Connect4} className={defaultLinkButtonClasses}>Connect 4</Link>
                    <Link to={pageRoutes.Gomoku} className={defaultLinkButtonClasses}>Gomoku</Link>
                    <Link to={pageRoutes.Mancala} className={defaultLinkButtonClasses}>Mancala</Link>
                    <Link to={pageRoutes.Othello} className={defaultLinkButtonClasses}>Othello</Link>
                    <Link to={pageRoutes.SeaBattle} className={defaultLinkButtonClasses}>Sea Battle</Link>
                    <Link to={pageRoutes.WordBites} className={defaultLinkButtonClasses}>Word Bites</Link>
                    <Link to={pageRoutes.WordHunt} className={defaultLinkButtonClasses}>Word Hunt</Link>
                    <span className="px-4 py-2 border-b border-brd-muted font-semibold text-sm text-text-muted mt-2">NYT Mini Games</span>
                    <Link to={pageRoutes.LetterBoxed} className={defaultLinkButtonClasses}>Letter Boxed</Link>
                    <Link to={pageRoutes.SpellingBee} className={defaultLinkButtonClasses}>Spelling Bee</Link>
                </div>
            )}
        </div>
    );
}

export default GameNavigation;