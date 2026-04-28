import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Existing App Components (renamed to CertifyStudio)
import CertifyStudio from './CertifyStudio';
import VerificationPage from './pages/Verification';

// New Quiz Components
import QuizHub from './pages/quiz/QuizHub';
import CreateQuiz from './pages/quiz/CreateQuiz';
import TakeQuiz from './pages/quiz/TakeQuiz';
import Leaderboard from './pages/quiz/Leaderboard';
import History from './pages/quiz/History';
import Analytics from './pages/quiz/Analytics';
import StudentResults from './pages/quiz/StudentResults';
import StartupCheck from './components/StartupCheck';
import Onboarding from './pages/Onboarding';



function App() {
  const navigate = (path) => {
    window.location.href = path.startsWith('/') ? path : `/${path}`;
  };

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <StartupCheck>
        <Routes>
          {/* Main CertLock Routes */}
          <Route path="/" element={<CertifyStudio />} />
          <Route path="/how-it-works" element={<Onboarding onNavigate={navigate} />} />
          <Route path="/verify" element={<VerificationPage onBack={() => navigate('/')} />} />



        {/* Quiz System Routes */}
        <Route path="/quiz" element={<QuizHub />} />
        <Route path="/quiz/create" element={<CreateQuiz />} />
        <Route path="/quiz/results" element={<StudentResults />} />
        <Route path="/quiz/results/:quizId" element={<StudentResults />} />
        <Route path="/quiz/take/:quizId" element={<TakeQuiz />} />
        <Route path="/quiz/leaderboard/:quizId" element={<Leaderboard />} />
        <Route path="/quiz/history" element={<History />} />
        <Route path="/quiz/analytics/:id" element={<Analytics />} />
      </Routes>
      </StartupCheck>
    </BrowserRouter>
  );
}

export default App;
