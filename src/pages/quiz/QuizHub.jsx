import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import quizApi from '../../services/quizApi';
import toast from 'react-hot-toast';

const QuizHub = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('quiz_user')) || null);
  const [showLogin, setShowLogin] = useState(!user);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const data = await quizApi.getQuizzes();
      if (data.success) {
        setQuizzes(data.quizzes);
      }
    } catch (err) {
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
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '40px 20px',
      color: '#f8fafc'
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 60 }} data-aos="zoom-in">
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, marginBottom: 20 }}>
              <div style={{ width: 50, height: 50, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <i className="pi pi-bolt" style={{ fontSize: '1.5rem', color: '#fff' }}></i>
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'Outfit' }}>Assessment Center</h1>
           </div>
           <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: 600, margin: '0 auto' }}>Test your knowledge or create custom assessments for your team.</p>
           
           {!user ? (
             <div style={{ marginTop: 40 }}>
                <Button label="Identify Yourself to Continue" icon="pi pi-user" onClick={() => setShowLogin(true)} 
                        style={{ padding: '15px 30px', borderRadius: 50, background: '#3b82f6', border: 'none', fontWeight: 700 }} />
             </div>
           ) : (
             <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 15 }}>
                <Button label="Create New Quiz" icon="pi pi-plus" onClick={() => navigate('/quiz/create')} 
                        style={{ padding: '12px 25px', borderRadius: 12, background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', border: 'none', fontWeight: 700 }} />
                <Button label="My Results" icon="pi pi-history" onClick={() => navigate('/quiz/history')} 
                        style={{ padding: '12px 25px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} className="p-button-outlined" />
             </div>
           )}
        </header>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Available Quizzes</h2>
            <div style={{ width: 1, height: 2, background: 'rgba(255,255,255,0.1)', flex: 1, margin: '0 20px' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 25 }}>
            {quizzes.map((quiz, i) => (
              <Card key={quiz.id} data-aos="fade-up" data-aos-delay={i * 100} style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                backdropFilter: 'blur(10px)', 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 24,
                overflow: 'hidden',
                transition: 'transform 0.3s ease, border 0.3s ease'
              }} className="quiz-card-hover">
                 <div style={{ padding: 25 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                       <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{quiz.title}</h3>
                       <div style={{ display: 'flex', gap: 8 }}>
                         <Button icon="pi pi-share-alt" className="p-button-text p-button-sm" 
                                 style={{ color: '#3b82f6', padding: 0, width: 30, height: 30 }} 
                                 onClick={(e) => handleShare(quiz.id, e)} tooltip="Copy Link" />
                          {((user && quiz.created_by === user.id) || (JSON.parse(localStorage.getItem('user'))?.id === quiz.created_by)) && (
                            <>
                              <Button icon="pi pi-pencil" className="p-button-text p-button-sm" 
                                      style={{ color: '#94a3b8', padding: 0, width: 30, height: 30 }} 
                                      onClick={(e) => { e.stopPropagation(); navigate(`/quiz/create?edit=${quiz.id}`); }} />
                              <Button icon="pi pi-trash" className="p-button-text p-button-danger p-button-sm" 
                                      style={{ color: '#ef4444', padding: 0, width: 30, height: 30 }} 
                                      onClick={(e) => deleteQuiz(quiz.id, e)} />
                            </>
                          )}
                       </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
                          <i className="pi pi-user" style={{ fontSize: '0.8rem' }}></i>
                          <span style={{ fontSize: '0.85rem' }}>{quiz.creator_name || 'Anonymous'}</span>
                       </div>
                       {quiz.start_time && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: new Date() < new Date(quiz.start_time) ? '#f59e0b' : '#10b981' }}>
                            <i className="pi pi-calendar-plus" style={{ fontSize: '0.8rem' }}></i>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Starts: {new Date(quiz.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                         </div>
                       )}
                       {quiz.end_time && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: new Date() > new Date(quiz.end_time) ? '#ef4444' : '#64748b' }}>
                            <i className="pi pi-calendar-minus" style={{ fontSize: '0.8rem' }}></i>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Ends: {new Date(quiz.end_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                         </div>
                       )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ color: '#475569', fontSize: '0.8rem' }}>
                          Created {new Date(quiz.created_at).toLocaleDateString()}
                       </div>
                       <Button label="Take Quiz" icon="pi pi-play" 
                               onClick={() => startQuiz(quiz.id)}
                               style={{ borderRadius: 12, padding: '10px 18px', background: '#3b82f6', border: 'none' }} />
                    </div>
                 </div>
              </Card>
            ))}
            
            {!loading && quizzes.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 50, color: '#64748b' }}>
                <i className="pi pi-inbox" style={{ fontSize: '3rem', marginBottom: 20 }}></i>
                <p>No quizzes available yet. Be the first to create one!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <Dialog header="Join the Orbit" visible={showLogin} style={{ width: '90vw', maxWidth: 400 }} onHide={() => setShowLogin(false)} closable={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '20px 0' }}>
            <div className="flex flex-column gap-2">
              <label htmlFor="name" style={{ fontWeight: 600 }}>Display Name</label>
              <InputText id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="How should we call you?" />
            </div>
            <div className="flex flex-column gap-2">
              <label htmlFor="email" style={{ fontWeight: 600 }}>Email Address</label>
              <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <Button label="Enter Orbit" onClick={handleRegister} className="mt-2" 
                    style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', border: 'none', borderRadius: 12, padding: 12 }} />
          </div>
      </Dialog>
    </div>
  );
};

export default QuizHub;
