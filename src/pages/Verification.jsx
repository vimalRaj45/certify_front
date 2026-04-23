import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import toast, { Toaster } from 'react-hot-toast';
import AOS from 'aos';

const API_BASE = import.meta.env.VITE_API_URL || 'https://certify-open.onrender.com';

const STEP_META = {
    hashing: { label: 'Layer 1 · Cryptographic Integrity', icon: 'pi-key', color: '#6366F1', num: 1 },
    parsing: { label: 'Layer 2 · Metadata Extraction', icon: 'pi-database', color: '#0EA5E9', num: 2 },
    registry: { label: 'Layer 3 · Registry Consensus', icon: 'pi-globe', color: '#10B981', num: 3 },
};

const STEP_ORDER = ['hashing', 'parsing', 'registry'];

// Comparison row with entrance animation
const CompareRow = ({ row, index }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), index * 180);
        return () => clearTimeout(t);
    }, [index]);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '130px 1fr 28px',
            gap: '6px 14px',
            alignItems: 'start',
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(-8px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 2 }}>
                {row.label}
            </span>

            <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.5, wordBreak: 'break-all' }}>
                {row.expected !== undefined && (
                    <div style={{ marginBottom: 4 }}>
                        <span style={{ color: '#475569', fontSize: '0.65rem', fontWeight: 900, marginRight: 8, background: 'rgba(255,255,255,0.03)', padding: '1px 4px', borderRadius: 4 }}>EXPECTED</span>
                        <span style={{ color: row.match ? '#94A3B8' : '#FCA5A5', fontWeight: row.match ? 400 : 700 }}>{row.expected}</span>
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    {row.expected !== undefined && (
                        <span style={{ color: row.match ? '#475569' : '#EF4444', fontSize: '0.65rem', fontWeight: 900, background: row.match ? 'rgba(255,255,255,0.03)' : 'rgba(239,68,68,0.1)', padding: '1px 4px', borderRadius: 4 }}>GOT</span>
                    )}
                    <span style={{ color: row.match ? '#6EE7B7' : '#F87171', fontWeight: row.match ? 400 : 700 }}>
                        {row.got}
                    </span>
                </div>
            </div>

            <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: row.match ? '#10B981' : '#EF4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', color: '#fff', fontWeight: 900,
                marginTop: 2, flexShrink: 0,
                boxShadow: `0 2px 6px ${row.match ? '#10B98150' : '#EF444450'}`
            }}>
                {row.match ? '✓' : '✗'}
            </div>
        </div>
    );
};

