import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Existing App Components (renamed to CertifyStudio)
import CertifyStudio from './CertifyStudio';

// New Quiz Components
import QuizHub from './pages/quiz/QuizHub';
import CreateQuiz from './pages/quiz/CreateQuiz';
import TakeQuiz from './pages/quiz/TakeQuiz';
import Leaderboard from './pages/quiz/Leaderboard';
import History from './pages/quiz/History';

import Guide from './pages/Guide';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Main CertifyPro Routes */}
        <Route path="/" element={<CertifyStudio />} />
        <Route path="/guide" element={<Guide onBack={() => window.location.href = '/'} />} />

        {/* Quiz System Routes */}
        <Route path="/quiz" element={<QuizHub />} />
        <Route path="/quiz/create" element={<CreateQuiz />} />
        <Route path="/quiz/take/:quizId" element={<TakeQuiz />} />
        <Route path="/quiz/leaderboard/:quizId" element={<Leaderboard />} />
        <Route path="/quiz/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;