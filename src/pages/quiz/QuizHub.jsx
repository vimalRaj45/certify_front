import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import quizApi from '../../services/quizApi';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../components/quiz/Breadcrumbs';
import './quiz.css';

const QuizHub = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('quiz_user')) || null);
  const [showLogin, setShowLogin] = useState(!user);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quizApi.getQuizzes();
      if (data.success && Array.isArray(data.quizzes)) {
        setQuizzes(data.quizzes);
      } else {
        setError("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.error || "Failed to reach the assessment server. Check your connection.");
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !name) return toast.error("Email and Name required");
    try {
      const data = await quizApi.registerUser(email, name);
      if (data.success) {
        localStorage.setItem('quiz_user', JSON.stringify(data.user));
        setUser(data.user);
        setShowLogin(false);
        toast.success(`Welcome, ${data.user.name}!`);
      }
    } catch (err) {
      toast.error("Registration failed");
    }
  };

  const startQuiz = (quizId) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    navigate(`/quiz/take/${quizId}`);
  };

  const deleteQuiz = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this quiz? All questions and results will be lost.")) return;
    try {
      await quizApi.deleteQuiz(id);
      setQuizzes(quizzes.filter(q => q.id !== id));
      toast.success("Quiz deleted");
    } catch (err) {
      toast.error("Failed to delete quiz");
    }
  };

  const handleShare = (quizId, e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/quiz/take/${quizId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success("Quiz link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text)',
      paddingTop: 40
    }} className="quiz-container">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Breadcrumbs items={[]} />
        
        <header style={{ marginBottom: 60 }} className="quiz-header">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 30 }}>
              <div style={{ flex: 1, minWidth: 300 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 15 }}>
                    <div style={{ width: 40, height: 40, background: 'var(--aurora-gradient)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-blue)' }}>
                       <i className="pi pi-bolt" style={{ fontSize: '1.2rem', color: '#fff' }}></i>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-h)', margin: 0, color: 'var(--text)' }}>Assessment Center</h1>
                 </div>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 500, fontWeight: 500 }}>Create, manage, and take professional assessments with real-time analytics.</p>
              </div>

              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 15, background: 'var(--bg-card)', padding: '10px 20px', borderRadius: 20, border: '1px solid var(--border)' }}>
                   <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--aurora-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff' }}>
                      {user.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Explorer</div>
                   </div>
                   <Button icon="pi pi-sign-out" rounded text severity="secondary" size="small" onClick={() => { localStorage.removeItem('quiz_user'); setUser(null); setShowLogin(true); }} />
                </div>
              ) : (
                <Button label="Identify Yourself" icon="pi pi-user-plus" onClick={() => setShowLogin(true)} 
                        style={{ padding: '12px 25px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              )}
           </div>

           {user && (
              <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-start', gap: 15 }} className="mobile-flex-column">
                 <Button label="Create New Quiz" icon="pi pi-plus" onClick={() => navigate('/quiz/create')} 
                         style={{ padding: '15px 30px', borderRadius: 12, background: 'var(--accent)', border: 'none', fontWeight: 800, boxShadow: 'var(--shadow-blue)' }} className="mobile-full-width" />
                 <Button label="My Performance" icon="pi pi-history" onClick={() => navigate('/quiz/history')} 
                         style={{ padding: '15px 30px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 700 }} className="p-button-outlined mobile-full-width" />
                 <Button label="Certificate Studio" icon="pi pi-verified" onClick={() => navigate('/')} 
                         style={{ padding: '15px 30px', borderRadius: 12, background: 'rgba(59, 130, 246, 0.05)', color: 'var(--accent)', border: '1px solid var(--accent)', fontWeight: 700 }} className="mobile-full-width" />
              </div>
           )}
        </header>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }} className="mobile-flex-column">
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-h)', color: 'var(--text)' }}>Available Quizzes ({quizzes.length})</h2>
            <div style={{ display: 'flex', gap: 10 }}>
               <Button label="Quick Create" icon="pi pi-plus" size="small" onClick={() => navigate('/quiz/create')} 
                       style={{ background: 'var(--accent)', border: 'none', borderRadius: 10, fontWeight: 700 }} />
               <div className="mobile-hide" style={{ height: 1, background: 'var(--border)', width: 100 }}></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 25 }} className="quiz-grid">
            {quizzes.map((quiz, i) => (
              <Card key={quiz.id} className="quiz-card-hover" style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border)',
                borderRadius: 20,
                overflow: 'hidden',
                color: 'var(--text)',
                boxShadow: 'var(--shadow-card)'
              }}>
                 <div style={{ padding: 25 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                       <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-h)' }}>{quiz.title}</h3>
                       <div style={{ display: 'flex', gap: 8 }}>
                         <Button icon="pi pi-chart-bar" className="p-button-text p-button-sm" 
                                 style={{ color: 'var(--aurora-2)', padding: 0, width: 30, height: 30 }} 
                                 onClick={(e) => { e.stopPropagation(); navigate(`/quiz/analytics/${quiz.id}`); }} tooltip="Performance Analytics" />
                         <Button icon="pi pi-share-alt" className="p-button-text p-button-sm" 
                                 style={{ color: 'var(--accent)', padding: 0, width: 30, height: 30 }} 
                                 onClick={(e) => handleShare(quiz.id, e)} tooltip="Copy Link" />
                          {((user && quiz.created_by === user.id) || (JSON.parse(localStorage.getItem('user'))?.id === quiz.created_by)) && (
                            <>
                              <Button icon="pi pi-pencil" className="p-button-text p-button-sm" 
                                      style={{ color: 'var(--text-muted)', padding: 0, width: 30, height: 30 }} 
                                      onClick={(e) => { e.stopPropagation(); navigate(`/quiz/create?edit=${quiz.id}`); }} />
                              <Button icon="pi pi-trash" className="p-button-text p-button-danger p-button-sm" 
                                      style={{ color: 'var(--red)', padding: 0, width: 30, height: 30 }} 
                                      onClick={(e) => deleteQuiz(quiz.id, e)} />
                            </>
                          )}
                       </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                           <i className="pi pi-user" style={{ fontSize: '0.8rem' }}></i>
                           <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{quiz.creator_name || 'Anonymous'}</span>
                        </div>
                        {quiz.start_time && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: new Date() < new Date(quiz.start_time) ? 'var(--amber)' : 'var(--green)' }}>
                             <i className="pi pi-calendar-plus" style={{ fontSize: '0.8rem' }}></i>
                             <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Starts: {new Date(quiz.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                          </div>
                        )}
                        {quiz.end_time && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: new Date() > new Date(quiz.end_time) ? 'var(--red)' : 'var(--text-secondary)' }}>
                             <i className="pi pi-calendar-minus" style={{ fontSize: '0.8rem' }}></i>
                             <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Ends: {new Date(quiz.end_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                          </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>
                           Created {new Date(quiz.created_at).toLocaleDateString()}
                        </div>
                        <Button label="Take Quiz" icon="pi pi-play" 
                                onClick={() => startQuiz(quiz.id)}
                                style={{ borderRadius: 12, padding: '10px 18px', background: 'var(--accent)', border: 'none', fontWeight: 700 }} />
                    </div>
                 </div>
              </Card>
            ))}
            
            {loading && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 50 }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: 'var(--accent)' }}></i>
                <p style={{ marginTop: 20, color: 'var(--text-secondary)', fontWeight: 600 }}>Fetching your assessments...</p>
              </div>
            )}
            
            {error && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 50, color: 'var(--red)' }}>
                <i className="pi pi-exclamation-triangle" style={{ fontSize: '3rem', marginBottom: 20 }}></i>
                <p style={{ fontWeight: 600 }}>{error}</p>
                <Button label="Try Again" icon="pi pi-refresh" text onClick={fetchQuizzes} className="mt-3" style={{ color: 'var(--accent)' }} />
              </div>
            )}
            
            {!loading && !error && quizzes.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 50, color: 'var(--text-muted)' }}>
                <i className="pi pi-inbox" style={{ fontSize: '3rem', marginBottom: 20 }}></i>
                <p style={{ fontWeight: 600 }}>No quizzes available yet. Be the first to create one!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <Dialog header="Join the Orbit" visible={showLogin} style={{ width: '90vw', maxWidth: 400 }} onHide={() => setShowLogin(false)} closable={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '20px 0' }}>
            <div className="flex flex-column gap-2">
              <label htmlFor="name" style={{ fontWeight: 700, color: 'var(--text)' }}>Display Name</label>
              <InputText id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="How should we call you?" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <div className="flex flex-column gap-2">
              <label htmlFor="email" style={{ fontWeight: 700, color: 'var(--text)' }}>Email Address</label>
              <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <Button label="Enter Orbit" onClick={handleRegister} className="mt-2" 
                    style={{ background: 'var(--aurora-gradient)', border: 'none', borderRadius: 12, padding: 12, fontWeight: 800, color: '#fff' }} />
          </div>
      </Dialog>
    </div>
  );
};

export default QuizHub;
