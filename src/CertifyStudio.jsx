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
import { Avatar } from 'primereact/avatar';
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
        const exported = localStorage.getItem('cert_participants');
        if (exported) {
            try {
                const data = JSON.parse(exported);
                setCsvData({
                    columns: ["Name", "Email", "Score", "Total"],
                    participants: data
                });
                toast.success("Imported quiz results successfully!", { icon: '🎓' });
                localStorage.removeItem('cert_participants');
            } catch (err) {
                console.error("Failed to parse exported data", err);
            }
        }
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

                    if (data.type === 'queue_update') {
                        setQueueState(data.data);

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

    if (!user) return <Signin onLogin={setUser} />;
    if (!showApp) return <LandingPage onStartApp={() => setShowApp(true)} user={user} />;

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <Toaster position="top-center" />

            <div className="main-content" style={{ marginLeft: 0 }}>
                <Dialog
                    header="Experience Optimization"
                    visible={isMobile && !viewModeSelected && showApp}
                    onHide={() => setViewModeSelected(true)}
                    style={{ width: '90vw', maxWidth: 450 }}
                    closable={false}
                    footer={(
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                            <Button label="Stay in Mobile" className="p-button-text p-button-secondary" size="small" onClick={() => setViewModeSelected(true)} />
                            <Button label="Switch to Desktop" icon="pi pi-desktop" size="small" style={{ background: 'var(--accent)', borderRadius: 50, padding: '8px 16px' }}
                                onClick={() => { setForceDesktop(true); setViewModeSelected(true); }} />
                        </div>
                    )}
                >
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ width: 60, height: 60, background: 'rgba(37,99,235,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <i className="pi pi-desktop" style={{ fontSize: '1.8rem', color: 'var(--accent)' }}></i>
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-h)', fontWeight: 800, marginBottom: 12 }}>Precision Design Awaits</h3>
                    </div>
                </Dialog>

                <div className="topbar" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 24px',
                    background: 'rgba(7, 13, 31, 0.75)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    height: '72px',
                    zIndex: 1000,
                    position: 'sticky',
                    top: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Button icon="pi pi-arrow-left" className="p-button-rounded p-button-text p-button-secondary"
                            onClick={() => setShowApp(false)} tooltip="Exit Console"
                            style={{ borderRadius: 12, width: 40, height: 40, color: 'var(--text-secondary)' }} />

                        <Button label="Quiz Console" icon="pi pi-th-large"
                            className="p-button-rounded"
                            onClick={() => navigate('/quiz')}
                            style={{
                                background: 'rgba(59, 130, 246, 0.12)',
                                border: '1px solid rgba(59, 130, 246, 0.4)',
                                color: 'var(--accent)',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                padding: '8px 18px',
                                borderRadius: 12,
                                transition: 'all 0.3s',
                                letterSpacing: '0.02em'
                            }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 34, height: 34,
                                background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))',
                                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(59,130,246,0.2)'
                            }} className="mobile-hide">
                                <i className="pi pi-bolt" style={{ fontSize: '1rem', color: '#fff' }}></i>
                            </div>
                            <div style={{ lineHeight: 1.1 }}>
                                <h2 style={{ fontSize: '0.92rem', fontWeight: 900, fontFamily: 'var(--font-h)', margin: 0, color: 'var(--text)', letterSpacing: '-0.01em' }}>CertifyPro</h2>
                                <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }} className="mobile-hide">Generation Studio</div>
                            </div>
                        </div>
                    </div>

                    <div className="topbar-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: 50, border: '1px solid var(--border)' }}>
                            {[{ label: 'Import', step: 1, done: !!csvData && !!templateUrl }, { label: 'Configure', step: 2, done: fields.length > 0 }, { label: 'Generate', step: 3, done: false }].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 50,
                                        background: s.done ? 'rgba(16,185,129,0.12)' : (s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? 'rgba(59,130,246,0.1)' : 'transparent'),
                                        border: s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? '1.5px solid var(--accent)' : '1px solid transparent',
                                        boxShadow: s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? '0 0 15px rgba(59,130,246,0.15)' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div style={{
                                            width: 7, height: 7, borderRadius: '50%',
                                            background: s.done ? 'var(--green)' : (s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? 'var(--accent)' : 'var(--text-muted)'),
                                            boxShadow: s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? '0 0 8px var(--accent)' : 'none'
                                        }}></div>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 800,
                                            color: s.done ? 'var(--green)' : (s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? 'var(--text)' : 'var(--text-muted)'),
                                            whiteSpace: 'nowrap',
                                            letterSpacing: '0.02em'
                                        }}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < 2 && <i className="pi pi-chevron-right" style={{ fontSize: '0.55rem', color: 'var(--border)', margin: '0 4px' }}></i>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                        {isGenerating && (
                            <Button icon="pi pi-stop-circle" size="small" className="p-button-danger p-button-text" onClick={stopGeneration} style={{ borderRadius: 50 }} />
                        )}

                        <div style={{ height: 32, width: 1, background: 'var(--border)', margin: '0 8px' }} className="mobile-hide"></div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 50, border: '1px solid var(--border)' }}>
                            <div style={{ textAlign: 'right' }} className="mobile-hide">
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{user.name || 'Industrial User'}</div>
                                <div style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{user.email}</div>
                            </div>
                            <Avatar image={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=fff`} shape="circle" size="normal" />
                            <Button icon="pi pi-power-off" className="p-button-rounded p-button-text p-button-danger"
                                tooltip="Logout" size="small"
                                style={{ width: 32, height: 32 }}
                                onClick={() => { localStorage.removeItem('user'); window.location.reload(); }} />
                        </div>
                    </div>
                </div>

                <div style={{ padding: '20px 24px 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                        <div className="kpi-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <i className="pi pi-users" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                                </div>
                                {csvData && <div className="badge badge-green">LOADED</div>}
                            </div>
                            <div style={{ marginTop: 15 }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-h)', color: 'var(--text)', lineHeight: 1 }}>{csvData?.participants?.length || 0}</div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Total Records</div>
                            </div>
                        </div>

                        <div className="kpi-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: 'linear-gradient(135deg, var(--aurora-2), var(--aurora-3))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <i className="pi pi-link" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                                </div>
                                {fields.length > 0 && <div className="badge badge-purple">ACTIVE</div>}
                            </div>
                            <div style={{ marginTop: 15 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-h)', color: 'var(--text)', lineHeight: 1 }}>{fields.length}</div>
                                    {csvData && <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>/ {csvData.columns.length}</div>}
                                </div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Mapped Fields</div>
                            </div>
                        </div>

                        <div className="kpi-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: templateUrl ? 'linear-gradient(135deg, var(--green), #34D399)' : 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <i className={`pi ${templateUrl ? 'pi-verified' : 'pi-image'}`} style={{ color: templateUrl ? '#fff' : 'var(--text-muted)', fontSize: '0.9rem' }}></i>
                                </div>
                            </div>
                            <div style={{ marginTop: 15 }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-h)', color: templateUrl ? 'var(--green)' : 'var(--text-muted)', lineHeight: 1 }}>{templateUrl ? 'Ready' : 'Pending'}</div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Template Status</div>
                            </div>
                        </div>

                        <div className="kpi-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: 'linear-gradient(135deg, var(--amber), #FBBF24)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <i className="pi pi-shield" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                                </div>
                                <div className="badge badge-amber">SOC2</div>
                            </div>
                            <div style={{ marginTop: 15 }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-h)', color: 'var(--text)', lineHeight: 1 }}>AES-256</div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Encryption</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="console-grid">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="step-wizard-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                <div className="step-number" style={{ background: (csvData && templateUrl) ? 'rgba(16,185,129,0.1)' : 'var(--aurora-gradient)', color: (csvData && templateUrl) ? 'var(--green)' : '#fff', boxShadow: (csvData && templateUrl) ? 'none' : '0 8px 20px rgba(59,130,246,0.35)' }}>
                                    {(csvData && templateUrl) ? <i className="pi pi-check" style={{ fontSize: '0.8rem' }}></i> : '01'}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.62rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>Step 1 — IMPORT</div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-h)', color: 'var(--text)' }}>Data & Template</h3>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="upload-zone-premium" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: csvData ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className={`pi ${csvData ? 'pi-check-circle' : 'pi-file'}`} style={{ color: csvData ? 'var(--green)' : 'var(--accent)', fontSize: '1rem' }}></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>CSV Data File</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{csvData ? `${csvData.participants.length} records loaded` : 'Accepts .csv — Max 1001 rows'}</div>
                                        </div>
                                        {csvData && <div style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 800, color: 'var(--green)', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: 999 }}>✓ Ready</div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <FileUpload mode="basic" name="csv" accept=".csv" maxFileSize={10000000} onSelect={onCsvUpload} auto chooseLabel={csvData ? 'Replace CSV' : 'Upload CSV'} className="w-full" />
                                        <Button icon="pi pi-database" label="Import from Quiz" className="p-button-outlined" onClick={openQuizImport} style={{ borderRadius: 12, borderColor: 'var(--border)', color: 'var(--text)' }} />
                                    </div>
                                </div>

                                <div className="upload-zone-premium" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: templateUrl ? 'rgba(16,185,129,0.1)' : 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className={`pi ${templateUrl ? 'pi-check-circle' : 'pi-image'}`} style={{ color: templateUrl ? 'var(--green)' : 'var(--purple)', fontSize: '1rem' }}></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>Certificate Template</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{templateUrl ? 'Design uploaded to cloud canvas' : 'JPG Only — Max 2MB, Standard Res'}</div>
                                        </div>
                                        {templateUrl && <div style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 800, color: 'var(--green)', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: 999 }}>✓ Linked</div>}
                                    </div>
                                    <FileUpload mode="basic" name="template" accept="image/jpeg" maxFileSize={2000000} onSelect={onTemplateUpload} auto chooseLabel={templateUrl ? 'Replace Design' : 'Upload Design'} className="w-full" />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '14px 18px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <i className="pi pi-expand" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}></i>
                                        <div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>Custom Resolution</div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{useCustomSize ? `${customWidth} × ${customHeight} px` : 'Using default template size'}</div>
                                        </div>
                                    </div>
                                    <InputSwitch checked={useCustomSize} onChange={(e) => setUseCustomSize(e.value)} />
                                </div>
                                {useCustomSize && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: '10px 14px', border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Width (px)</div>
                                            <InputNumber value={customWidth} onValueChange={(e) => setCustomWidth(e.value)} className="w-full" min={100} max={5000} inputStyle={{ border: 'none', background: 'transparent', fontWeight: 800, padding: 0, color: 'var(--text)' }} />
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: '10px 14px', border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Height (px)</div>
                                            <InputNumber value={customHeight} onValueChange={(e) => setCustomHeight(e.value)} className="w-full" min={100} max={5000} inputStyle={{ border: 'none', background: 'transparent', fontWeight: 800, padding: 0, color: 'var(--text)' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {csvData && (
                            <div className="step-wizard-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                    <div className="step-number" style={{ background: fields.length > 0 ? 'var(--aurora-gradient)' : 'rgba(255,255,255,0.05)', color: fields.length > 0 ? '#fff' : 'var(--text-muted)', boxShadow: fields.length > 0 ? '0 8px 20px rgba(168,85,247,0.35)' : 'none' }}>
                                        {fields.length > 0 ? <i className="pi pi-check" style={{ fontSize: '0.8rem' }}></i> : '02'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.62rem', fontWeight: 900, color: 'var(--purple)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>Step 2 — CONFIGURE</div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-h)', color: 'var(--text)' }}>Dynamic Field Mapping</h3>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Available Columns</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {csvData.columns.map(col => {
                                            const isMapped = fields.find(f => f.field === col);
                                            return (
                                                <div
                                                    key={col}
                                                    onClick={() => isMapped ? setFields(fields.filter(f => f.field !== col)) : addField(col)}
                                                    className={`field-chip ${isMapped ? 'mapped' : ''}`}
                                                >
                                                    <i className={`pi ${isMapped ? 'pi-times' : 'pi-plus'}`}></i>
                                                    {col}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

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

                        {/* Step 3: Execute & Generate */}
                        {fields.length > 0 && (
                            <div className="step-wizard-card" data-aos="fade-right" data-aos-delay="200">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                    <div className="step-number" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)', color: '#fff' }}>03</div>
                                    <div>
                                        <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#10B981', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>Step 3 — EXECUTE</div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-h)', color: 'var(--text)' }}>Generate Certificates</h3>
                                    </div>
                                </div>

                                {csvData && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '14px 18px', border: '1px solid var(--border)' }}>
                                        <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Records</div><div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-h)', color: 'var(--text)' }}>{csvData.participants.length}</div></div>
                                        <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fields</div><div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-h)', color: 'var(--text)' }}>{fields.length}</div></div>
                                        <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Est. Time</div><div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-h)', color: 'var(--accent)' }}>~{Math.max(3, Math.ceil(csvData.participants.length * 0.3))}s</div></div>
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
                            style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }}></div>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }}></div>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }}></div>
                                    </div>
                                    <div style={{ height: 16, width: 1, background: 'var(--border)' }}></div>
                                    <div>
                                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-h)' }}>Live Designer</div>
                                        <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{useCustomSize ? `${customWidth} × ${customHeight}` : '600 × 400'} px canvas · {fields.length} layer{fields.length !== 1 ? 's' : ''}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '3px 6px', gap: 2 }}>
                                        <Button icon="pi pi-minus" className="p-button-text p-button-sm" onClick={() => setCanvasZoom(Math.max(0.5, canvasZoom - 0.1))} style={{ color: 'var(--text)' }} />
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, minWidth: 38, textAlign: 'center', color: 'var(--text)' }}>{Math.round(canvasZoom * 100)}%</span>
                                        <Button icon="pi pi-plus" className="p-button-text p-button-sm" onClick={() => setCanvasZoom(Math.min(3, canvasZoom + 0.1))} style={{ color: 'var(--text)' }} />
                                        <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 2px' }}></div>
                                        <Button icon="pi pi-refresh" className="p-button-text p-button-sm" onClick={() => setCanvasZoom(1)} style={{ color: 'var(--text)' }} />
                                    </div>
                                </div>
                            </div>

                            <div className="canvas-viewport" style={{
                                position: 'relative',
                                background: 'var(--bg-primary)',
                                backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
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
                                                fontSize: '0.65rem', fontWeight: 800, color: 'rgba(0,0,0,0.25)',
                                                textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Outfit',
                                                pointerEvents: 'none', zIndex: 30, background: 'rgba(255,255,255,0.4)',
                                                padding: '2px 8px', borderRadius: '4px', backdropFilter: 'blur(4px)'
                                            }}>
                                                Generated by CertifyPro
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

                                        <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 20, border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                                <i className="pi pi-palette" style={{ color: 'var(--accent)' }}></i>
                                                <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Color Theme</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 12 }}>
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

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                                        <Button label="Remove Layer" icon="pi pi-trash" className="p-button-danger p-button-text" onClick={() => { setFields(fields.filter(f => f.field !== activeFieldId)); setActiveFieldId(null); }} />
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Select another field or click canvas to deselect.</div>
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
                                <div style={{ background: 'var(--aurora-gradient)', padding: '32px 20px', textAlign: 'center', color: 'white' }}>
                                    <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <i className="pi pi-check-circle" style={{ fontSize: '1.8rem' }}></i>
                                    </div>
                                    <h3 style={{ fontFamily: 'var(--font-h)', fontWeight: 900, fontSize: '1.5rem', marginBottom: 8 }}>Batch Generated! 🎉</h3>
                                    <p style={{ opacity: 0.7, marginBottom: 24 }}>Your batch of certificates is ready for delivery.</p>
                                    <button onClick={startGeneration} style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--bg-primary)', border: 'none', borderRadius: 16, padding: '14px 20px', fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                                        <i className="pi pi-download"></i> Download ZIP Package
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                            <div className="security-card" style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 20, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="pi pi-shield" style={{ fontSize: '1.2rem', color: 'var(--accent)' }}></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase' }}>Zero-Retention</div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Data is destroyed 60s after export or 15m of inactivity.</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--green)', background: 'rgba(16,185,129,0.08)', padding: '2px 8px', borderRadius: 50 }}>✓ Active</div>
                                    <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-muted)' }}>SOC2 · AES</div>
                                </div>
                            </div>

                            <div className="security-card" style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 20, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: 'rgba(16,185,129,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.2)', flexShrink: 0
                                }} className="mobile-hide">
                                    <i className="pi pi-verified" style={{ fontSize: '1.2rem', color: 'var(--green)' }}></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Auto-Verification Enabled</div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>Files receive embedded invisible cryptography for authenticity checking.</p>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800, fontFamily: 'monospace' }}>Hash: a8f7...</div>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800 }}>Metadata Signed</div>
                                    </div>
                                </div>
                                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--green)', background: 'rgba(16,185,129,0.08)', padding: '2px 8px', borderRadius: 50 }}>✓ Active</div>
                                </div>
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
                    background: 'rgba(7,13,31,0.8)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 60px',
                        background: 'var(--bg-card)',
                        borderRadius: '24px',
                        border: '1px solid var(--border)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
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
                    background: 'rgba(7,13,31,0.8)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '50px 70px',
                        background: 'var(--bg-card)',
                        borderRadius: '24px',
                        border: '1px solid var(--border)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
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
                            Please stay on this page.
                        </p>
                    </div>
                </div>
            )}
            <Dialog header="Import Quiz Results" visible={showQuizImport} onHide={() => setShowQuizImport(false)} style={{ width: '90vw', maxWidth: 500 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Select a quiz to import all participants who have completed the assessment.</p>
                    {availableQuizzes.map(q => (
                        <div key={q.id} className="quiz-import-item"
                            onClick={() => handleQuizImport(q.id)}
                            style={{
                                padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                            <div>
                                <div style={{ fontWeight: 800, color: 'var(--text)' }}>{q.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>By {q.creator_name}</div>
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
}

export default CertifyStudio;