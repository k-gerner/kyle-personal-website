import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import AboutMe from "./pages/AboutMe";
import GameHome from "./pages/GameHome";
import Footer from "./components/Footer";
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
import { pageRoutes } from "./utils/urls";
import './index.css';

import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    // Prevent background scroll
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col px-6 bg-background-base min-h-screen">
        {/* Nav bar: left-aligned on mobile, centered on desktop */}
        <nav
          className="fixed flex space-x-2 top-2 left-2 md:left-1/2 md:-translate-x-1/2 z-20 flex justify-between items-center rounded-full backdrop-blur-xl bg-background-base/80 shadow-lg px-4 py-2 w-auto md:w-auto transition-all text-primary-highlight font-semibold"
          style={{ maxWidth: 'calc(100vw - 1rem)' }}
        >
          {/* Hamburger for mobile */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded-full hover:bg-background-muted focus:outline-none"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu className="w-7 h-7" />
          </button>
          {/* Nav links for desktop */}
          <div className="hidden md:flex space-x-2 items-center">
            <HomeLink />
            <GameNavigation />
            <ThemePicker />
          </div>
        </nav>

        {/* Mobile popout menu */}
        {menuOpen && (
          <MobilePopOutMenu setMenuOpen={setMenuOpen} />
        )}

        <main className="pt-12 md:pt-24 flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to={pageRoutes.AboutMe} replace />} />
            <Route path={pageRoutes.AboutMe} element={<AboutMe />} />
            <Route path={pageRoutes.GameHome} element={<GameHome />} />
            <Route path={pageRoutes.SpellingBee} element={<SpellingBee />} />
            <Route path={pageRoutes.LetterBoxed} element={<LetterBoxed />} />
            <Route path={pageRoutes.Anagrams} element={<Anagrams />} />
            <Route path={pageRoutes.WordHunt} element={<WordHunt />} />
            <Route path={pageRoutes.WordBites} element={<WordBites />} />
            <Route path={pageRoutes.Connect4} element={<Connect4 />} />
            <Route path={pageRoutes.Gomoku} element={<Gomoku />} />
            <Route path={pageRoutes.Othello} element={<Othello />} />
            <Route path={pageRoutes.SeaBattle} element={<SeaBattle />} />
            <Route path={pageRoutes.Mancala} element={<Mancala />} />
            {/* Catch-all route for 404 routes to About Me page */}
            <Route path="*" element={<Navigate to={pageRoutes.AboutMe} replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

interface HomeLinkProps {
  onClick?: () => void;
}
const HomeLink: React.FC<HomeLinkProps> = ({ onClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (location.pathname === pageRoutes.AboutMe) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(pageRoutes.AboutMe);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <a
      href={pageRoutes.AboutMe}
      onClick={handleClick}
      className="text-primary-highlight hover:bg-background-muted rounded-full py-2 px-4 transition-all duration-300 hover:bg-primary-base hover:text-text-contrast hover:border-primary-base"
    >
      Home
    </a>
  );
};

interface MobilePopOutMenuProps {
  setMenuOpen: (open: boolean) => void;
}

const MobilePopOutMenu: React.FC<MobilePopOutMenuProps> = ({ setMenuOpen }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex md:hidden">
      <div className="bg-background-base w-64 max-w-full h-full shadow-lg flex flex-col p-6 relative animate-slideInFromLeft text-primary-highlight font-semibold">
        <button
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-background-muted focus:outline-none"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        >
          <FiX className="w-7 h-7" />
        </button>
        <div className="flex flex-col gap-4 mt-4 text-xl">
          <HomeLink onClick={() => setMenuOpen(false)} />
          <GameNavigation onNavigate={() => setMenuOpen(false)} />
          <ThemePicker />
        </div>
      </div>
      {/* Click outside to close */}
      <div className="flex-1" onClick={() => setMenuOpen(false)} />
    </div>
  );
};

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default App;