import React, { useState, useEffect, useRef } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { ColorPicker } from 'primereact/colorpicker';
import { ProgressBar } from 'primereact/progressbar';
import toast, { Toaster } from 'react-hot-toast';
import { Dialog } from 'primereact/dialog';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import gsap from 'gsap';
import AOS from 'aos';
import LandingPage from './pages/LandingPage';
import Signin from './pages/Signin';
import VerificationPage from './pages/Verification';
import Loader from './components/Loader';
import quizApi from './services/quizApi';

const API_BASE = import.meta.env.VITE_API_URL || 'https://certify-vsgrps.onrender.com';

const DraggableField = ({ field, isSelected, onClick, handleDragStop, updateFieldSize, updateFieldColor, removeField }) => {
    const nodeRef = useRef(null);
    return (
        <Draggable
            nodeRef={nodeRef}
            bounds="parent"
            position={{ x: field.x, y: field.y }}
            onStop={(e, data) => handleDragStop(field.field, data)}
            onDrag={(e, data) => handleDragStop(field.field, data)}
        >
            <div
                ref={nodeRef}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                style={{
                    position: 'absolute', padding: '8px 16px', cursor: 'grab', userSelect: 'none',
                    background: isSelected ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.4)',
                    borderRadius: 10, fontSize: `${field.size}px`, color: field.color,
                    fontWeight: field.fontWeight === 'light' ? 300 : (field.fontWeight === 'medium' ? 500 : (field.fontWeight === 'black' ? 900 : (field.fontWeight === 'bold' ? 700 : 400))),
                    fontFamily: field.fontFamily || 'sans-serif',
                    textAlign: field.textAlign || 'left',
                    letterSpacing: `${field.letterSpacing || 0}px`,
                    minWidth: 60, zIndex: isSelected ? 40 : 20,
                    backdropFilter: 'blur(8px)',
                    boxShadow: isSelected ? '0 10px 25px rgba(37,99,235,0.2)' : 'none',
                    transition: 'border 0.2s, background 0.2s, box-shadow 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: field.textAlign === 'center' ? 'center' : (field.textAlign === 'right' ? 'flex-end' : 'flex-start')
                }}
            >
                {isSelected && (
                    <div style={{
                        position: 'absolute', bottom: 'calc(100% + 15px)', left: '50%', transform: 'translateX(-50%)',
                        background: '#070D1F', borderRadius: 12, padding: '6px 10px',
                        display: 'flex', alignItems: 'center', gap: 8, zIndex: 100,
                        boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        animation: 'fadeInUp 0.2s ease-out'
                    }}>
                        <style>{`
                            @keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
                        `}</style>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 6, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                            <Button icon="pi pi-minus" className="p-button-rounded p-button-text p-button-sm p-button-secondary"
                                style={{ width: 24, height: 24, color: '#fff' }} onClick={(e) => { e.stopPropagation(); updateFieldSize(Math.max(8, field.size - 2)); }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.8)', minWidth: 24 }}>{field.size}</span>
                            <Button icon="pi pi-plus" className="p-button-rounded p-button-text p-button-sm p-button-secondary"
                                style={{ width: 24, height: 24, color: '#fff' }} onClick={(e) => { e.stopPropagation(); updateFieldSize(Math.min(100, field.size + 2)); }} />
                        </div>
                        <div style={{ padding: '0 4px', position: 'relative' }}>
                            <ColorPicker value={field.color} onChange={(e) => { updateFieldColor(`#${e.value}`); }}
                                style={{ width: 20, height: 20 }} />
                        </div>
                        <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-sm p-button-danger"
                            style={{ width: 24, height: 24, marginLeft: 4 }} onClick={(e) => { e.stopPropagation(); removeField(); }} />
                        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #070D1F' }}></div>
                    </div>
                )}

                <div style={{
                    position: 'absolute', top: -16, left: 0,
                    fontSize: '0.6rem', fontWeight: 800,
                    color: isSelected ? '#2563EB' : '#94A3B8',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                    {field.field}
                </div>

                {isSelected && (
                    <>
                        <div style={{ position: 'absolute', top: -3, left: -3, width: 6, height: 6, background: '#2563EB', borderRadius: '50%' }}></div>
                        <div style={{ position: 'absolute', top: -3, right: -3, width: 6, height: 6, background: '#2563EB', borderRadius: '50%' }}></div>
                        <div style={{ position: 'absolute', bottom: -3, left: -3, width: 6, height: 6, background: '#2563EB', borderRadius: '50%' }}></div>
                        <div style={{ position: 'absolute', bottom: -3, right: -3, width: 6, height: 6, background: '#2563EB', borderRadius: '50%' }}></div>
                    </>
                )}

                {field.field}
            </div>
        </Draggable>
    );
};

function CertifyStudio() {
    const navigate = useNavigate();
    const [csvData, setCsvData] = useState(null);
    const [templateUrl, setTemplateUrl] = useState('');
    const [publicId, setPublicId] = useState('');
    const [fields, setFields] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(null);
    const [queueState, setQueueState] = useState({ activeJob: null, queue: [] });
    const [showApp, setShowApp] = useState(false);
    const [showVerify, setShowVerify] = useState(false);
    const [genKey, setGenKey] = useState(null);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [activeFieldId, setActiveFieldId] = useState(null);
    const [canvasScale, setCanvasScale] = useState(1);
    const [canvasZoom, setCanvasZoom] = useState(1);
    const [forceDesktop, setForceDesktop] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));
    const [viewModeSelected, setViewModeSelected] = useState(false);
    const [eventSource, setEventSource] = useState(null);

    const [useCustomSize, setUseCustomSize] = useState(false);
    const [customWidth, setCustomWidth] = useState(600);
    const [customHeight, setCustomHeight] = useState(400);
    const [user, setUser] = useState(null);
    const [showQuizImport, setShowQuizImport] = useState(false);
    const [availableQuizzes, setAvailableQuizzes] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    };
    useEffect(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        if (meta) {
            if (showApp && (isMobile || forceDesktop)) {
                meta.setAttribute('content', 'width=1200, initial-scale=0.3, maximum-scale=5, user-scalable=yes');
            } else {
                meta.setAttribute('content', 'width=device-width, initial-scale=1');
            }
        }
    }, [showApp, isMobile, forceDesktop]);

    useEffect(() => {
        const handleResize = () => {
            const viewport = document.querySelector('.canvas-viewport-inner');
            if (viewport) {
                const availableWidth = viewport.offsetWidth - 32;
                const targetW = useCustomSize ? customWidth : 600;
                setCanvasScale(availableWidth < targetW ? availableWidth / targetW : 1);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [showApp, useCustomSize, customWidth]);

    const [isUploading, setIsUploading] = useState(false);
    const [showDownload, setShowDownload] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState('');

    useEffect(() => {
        if (showDownload && downloadUrl) {
            toast("Generation Complete! Your ZIP will download in 1.5s...", {
                icon: '⏳',
                duration: 2000,
                style: { borderRadius: '12px', background: '#059669', color: '#fff', fontWeight: 700 }
            });

            const timer = setTimeout(() => {
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `certificates_batch.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success("Download started!", {
                    icon: '🚀',
                    style: { borderRadius: '12px', background: '#070D1F', color: '#fff' }
                });
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [showDownload, downloadUrl]);

    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        AOS.init({ duration: 700, once: true });
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isGenerating) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isGenerating]);

    // Cleanup EventSource on unmount
    useEffect(() => {
        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [eventSource]);

    const onCsvUpload = async (e) => {
        const formData = new FormData();
        formData.append('csv', e.files[0]);
        setIsUploading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const res = await axios.post(`${API_BASE}/upload-csv`, formData);
            setCsvData(res.data);
            toast.success(`${res.data.participants.length} participants found.`, { duration: 3000 });
        } catch (err) {
            toast.error(err.response?.data?.error || err.message, { duration: 5000 });
        } finally {
            setIsUploading(false);
        }
    };

    const onTemplateUpload = async (e) => {
        const file = e.files[0];

        if (file.type !== 'image/jpeg') {
            toast.error("Format Error: Only JPEG/JPG templates are supported for high-speed generation.", { icon: '🚫' });
            return;
        }

        const validateImage = (imgFile) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                const objectUrl = URL.createObjectURL(imgFile);
                img.onload = () => {
                    URL.revokeObjectURL(objectUrl);
                    if (img.width > 2500 || img.height > 2500) {
                        reject(`High-resolution image (${img.width}x${img.height}) detected! Max allowed is 2500x2500 pixels for optimal stability.`);
                    } else {
                        resolve();
                    }
                };
                img.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    reject("Invalid image format or corrupted file.");
                };
                img.src = objectUrl;
            });
        };

        setIsUploading(true);
        try {
            await validateImage(file);
            const formData = new FormData();
            formData.append('template', file);

            await new Promise(resolve => setTimeout(resolve, 800));
            const res = await axios.post(`${API_BASE}/upload-template`, formData);
            const tmplUrl = res.data.templateUrl;
            setTemplateUrl(tmplUrl);
            setPublicId(res.data.publicId);

            toast.success('Template linked to canvas.', {
                icon: '🖼️',
                duration: 3000,
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });
        } catch (err) {
            toast.error(err.message || 'Resolution check failed', {
                icon: '⚠️',
                duration: 5000,
                style: { borderRadius: '12px', background: '#7f1d1d', color: '#fff' }
            });
        } finally {
            setIsUploading(false);
        }
    };

    const addField = (fieldName) => {
        if (fields.find(f => f.field === fieldName)) return;
        setFields([...fields, {
            field: fieldName,
            x: 50,
            y: 50,
            size: 24,
            color: '#000000',
            fontFamily: 'NotoSans',
            fontWeight: 'normal',
            textAlign: 'left',
            letterSpacing: 0
        }]);
    };

    const handleDragStop = (fieldName, data) => {
        setFields(fields.map(f => f.field === fieldName ? { ...f, x: data.x, y: data.y } : f));
    };

    const nudge = (dx, dy) => {
        if (!activeFieldId) return;
        setFields(fields.map(f => f.field === activeFieldId ? { ...f, x: Math.max(0, f.x + dx), y: Math.max(0, (f.y || 50) + dy) } : f));
    };

    const generatePreview = async () => {
        if (!csvData || !templateUrl) return;
        setIsPreviewing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const res = await axios.post(`${API_BASE}/preview-pdf`, {
                participant: csvData.participants[0], templateUrl, fields,
                customDimensions: useCustomSize ? { width: customWidth, height: customHeight } : null
            }, { responseType: 'blob' });

            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `Preview_${csvData.participants[0][Object.keys(csvData.participants[0])[0]] || 'Certificate'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Preview sample downloaded successfully.', { icon: '📄' });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsPreviewing(false);
        }
    };

    const startGeneration = async () => {
        if (!csvData || !templateUrl) return;
        setIsGenerating(true);
        setProgress({ stage: 'starting', task: 'Initializing...' });
        setShowDownload(false);
        setQueueState({ activeJob: null, queue: [] });

        try {
            const res = await axios.post(`${API_BASE}/generate`, {
                participants: csvData.participants, templateUrl, publicId, fields,
                customDimensions: useCustomSize ? { width: customWidth, height: customHeight } : null
            });
            const key = res.data.key;
            setGenKey(key);

            // Close existing connection if any
            if (eventSource) {
                eventSource.close();
            }

            const es = new EventSource(`${API_BASE}/progress?key=${key}`);
            setEventSource(es);

            es.onmessage = (e) => {
                if (e.data === 'connected') return;

                try {
                    const data = JSON.parse(e.data);

                    if (data.type === 'ping') return;

                    // Handle queue updates
                    if (data.type === 'queue_update') {
                        setQueueState(data.data);

                        // Find current user's position in queue
                        const userQueueItem = data.data.queue.find(item => item.key === key);
                        const userPosition = userQueueItem ? userQueueItem.position : null;

                        if (userPosition) {
                            setProgress({
                                stage: 'queued',
                                task: userPosition === 1 ? "You are NEXT in line!" : `Position #${userPosition} in queue`,
                                position: userPosition,
                                totalInQueue: data.data.queue.length,
                                activeJob: data.data.activeJob,
                                estimatedWaitTime: userPosition * 30
                            });
                        } else if (data.data.activeJob && data.data.activeJob.key === key) {
                            setProgress(prev => ({
                                ...prev,
                                stage: 'processing',
                                task: prev?.task || 'Processing your certificates...'
                            }));
                        }
                        return;
                    }

                    // Handle regular progress updates
                    setProgress(prev => {
                        const newProgress = { ...prev, ...data };

                        if (data.stage === 'processing' && data.percent !== undefined) {
                            setQueueState(qs => ({
                                ...qs,
                                activeJob: qs.activeJob ? {
                                    ...qs.activeJob,
                                    progress: { ...qs.activeJob.progress, ...data }
                                } : qs.activeJob
                            }));
                        }

                        return newProgress;
                    });

                    if (data.stage === 'completed') {
                        const fullUrl = `${API_BASE}${data.downloadUrl}`;
                        setDownloadUrl(fullUrl);
                        setShowDownload(true);
                        setIsGenerating(false);
                        es.close();
                        setEventSource(null);
                    }

                    if (data.stage === 'error' || data.stage === 'cancelled') {
                        setIsGenerating(false);
                        toast.error(data.message || 'Generation failed');
                        es.close();
                        setEventSource(null);
                    }
                } catch (parseErr) {
                    console.error('Failed to parse SSE data:', parseErr);
                }
            };

            es.onerror = (err) => {
                console.error('SSE Error:', err);
                es.close();
                setEventSource(null);
                setIsGenerating(false);
                toast.error('Connection lost. Please check your generation status.');
            };

        } catch (err) {
            setIsGenerating(false);
            toast.error(err.message);
        }
    };

    const handleQuizImport = async (quizId) => {
        try {
            setIsUploading(true);
            const data = await quizApi.exportQuizResults(quizId);
            if (data.success) {
                setCsvData(data);
                setShowQuizImport(false);
                toast.success(`Imported ${data.participants.length} results from quiz.`, {
                    icon: '📊',
                    style: { borderRadius: '12px', background: '#070D1F', color: '#fff' }
                });
            }
        } catch (err) {
            toast.error("Failed to fetch quiz results");
        } finally {
            setIsUploading(false);
        }
    };

    const openQuizImport = async () => {
        try {
            const data = await quizApi.getQuizzes();
            if (data.success) {
                setAvailableQuizzes(data.quizzes);
                setShowQuizImport(true);
            }
        } catch (err) {
            toast.error("Failed to load quizzes");
        }
    };

    const stopGeneration = async () => {
        try {
            await axios.post(`${API_BASE}/stop-generate`, { key: genKey });
            toast.success('Generation stopped successfully');
            if (eventSource) {
                eventSource.close();
                setEventSource(null);
            }
        } catch (err) {
            console.error('Stop failed:', err);
        }
        setIsGenerating(false);
        setProgress(null);
    };

    const handleDownload = () => {
        window.open(downloadUrl);
        toast('All files being purged from cloud.', { icon: 'ℹ️', duration: 4000 });
        setTimeout(async () => {
            try {
                await axios.post(`${API_BASE}/cleanup`, { key: genKey, publicId });
            } catch { }
        }, 5000);
    };

    if (showVerify) return <VerificationPage onBack={() => setShowVerify(false)} />;
    if (!user) return <Signin onLogin={setUser} />;
    if (!showApp) return <LandingPage onStartApp={() => setShowApp(true)} onVerify={() => setShowVerify(true)} user={user} />;

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <Toaster position="top-center" />

            <div className="main-content" style={{ marginLeft: 0 }}>
                {/* Mobile Viewmode Dialog */}
                <Dialog
                    header="Experience Optimization"
                    visible={isMobile && !viewModeSelected && showApp}
                    onHide={() => setViewModeSelected(true)}
                    style={{ width: '90vw', maxWidth: 450 }}
                    closable={false}
                    footer={(
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                            <Button label="Stay in Mobile" className="p-button-text p-button-secondary" size="small" onClick={() => setViewModeSelected(true)} />
                            <Button label="Switch to Desktop" icon="pi pi-desktop" size="small" style={{ background: '#2563EB', borderRadius: 50, padding: '8px 16px' }}
                                onClick={() => { setForceDesktop(true); setViewModeSelected(true); }} />
                        </div>
                    )}
                >
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{
                            width: 60, height: 60, background: 'rgba(37,99,235,0.1)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 20px'
                        }}>
                            <i className="pi pi-desktop" style={{ fontSize: '1.8rem', color: '#2563EB' }}></i>
                        </div>
                        <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: 12 }}>Precision Design Awaits</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            For the most accurate certificate mapping and industrial-grade precision, we recommend using <strong>Desktop Mode</strong>.
                        </p>
                        <ul style={{ textAlign: 'left', fontSize: '0.85rem', color: '#475569', marginTop: 16, paddingLeft: 20 }}>
                            <li>Full-scale canvas view (no zooming needed)</li>
                            <li>Advanced toolbar positioning</li>
                            <li>Pixel-perfect field snapping</li>
                        </ul>
                    </div>
                </Dialog>

                {/* Topbar */}
                <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#fff', borderBottom: '1px solid #F1F5F9', position: 'relative' }}>

                    {/* Left Section: Logo & Exit */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Button icon="pi pi-arrow-left" className="p-button-text p-button-secondary"
                            onClick={() => setShowApp(false)} tooltip="Exit Console"
                            style={{ borderRadius: 12, width: 38, height: 38 }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 34, height: 34,
                                background: 'linear-gradient(135deg, #3B82F6, #A855F7)',
                                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(59,130,246,0.2)'
                            }} className="mobile-hide">
                                <i className="pi pi-bolt" style={{ fontSize: '1rem', color: '#fff' }}></i>
                            </div>
                            <div style={{ lineHeight: 1.1 }}>
                                <h2 style={{ fontSize: '0.92rem', fontWeight: 900, fontFamily: 'Outfit', margin: 0, color: '#0F172A', letterSpacing: '-0.01em' }}>CertifyPro</h2>
                                <div style={{ fontSize: '0.55rem', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }} className="mobile-hide">Generation Studio</div>
                            </div>
                        </div>
                    </div>

                    {/* Center Section: Progress or System Status */}
                    <div className="topbar-center" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div className="mobile-hide" style={{ display: 'flex', gap: 8, background: '#F8FAFC', padding: '4px', borderRadius: 50, border: '1px solid #E2E8F0' }}>
                            {[{ label: 'Import', step: 1, done: !!csvData && !!templateUrl }, { label: 'Configure', step: 2, done: fields.length > 0 }, { label: 'Generate', step: 3, done: false }].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50,
                                        background: s.done ? 'rgba(16,185,129,0.08)' : (s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? '#fff' : 'transparent'),
                                        border: s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? '1.5px solid #2563EB' : '1px solid transparent',
                                        boxShadow: s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? '0 4px 10px rgba(37,99,235,0.1)' : 'none',
                                    }}>
                                        <div style={{
                                            width: 6, height: 6, borderRadius: '50%',
                                            background: s.done ? '#10B981' : (s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? '#2563EB' : '#94A3B8')
                                        }}></div>
                                        <span style={{
                                            fontSize: '0.72rem', fontWeight: 800,
                                            color: s.done ? '#10B981' : (s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? '#2563EB' : '#94A3B8'),
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < 2 && <i className="pi pi-chevron-right" style={{ fontSize: '0.5rem', color: '#CBD5E1', margin: '0 2px' }}></i>}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 12px #10B98180' }}></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }} className="mobile-hide">SYSTEM ONLINE</span>
                        </div>
                    </div>

                    {/* Right Section: Actions & Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Button label="Guide" icon="pi pi-book" size="small" className="p-button-text p-button-secondary mobile-hide"
                            style={{ borderRadius: 50 }}
                            onClick={() => navigate('/guide')} />
                        <Button label="Quiz Hub" icon="pi pi-bolt" size="small" className="mobile-hide"
                            style={{ borderRadius: 50, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', border: 'none' }}
                            onClick={() => navigate('/quiz')} />

                        <div className="mobile-hide" style={{ width: 1, height: 24, background: '#E2E8F0', margin: '0 4px' }}></div>

                        {isGenerating && (
                            <Button icon="pi pi-stop-circle" size="small" className="p-button-danger p-button-text" onClick={stopGeneration} style={{ borderRadius: 50 }} />
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={logout}>
                            <img src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff`}
                                alt={user?.name} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #3B82F6' }} />
                            <div className="mobile-hide" style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{user?.name}</div>
                                <div style={{ fontSize: '0.55rem', color: '#94A3B8', fontWeight: 700 }}>Workspace Owner</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Dashboard */}
                <div style={{ padding: '20px 24px 0' }}>
                    <style>{`
                        @keyframes kpiPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.2); } 50% { box-shadow: 0 0 0 8px rgba(59,130,246,0); } }
                        .kpi-card { background: #fff; border-radius: 20px; padding: 20px; border: 1px solid #F1F5F9; transition: all 0.3s; }
                        .kpi-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -12px rgba(0,0,0,0.08); }
                        .step-wizard-card { background: #fff; border-radius: 24px; padding: 28px; border: 1px solid #F1F5F9; transition: all 0.3s; }
                        .step-wizard-card:hover { box-shadow: 0 20px 40px -12px rgba(0,0,0,0.06); }
                        .step-number { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 900; font-family: 'Outfit'; }
                        .field-chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; background: #F8FAFC; border: 1px solid #E2E8F0; font-size: 0.8rem; font-weight: 700; color: #334155; cursor: pointer; transition: all 0.2s; }
                        .field-chip:hover { background: rgba(59,130,246,0.08); border-color: #3B82F6; color: #3B82F6; }
                        .field-chip.mapped { background: rgba(59,130,246,0.06); border-color: rgba(59,130,246,0.3); color: #2563EB; }
                        .action-btn-primary { background: linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #A855F7 100%); background-size: 200% auto; border: none; border-radius: 16px; color: #fff; font-weight: 800; font-size: 1rem; padding: 16px 32px; cursor: pointer; width: 100%; transition: all 0.4s ease; display: flex; align-items: center; justify-content: center; gap: 10px; }
                        .action-btn-primary:hover { background-position: right center; transform: translateY(-2px); }
                        .action-btn-secondary { background: #fff; border: 1.5px solid #E2E8F0; border-radius: 16px; color: #334155; font-weight: 700; font-size: 0.95rem; padding: 14px 24px; cursor: pointer; width: 100%; transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 10px; }
                        .action-btn-secondary:hover { border-color: #3B82F6; color: #3B82F6; }
                        .upload-zone-premium { border: 2px dashed #E2E8F0; border-radius: 16px; padding: 20px; transition: all 0.25s; cursor: pointer; background: linear-gradient(135deg, rgba(59,130,246,0.01), rgba(168,85,247,0.01)); }
                        .upload-zone-premium:hover { border-color: #3B82F6; background: rgba(59,130,246,0.03); }
                        
                        @media (max-width: 768px) { 
                            .mobile-hide { display: none !important; } 
                            .topbar-center { display: none !important; }
                            .kpi-grid { grid-template-columns: 1fr 1fr !important; }
                            .main-studio-grid { grid-template-columns: 1fr !important; }
                            .step-wizard-card { padding: 18px !important; }
                        }
                        @media (max-width: 480px) {
                            .kpi-grid { grid-template-columns: 1fr !important; }
                        }
                        
                        .canvas-viewport::-webkit-scrollbar { height: 6px; }
                        .canvas-viewport::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 10px; }
                        .canvas-viewport::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 10px; }
                    `}</style>

                    <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        <div className="kpi-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #3B82F6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="pi pi-users" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                                </div>
                                {csvData && <div style={{ background: '#D1FAE5', color: '#059669', padding: '2px 8px', borderRadius: 999, fontSize: '0.6rem', fontWeight: 800 }}>LOADED</div>}
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit', color: '#0F172A', lineHeight: 1 }}>{csvData?.participants?.length || 0}</div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Total Records</div>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #A855F7, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="pi pi-link" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                                </div>
                                {fields.length > 0 && <div style={{ background: '#F3E8FF', color: '#9333EA', padding: '2px 8px', borderRadius: 999, fontSize: '0.6rem', fontWeight: 800 }}>ACTIVE</div>}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit', color: '#0F172A', lineHeight: 1 }}>{fields.length}</div>
                                    {csvData && csvData.columns && <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1' }}>/ {csvData.columns.length}</div>}
                                </div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Mapped Fields</div>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: templateUrl ? 'linear-gradient(135deg, #10B981, #34D399)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className={`pi ${templateUrl ? 'pi-verified' : 'pi-image'}`} style={{ color: templateUrl ? '#fff' : '#CBD5E1', fontSize: '0.9rem' }}></i>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Outfit', color: templateUrl ? '#10B981' : '#CBD5E1', lineHeight: 1 }}>{templateUrl ? 'Ready' : 'Pending'}</div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Template Status</div>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="pi pi-shield" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                                </div>
                                <div style={{ background: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: 999, fontSize: '0.6rem', fontWeight: 800 }}>SOC2</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Outfit', color: '#0F172A', lineHeight: 1 }}>AES-256</div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Encryption</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="main-studio-grid" style={{ padding: '0 24px 40px', display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, marginTop: 24 }}>
                    {/* Left: Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Step 1: Import Assets */}
                        <div className="step-wizard-card" data-aos="fade-right">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                <div className="step-number" style={{ background: (csvData && templateUrl) ? '#D1FAE5' : 'linear-gradient(135deg, #3B82F6, #6366F1)', color: (csvData && templateUrl) ? '#059669' : '#fff' }}>
                                    {(csvData && templateUrl) ? <i className="pi pi-check" style={{ fontSize: '0.8rem' }}></i> : '01'}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>Step 1 — IMPORT</div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit', color: '#0F172A' }}>Data & Template</h3>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="upload-zone-premium">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: csvData ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className={`pi ${csvData ? 'pi-check-circle' : 'pi-file'}`} style={{ color: csvData ? '#10B981' : '#3B82F6', fontSize: '1rem' }}></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>CSV Data File</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{csvData ? `${csvData.participants.length} records, ${csvData.columns?.length} columns loaded` : 'Accepts .csv — Max 10MB, 1001 rows'}</div>
                                        </div>
                                        {csvData && <div style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 800, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: 999 }}>✓ Ready</div>}
                                    </div>
                                    <FileUpload mode="basic" name="csv" accept=".csv" maxFileSize={10000000} onSelect={onCsvUpload} auto chooseLabel={csvData ? 'Replace CSV' : 'Upload CSV'} className="w-full" />

                                    <div style={{ marginTop: 12 }}>
                                        <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 800, textAlign: 'center', margin: '8px 0', textTransform: 'uppercase' }}>— OR —</div>
                                        <Button label="Import from Quiz Results" icon="pi pi-bolt" className="w-full p-button-outlined"
                                            style={{ borderRadius: 12, borderStyle: 'dashed', fontSize: '0.85rem' }}
                                            onClick={openQuizImport} />
                                    </div>
                                </div>

                                <div className="upload-zone-premium">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: templateUrl ? 'rgba(16,185,129,0.1)' : 'rgba(168,85,247,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className={`pi ${templateUrl ? 'pi-check-circle' : 'pi-image'}`} style={{ color: templateUrl ? '#10B981' : '#A855F7', fontSize: '1rem' }}></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Certificate Template</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{templateUrl ? 'Design uploaded to cloud canvas' : 'JPEG Only — Max 2MB, Standard Res (Under 2500px)'}</div>
                                        </div>
                                        {templateUrl && <div style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 800, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: 999 }}>✓ Linked</div>}
                                    </div>
                                    <FileUpload mode="basic" name="template" accept=".jpg,.jpeg" maxFileSize={2000000} onSelect={onTemplateUpload} auto chooseLabel={templateUrl ? 'Replace Design' : 'Upload Design'} className="w-full" />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', borderRadius: 14, padding: '14px 18px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <i className="pi pi-expand" style={{ color: '#3B82F6', fontSize: '0.9rem' }}></i>
                                        <div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Custom Resolution</div>
                                            <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{useCustomSize ? `${customWidth} × ${customHeight} px` : 'Using default 600×400'}</div>
                                        </div>
                                    </div>
                                    <InputSwitch checked={useCustomSize} onChange={(e) => setUseCustomSize(e.value)} />
                                </div>
                                {useCustomSize && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '10px 14px', border: '1px solid #E2E8F0' }}>
                                            <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Width (px)</div>
                                            <InputNumber value={customWidth} onValueChange={(e) => setCustomWidth(e.value)} className="w-full" min={100} max={5000} />
                                        </div>
                                        <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '10px 14px', border: '1px solid #E2E8F0' }}>
                                            <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Height (px)</div>
                                            <InputNumber value={customHeight} onValueChange={(e) => setCustomHeight(e.value)} className="w-full" min={100} max={5000} />
                                        </div>
                                    </div>
                                )}

                                <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(168,85,247,0.05))', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(59,130,246,0.12)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <i className="pi pi-info-circle" style={{ color: '#3B82F6', fontSize: '0.85rem', marginTop: 2 }}></i>
                                        <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.6 }}>
                                            <strong style={{ color: '#3B82F6' }}>100% Free</strong> — Batches limited to 1001 rows. Need higher limits or advanced features? <a href="#" style={{ color: '#7C3AED', fontWeight: 800 }}>Contact VSGRPS →</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Configure Fields */}
                        {csvData && (
                            <div className="step-wizard-card" data-aos="fade-right" data-aos-delay="100">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                    <div className="step-number" style={{ background: fields.length > 0 ? 'linear-gradient(135deg, #A855F7, #EC4899)' : '#F1F5F9', color: fields.length > 0 ? '#fff' : '#94A3B8' }}>
                                        {fields.length > 0 ? <i className="pi pi-check" style={{ fontSize: '0.8rem' }}></i> : '02'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#A855F7', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>Step 2 — CONFIGURE</div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit', color: '#0F172A' }}>Dynamic Field Mapping</h3>
                                    </div>
                                    {fields.length > 0 && (
                                        <div style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 800, color: '#A855F7', background: 'rgba(168,85,247,0.08)', padding: '5px 12px', borderRadius: 999, border: '1px solid rgba(168,85,247,0.2)' }}>
                                            {fields.length}/{csvData.columns?.length} mapped
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Available Columns — Click to map to canvas</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {csvData.columns.map(col => {
                                            const isMapped = fields.find(f => f.field === col);
                                            return (
                                                <button key={col} className={`field-chip ${isMapped ? 'mapped' : ''}`}
                                                    onClick={() => isMapped ? setFields(fields.filter(f => f.field !== col)) : addField(col)}>
                                                    <i className={`pi ${isMapped ? 'pi-check-circle' : 'pi-plus-circle'}`} style={{ fontSize: '0.75rem' }}></i>
                                                    {col}
                                                    {isMapped && <i className="pi pi-times" style={{ fontSize: '0.6rem', opacity: 0.6 }}></i>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {fields.length > 0 && (
                                    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #F1F5F9' }}>
                                        <DataTable value={fields} size="small" scrollable scrollHeight="200px" emptyMessage="No fields mapped">
                                            <Column field="field" header="Field" body={(f) => <span style={{ background: 'rgba(59,130,246,0.06)', padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, color: '#3B82F6', fontFamily: 'monospace' }}>{f.field}</span>} />
                                            <Column header="Size" style={{ width: 80 }} body={(f) => <InputNumber value={f.size} onValueChange={(e) => setFields(fields.map(fi => fi.field === f.field ? { ...fi, size: e.value } : fi))} min={8} max={100} />} />
                                            <Column header="Color" body={(f) => <ColorPicker value={f.color} onChange={(e) => setFields(fields.map(fi => fi.field === f.field ? { ...fi, color: `#${e.value}` } : fi))} />} />
                                            <Column header="Edit" body={(f) => <Button icon="pi pi-pencil" className="p-button-text p-button-sm" onClick={() => setActiveFieldId(f.field)} />} />
                                            <Column body={(f) => <Button icon="pi pi-trash" className="p-button-text p-button-danger p-button-sm" onClick={() => setFields(fields.filter(fi => fi.field !== f.field))} />} />
                                        </DataTable>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Execute & Generate */}
                        {fields.length > 0 && (
                            <div className="step-wizard-card" data-aos="fade-right" data-aos-delay="200">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                    <div className="step-number" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)', color: '#fff' }}>03</div>
                                    <div>
                                        <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#10B981', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>Step 3 — EXECUTE</div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit', color: '#0F172A' }}>Generate Certificates</h3>
                                    </div>
                                </div>

                                {csvData && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginBottom: 20, background: '#F8FAFC', borderRadius: 14, padding: '14px 18px', border: '1px solid #E2E8F0' }}>
                                        <div><div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Records</div><div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Outfit', color: '#0F172A' }}>{csvData.participants.length}</div></div>
                                        <div><div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fields</div><div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Outfit', color: '#0F172A' }}>{fields.length}</div></div>
                                        <div><div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Est. Time</div><div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Outfit', color: '#3B82F6' }}>~{Math.max(3, Math.ceil(csvData.participants.length * 0.3))}s</div></div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <button className="action-btn-secondary" onClick={generatePreview} disabled={isPreviewing}>
                                        <i className="pi pi-eye" style={{ fontSize: '1rem' }}></i>
                                        {isPreviewing ? 'Generating Preview...' : 'Preview First Certificate'}
                                    </button>
                                    <button className="action-btn-primary" onClick={startGeneration} disabled={isGenerating}>
                                        <i className="pi pi-bolt" style={{ fontSize: '1rem' }}></i>
                                        {isGenerating ? 'Production Running...' : 'Run Full Production'}
                                        {!isGenerating && csvData && <span style={{ fontSize: '0.75rem', opacity: 0.8, marginLeft: 4 }}>({csvData.participants.length} certs)</span>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Canvas & Progress */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Canvas Area Container */}
                        <div className="canvas-container" data-aos="fade-left" onClick={() => setActiveFieldId(null)}
                            style={{ background: '#fff', borderRadius: 24, border: '1px solid #F1F5F9', overflow: 'hidden' }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #F8FAFC', background: 'rgba(248,250,252,0.8)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }}></div>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }}></div>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }}></div>
                                    </div>
                                    <div style={{ height: 16, width: 1, background: '#E2E8F0' }}></div>
                                    <div>
                                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', fontFamily: 'Outfit' }}>Live Designer</div>
                                        <div style={{ fontSize: '0.62rem', color: '#94A3B8', fontWeight: 600 }}>{useCustomSize ? `${customWidth} × ${customHeight}` : '600 × 400'} px canvas · {fields.length} layer{fields.length !== 1 ? 's' : ''}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '3px 6px', gap: 2 }}>
                                        <Button icon="pi pi-minus" className="p-button-text p-button-sm" onClick={() => setCanvasZoom(Math.max(0.5, canvasZoom - 0.1))} />
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, minWidth: 38, textAlign: 'center' }}>{Math.round(canvasZoom * 100)}%</span>
                                        <Button icon="pi pi-plus" className="p-button-text p-button-sm" onClick={() => setCanvasZoom(Math.min(3, canvasZoom + 0.1))} />
                                        <div style={{ width: 1, height: 16, background: '#E2E8F0', margin: '0 2px' }}></div>
                                        <Button icon="pi pi-refresh" className="p-button-text p-button-sm" onClick={() => setCanvasZoom(1)} />
                                    </div>
                                </div>
                            </div>

                            <div className="canvas-viewport" style={{
                                position: 'relative',
                                background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                                backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.04) 1px, transparent 1px)',
                                backgroundSize: '20px 20px',
                                overflow: 'hidden'
                            }}>
                                <div className="canvas-viewport-inner" style={{
                                    padding: '40px 20px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    minHeight: ((useCustomSize ? customHeight : 400) * canvasScale * canvasZoom) + 80,
                                    overflow: 'auto',
                                    position: 'relative'
                                }}>
                                    <div id="certificate-canvas-wrapper" style={{
                                        transform: `scale(${canvasScale * canvasZoom})`,
                                        transformOrigin: 'top center',
                                        width: useCustomSize ? customWidth : 600,
                                        height: useCustomSize ? customHeight : 400,
                                        flexShrink: 0
                                    }}>
                                        <div id="certificate-canvas" style={{
                                            width: useCustomSize ? customWidth : 600,
                                            height: useCustomSize ? customHeight : 400,
                                            background: 'white',
                                            backgroundImage: templateUrl ? `url(${templateUrl})` : 'none',
                                            backgroundSize: '100% 100%',
                                            position: 'relative',
                                            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)',
                                            borderRadius: 6,
                                        }}>
                                            {!templateUrl && (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', gap: 12 }}>
                                                    <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(168,85,247,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(59,130,246,0.2)' }}>
                                                        <i className="pi pi-image" style={{ fontSize: '2.2rem', color: 'rgba(59,130,246,0.3)' }}></i>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#94A3B8' }}>Canvas Ready</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: 4 }}>Upload a template to begin designing</div>
                                                    </div>
                                                </div>
                                            )}
                                            {fields.map(field => (
                                                <DraggableField
                                                    key={field.field}
                                                    field={field}
                                                    isSelected={activeFieldId === field.field}
                                                    onClick={() => setActiveFieldId(field.field)}
                                                    handleDragStop={handleDragStop}
                                                    updateFieldSize={(newSize) => setFields(fields.map(f => f.field === field.field ? { ...f, size: newSize } : f))}
                                                    updateFieldColor={(newColor) => setFields(fields.map(f => f.field === field.field ? { ...f, color: newColor } : f))}
                                                    removeField={() => { setFields(fields.filter(f => f.field !== field.field)); setActiveFieldId(null); }}
                                                />
                                            ))}
                                            <div style={{
                                                position: 'absolute', bottom: 12, right: 12,
                                                fontSize: '0.5rem', fontWeight: 800, color: 'rgba(0,0,0,0.25)',
                                                textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Outfit',
                                                pointerEvents: 'none', zIndex: 30, background: 'rgba(255,255,255,0.4)',
                                                padding: '2px 8px', borderRadius: '4px', backdropFilter: 'blur(4px)'
                                            }}>
                                                Generated and Secured by CertifyPro
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Editor Panel */}
                        {activeFieldId && (
                            <div style={{ padding: '0 16px' }} data-aos="fade-up">
                                <div className="editor-panel-container" style={{
                                    background: 'rgba(248, 250, 252, 0.8)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                    borderRadius: '30px',
                                    padding: '32px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748B', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                                                Design Engine Pro
                                            </div>
                                            <h3 style={{ fontSize: '1.75rem', margin: 0, fontFamily: 'Outfit', fontWeight: 800, color: '#0F172A' }}>
                                                Advanced Editor: <span style={{ color: '#2563EB' }}>{activeFieldId}</span>
                                            </h3>
                                        </div>
                                        <Button icon="pi pi-times" className="p-button-rounded p-button-text" onClick={() => setActiveFieldId(null)} />
                                    </div>

                                    <div className="editor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                                        <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #F1F5F9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                                <i className="pi pi-map-marker" style={{ color: '#2563EB' }}></i>
                                                <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#64748B' }}>Precision Mapping</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <div style={{ flex: 1, position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.62rem', fontWeight: 900, color: '#2563EB' }}>X</span>
                                                    <InputNumber value={fields.find(f => f.field === activeFieldId)?.x || 0}
                                                        onValueChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, x: e.value } : f))}
                                                        inputStyle={{ width: '100%', paddingLeft: 28, height: 42, borderRadius: 12 }} />
                                                </div>
                                                <div style={{ flex: 1, position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.62rem', fontWeight: 900, color: '#2563EB' }}>Y</span>
                                                    <InputNumber value={fields.find(f => f.field === activeFieldId)?.y || 0}
                                                        onValueChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, y: e.value } : f))}
                                                        inputStyle={{ width: '100%', paddingLeft: 28, height: 42, borderRadius: 12 }} />
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, background: '#F1F5F9', padding: 8, borderRadius: 18, marginTop: 12 }}>
                                                <div /><Button icon="pi pi-chevron-up" onClick={() => nudge(0, -1)} /><div />
                                                <Button icon="pi pi-chevron-left" onClick={() => nudge(-1, 0)} />
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 900 }}>STEP</div>
                                                <Button icon="pi pi-chevron-right" onClick={() => nudge(1, 0)} />
                                                <div /><Button icon="pi pi-chevron-down" onClick={() => nudge(0, 1)} /><div />
                                            </div>
                                        </div>

                                        <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #F1F5F9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                                <i className="pi pi-text-color" style={{ color: '#2563EB' }}></i>
                                                <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#64748B' }}>Typography Scale</span>
                                            </div>
                                            <div style={{ marginBottom: 12 }}>
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.62rem', fontWeight: 900, color: '#94A3B8' }}>SIZE</span>
                                                    <InputNumber value={fields.find(f => f.field === activeFieldId)?.size || 24}
                                                        onValueChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, size: e.value } : f))}
                                                        min={8} max={250} inputStyle={{ width: '100%', paddingLeft: 44, height: 42, borderRadius: 12 }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.62rem', fontWeight: 900, color: '#94A3B8' }}>TRS</span>
                                                    <InputNumber value={fields.find(f => f.field === activeFieldId)?.letterSpacing || 0}
                                                        onValueChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, letterSpacing: e.value } : f))}
                                                        min={-20} max={100} inputStyle={{ width: '100%', paddingLeft: 44, height: 42, borderRadius: 12 }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #F1F5F9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                                <i className="pi pi-palette" style={{ color: '#2563EB' }}></i>
                                                <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#64748B' }}>Color Theme</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFC', padding: '10px 12px', borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 12 }}>
                                                <div style={{ height: 38, width: 38, position: 'relative', overflow: 'hidden', borderRadius: 10 }}>
                                                    <ColorPicker value={fields.find(f => f.field === activeFieldId)?.color || '#000000'}
                                                        onChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, color: `#${e.value}` } : f))}
                                                        style={{ position: 'absolute', top: -12, left: -12, width: 64, height: 64 }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <input type="text" value={(fields.find(f => f.field === activeFieldId)?.color || '#000000').toUpperCase()}
                                                        onChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, color: e.target.value } : f))}
                                                        style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.82rem', fontWeight: 800, fontFamily: 'monospace', outline: 'none' }} />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                                                {['#000000', '#2563EB', '#7C3AED', '#DC2626', '#10B981', '#F59E0B'].map(c => (
                                                    <div key={c} onClick={() => setFields(fields.map(f => f.field === activeFieldId ? { ...f, color: c } : f))}
                                                        style={{ width: 22, height: 22, borderRadius: '6px', background: c, cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(226, 232, 240, 0.6)' }}>
                                        <Button label="Remove Layer" icon="pi pi-trash" className="p-button-danger p-button-text" onClick={() => { setFields(fields.filter(f => f.field !== activeFieldId)); setActiveFieldId(null); }} />
                                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontStyle: 'italic' }}>Select another field or click canvas to deselect.</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Progress Panel */}
                        {isGenerating && (
                            <div style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(255, 255, 255, 0.75)',
                                backdropFilter: 'blur(30px) saturate(180%)', zIndex: 9999,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: 20
                            }}>
                                <div style={{
                                    width: '100%', maxWidth: 480, background: 'rgba(255, 255, 255, 0.95)',
                                    padding: '24px 20px', borderRadius: 28, border: '1px solid rgba(37, 99, 235, 0.15)',
                                    boxShadow: '0 25px 60px -12px rgba(37, 99, 235, 0.15)',
                                    textAlign: 'center', color: '#334155'
                                }}>
                                    {!progress || progress.stage === 'starting' ? (
                                        <div>
                                            <i className="pi pi-cog pi-spin" style={{ fontSize: '2.5rem', color: '#2563EB' }}></i>
                                            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', marginTop: 16 }}>Engine Hot-Start</h2>
                                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Provisioning your dedicated industrial cloud</p>
                                        </div>
                                    ) : progress.stage === 'queued' ? (
                                        <div>
                                            <div style={{ width: 64, height: 64, background: 'rgba(37,99,235,0.04)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                                <i className="pi pi-clock" style={{ fontSize: '1.8rem', color: '#2563EB' }}></i>
                                            </div>
                                            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem' }}>Priority Waitlist</h2>
                                            {progress.position && (
                                                <div style={{ fontSize: '4.2rem', fontWeight: 900, color: '#2563EB', margin: '4px 0', fontFamily: 'Outfit' }}>#{progress.position}</div>
                                            )}
                                            <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>
                                                {progress.position === 1 ? "You are NEXT in line!" : `Position #${progress.position} in queue`}
                                            </p>
                                            {progress.activeJob && (
                                                <div style={{ background: 'rgba(37,99,235,0.03)', borderRadius: 20, padding: 16, marginTop: 16 }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', marginBottom: 8 }}>
                                                        Currently Processing
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800, marginBottom: 8 }}>
                                                        <span>{progress.activeJob.progress?.percent || 0}% Done</span>
                                                        <span>~{progress.activeJob.progress?.estimatedTimeRemaining || 'Calculating'}s left</span>
                                                    </div>
                                                    <ProgressBar value={progress.activeJob.progress?.percent || 0} showValue={false} style={{ height: 6, borderRadius: 50 }} />
                                                    <div style={{ fontSize: '0.6rem', color: '#94A3B8', marginTop: 10 }}>Your job will start automatically after this.</div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ marginBottom: 32 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>{progress.task || 'Processing'}</span>
                                                    <span style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'Outfit' }}>{progress.percent || 0}%</span>
                                                </div>
                                                <ProgressBar value={progress.percent || 0} showValue={false} style={{ height: 10, borderRadius: 50 }} />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'rgba(255,255,255,0.4)', borderRadius: 20, padding: 24, marginBottom: 24 }}>
                                                <div>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Records</div>
                                                    <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Outfit' }}>{progress.current || 0} / {progress.total || 0}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Efficiency</div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit', color: '#2563EB' }}>
                                                        {progress.estimatedTimeRemaining > 0 ? (
                                                            progress.estimatedTimeRemaining > 60 ?
                                                                `${Math.floor(progress.estimatedTimeRemaining / 60)}m ${progress.estimatedTimeRemaining % 60}s` :
                                                                `${progress.estimatedTimeRemaining}s`
                                                        ) : "Stabilizing"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                                        <div style={{ width: 6, height: 6, background: '#2563EB', borderRadius: '50%', margin: '0 auto', animation: 'pulse 1.5s infinite' }}></div>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>PRO PRODUCTION SUITE</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Completion Card */}
                        {showDownload && (
                            <div data-aos="zoom-in" style={{ borderRadius: 24, overflow: 'hidden' }}>
                                <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)', padding: '32px 20px', textAlign: 'center', color: 'white' }}>
                                    <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <i className="pi pi-check-circle" style={{ fontSize: '1.8rem' }}></i>
                                    </div>
                                    <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.5rem', marginBottom: 8 }}>Batch Generated! 🎉</h3>
                                    <p style={{ opacity: 0.7, marginBottom: 24 }}>Your batch of certificates is ready for delivery.</p>
                                    <button onClick={handleDownload} style={{ background: 'rgba(255,255,255,0.95)', color: '#065F46', border: 'none', borderRadius: 16, padding: '14px 20px', fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                                        <i className="pi pi-download"></i> Download ZIP Package
                                    </button>
                                </div>

                                {/* Sharing Instructions */}
                                <div style={{ background: '#F0FDF4', padding: '24px', border: '1px solid #DCFCE7', borderTop: 'none' }}>
                                    <h4 style={{ color: '#166534', fontWeight: 800, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <i className="pi pi-info-circle"></i> IMPORTANT: How to Share Your Certificate
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                                        {[
                                            "Upload the ORIGINAL PDF to Google Drive",
                                            "Do NOT rename or edit the file",
                                            "Do NOT compress or screenshot the certificate",
                                            "Set sharing to: 'Anyone with the link → Viewer'",
                                            "Share the Google Drive link along with your Certificate ID"
                                        ].map((step, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#166534', color: 'white', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{idx + 1}</div>
                                                <p style={{ fontSize: '0.8rem', color: '#374151', margin: 0, lineHeight: 1.4 }}>{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                            <div className="security-card" style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(168,85,247,0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="pi pi-shield" style={{ fontSize: '1.2rem', color: '#3B82F6' }}></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#3B82F6', textTransform: 'uppercase' }}>Zero-Retention</div>
                                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>Data is destroyed 60s after export or 15m of inactivity.</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#10B981', background: 'rgba(16,185,129,0.08)', padding: '2px 8px', borderRadius: 50 }}>✓ Active</div>
                                    <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#CBD5E1' }}>SOC2 · AES</div>
                                </div>
                            </div>

                            {/* Verification Features Quick Look */}
                            <div className="security-card" style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.08))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.2)', flexShrink: 0
                                }} className="mobile-hide">
                                    <i className="pi pi-verified" style={{ fontSize: '1.2rem', color: '#10B981' }}></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#10B981', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Auto-Verification Enabled</div>
                                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>Files receive embedded invisible cryptography for authenticity checking.</p>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                        <div style={{ background: '#F8FAFC', padding: '4px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: '0.65rem', color: '#64748B', fontWeight: 800, fontFamily: 'monospace' }}>Hash: a8f7...</div>
                                        <div style={{ background: '#F8FAFC', padding: '4px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: '0.65rem', color: '#64748B', fontWeight: 800 }}>Metadata Signed</div>
                                    </div>
                                </div>
                                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#10B981', background: 'rgba(16,185,129,0.08)', padding: '2px 8px', borderRadius: 50 }}>✓ Active</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Loader Overlay */}
                {/* Loader for CSV/Template Upload */}
                {(isUploading) && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 60px',
                            background: 'white',
                            borderRadius: '24px',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.12)',
                            maxWidth: '380px'
                        }}>
                            <ProgressSpinner
                                style={{ width: '50px', height: '50px' }}
                                strokeWidth="4"
                            />
                            <h3 style={{
                                fontFamily: 'Outfit',
                                fontWeight: 900,
                                marginTop: 20,
                                fontSize: '1.3rem'
                            }}>
                                Uploading...
                            </h3>
                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.85rem',
                                marginTop: 8,
                                lineHeight: 1.5
                            }}>
                                Please wait while we process your file.
                            </p>
                        </div>
                    </div>
                )}

                {/* Loader for Certificate Generation */}
                {(isGenerating && (!progress || progress.stage === 'starting')) && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            padding: '50px 70px',
                            background: 'white',
                            borderRadius: '24px',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.12)',
                            maxWidth: '420px'
                        }}>
                            <ProgressSpinner
                                style={{ width: '60px', height: '60px' }}
                                strokeWidth="4"
                            />
                            <h3 style={{
                                fontFamily: 'Outfit',
                                fontWeight: 900,
                                marginTop: 24,
                                fontSize: '1.6rem'
                            }}>
                                Generating Certificates...
                            </h3>
                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.95rem',
                                marginTop: 12,
                                lineHeight: 1.6
                            }}>
                                Your certificates are being generated. During peak usage, requests may be queued.
                                Your batch will be processed automatically, and the ZIP file will be ready for download once complete.
                                Pls Stay on this page.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <Dialog header="Import Quiz Results" visible={showQuizImport} onHide={() => setShowQuizImport(false)} style={{ width: '90vw', maxWidth: 500 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Select a quiz to import all participants who have completed the assessment.</p>
                    {availableQuizzes.map(q => (
                        <div key={q.id} className="quiz-import-item"
                            onClick={() => handleQuizImport(q.id)}
                            style={{
                                padding: '16px', borderRadius: 12, background: '#F8FAFC',
                                border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                            <div>
                                <div style={{ fontWeight: 800, color: '#0F172A' }}>{q.title}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>By {q.creator_name}</div>
                            </div>
                            <i className="pi pi-chevron-right" style={{ color: '#CBD5E1' }}></i>
                        </div>
                    ))}
                    {availableQuizzes.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>
                            <i className="pi pi-info-circle" style={{ fontSize: '2rem', marginBottom: 10 }}></i>
                            <p>No quizzes found. Create one in the Quiz Hub first!</p>
                        </div>
                    )}
                </div>
                <style>{`
                    .quiz-import-item:hover { transform: translateX(5px); border-color: #3B82F6; background: rgba(59,130,246,0.02); }
                `}</style>
            </Dialog>

        </div>
    );
};

export default CertifyStudio;