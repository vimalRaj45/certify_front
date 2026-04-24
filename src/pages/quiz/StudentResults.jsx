import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

const StudentResults = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const navigate = useNavigate();
    const { quizId } = useParams();

    const fetchResults = async () => {
        if (!email) return toast.error("Please enter your email");
        setLoading(true);
        try {
            const url = quizId 
                ? `${API_URL}/quiz/results-by-email?email=${encodeURIComponent(email)}&quiz_id=${quizId}`
                : `${API_URL}/quiz/results-by-email?email=${encodeURIComponent(email)}`;
            const resp = await fetch(url);
            const json = await resp.json();
            if (json.success) {
                setData(json);
                if (json.results.length === 0) {
                    toast.error("No results found for this email.");
                } else {
                    toast.success(`Found ${json.results.length} quiz records.`);
                }
            } else {
                toast.error(json.error || "Failed to fetch results");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'var(--bg-primary)', 
            color: 'var(--text)', 
            padding: '80px 24px 40px' 
        }}>
            {/* Header / Nav */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100,
                background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)', padding: '0 24px', height: 60,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <div style={{ width: 32, height: 32, background: 'var(--aurora-gradient)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="pi pi-verified text-white" style={{ fontSize: '0.9rem' }}></i>
                    </div>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1rem', color: 'var(--text)' }}>CertifyPro Results</span>
                </div>
                <Button label="Home" icon="pi pi-home" className="p-button-text p-button-sm" onClick={() => navigate('/')} />
            </nav>

            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.5rem', marginBottom: 10 }}>
                        {quizId ? 'Quiz Result Portal' : 'Student Result Portal'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {quizId 
                            ? 'Enter your registered email to view your score and correct answers for this assessment.' 
                            : 'Enter your registered email to view your quiz scores and correct answers across all assessments.'}
                    </p>
                </div>

                <Card className="card-premium" style={{ marginBottom: 30, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 250 }}>
                            <span className="p-input-icon-left" style={{ width: '100%' }}>
                                <i className="pi pi-envelope" />
                                <InputText 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="Enter your email address..." 
                                    style={{ width: '100%', borderRadius: 12, paddingLeft: 40 }}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchResults()}
                                />
                            </span>
                        </div>
                        <Button 
                            label={loading ? "Searching..." : "Check Results"} 
                            icon="pi pi-search" 
                            disabled={loading}
                            onClick={fetchResults}
                            style={{ borderRadius: 12, padding: '12px 24px', background: 'var(--accent)', border: 'none' }}
                        />
                    </div>
                </Card>

                {data && data.results && data.results.length > 0 && (
                    <div className="results-container" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 10 }}>
                            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--aurora-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: '1.2rem' }}>
                                {data.user.name.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{data.user.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{data.user.email}</div>
                            </div>
                        </div>

                        {data.results.map((res, idx) => (
                            <Card key={idx} style={{ 
                                background: 'var(--bg-card)', 
                                border: '1px solid var(--border)', 
                                borderRadius: 20,
                                overflow: 'hidden'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                    <div>
                                        <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', margin: 0 }}>{res.quiz_title}</h2>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                            <i className="pi pi-calendar" style={{ fontSize: '0.7rem', marginRight: 5 }}></i>
                                            Submitted on: {new Date(res.submitted_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)' }}>
                                            {res.total_score} / {res.max_possible}
                                        </div>
                                        <Badge value={`${Math.round((res.total_score / res.max_possible) * 100)}%`} severity={res.total_score / res.max_possible >= 0.5 ? 'success' : 'danger'} />
                                    </div>
                                </div>

                                <Accordion multiple>
                                    <AccordionTab header={
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <i className="pi pi-list" /> View Detailed Responses
                                        </span>
                                    }>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                                            {res.responses.map((ans, qIdx) => (
                                                <div key={qIdx} style={{ 
                                                    padding: 16, 
                                                    background: 'rgba(255,255,255,0.02)', 
                                                    borderRadius: 12,
                                                    border: `1px solid ${ans.is_correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                                                }}>
                                                    <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.9rem' }}>
                                                        Q{qIdx + 1}: {ans.question}
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.85rem' }}>
                                                        <div style={{ color: 'var(--text-secondary)' }}>
                                                            Your Answer: 
                                                            <span style={{ color: ans.is_correct ? '#10B981' : '#EF4444', fontWeight: 700, marginLeft: 5 }}>
                                                                {ans.answer || '(No Answer)'}
                                                            </span>
                                                        </div>
                                                        <div style={{ color: 'var(--text-secondary)' }}>
                                                            Correct Answer: 
                                                            <span style={{ color: '#10B981', fontWeight: 700, marginLeft: 5 }}>
                                                                {ans.correct_answer}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionTab>
                                </Accordion>
                            </Card>
                        ))}
                    </div>
                )}

                {!data && !loading && (
                    <div style={{ textAlign: 'center', marginTop: 100, opacity: 0.3 }}>
                        <i className="pi pi-envelope" style={{ fontSize: '4rem', marginBottom: 20 }}></i>
                        <div style={{ fontWeight: 800 }}>Enter your email to search for records</div>
                    </div>
                )}
            </div>

            <style>{`
                .p-accordion .p-accordion-header .p-accordion-header-link {
                    background: transparent;
                    border: none;
                    color: var(--text);
                    font-weight: 700;
                    padding: 12px 0;
                    box-shadow: none !important;
                }
                .p-accordion .p-accordion-content {
                    background: transparent;
                    border: none;
                    color: var(--text);
                    padding: 10px 0;
                }
                .card-premium {
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
                }
            `}</style>
        </div>
    );
};

export default StudentResults;
