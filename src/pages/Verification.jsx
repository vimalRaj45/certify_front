import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import toast, { Toaster } from 'react-hot-toast';
import AOS from 'aos';

const API_BASE = import.meta.env.VITE_API_URL || 'https://certify-vsgrps.onrender.com';

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

        // Check for ?id= in URL for instant verification
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            handleInstantVerify(id);
        }

        return () => { if (esRef.current) esRef.current.close(); };
    }, []);

    const handleInstantVerify = async (id) => {
        setVerifying(true);
        setSteps([{ id: 'registry', status: 'working', message: 'Querying official registry by ID...' }]);

        const currentApiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5000' : API_BASE;

        try {
            const resp = await axios.get(`${currentApiBase}/verify-id?id=${id}`);
            setSteps([{
                id: 'registry', status: 'pass', message: 'Registry record found and validated.', comparisons: [
                    { label: 'Cert ID', got: id, match: true },
                    { label: 'Registry Hit', got: '1 record found', match: true }
                ]
            }]);
            setResult(resp.data);
            toast.success('Certificate Verified via Registry!');
        } catch (err) {
            setSteps([{ id: 'registry', status: 'fail', message: err.response?.data?.error || 'Certificate not found in registry.' }]);
            toast.error('Verification Failed');
        } finally {
            setVerifying(false);
        }
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

        const currentApiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5000' : API_BASE;

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
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px 24px', fontFamily: 'Inter, sans-serif' }}>
            <Toaster position="top-center" />
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity:0; transform:translateY(12px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .step-enter { animation: fadeSlideIn 0.35s ease forwards; }
            `}</style>

            {/* Nav */}
            <nav style={{ maxWidth: 780, margin: '0 auto 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={onBack}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#3B82F6,#A855F7)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="pi pi-verified" style={{ color: '#fff', fontSize: '1rem' }}></i>
                    </div>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.2rem', color: 'var(--text)' }}>
                        CertifyPro <span style={{ color: 'var(--accent)', fontWeight: 400 }}>Verify</span>
                    </span>
                </div>
                <Button label="Back to Home" icon="pi pi-arrow-left" className="p-button-text p-button-secondary" onClick={onBack} />
            </nav>

            <div style={{ maxWidth: 780, margin: '0 auto' }}>

                {/* Header card */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 28, padding: '40px 32px 32px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)', textAlign: 'center', marginBottom: 24 }} data-aos="fade-up">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(59, 130, 246, 0.1)', padding: '6px 14px', borderRadius: 20, marginBottom: 18, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <i className="pi pi-shield" style={{ color: 'var(--accent)', fontSize: '0.8rem' }}></i>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Multi-Layer Security Engine</span>
                    </div>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.4rem', color: 'var(--text)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                        Certificate Verification
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
                        Upload a CertifyPro PDF. Each security layer computes, shows its full comparison, then passes control to the next.
                    </p>

                    {/* How it Works / Help Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'left', marginBottom: '32px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="pi pi-question-circle" style={{ color: 'var(--accent)' }}></i> HOW TO USE
                            </h4>
                            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                                <li>Select the certificate PDF file you wish to validate.</li>
                                <li>Wait for the 3-layer security engine to finish its audit.</li>
                                <li>View the official recipient data directly from our registry.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="pi pi-share-alt" style={{ color: 'var(--purple)' }}></i> HOW WE SHARE
                            </h4>
                            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                                <li><strong>Direct Email:</strong> Auto-sent to participants via Nodemailer Gmail Service.</li>
                                <li><strong>Secure ZIP:</strong> Bulk download available after generation.</li>
                                <li><strong>Public Links:</strong> We recommend uploading to Drive/Cloud and sharing the link.</li>
                            </ul>
                        </div>
                    </div>

                    {!verifying && !result && (
                        <div style={{ border: '2px dashed #CBD5E1', borderRadius: 20, padding: '36px', background: 'rgba(99,102,241,0.02)' }}>
                            <FileUpload mode="basic" name="file" accept="application/pdf" maxFileSize={10000000}
                                onSelect={onUpload} auto chooseLabel="Choose PDF Certificate to Verify"
                                style={{ borderRadius: 14 }} />
                            <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: 14 }}>Max 10MB · PDF only</p>
                        </div>
                    )}

                    {!verifying && result && (
                        <Button label="Verify Another Certificate" icon="pi pi-refresh" onClick={handleReset}
                            style={{ borderRadius: 12, fontWeight: 700, background: 'linear-gradient(135deg,#3B82F6,#6366F1)', border: 'none', padding: '12px 24px' }} />
                    )}
                </div>

                {/* Sequential step feed */}
                {(verifying || steps.length > 0) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* Connecting placeholder when no steps yet */}
                        {verifying && steps.length === 0 && (
                            <div className="step-enter" style={{ background: '#0F172A', border: '1.5px solid #1E293B', borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div className="pi pi-spin pi-spinner" style={{ color: '#6366F1', fontSize: '1.2rem' }}></div>
                                <span style={{ color: '#64748B', fontWeight: 600 }}>Connecting to security engine...</span>
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
                                    <span style={{ color: '#6366F1', fontSize: '0.82rem', fontWeight: 700 }}>
                                        Running{' '}
                                        {(() => {
                                            const doneIds = steps.map(s => s.id);
                                            const next = STEP_ORDER.find(s => !doneIds.includes(s));
                                            return next ? STEP_META[next]?.label : 'final checks';
                                        })()}...
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
                        background: result.verified ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1.5px solid ${result.verified ? '#10B981' : '#EF4444'}`,
                        borderRadius: 24, padding: '32px', textAlign: 'center'
                    }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                            background: result.verified ? '#10B981' : '#EF4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 12px 28px ${result.verified ? '#10B98140' : '#EF444440'}`
                        }}>
                            <i className={`pi ${result.verified ? 'pi-check' : (result.message?.includes('SECURITY ALERT') ? 'pi-shield' : 'pi-times')}`}
                                style={{ color: '#fff', fontSize: '2rem' }}></i>
                        </div>
                        <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.8rem', margin: '0 0 8px', color: result.verified ? 'var(--text)' : 'var(--red)' }}>
                            {result.verified ? '✅ Legitimate Certificate' : (result.message?.includes('SECURITY ALERT') ? '🚨 Tampered Document' : '❌ Verification Failed')}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            {result.verified ? 'This certificate is authentic and on record in our secure registry.' : result.message}
                        </p>

                        {result.verified && result.data && (
                            <>
                                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 18, padding: '20px 24px', textAlign: 'left', display: 'grid', gap: 14, border: '1px solid var(--border)' }}>
                                    {[
                                        { label: 'Recipient', value: result.data.name },
                                        { label: 'Issue Date', value: new Date(result.data.date).toLocaleDateString(undefined, { dateStyle: 'full' }) },
                                        { label: 'Certificate ID', value: result.data.id, mono: true },
                                    ].map(row => (
                                        <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{row.label}</span>
                                            <span style={{ fontWeight: 700, color: row.mono ? 'var(--accent)' : 'var(--text)', fontFamily: row.mono ? 'monospace' : 'inherit', fontSize: row.mono ? '0.82rem' : '1rem', wordBreak: 'break-all' }}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Dos and Don'ts Section */}
                                <div style={{ marginTop: '24px', textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text)', marginBottom: '16px', letterSpacing: '0.02em' }}>CERTIFICATE USAGE GUIDELINES</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div>
                                            <div style={{ color: 'var(--green)', fontSize: '0.75rem', fontWeight: 900, marginBottom: '8px' }}>✅ THE DOS</div>
                                            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '16px', margin: 0, lineHeight: 1.5 }}>
                                                <li>Share your ID on LinkedIn/CV.</li>
                                                <li>Keep the original PDF file safe.</li>
                                                <li>Use this page for official proof.</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--red)', fontSize: '0.75rem', fontWeight: 900, marginBottom: '8px' }}>❌ THE DON'TS</div>
                                            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '16px', margin: 0, lineHeight: 1.5 }}>
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
