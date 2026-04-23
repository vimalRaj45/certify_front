import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Card } from 'primereact/card';
import quizApi from '../../services/quizApi';
import toast from 'react-hot-toast';
import { InputText } from 'primereact/inputtext';
import FaceMonitor from '../../components/FaceMonitor';
import Breadcrumbs from '../../components/quiz/Breadcrumbs';
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
    // MOBILE ONLY CHECK
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (!isMobile) {
      toast.error("This assessment can only be taken on a mobile device for security reasons.", { duration: 6000 });
      return;
    }

    try {
      setLoading(true);
      
      let currentUser = user;
      
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

      if (quiz.access_key && !accessKeyInput) {
        toast.error("This quiz requires an Access Key. Please enter it below.");
        setLoading(false);
        return;
      }

      const attemptData = await quizApi.startAttempt(quizId, currentUser.id, accessKeyInput);
      if (attemptData.success) {
        setAttemptId(attemptData.attempt.id);
        
        const element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen().catch(() => {});
        }

        setIsStarted(true);
        toast.success("Quiz started. Good luck!");
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.startTime) {
        const localStartTime = new Date(errorData.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
        toast.error(`Please come back at the scheduled time: ${localStartTime}`, { duration: 5000 });
        setTimeout(() => navigate('/quiz'), 3000);
      } else {
        toast.error(errorData?.error || "Access denied or initialization failed");
        if (err.response?.status === 403) setTimeout(() => navigate('/quiz'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = option;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const submitQuiz = async () => {
    try {
      setLoading(true);
      const res = await quizApi.submitQuiz(attemptId, answers);
      if (res.success) {
        setResult(res);
        setIsSubmitted(true);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        toast.success("Assessment submitted successfully!");
      }
    } catch (err) {
      toast.error("Failed to submit quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStarted && !isSubmitted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isStarted && !isSubmitted) {
      submitQuiz();
    }
  }, [isStarted, isSubmitted, timeLeft]);

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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#f8fafc', paddingTop: 40 }} className="quiz-container">
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
           <Breadcrumbs items={[{ label: 'Take Assessment' }]} />

           <Card style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: 20 }} className="responsive-card">
              <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit' }}>{quiz.title}</h1>
                <p style={{ color: '#94a3b8' }}>{quiz.description || "Official assessment examination."}</p>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: 20, borderRadius: 15, marginBottom: 25, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 15 }}>📋 Instructions & Security</h3>
                <ul style={{ color: '#94a3b8', paddingLeft: 20, lineHeight: 1.8 }}>
                   <li style={{ color: '#fbbf24', fontWeight: 700 }}><i className="pi pi-mobile mr-2"></i> Mobile Only: Access from Desktop/Laptop is strictly prohibited.</li>
                   <li><b>Fullscreen Required:</b> The browser will lock to fullscreen.</li>
                   <li><b>Face Monitoring:</b> Stay in front of your camera at all times.</li>
                   <li><b>Tab Switching:</b> Switching tabs may result in automatic disqualification.</li>
                   <li><b>Duration:</b> You have {quiz.duration_minutes} minutes for {questions.length} questions.</li>
                </ul>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }} className="mobile-flex-column">
                      <div className="flex flex-column gap-1">
                          <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Full Name</label>
                          <InputText value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="e.g. John Doe" />
                      </div>
                      <div className="flex flex-column gap-1">
                          <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Email Address</label>
                          <InputText value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="e.g. john@example.com" />
                      </div>
                  </div>

                  {quiz.access_key && (
                    <div className="flex flex-column gap-1">
                        <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Secret Access Key</label>
                        <InputText type="password" value={accessKeyInput} onChange={(e) => setAccessKeyInput(e.target.value)} placeholder="Enter key provided by examiner" />
                    </div>
                  )}

                  <Button label="Initialize Proctoring & Start" icon="pi pi-shield" 
                          onClick={startQuizFlow}
                          style={{ padding: 18, borderRadius: 15, background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', border: 'none', fontWeight: 800, marginTop: 10 }} />
              </div>
           </Card>
        </div>
      </div>
    );
  }

  // Active Quiz Page
  if (isStarted && !isSubmitted) {
    const q = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff' }}>
         <FaceMonitor onViolation={() => setViolations(v => v + 1)} />
         
         <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
               <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{quiz.title}</h2>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Question {currentIndex + 1} of {questions.length}</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: timeLeft < 60 ? '#ef4444' : '#3b82f6' }}>{formatTime(timeLeft)}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Time Remaining</div>
               </div>
            </div>

            <ProgressBar value={progress} showValue={false} style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', marginBottom: 40 }} />

            <Card style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: 20 }}>
               <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: 30, lineHeight: 1.5 }}>{q.question}</h3>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {q.type === 'mcq' || q.type === 'multiple' ? (
                    q.options.map((opt, i) => {
                      const isSelected = answers[currentIndex] === opt;
                      return (
                        <div key={i} 
                             onClick={() => handleAnswer(opt)}
                             style={{ 
                               padding: 18, borderRadius: 15, 
                               background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(15, 23, 42, 0.5)', 
                               border: `2px solid ${isSelected ? '#3b82f6' : 'rgba(255,255,255,0.05)'}`,
                               cursor: 'pointer', transition: 'all 0.2s'
                             }} className="option-hover">
                           <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${isSelected ? '#3b82f6' : '#334155'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                 {isSelected && <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }}></div>}
                              </div>
                              <span style={{ fontWeight: 500 }}>{opt}</span>
                           </div>
                        </div>
                      )
                    })
                  ) : (
                    <InputText value={answers[currentIndex] || ''} 
                               onChange={(e) => handleAnswer(e.target.value)} 
                               placeholder="Type your answer here..."
                               style={{ padding: 15, background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', color: '#fff', borderRadius: 12 }} />
                  )}
               </div>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
               <Button label="Previous" icon="pi pi-chevron-left" disabled={currentIndex === 0} onClick={prevQuestion} text style={{ color: '#94a3b8' }} />
               
               {currentIndex === questions.length - 1 ? (
                 <Button label="Submit Assessment" icon="pi pi-send" onClick={submitQuiz} severity="success" style={{ borderRadius: 12, padding: '12px 30px' }} />
               ) : (
                 <Button label="Next" iconPos="right" icon="pi pi-chevron-right" onClick={nextQuestion} style={{ borderRadius: 12, padding: '12px 30px', background: '#3b82f6', border: 'none' }} />
               )}
            </div>
         </div>
      </div>
    )
  }

  // Result Page
  if (isSubmitted && result) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
         <Card style={{ maxWidth: 500, width: '100%', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 30, textAlign: 'center', padding: 20 }}>
            <div style={{ width: 80, height: 80, background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
               <i className="pi pi-check" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 10 }}>Well Done!</h2>
            <p style={{ color: '#94a3b8', marginBottom: 30 }}>Your assessment has been evaluated.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 30 }}>
               <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: 20, borderRadius: 20 }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Score</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#3b82f6' }}>{result.score}/{result.totalPoints}</div>
               </div>
               <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: 20, borderRadius: 20 }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Accuracy</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>{Math.round((result.score / result.totalPoints) * 100)}%</div>
               </div>
            </div>

            <Button label="Back to Dashboard" icon="pi pi-home" onClick={() => navigate('/quiz')} 
                    style={{ width: '100%', padding: 15, borderRadius: 15, background: '#3b82f6', border: 'none', fontWeight: 700 }} />
            
            <Button label="View Leaderboard" icon="pi pi-chart-bar" text onClick={() => navigate(`/quiz/leaderboard/${quizId}`)} 
                    style={{ width: '100%', marginTop: 10, color: '#94a3b8' }} />
         </Card>
      </div>
    )
  }

  return null;
};

export default TakeQuiz;
