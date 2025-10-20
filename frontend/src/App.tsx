import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import GameHome from "./pages/GameHome";
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
import { IoLogoLinkedin } from "react-icons/io5";
import { FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import './index.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col px-6 bg-background-base min-h-screen">
        <nav className="flex bg-background-base border-b border-brd-muted justify-between items-center fixed w-full px-8 z-20">
          {/* Left side: Links */}
          <div className="space-x-2 flex flex-row items-center">
            <Link to="/home" className="text-primary-highlight hover:bg-background-muted rounded-lg p-2">Home</Link>
            <GameNavigation />
          </div>

          {/* Right side: Theme Picker */}
          <ThemePicker />
        </nav>

        <main className="pt-16 flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<GameHome />} />
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
            <Route path="*" element={<div className="text-center text-text-base">Page not found</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

const Footer = () => {
  return (
    <footer className="mt-8 py-6 border-t border-brd-muted text-center text-text-muted flex flex-col items-center gap-2">
      <div className="flex gap-4 justify-center">
        <a
          href="https://github.com/k-gerner"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary-highlight transition-colors flex items-center gap-1"
        >
          <FaGithub className="w-5 h-5" />
          <span>GitHub</span>
        </a>
        <span className="text-text-muted select-none">|</span>
        <a
          href="https://www.linkedin.com/in/kyle-gerner/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary-highlight transition-colors flex items-center gap-1"
        >
          <IoLogoLinkedin className="w-5 h-5" />
          <span>LinkedIn</span>
        </a>
        <span className="text-text-muted select-none">|</span>
        <a
          href="mailto:kgerner@vt.edu,kgcoltsfan@gmail.com"
          className="hover:text-primary-highlight transition-colors flex items-center gap-1"
        >
          <MdEmail className="w-5 h-5" />
          <span>Email</span>
        </a>
      </div>
      <span className="text-xs">&copy; {new Date().getFullYear()} Kyle Gerner</span>
    </footer>
  )
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default App;