// Single step card
const StepCard = ({ step }) => {
    const meta = STEP_META[step.id] || { label: step.id, icon: 'pi-circle', color: '#64748B', num: 0 };
    const isWorking = step.status === 'working';
    const isPassed = step.status === 'pass';
    const isFailed = step.status === 'fail';
    const accentColor = isPassed ? '#10B981' : (isFailed ? '#EF4444' : meta.color);

    return (
        <div style={{
            background: '#0F172A',
            border: `1.5px solid ${accentColor}40`,
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: isWorking
                ? `0 0 0 3px ${meta.color}30, 0 4px 20px rgba(0,0,0,0.2)`
                : '0 2px 12px rgba(0,0,0,0.12)',
            transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                borderBottom: step.comparisons?.length ? '1px solid rgba(255,255,255,0.06)' : 'none'
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                    background: `linear-gradient(135deg, ${accentColor}CC, ${accentColor}88)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 14px ${accentColor}50`,
                }}>
                    {isWorking
                        ? <i className="pi pi-spin pi-spinner" style={{ color: '#fff', fontSize: '1rem' }}></i>
                        : <i className={`pi ${isPassed ? 'pi-check' : (isFailed ? 'pi-times' : meta.icon)}`}
                            style={{ color: '#fff', fontSize: '1rem' }}></i>
                    }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                        {meta.label}
                    </div>
                    <div style={{ fontSize: '0.93rem', fontWeight: 700, color: isFailed ? '#FCA5A5' : (isPassed ? '#A7F3D0' : '#E2E8F0'), lineHeight: 1.3 }}>
                        {step.message}
                    </div>
                </div>

                <div style={{
                    padding: '5px 13px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 800,
                    whiteSpace: 'nowrap', flexShrink: 0,
                    background: isPassed ? '#10B98118' : (isFailed ? '#EF444418' : `${meta.color}18`),
                    color: isPassed ? '#34D399' : (isFailed ? '#F87171' : '#A5B4FC'),
                    border: `1px solid ${isPassed ? '#10B98130' : (isFailed ? '#EF444430' : `${meta.color}30`)}`,
                }}>
                    {isWorking ? '⟳ RUNNING' : (isPassed ? '✓ PASSED' : '✗ FAILED')}
                </div>
            </div>

            {step.comparisons?.length > 0 && (
                <div style={{ padding: '10px 20px 14px' }}>
                    {step.comparisons.map((row, i) => (
                        <CompareRow key={i} row={row} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Main page
const VerificationPage = ({ onBack }) => {
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState(null);
    const [steps, setSteps] = useState([]);
    const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' or 'id'
    const [certId, setCertId] = useState('');
    const [turnstileToken, setTurnstileToken] = useState(null);
    const esRef = useRef(null);


    useEffect(() => {
        AOS.init({ duration: 600 });
        
        // Manual Turnstile Render for SPAs
        const renderTurnstile = () => {
            const container = document.getElementById('turnstile-verify');
            if (window.turnstile && container && container.innerHTML === "") {
                try {
                    const siteKey = window.location.hostname === 'localhost' ? "1x00000000000000000000AA" : (import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA");
                    window.turnstile.render('#turnstile-verify', {
                        sitekey: String(siteKey),
                        callback: (token) => setTurnstileToken(token),
                    });
                } catch (e) { console.warn("Turnstile render error:", e); }
            }
        };


        renderTurnstile();
        const interval = setInterval(() => { if (!turnstileToken) renderTurnstile(); }, 2000);

        return () => { 
            if (esRef.current) esRef.current.close(); 
            clearInterval(interval);
        };
    }, [activeTab]);



    const handleBack = () => {
        if (onBack) onBack();
        else window.location.href = '/';
    };

    const pushStep = (id, status, message, comparisons) => {
        setSteps(prev => {
            const idx = prev.findIndex(s => s.id === id);
            const entry = { id, status, message, comparisons: comparisons || [] };
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = entry;
                return next;
            }
            return [...prev, entry];
        });
    };

    const onUpload = async (e) => {
        const file = e.files[0];
        if (!file) return;

        const verifyKey = `v_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        setVerifying(true);
        setResult(null);
        setSteps([]);

        const es = new EventSource(`${API_BASE}/progress?key=${verifyKey}`);
        esRef.current = es;

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type !== 'verify_progress') return;
                pushStep(data.step, data.status, data.message, data.comparisons);
            } catch (_) { }
        };

        const formData = new FormData();
        formData.append('verifyKey', verifyKey);
        formData.append('file', file);
        formData.append('turnstileToken', turnstileToken); // Send token


        try {
            const resp = await axios.post(`${API_BASE}/verify-pdf`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await new Promise(r => setTimeout(r, 600));
            setResult(resp.data);
            if (resp.data.verified) toast.success('Certificate Verified!');
            else toast.error('Verification Failed');
        } catch (err) {
            toast.error('Could not reach the verification server.');
        } finally {
            setVerifying(false);
            es.close();
            esRef.current = null;
        }
    };

    const handleVerifyById = async () => {
        if (!certId.trim()) return toast.error('Please enter a Certificate ID');
        if (!turnstileToken) return toast.error('Please complete the security check');
        setVerifying(true);
        setResult(null);
        setSteps([]);

        try {
            const resp = await axios.get(`${API_BASE}/verify-id/${certId.trim()}?turnstileToken=${turnstileToken}`);
            setResult(resp.data);
            if (resp.data.verified) toast.success('Certificate Found!');
            else toast.error('Certificate Not Found');
        } catch (err) {
            toast.error('Verification failed. Check your ID.');
        } finally {
            setVerifying(false);
        }
    };


    const handleReset = () => { setResult(null); setSteps([]); setCertId(''); };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F0F4FF 0%, #FAF5FF 100%)', padding: '40px 24px', fontFamily: 'Inter, sans-serif' }}>
            <Toaster position="top-center" />
            <style>{`
                @keyframes fadeSlideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                .step-enter { animation: fadeSlideIn 0.35s ease forwards; }
                .tab-btn { padding: 12px 24px; font-weight: 800; font-size: 0.85rem; border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
                .tab-btn.active { background: #3B82F6; color: white; box-shadow: 0 4px 12px rgba(59,130,246,0.25); }
                .tab-btn.inactive { background: #F1F5F9; color: #64748B; }
            `}</style>

            <nav style={{ maxWidth: 780, margin: '0 auto 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={handleBack}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#3B82F6,#A855F7)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="pi pi-verified" style={{ color: '#fff', fontSize: '1rem' }}></i>
                    </div>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.2rem', color: '#0F172A' }}>
                        CertifyPro <span style={{ color: '#3B82F6', fontWeight: 400 }}>Verify</span>
                    </span>
                </div>
                <Button label="Back" icon="pi pi-arrow-left" className="p-button-text p-button-secondary" onClick={handleBack} />
            </nav>

            <div style={{ maxWidth: 780, margin: '0 auto' }}>
                <div style={{ background: '#fff', borderRadius: 28, padding: '40px 32px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', border: '1px solid #E8EDF5', textAlign: 'center', marginBottom: 24 }} data-aos="fade-up">
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.4rem', color: '#0F172A', margin: '0 0 12px' }}>
                        Verification Portal
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
                        Validate certificates instantly via PDF analysis or Registry ID search.
                    </p>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 32, background: '#F8FAFC', padding: 6, borderRadius: 16, width: 'fit-content', marginInline: 'auto' }}>
                        <button className={`tab-btn ${activeTab === 'pdf' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('pdf')}>PDF Upload</button>
                        <button className={`tab-btn ${activeTab === 'id' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('id')}>Search by ID</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, gap: 8 }}>
                        <div id="turnstile-verify" className="cf-turnstile"></div>
                        {!turnstileToken && (
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Security Check Required
                            </span>
                        )}
                    </div>



                    {!verifying && !result && (
                        <>
                            {activeTab === 'pdf' ? (
                                <div style={{ border: '2px dashed #CBD5E1', borderRadius: 20, padding: '36px', background: 'rgba(99,102,241,0.02)', opacity: turnstileToken ? 1 : 0.5, pointerEvents: turnstileToken ? 'auto' : 'none' }}>
                                    <FileUpload mode="basic" name="file" accept="application/pdf" maxFileSize={10000000}
                                        onSelect={onUpload} auto chooseLabel="Upload PDF to Verify"
                                        style={{ borderRadius: 14 }} />
                                    <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: 14 }}>{turnstileToken ? 'Max 10MB · Secure PDF only' : 'Please complete security check first'}</p>
                                </div>

                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ position: 'relative' }}>
                                        <InputText value={certId} onChange={(e) => setCertId(e.target.value)} placeholder="Enter Certificate ID (e.g. SEC-XXXX-XXXX)" 
                                            style={{ width: '100%', padding: '16px 20px', borderRadius: 14, border: '1px solid #E2E8F0', fontSize: '1rem', fontWeight: 600 }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleVerifyById()} />
                                    </div>
                                    <Button label="Search Registry" icon="pi pi-search" onClick={handleVerifyById} 
                                        style={{ width: '100%', borderRadius: 14, padding: '14px', background: '#3B82F6', border: 'none', fontWeight: 800 }} />
                                </div>
                            )}
                        </>
                    )}

                    {!verifying && result && (
                        <Button label="Verify Another" icon="pi pi-refresh" onClick={handleReset}
                            className="p-button-outlined" style={{ borderRadius: 12, fontWeight: 700 }} />
                    )}
                </div>

                {(verifying || steps.length > 0) && activeTab === 'pdf' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                        {verifying && steps.length === 0 && (
                            <div className="step-enter" style={{ background: '#0F172A', border: '1.5px solid #1E293B', borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div className="pi pi-spin pi-spinner" style={{ color: '#6366F1', fontSize: '1.2rem' }}></div>
                                <span style={{ color: '#64748B', fontWeight: 600 }}>Analyzing cryptographic layers...</span>
                            </div>
                        )}
                        {steps.map((step) => (
                            <div key={step.id} className="step-enter">
                                <StepCard step={step} />
                            </div>
                        ))}
                    </div>
                )}

                {result && (
                    <div data-aos="zoom-in" style={{
                        background: result.verified ? 'linear-gradient(135deg,#F0FDF4,#DCFCE7)' : 'linear-gradient(135deg,#FFF5F5,#FEE2E2)',
                        border: `1.5px solid ${result.verified ? '#86EFAC' : '#FCA5A5'}`,
                        borderRadius: 24, padding: '32px', textAlign: 'center'
                    }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                            background: result.verified ? '#10B981' : '#EF4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 12px 28px ${result.verified ? '#10B98140' : '#EF444440'}`
                        }}>
                            <i className={`pi ${result.verified ? 'pi-check' : 'pi-times'}`} style={{ color: '#fff', fontSize: '2rem' }}></i>
                        </div>
                        <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.8rem', margin: '0 0 8px', color: result.verified ? '#064E3B' : '#991B1B' }}>
                            {result.verified ? 'Legitimate Certificate' : 'Verification Failed'}
                        </h2>
                        <p style={{ color: result.verified ? '#065F46' : '#B91C1C', margin: '0 0 24px', fontSize: '0.95rem' }}>
                            {result.verified ? 'This certificate is authentic and on record in our secure registry.' : result.message}
                        </p>

                        {result.verified && result.data && (
                            <div style={{ background: '#fff', borderRadius: 18, padding: '20px 24px', textAlign: 'left', display: 'grid', gap: 14, border: '1px solid #D1FAE5' }}>
                                {[
                                    { label: 'Recipient', value: result.data.name },
                                    { label: 'Issue Date', value: new Date(result.data.date).toLocaleDateString(undefined, { dateStyle: 'full' }) },
                                    { label: 'Registry ID', value: result.data.id, mono: true },
                                ].map(row => (
                                    <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{row.label}</span>
                                        <span style={{ fontWeight: 700, color: row.mono ? '#6366F1' : '#0F172A', fontFamily: row.mono ? 'monospace' : 'inherit', fontSize: row.mono ? '0.82rem' : '1rem' }}>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginTop: 32, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <i className="pi pi-lock" style={{ color: '#10B981', fontSize: '0.75rem' }}></i>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Enterprise Registry Protection · Certify-SSE v2</span>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;

