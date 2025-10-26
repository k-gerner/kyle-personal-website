import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
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

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col px-6 bg-background-base min-h-screen">
        <nav className="fixed flex space-x-2 top-2 left-1/2 -translate-x-1/2 z-20 flex justify-between items-center rounded-full backdrop-blur-xl bg-background-base/80 shadow-lg px-4 py-2 w-auto transition-all text-primary-highlight font-semibold">
          <HomeLink />
          <GameNavigation />
          <ThemePicker />
        </nav>

        <main className="pt-24 flex-1 flex flex-col">
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

const HomeLink: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (location.pathname === pageRoutes.AboutMe) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(pageRoutes.AboutMe);
    }
  };

  return (
    <a
      href={pageRoutes.AboutMe}
      onClick={handleClick}
      className="text-primary-highlight hover:bg-background-muted rounded-full py-2 px-4 transition-all duration-300 hover:bg-primary-base hover:text-text-light hover:border-primary-base"
    >
      Home
    </a>
  );
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