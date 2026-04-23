import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Card } from 'primereact/card';
import quizApi from '../../services/quizApi';
import toast from 'react-hot-toast';
import { InputText } from 'primereact/inputtext';
import FaceMonitor from '../../components/FaceMonitor';
import './quiz.css';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  
  // Anti-cheating state
  const [violations, setViolations] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);

  // Entrance state
  const [user, setUser] = useState(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [accessKeyInput, setAccessKeyInput] = useState('');

  useEffect(() => {
    fetchQuizInfo();
  }, [quizId]);

  const fetchQuizInfo = async () => {
    try {
      const quizData = await quizApi.getQuiz(quizId);
      if (quizData.success) {
        setQuiz(quizData.quiz);
        setQuestions(quizData.questions);
        setTimeLeft((quizData.quiz.duration_minutes || 30) * 60);
      }
    } catch (err) {
      toast.error("Failed to load quiz");
      navigate('/quiz');
    } finally {
      setLoading(false);
    }
  };

  const startQuizFlow = async () => {
    try {
      setLoading(true);
      
      let currentUser = user;
      
      // Always register/identify guest for every attempt as per requirement
      if (!guestEmail || !guestName) {
         toast.error("Please enter your name and email to proceed");
         setLoading(false);
         return;
      }
      const regData = await quizApi.registerUser(guestEmail, guestName);
      if (regData.success) {
        currentUser = regData.user;
        setUser(currentUser);
        localStorage.setItem('quiz_user', JSON.stringify(currentUser));
      }

      // Check access key
      if (quiz.access_key && !accessKeyInput) {
        toast.error("This quiz requires an Access Key. Please enter it below.");
        setLoading(false);
        return;
      }

      // Try to start attempt (Backend checks whitelist + access key)
      const attemptData = await quizApi.startAttempt(quizId, currentUser.id, accessKeyInput);
      if (attemptData.success) {
        setAttemptId(attemptData.attempt.id);
        
        // Request Fullscreen
        const element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen().catch(() => {});
        }

        setIsStarted(true);
        toast.success("Quiz started. Good luck!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Access denied or initialization failed");
    } finally {
      setLoading(false);
    }
  };

  // Timer logic
  useEffect(() => {
    if (!isStarted || isSubmitted || timeLeft === null) return;
    
    if (timeLeft <= 0) {
      submitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isSubmitted, timeLeft]);

  // Tab switch detection
  useEffect(() => {
    if (!isStarted || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("Security Violation: Tab switch detected!");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Disable right click and copy-paste
    const preventAction = (e) => e.preventDefault();
    document.addEventListener('contextmenu', preventAction);
    document.addEventListener('copy', preventAction);
    document.addEventListener('paste', preventAction);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', preventAction);
      document.removeEventListener('copy', preventAction);
      document.removeEventListener('paste', preventAction);
    };
  }, [isStarted, isSubmitted, violations]);

  const handleSelectAnswer = (option) => {
    let currentVal = answers.find(a => a.question_id === questions[currentIndex].id)?.answer || '';
    let newVal;

    if (questions[currentIndex].type === 'multiple') {
      const selectedArr = currentVal ? currentVal.split(',') : [];
      if (selectedArr.includes(option)) {
        newVal = selectedArr.filter(o => o !== option).sort().join(',');
      } else {
        newVal = [...selectedArr, option].sort().join(',');
      }
    } else {
      newVal = option;
    }

    const newAnswers = [...answers];
    const existingIdx = newAnswers.findIndex(a => a.question_id === questions[currentIndex].id);
    
    if (existingIdx > -1) {
      newAnswers[existingIdx].answer = newVal;
    } else {
      newAnswers.push({ question_id: questions[currentIndex].id, answer: newVal });
    }
    setAnswers(newAnswers);
  };

  const handleFillInSubmit = (val) => {
    const newAnswers = [...answers];
    const existingIdx = newAnswers.findIndex(a => a.question_id === questions[currentIndex].id);
    if (existingIdx > -1) {
      newAnswers[existingIdx].answer = val;
    } else {
      newAnswers.push({ question_id: questions[currentIndex].id, answer: val });
    }
    setAnswers(newAnswers);
  };

  const handleViolation = (message, isCritical = false) => {
    if (isSubmitted || !isStarted) return;
    
    // We update the state, but we must use the functional update to get the latest value if called rapidly
    setViolations(prev => {
      const nextCount = prev + 1;
      
      if (nextCount >= 3 || isCritical) {
        toast.error(isCritical ? message : `SECURITY BREACH: ${message} Auto-submitting...`, { 
          duration: 5000,
          style: { background: '#ef4444', color: '#fff', fontWeight: 900 }
        });
        
        // Use a timeout to ensure state update propagates before submission
        setTimeout(() => submitQuiz(), 500);
        return nextCount;
      }

      toast.error(`${message} Strike (${nextCount}/3)`, { 
        style: { border: '2px solid orange', color: 'orange', fontWeight: 800 },
        duration: 4000 
      });
      
      return nextCount;
    });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const submitQuiz = async () => {
    if (isSubmitted) return;
    try {
      setLoading(true);
      const data = await quizApi.submitAttempt(attemptId, answers);
      if (data.success) {
        setIsSubmitted(true);
        setResult(data.result);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading && !isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#3b82f6' }}></i>
      </div>
    );
  }

  // Instructions Page
  if (!isStarted && quiz && !isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#f8fafc' }} className="quiz-container">
        <div style={{ maxWidth: 700, margin: '60px auto' }}>
           <Card style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: 20 }} className="responsive-card">
              <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit' }}>{quiz.title}</h1>
                <p style={{ color: '#94a3b8' }}>{quiz.description || "Official assessment examination."}</p>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: 20, borderRadius: 15, marginBottom: 25, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 15 }}>📋 Instructions & Security</h3>
                <ul style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '0.85rem' }}>
                  <li><b>Duration:</b> {quiz.duration_minutes} mins for {questions.length} questions.</li>
                  <li><b>Security:</b> Fullscreen and Tab monitoring is active.</li>
                  {quiz.start_time && <li><b>Opens:</b> {new Date(quiz.start_time).toLocaleDateString()} {new Date(quiz.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>}
                  {quiz.end_time && <li><b>Closes:</b> {new Date(quiz.end_time).toLocaleDateString()} {new Date(quiz.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>}
                </ul>
              </div>

              {/* Identification Flow (Always mandatory as per requirement) */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 25, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 25 }}>
                 <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, color: '#3b82f6' }}>👤 Participant Identification</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }} className="create-quiz-grid">
                    <div className="flex flex-column gap-2 text-left">
                       <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Full Name</label>
                       <InputText value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="John Doe" 
                                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid #334155', color: '#fff' }} />
                    </div>
                    <div className="flex flex-column gap-2 text-left">
                       <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Email Address</label>
                       <InputText value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="john@example.com" 
                                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid #334155', color: '#fff' }} />
                    </div>
                 </div>
              </div>

              {/* Access Key Flow (Only if quiz requires it) */}
              {quiz.access_key && (
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: 25, borderRadius: 20, border: 'forced-colors: 1px solid #3b82f6', marginBottom: 25, border: '1px solid #334155' }}>
                   <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 15, color: '#10b981' }}>🔑 Private Access Code</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <InputText value={accessKeyInput} onChange={(e) => setAccessKeyInput(e.target.value)} placeholder="Enter Quiz Key..." 
                                 type="password"
                                 style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid #10b981', color: '#fff', textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.2rem' }} />
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>This assessment is password protected.</p>
                   </div>
                </div>
              )}

              <Button label={loading ? "Initializing..." : "I Agree - Enter Fullscreen & Start"} 
                      icon={loading ? "pi pi-spin pi-spinner" : "pi pi-shield"} 
                      onClick={startQuizFlow} disabled={loading}
                      style={{ width: '100%', padding: 20, borderRadius: 15, background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', border: 'none', fontWeight: 800, fontSize: '1.1rem' }} />
           </Card>
        </div>
      </div>
    );
  }

  if (isSubmitted && result) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', textAlign: 'center' }} className="quiz-container">
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ width: 120, height: 120, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', border: '2px solid #10b981' }}>
            <i className="pi pi-check" style={{ fontSize: '3rem', color: '#10b981' }}></i>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit', marginBottom: 10 }}>Quiz Completed!</h1>
          <p style={{ color: '#94a3b8', marginBottom: 40 }}>You've successfully finished <b>{quiz.title}</b></p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }} className="quiz-result-grid">
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 30, borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#3b82f6' }}>{result.score}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score / {result.max_possible}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 30, borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: result.percent >= 50 ? '#10b981' : '#ef4444' }}>{result.percent}%</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Accuracy</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 15, justifyContent: 'center' }}>
            <Button label="Back to Hub" icon="pi pi-home" onClick={() => navigate('/quiz')} style={{ padding: '12px 25px', borderRadius: 12, background: '#3b82f6', border: 'none' }} />
            <Button label="View Leaderboard" icon="pi pi-chart-bar" onClick={() => navigate(`/quiz/leaderboard/${quizId}`)} style={{ padding: '12px 25px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const userChoice = answers.find(a => a.question_id === currentQuestion.id)?.answer || '';
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f8fafc'
    }} className="quiz-container">
      {/* AI Face Monitoring Component */}
      <FaceMonitor 
        isStarted={isStarted} 
        isSubmitted={isSubmitted} 
        onViolation={handleViolation} 
      />

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <header style={{ marginBottom: 40 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }} className="take-quiz-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{quiz?.title}</h2>
                <span style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>{currentQuestion.type || 'mcq'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="take-quiz-stats">
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: timeLeft < 60 ? '#ef4444' : '#10b981' }}>
                    <i className="pi pi-clock"></i>
                    <span style={{ fontWeight: 900, fontSize: '1.2rem', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</span>
                 </div>
                 {violations > 0 && (
                   <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444' }} className="strike-pulse">
                      <i className="pi pi-exclamation-triangle"></i>
                      <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>Strikes: {violations}/3</span>
                   </div>
                 )}
                 <span style={{ fontWeight: 800, color: '#3b82f6' }}>Q {currentIndex + 1} / {questions.length}</span>
              </div>
           </div>
           <ProgressBar value={progressPercent} showValue={false} style={{ height: 8, borderRadius: 50, background: 'rgba(255,255,255,0.1)' }} color="#3b82f6" />
        </header>

        <Card style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: 20 }} className="responsive-card">
          <h3 style={{ fontSize: '1.5rem', marginBottom: 30, lineHeight: 1.4 }}>{currentQuestion.question}</h3>
          
          {currentQuestion.type === 'fill_in_the_blanks' ? (
            <div style={{ padding: '20px 0' }}>
               <label style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 10, display: 'block' }}>Type your answer below:</label>
               <InputText 
                 value={userChoice} 
                 onChange={(e) => handleFillInSubmit(e.target.value)}
                 placeholder="Your answer..."
                 style={{ width: '100%', padding: 18, borderRadius: 15, background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '1.1rem' }}
               />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {currentQuestion.options.map((option, idx) => {
                const isSelected = currentQuestion.type === 'multiple' 
                                   ? userChoice.split(',').includes(option)
                                   : userChoice === option;

                return (
                  <div 
                    key={idx} 
                    onClick={() => handleSelectAnswer(option)}
                    style={{
                      padding: '18px 25px',
                      borderRadius: 15,
                      background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.4)',
                      border: `1.5px solid ${isSelected ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 15
                    }}
                  >
                    <div style={{ 
                      width: 24, height: 24, borderRadius: currentQuestion.type === 'mcq' ? '50%' : '6px', 
                      border: `2px solid ${isSelected ? '#3b82f6' : '#334155'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isSelected && currentQuestion.type === 'multiple' ? '#3b82f6' : 'transparent'
                    }}>
                      {isSelected && currentQuestion.type === 'mcq' && <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }}></div>}
                      {isSelected && currentQuestion.type === 'multiple' && <i className="pi pi-check" style={{ fontSize: '0.8rem', color: '#fff' }}></i>}
                    </div>
                    <span style={{ fontSize: '1.1rem' }}>{option}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
            <Button label="Previous" icon="pi pi-chevron-left" disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8' }} />
            
            {currentIndex < questions.length - 1 ? (
              <Button label="Next Question" icon="pi pi-chevron-right" iconPos="right" onClick={nextQuestion} disabled={!userChoice}
                      style={{ padding: '12px 25px', borderRadius: 12, background: '#3b82f6', border: 'none' }} />
            ) : (
              <Button label="Finish Quiz" icon="pi pi-check" iconPos="right" onClick={submitQuiz} disabled={!userChoice}
                      style={{ padding: '12px 25px', borderRadius: 12, background: '#10b981', border: 'none' }} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};


export default TakeQuiz;
