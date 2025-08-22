import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import About from "./pages/About";
import SpellingBee from "./pages/ai/nyt/SpellingBee";
import LetterBoxed from "./pages/ai/nyt/LetterBoxed";
import Anagrams from "./pages/ai/gamepigeon/Anagrams";
import WordHunt from "./pages/ai/gamepigeon/WordHunt";
import WordBites from "./pages/ai/gamepigeon/WordBites";
import { ThemePicker } from "./components/ThemePicker"; // Import your ThemePicker component
import './index.css';

function App() {
  return (
    <Router>
      <div className="p-6 bg-background-base min-h-screen">
        <nav className="mb-4 flex justify-between items-center">
          {/* Left side: Links */}
          <div className="space-x-4">
            <Link to="/about" className="text-primary-highlight hover:underline">About</Link>
            <Link to="/spelling_bee" className="text-primary-highlight hover:underline">Spelling Bee</Link>
            <Link to="/letter_boxed" className="text-primary-highlight hover:underline">Letter Boxed</Link>
            <Link to="/anagrams" className="text-primary-highlight hover:underline">Anagrams</Link>
            <Link to="/word_hunt" className="text-primary-highlight hover:underline">Word Hunt</Link>
            <Link to="/word_bites" className="text-primary-highlight hover:underline">Word Bites</Link>
          </div>

          {/* Right side: Theme Picker */}
          <ThemePicker />
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/about" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/spelling_bee" element={<SpellingBee />} />
          <Route path="/letter_boxed" element={<LetterBoxed />} />
          <Route path="/anagrams" element={<Anagrams />} />
          <Route path="/word_hunt" element={<WordHunt />} />
          <Route path="/word_bites" element={<WordBites />} />
          {/* Catch-all route for 404 */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;