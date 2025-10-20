import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import About from "./pages/About";
import SpellingBee from "./pages/ai/nyt/SpellingBee";
import LetterBoxed from "./pages/ai/nyt/LetterBoxed";
import Anagrams from "./pages/ai/gamepigeon/Anagrams";
import WordHunt from "./pages/ai/gamepigeon/WordHunt";
import WordBites from "./pages/ai/gamepigeon/WordBites";
import Connect4 from "./pages/ai/gamepigeon/Connect4";
import Gomoku from "./pages/ai/gamepigeon/Gomoku";
import Othello from "./pages/ai/gamepigeon/Othello";
import SeaBattle from "./pages/ai/gamepigeon/SeaBattle";
import Mancala from "./pages/ai/gamepigeon/Mancala";
import { ThemePicker } from "./components/ThemePicker";
import GameNavigation from "./components/ai/GameNavigation";
import './index.css';

function App() {
  return (
    <Router>
      <div className="px-6 bg-background-base min-h-screen">
        <nav className="flex bg-background-base border-b border-brd-muted justify-between items-center fixed w-full px-8 z-20">
          {/* Left side: Links */}
          <div className="space-x-4 flex flex-row items-center">
            <Link to="/about" className="text-primary-highlight hover:underline">About</Link>
            <GameNavigation />
          </div>

          {/* Right side: Theme Picker */}
          <ThemePicker />
        </nav>

        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Navigate to="/about" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/spelling_bee" element={<SpellingBee />} />
            <Route path="/letter_boxed" element={<LetterBoxed />} />
            <Route path="/anagrams" element={<Anagrams />} />
            <Route path="/word_hunt" element={<WordHunt />} />
            <Route path="/word_bites" element={<WordBites />} />
            <Route path="/connect4" element={<Connect4 />} />
            <Route path="/gomoku" element={<Gomoku />} />
            <Route path="/othello" element={<Othello />} />
            <Route path="/sea_battle" element={<SeaBattle />} />
            <Route path="/mancala" element={<Mancala />} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;