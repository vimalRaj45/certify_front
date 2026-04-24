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
  const [tabSwitches, setTabSwitches] = useState(0);
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
        if (regData.token) {
          localStorage.setItem('quiz_token', regData.token);
        }
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
        setTimeout(() => navigate('/'), 3000);
      } else {
        toast.error(errorData?.error || "Access denied or initialization failed");
        if (err.response?.status === 403) setTimeout(() => navigate('/'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option) => {
    const q = questions[currentIndex];
    const newAnswers = [...answers];
    
    if (q.type === 'multiple') {
      const currentSelected = newAnswers[currentIndex] ? newAnswers[currentIndex].split(',').filter(a => a) : [];
      if (currentSelected.includes(option)) {
        newAnswers[currentIndex] = currentSelected.filter(a => a !== option).sort().join(',');
      } else {
        newAnswers[currentIndex] = [...currentSelected, option].sort().join(',');
      }
    } else {
      newAnswers[currentIndex] = option;
    }
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
      
      // Map answers to backend format
      const formattedAnswers = questions.map((q, idx) => ({
        question_id: q.id,
        answer: answers[idx] || ""
      }));

      const res = await quizApi.submitAttempt(attemptId, formattedAnswers);
      if (res.success) {
        setResult(res.result);
        setIsSubmitted(true);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        toast.success("Assessment submitted successfully!");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.response?.data?.error || "Failed to submit assessment. Please try again.");
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

  // Unified Tab Switching / Visibility Monitor
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isStarted && !isSubmitted) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            toast.error("SECURITY BREACH: Multiple tab switches detected. Auto-submitting assessment...", { 
              duration: 5000,
              icon: '🚨' 
            });
            submitQuiz();
          } else {
            toast.error(`SECURITY WARNING: Tab switch detected (${newCount}/3). Subsequent violations will trigger auto-submission!`, { 
              duration: 4000,
              icon: '⚠️'
            });
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isStarted && !isSubmitted) {
        toast.error("SECURITY ALERT: Fullscreen exited! Please stay in fullscreen mode.", { 
          duration: 4000,
          icon: '🚫' 
        });
        setViolations(v => v + 1);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isStarted, isSubmitted, attemptId, questions, answers]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading && !isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: 'var(--accent)' }}></i>
      </div>
    );
  }

  // Instructions Page
  if (!isStarted && quiz && !isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text)', paddingTop: 40 }} className="quiz-container">
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
           <Breadcrumbs items={[{ label: 'Take Assessment' }]} />

           <Card style={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: 24, padding: 20, boxShadow: 'var(--shadow-card)' }} className="responsive-card">
              <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-h)', color: 'var(--text)' }}>{quiz.title}</h1>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{quiz.description || "Official assessment examination."}</p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 20, borderRadius: 15, marginBottom: 25, border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 15, color: 'var(--text)' }}>📋 Instructions & Security</h3>
                <ul style={{ color: 'var(--text-secondary)', paddingLeft: 20, lineHeight: 1.8, fontWeight: 500 }}>
                   <li style={{ color: 'var(--amber)', fontWeight: 700 }}><i className="pi pi-mobile mr-2"></i> Mobile Only: Access from Desktop/Laptop is strictly prohibited.</li>
                   <li><b>Fullscreen Required:</b> The browser will lock to fullscreen.</li>
                   <li><b>Face Monitoring:</b> Stay in front of your camera at all times.</li>
                   <li style={{ color: 'var(--red)', fontWeight: 700 }}><b>Anti-Cheat:</b> Switching tabs more than 3 times will trigger AUTO-SUBMISSION.</li>
                   <li><b>Duration:</b> You have {quiz.duration_minutes} minutes for {questions.length} questions.</li>
                </ul>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 15 }}>
                      <div className="flex flex-column gap-1">
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Full Name</label>
                          <InputText value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="e.g. John Doe" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                      </div>
                      <div className="flex flex-column gap-1">
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Email Address</label>
                          <InputText value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="e.g. john@example.com" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                      </div>
                  </div>

                  {quiz.access_key && (
                    <div className="flex flex-column gap-1">
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Secret Access Key</label>
                        <InputText type="password" value={accessKeyInput} onChange={(e) => setAccessKeyInput(e.target.value)} placeholder="Enter key provided by examiner" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                    </div>
                  )}

                  <Button label="Initialize Proctoring & Start" icon="pi pi-shield" 
                          onClick={startQuizFlow}
                          style={{ padding: 18, borderRadius: 15, background: 'var(--aurora-gradient)', border: 'none', fontWeight: 800, marginTop: 10, color: '#fff', boxShadow: 'var(--shadow-blue)' }} />
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
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text)' }}>
         <FaceMonitor onViolation={() => setViolations(v => v + 1)} />
         
         <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
               <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-h)' }}>{quiz.title}</h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Question {currentIndex + 1} of {questions.length}</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: timeLeft < 60 ? 'var(--red)' : 'var(--accent)', fontFamily: 'var(--font-h)' }}>{formatTime(timeLeft)}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Time Remaining</div>
               </div>
            </div>

            <ProgressBar value={progress} showValue={false} style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.03)', marginBottom: 40 }} />

            <Card style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 20, boxShadow: 'var(--shadow-card)' }}>
               <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 30, lineHeight: 1.5, color: 'var(--text)' }}>{q.question}</h3>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {q.type === 'mcq' || q.type === 'multiple' ? (
                    q.options.map((opt, i) => {
                      const isSelected = q.type === 'multiple' 
                        ? (answers[currentIndex] || '').split(',').includes(opt)
                        : answers[currentIndex] === opt;
                      
                      return (
                        <div key={i} 
                             onClick={() => handleAnswer(opt)}
                             style={{ 
                                padding: 18, borderRadius: 15, 
                                background: isSelected ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.02)', 
                                border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                                cursor: 'pointer', transition: 'all 0.2s'
                             }} className="option-hover">
                           <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                              <div style={{ 
                                width: 24, height: 24, 
                                borderRadius: q.type === 'mcq' ? '50%' : '6px', 
                                border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--text-muted)'}`, 
                                display: 'flex', alignItems: 'center', justifyContent: 'center' 
                              }}>
                                 {isSelected && (
                                   q.type === 'mcq' 
                                    ? <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)' }}></div>
                                    : <i className="pi pi-check" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}></i>
                                 )}
                              </div>
                              <span style={{ fontWeight: 600, color: isSelected ? 'var(--text)' : 'var(--text-secondary)' }}>{opt}</span>
                           </div>
                        </div>
                      )
                    })
                  ) : (
                    <InputText value={answers[currentIndex] || ''} 
                                onChange={(e) => handleAnswer(e.target.value)} 
                                placeholder="Type your answer here..."
                                style={{ padding: 15, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 12 }} />
                  )}
               </div>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
               <Button label="Previous" icon="pi pi-chevron-left" disabled={currentIndex === 0} onClick={prevQuestion} text style={{ color: 'var(--text-muted)', fontWeight: 700 }} />
               
               {currentIndex === questions.length - 1 ? (
                 <Button label="Submit Assessment" icon="pi pi-send" onClick={submitQuiz} style={{ borderRadius: 12, padding: '12px 30px', background: 'var(--green)', border: 'none', fontWeight: 800, color: '#fff' }} />
               ) : (
                 <Button label="Next" iconPos="right" icon="pi pi-chevron-right" onClick={nextQuestion} style={{ borderRadius: 12, padding: '12px 30px', background: 'var(--accent)', border: 'none', fontWeight: 800, color: '#fff' }} />
               )}
            </div>
         </div>
      </div>
    )
  }

  // Result Page
  if (isSubmitted && result) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Card style={{ maxWidth: 500, width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 30, textAlign: 'center', padding: 40, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ width: 80, height: 80, background: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
               <i className="pi pi-check" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 10, fontFamily: 'var(--font-h)' }}>Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 30, fontSize: '1.1rem', fontWeight: 500 }}>
              Your assessment has been successfully recorded. 
              <br/>
              The administrator will review your results.
            </p>
            
            <Button label="Back to Assessment Hub" icon="pi pi-home" onClick={() => navigate('/quiz')} 
                    style={{ width: '100%', padding: 15, borderRadius: 15, background: 'var(--accent)', border: 'none', fontWeight: 800, color: '#fff' }} />
          </Card>
      </div>
    )
  }
}

export default TakeQuiz;
