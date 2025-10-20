import React, { useState, useRef, useEffect } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { Link } from "react-router-dom";

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
                className="text-primary-highlight hover:bg-background-muted rounded-lg p-2"
            >
                <div className="flex flex-row gap-2 items-center">
                    <span>AI Solvers</span>
                    {dropdownOpen ? <MdExpandLess /> : <MdExpandMore />}
                </div>
            </button>
            {dropdownOpen && (
                <div className="absolute left-0 mt-2 bg-background-base border border-brd-muted rounded shadow-lg min-w-[12rem] z-40 flex flex-col py-2" onClick={() => setDropdownOpen(false)} ref={dropdownRef}>
                    <div className="px-4 py-2 border-b border-brd-muted font-semibold text-sm text-text-muted">Game Pigeon</div>
                    <Link to="/anagrams" className="px-4 py-2 text-primary-highlight hover:bg-primary-base hover:text-text-light rounded transition-colors">Anagrams</Link>
                    <Link to="/connect4" className="px-4 py-2 text-primary-highlight hover:bg-primary-base hover:text-text-light rounded transition-colors">Connect 4</Link>
                    <Link to="/gomoku" className="px-4 py-2 text-primary-highlight hover:bg-primary-base hover:text-text-light rounded transition-colors">Gomoku</Link>
                    <Link to="/mancala" className="px-4 py-2 text-primary-highlight hover:bg-primary-base hover:text-text-light rounded transition-colors">Mancala</Link>
                    <Link to="/othello" className="px-4 py-2 text-primary-highlight hover:bg-primary-base hover:text-text-light rounded transition-colors">Othello</Link>
                    <Link to="/sea_battle" className="px-4 py-2 text-primary-highlight hover:bg-primary-base hover:text-text-light rounded transition-colors">Sea Battle</Link>
                    <Link to="/word_bites" className="px-4 py-2 text-primary-highlight hover:bg-primary-base hover:text-text-light rounded transition-colors">Word Bites</Link>
                    <Link to="/word_hunt" className="px-4 py-2 text-primary-highlight hover:bg-primary-base hover:text-text-light rounded transition-colors">Word Hunt</Link>
                    <span className="px-4 py-2 border-b border-brd-muted font-semibold text-sm text-text-muted mt-2">NYT Mini Games</span>
                    <Link to="/letter_boxed" className="px-4 py-2 text-primary-highlight hover:bg-primary-base hover:text-text-light rounded transition-colors">Letter Boxed</Link>
                    <Link to="/spelling_bee" className="px-4 py-2 text-primary-highlight hover:bg-primary-base hover:text-text-light rounded transition-colors">Spelling Bee</Link>
                </div>
            )}
        </div>
    );
}

export default GameNavigation;