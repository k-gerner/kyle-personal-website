import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import About from "./pages/About";
import SpellingBee from "./pages/ai/nyt/SpellingBee";
import LetterBoxed from "./pages/ai/nyt/LetterBoxed";
import Anagrams from "./pages/ai/gamepigeon/Anagrams";
import './index.css';

function App() {
  return (
    <Router>
      <div className="p-6 bg-white">
        <nav className="mb-4 space-x-4">
          <Link to="/about" className="text-dark-teal hover:underline">About</Link>
          <Link to="/spelling_bee" className="text-dark-teal hover:underline">Spelling Bee</Link>
          <Link to="/letter_boxed" className="text-dark-teal hover:underline">Letter Boxed</Link>
          <Link to="/anagrams" className="text-dark-teal hover:underline">Anagrams</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/about" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/spelling_bee" element={<SpellingBee />} />
          <Route path="/letter_boxed" element={<LetterBoxed />} />
          <Route path="/anagrams" element={<Anagrams />} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;