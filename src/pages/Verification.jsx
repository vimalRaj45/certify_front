import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import toast, { Toaster } from 'react-hot-toast';
import AOS from 'aos';

const API_BASE = 'https://certify-vsgrps.onrender.com';

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
            {/* Label */}
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 2 }}>
                {row.label}
            </span>

            {/* Values */}
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


            {/* Match badge */}
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
            {/* ── Header ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                borderBottom: step.comparisons?.length ? '1px solid rgba(255,255,255,0.06)' : 'none'
            }}>
                {/* Step number + icon */}
                <div style={{
                    width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                    background: `linear-gradient(135deg, ${accentColor}CC, ${accentColor}88)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 14px ${accentColor}50`,
                    transition: 'background 0.4s',
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

                {/* Status pill */}
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

            {/* ── Comparison table (drops in row by row) ── */}
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
    const esRef = useRef(null);

    useEffect(() => {
        AOS.init({ duration: 600 });
        return () => { if (esRef.current) esRef.current.close(); };
    }, []);

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

        const currentApiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'https://certify-vsgrps.onrender.com' : API_BASE;

        const es = new EventSource(`${currentApiBase}/progress?key=${verifyKey}`);
        esRef.current = es;

        // Wait for SSE handshake 'connected'
        await new Promise(resolve => {
            const onConnected = (ev) => {
                if (ev.data === 'connected') { es.removeEventListener('message', onConnected); resolve(); }
            };
            es.addEventListener('message', onConnected);
            es.onerror = () => resolve();
        });

        // Live listener — each SSE event updates or adds a step card
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

        try {
            const resp = await axios.post(`${currentApiBase}/verify-pdf`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await new Promise(r => setTimeout(r, 600));
            setResult(resp.data);
            if (resp.data.verified) toast.success('Certificate Verified!');
            else toast.error('Verification Failed');
        } catch (err) {
            console.error(err);
            toast.error('Could not reach the verification server.');
        } finally {
            setVerifying(false);
            es.close();
            esRef.current = null;
        }
    };

    const handleReset = () => { setResult(null); setSteps([]); };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F0F4FF 0%, #FAF5FF 100%)', padding: '40px 24px', fontFamily: 'Inter, sans-serif' }}>
            <Toaster position="top-center" />
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity:0; transform:translateY(12px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .step-enter { animation: fadeSlideIn 0.35s ease forwards; }
                
                @media (max-width: 768px) {
                    .verify-header h1 { font-size: 1.8rem !important; }
                    .compare-row { grid-template-columns: 1fr 30px !important; }
                    .compare-row span:first-child { grid-column: 1 / -1; margin-bottom: 4px; }
                    .guidelines-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
                    .step-status-pill { padding: 4px 8px !important; font-size: 0.6rem !important; }
                }
            `}</style>

            {/* Nav */}
            <nav style={{ maxWidth: 780, margin: '0 auto 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={onBack}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#3B82F6,#A855F7)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="pi pi-verified" style={{ color: '#fff', fontSize: '1rem' }}></i>
                    </div>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.2rem', color: '#0F172A' }}>
                        CertifyPro <span style={{ color: '#3B82F6', fontWeight: 400 }}>Verify</span>
                    </span>
                </div>
                <Button label="Back" icon="pi pi-arrow-left" className="p-button-text p-button-secondary" onClick={onBack} />
            </nav>

            <div style={{ maxWidth: 780, margin: '0 auto' }}>

                {/* Header card */}
                <div className="verify-header" style={{ background: '#fff', borderRadius: 28, padding: 'clamp(24px, 5vw, 40px) clamp(20px, 4vw, 32px)', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', border: '1px solid #E8EDF5', textAlign: 'center', marginBottom: 24 }} data-aos="fade-up">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EEF2FF', padding: '6px 14px', borderRadius: 20, marginBottom: 18 }}>
                        <i className="pi pi-shield" style={{ color: '#6366F1', fontSize: '0.8rem' }}></i>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4338CA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Security Engine</span>
                    </div>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', color: '#0F172A', margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        Certificate Verification
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
                        Upload a CertifyPro PDF. Our 3-layer security model will compute and show a full cryptographic audit.
                    </p>

                    {/* How it Works / Help Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', textAlign: 'left', marginBottom: '32px', padding: '20px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="pi pi-question-circle" style={{ color: '#3B82F6' }}></i> HOW TO USE
                            </h4>
                            <ul style={{ fontSize: '0.8rem', color: '#64748B', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                                <li>Select the certificate PDF file you wish to validate.</li>
                                <li>Wait for the 3-layer security engine to finish its audit.</li>
                                <li>View the official recipient data directly from our registry.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="pi pi-share-alt" style={{ color: '#A855F7' }}></i> HOW WE SHARE
                            </h4>
                            <ul style={{ fontSize: '0.8rem', color: '#64748B', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                                <li><strong>Direct Email:</strong> Sent via Brevo API.</li>
                                <li><strong>Public Links:</strong> We recommend sharing via Google Drive.</li>
                                <li><strong>Security:</strong> All files are purged after processing.</li>
                            </ul>
                        </div>
                    </div>

                    {!verifying && !result && (
                        <div style={{ border: '2px dashed #CBD5E1', borderRadius: 20, padding: 'clamp(24px, 5vw, 36px)', background: 'rgba(99,102,241,0.02)' }}>
                            <FileUpload mode="basic" name="file" accept="application/pdf" maxFileSize={10000000}
                                onSelect={onUpload} auto chooseLabel="Select Certificate PDF"
                                style={{ borderRadius: 14, width: '100%' }} />
                            <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: 14 }}>Max 10MB · Official PDF only</p>
                        </div>
                    )}

                    {!verifying && result && (
                        <Button label="Verify Another" icon="pi pi-refresh" onClick={handleReset}
                            style={{ borderRadius: 12, fontWeight: 700, background: 'linear-gradient(135deg,#3B82F6,#6366F1)', border: 'none', padding: '12px 24px', width: '100%' }} />
                    )}
                </div>

                {/* Sequential step feed */}
                {(verifying || steps.length > 0) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* Connecting placeholder when no steps yet */}
                        {verifying && steps.length === 0 && (
                            <div className="step-enter" style={{ background: '#0F172A', border: '1.5px solid #1E293B', borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div className="pi pi-spin pi-spinner" style={{ color: '#6366F1', fontSize: '1.2rem' }}></div>
                                <span style={{ color: '#64748B', fontWeight: 600, fontSize: '0.9rem' }}>Initializing security engine...</span>
                            </div>
                        )}

                        {/* Render each step card with entrance animation */}
                        {steps.map((step, idx) => (
                            <div key={step.id} className="step-enter">
                                <StepCard step={step} />
                            </div>
                        ))}

                        {/* Connector line + "next layer" loading dot when current layer passed and next hasn't started */}
                        {verifying && steps.length > 0 && steps[steps.length - 1]?.status === 'pass' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px' }}>
                                <div style={{ width: 2, height: 24, background: 'linear-gradient(180deg,#6366F120,#6366F180)', borderRadius: 2, marginLeft: 18 }}></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div className="pi pi-spin pi-spinner" style={{ color: '#6366F1', fontSize: '0.85rem' }}></div>
                                    <span style={{ color: '#6366F1', fontSize: '0.8rem', fontWeight: 700 }}>
                                        Running Layer{' '}{steps.length + 1}...
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Final result card */}
                {result && (
                    <div data-aos="zoom-in" style={{
                        marginTop: 20,
                        background: result.verified ? 'linear-gradient(135deg,#F0FDF4,#DCFCE7)' : 'linear-gradient(135deg,#FFF5F5,#FEE2E2)',
                        border: `1.5px solid ${result.verified ? '#86EFAC' : '#FCA5A5'}`,
                        borderRadius: 24, padding: 'clamp(24px, 5vw, 32px)', textAlign: 'center'
                    }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                            background: result.verified ? '#10B981' : '#EF4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 12px 28px ${result.verified ? '#10B98140' : '#EF444440'}`
                        }}>
                            <i className={`pi ${result.verified ? 'pi-check' : (result.message?.includes('SECURITY ALERT') ? 'pi-shield' : 'pi-times')}`}
                                style={{ color: '#fff', fontSize: '1.8rem' }}></i>
                        </div>
                        <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', margin: '0 0 8px', color: result.verified ? '#064E3B' : '#991B1B' }}>
                            {result.verified ? '✅ Authenticated' : (result.message?.includes('SECURITY ALERT') ? '🚨 Tampered' : '❌ Failed')}
                        </h2>
                        <p style={{ color: result.verified ? '#065F46' : '#B91C1C', margin: '0 0 24px', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            {result.verified ? 'This certificate is authentic and on record in our secure registry.' : result.message}
                        </p>

                        {result.verified && result.data && (
                            <>
                                <div style={{ background: '#fff', borderRadius: 18, padding: '20px', textAlign: 'left', display: 'grid', gap: 14, border: '1px solid #D1FAE5' }}>
                                    {[
                                        { label: 'Recipient', value: result.data.name },
                                        { label: 'Issue Date', value: new Date(result.data.date).toLocaleDateString(undefined, { dateStyle: 'medium' }) },
                                        { label: 'Cert ID', value: result.data.id, mono: true },
                                    ].map(row => (
                                        <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 8, alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{row.label}</span>
                                            <span style={{ fontWeight: 700, color: row.mono ? '#6366F1' : '#0F172A', fontFamily: row.mono ? 'monospace' : 'inherit', fontSize: row.mono ? '0.75rem' : '0.9rem', wordBreak: 'break-all' }}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Dos and Don'ts Section */}
                                <div style={{ marginTop: '24px', textAlign: 'left', borderTop: '1px solid #D1FAE5', paddingTop: '20px' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#064E3B', marginBottom: '16px', letterSpacing: '0.02em' }}>USAGE GUIDELINES</h4>
                                    <div className="guidelines-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div>
                                            <div style={{ color: '#059669', fontSize: '0.7rem', fontWeight: 900, marginBottom: '8px' }}>✅ THE DOS</div>
                                            <ul style={{ fontSize: '0.75rem', color: '#065F46', paddingLeft: '16px', margin: 0, lineHeight: 1.5 }}>
                                                <li>Share your ID on LinkedIn/CV.</li>
                                                <li>Keep the original PDF file safe.</li>
                                                <li>Use this page for official proof.</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <div style={{ color: '#DC2626', fontSize: '0.7rem', fontWeight: 900, marginBottom: '8px' }}>❌ THE DON'TS</div>
                                            <ul style={{ fontSize: '0.75rem', color: '#991B1B', paddingLeft: '16px', margin: 0, lineHeight: 1.5 }}>
                                                <li>Never edit the PDF text or images.</li>
                                                <li>Don't compress/shrink the file.</li>
                                                <li>Don't remove system watermarks.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div style={{ marginTop: 32, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <i className="pi pi-lock" style={{ color: '#10B981', fontSize: '0.75rem' }}></i>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Enterprise Bank-Grade Security · Certify-SSE v2</span>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;
