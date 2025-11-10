import React, { useState, useRef, useEffect } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { Link } from "react-router-dom";
import { pageRoutes } from "../../utils/urls";

const defaultLinkButtonClasses = [
    "px-4",
    "py-2",
    "text-primary-highlight",
    "hover:bg-primary-base",
    "hover:text-text-contrast",
    "rounded",
    "transition-colors",
    "first:pt-3",
    "first:rounded-t-3xl",
    "last:rounded-b-3xl",
    "last:pb-3"
].join(" ");

interface GameNavigationProps {
    onNavigate?: () => void;
}

const GameNavigation: React.FC<GameNavigationProps> = ({ onNavigate }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const closeAndNavigate = () => {
        setDropdownOpen(false);
        onNavigate && onNavigate();
    };
    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-primary-highlight rounded-full py-2 px-4 hover:bg-primary-base hover:text-text-contrast hover:bg-primary-base hover:border-primary-base transition-all duration-300"
            >
                <div className="flex flex-row gap-2 items-center">
                    <span>AI Solvers</span>
                    {dropdownOpen ? <MdExpandLess /> : <MdExpandMore />}
                </div>
            </button>
            {dropdownOpen && (
                <div className="
                    absolute left-0 mt-2 bg-background-base border border-brd-muted rounded-3xl shadow-lg min-w-[12rem] z-40 flex flex-col animate-dropdown 
                    max-h-[60vh] overflow-y-auto
                    md:max-h-none md:overflow-visible
                    "
                    ref={dropdownRef}
                >
                    <Link to={pageRoutes.GameHome} className={defaultLinkButtonClasses} onClick={closeAndNavigate}>Game Home</Link>
                    <div className="px-4 py-2 border-b border-brd-muted font-semibold text-sm text-text-muted mt-2">Game Pigeon</div>
                    <Link to={pageRoutes.Anagrams} className={defaultLinkButtonClasses} onClick={closeAndNavigate}>Anagrams</Link>
                    <Link to={pageRoutes.Connect4} className={defaultLinkButtonClasses} onClick={closeAndNavigate}>Connect 4</Link>
                    <Link to={pageRoutes.Gomoku} className={defaultLinkButtonClasses} onClick={closeAndNavigate}>Gomoku</Link>
                    <Link to={pageRoutes.Mancala} className={defaultLinkButtonClasses} onClick={closeAndNavigate}>Mancala</Link>
                    <Link to={pageRoutes.Othello} className={defaultLinkButtonClasses} onClick={closeAndNavigate}>Othello</Link>
                    <Link to={pageRoutes.SeaBattle} className={defaultLinkButtonClasses} onClick={closeAndNavigate}>Sea Battle</Link>
                    <Link to={pageRoutes.WordBites} className={defaultLinkButtonClasses} onClick={closeAndNavigate}>Word Bites</Link>
                    <Link to={pageRoutes.WordHunt} className={defaultLinkButtonClasses} onClick={closeAndNavigate}>Word Hunt</Link>
                    <span className="px-4 py-2 border-b border-brd-muted font-semibold text-sm text-text-muted mt-2">NYT Mini Games</span>
                    <Link to={pageRoutes.LetterBoxed} className={defaultLinkButtonClasses} onClick={closeAndNavigate}>Letter Boxed</Link>
                    <Link to={pageRoutes.SpellingBee} className={defaultLinkButtonClasses} onClick={closeAndNavigate}>Spelling Bee</Link>

                </div>
            )}
        </div>
    );
}

export default GameNavigation;