import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import axios from 'axios';
import Draggable from 'react-draggable';
import gsap from 'gsap';
import AOS from 'aos';

import Login from './Login';
import Loader from '../components/Loader';
import { authClient } from '../lib/auth';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://certify-vsgrps.onrender.com').trim();

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
                {/* TOOLTIP EDITOR (Floating above field) */}
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

                        {/* Tooltip Arrow */}
                        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #070D1F' }}></div>
                    </div>
                )}

                {/* Field Label Indicator */}
                <div style={{
                    position: 'absolute', top: -16, left: 0,
                    fontSize: '0.6rem', fontWeight: 800,
                    color: isSelected ? '#2563EB' : '#94A3B8',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                    {field.field}
                </div>

                {/* Resize Corners */}
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

/* ═══ MAIN APP ═══ */
function Home() {
    useEffect(() => {
        console.log("%c💎 CERTIFYPRO DASHBOARD v2.0 - ONLINE", "color: #2563EB; font-weight: 900; font-size: 16px;");
        console.log("📧 Email Automation: INITIALIZED");
    }, []);
    const { data: session, isPending } = authClient.useSession();
    const user = session?.user;
    const loading = isPending;

    const [csvData, setCsvData] = useState(null);
    const [templateUrl, setTemplateUrl] = useState('');
    const [publicId, setPublicId] = useState('');
    const [fields, setFields] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(null);
    const [genKey, setGenKey] = useState(null);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [activeFieldId, setActiveFieldId] = useState(null); // Advanced: Track selected field
    const [canvasScale, setCanvasScale] = useState(1); // Auto-scale for mobile
    const [canvasZoom, setCanvasZoom] = useState(1); // Manual zoom
    const [forceDesktop, setForceDesktop] = useState(false); // Manual desktop trigger
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));
    const [viewModeSelected, setViewModeSelected] = useState(false); // Track if user made mobile/desktop choice

    const [useCustomSize, setUseCustomSize] = useState(false);
    const [customWidth, setCustomWidth] = useState(600);
    const [customHeight, setCustomHeight] = useState(400);

    const [sendEmail, setSendEmail] = useState(false);
    const hasEmailColumn = useMemo(() => {
        if (!csvData || !csvData.columns) return false;
        const found = csvData.columns.some(col => {
            const lower = col.toLowerCase();
            return lower.includes('email') || lower.includes('mail') || lower.includes('recipient');
        });
        console.log("📧 [FRONTEND] Email Column Detected:", found);
        return found;
    }, [csvData]);

    // Desktop Viewport Hack for Mobile
    useEffect(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        if (meta) {
            if (user && (isMobile || forceDesktop)) {
                meta.setAttribute('content', 'width=1200, initial-scale=0.3, maximum-scale=5, user-scalable=yes');
            } else {
                meta.setAttribute('content', 'width=device-width, initial-scale=1');
            }
        }
    }, [user, isMobile, forceDesktop]);

    useEffect(() => {
        const handleResize = () => {
            const viewport = document.querySelector('.canvas-viewport-inner');
            // Stabilize detection: Don't flip isMobile based on forced width
            if (viewport) {
                const availableWidth = viewport.offsetWidth - 32;
                const targetW = useCustomSize ? customWidth : 600;
                setCanvasScale(availableWidth < targetW ? availableWidth / targetW : 1);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [user, useCustomSize, customWidth]);

    const [isUploading, setIsUploading] = useState(false);
    const [showDownload, setShowDownload] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState('');

    // Auto-download when ready (with 3s Delay & Visual Feedback)
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
    //    const toast = useRef(null);

    useEffect(() => {
        AOS.init({ duration: 700, once: true });
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isGenerating) {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome/Edge
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isGenerating]);

    /* ═══ HANDLERS ═══ */
    const onCsvUpload = async (e) => {
        const formData = new FormData();
        formData.append('csv', e.files[0]);
        setIsUploading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Artificial delay to show loader
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

        // Resolution Validation for High-Res Stability
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

            await new Promise(resolve => setTimeout(resolve, 800)); // Artificial delay to show loader
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

        // Dynamic Limit Enforcement: >500 rows = 2 fields, <=500 rows = 4 fields
        const rowCount = csvData?.participants?.length || 0;
        const limit = rowCount > 500 ? 2 : 4;

        if (fields.length >= limit) {
            toast.error(`Mapping Limit: For ${rowCount > 500 ? 'over 500' : 'under 500'} participants, you are limited to ${limit} mappings to ensure generation stability.`, {
                icon: '⚠️',
                style: { borderRadius: '12px', background: '#7f1d1d', color: '#fff', fontWeight: 700 }
            });
            return;
        }

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
            await new Promise(resolve => setTimeout(resolve, 800)); // Artificial delay to show loader
            const res = await axios.post(`${API_BASE}/preview-pdf`, {
                participant: csvData.participants[0], templateUrl, fields,
                customDimensions: useCustomSize ? { width: customWidth, height: customHeight } : null
            }, { responseType: 'blob' });

            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));

            // Consistently download preview across all devices
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

    const executeGeneration = async (shouldSendEmail) => {
        // Internet Stability Check
        if (!navigator.onLine) {
            toast.error("Network Error: Your internet connection appears to be offline. Please reconnect before starting production.", { 
                icon: '📡',
                style: { borderRadius: '12px', background: '#7f1d1d', color: '#fff', fontWeight: 700 }
            });
            return;
        }

        // Poor Connection Check (Effective Type)
        if (navigator.connection && (navigator.connection.effectiveType === '2g' || navigator.connection.saveData)) {
            toast.error("Network Too Weak: Industrial-grade production requires a stable 4G/WiFi connection. Current: " + (navigator.connection.effectiveType || 'Slow'), { 
                icon: '📡',
                style: { borderRadius: '12px', background: '#7f1d1d', color: '#fff', fontWeight: 700 }
            });
            return;
        }

        if (!csvData || !templateUrl) return;
        setIsGenerating(true);
        setProgress({ stage: 'starting', task: 'Initializing...' });
        setShowDownload(false);
        try {
            console.log("📤 [FRONTEND] CSV HEADERS:", csvData.columns);
            const payload = {
                participants: csvData.participants,
                templateUrl,
                publicId,
                fields,
                force_mass_email: true,
                customDimensions: useCustomSize ? { width: customWidth, height: customHeight } : null
            };
            console.log("📤 [FRONTEND] FINAL PAYLOAD DUMP:", JSON.stringify(payload, null, 2));
            const res = await axios.post(`${API_BASE}/generate`, payload);

            const key = res.data.key;
            setGenKey(key);
            const es = new EventSource(`${API_BASE}/progress?key=${key}`);
            es.onmessage = (e) => {
                if (e.data === 'connected') return;
                const data = JSON.parse(e.data);
                if (data.type === 'ping') return;

                if (data.type === 'queue_update') {
                    setProgress(prev => {
                        const newQueue = data.data?.queue || [];
                        const activeJob = data.data?.activeJob || null;

                        if (!prev) return { stage: 'queued', queue: newQueue, activeJob };

                        return {
                            ...prev,
                            queue: newQueue,
                            activeJob: activeJob ? {
                                status: activeJob.progress,
                                percent: activeJob.progress?.percent,
                                estimatedRemaining: activeJob.progress?.estimatedTimeRemaining || "Calculating..."
                            } : null,
                            message: data.message || prev.message
                        };
                    });
                    return;
                }

                setProgress(prev => ({
                    ...prev,
                    ...data,
                    stage: data.stage || prev?.stage
                }));

                if (data.stage === 'completed' || data.stage === 'finalizing') {
                    if (data.downloadUrl) {
                        setDownloadUrl(`${API_BASE}${data.downloadUrl}`);
                    }
                    if (data.stage === 'completed') {
                        setShowDownload(true);
                        setIsGenerating(false);
                        es.close();
                        toast.success('Batch Production Complete!');
                    }
                }
            };
            es.onerror = () => {
                es.close();
                setIsGenerating(false);
                toast.error('Connection lost. Please check server status.');
            };
        } catch (err) {
            setIsGenerating(false);
            console.error('Generation Error:', err);
            toast.error(err.response?.data?.error || 'Production Bridge Failure');
        }
    };

    const startGeneration = () => {
        if (hasEmailColumn) {
            confirmDialog({
                message: `Are you ready to finalize and email certificates to all ${csvData.participants.length} participants?`,
                header: 'Mass Email Production Confirmation',
                icon: 'pi pi-envelope',
                acceptLabel: 'Yes, Confirm & Send',
                rejectLabel: 'Cancel',
                accept: () => executeGeneration(true),
                reject: () => { } // Just close
            });
        } else {
            confirmDialog({
                message: `Are you ready to generate ${csvData.participants.length} certificates for download?`,
                header: 'Bulk Production Confirmation',
                icon: 'pi pi-file-pdf',
                acceptLabel: 'Start Generation',
                rejectLabel: 'Cancel',
                accept: () => executeGeneration(false),
                reject: () => { }
            });
        }
    };

    const stopGeneration = async () => {
        try { await axios.post(`${API_BASE}/stop`, { key: genKey }); } catch { }
        setIsGenerating(false); setProgress(null);
    };

    const handleDownload = () => {
        window.open(downloadUrl);
        toast('All files being purged from cloud.', { icon: 'ℹ️', duration: 4000 });
        setTimeout(async () => { try { await axios.post(`${API_BASE}/cleanup`, { key: genKey, publicId }); } catch { } }, 5000);
    };

    /* ═══ AUTH GATES ═══ */
    if (loading) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen">
                <div className="text-center">
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                    <p className="mt-3 font-bold text-600 font-outfit">Synchronizing Secure Access...</p>
                </div>
            </div>
        );
    }

    /* ═══ MAIN CONSOLE ═══ */
    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            {/* CACHE BREAKER BANNER */}
            <div style={{ background: '#EF4444', color: 'white', textAlign: 'center', fontSize: '10px', fontWeight: 900, padding: '2px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
                V2.0 DEBUG MODE ACTIVE - EMAIL FLAG HARDCODED
            </div>
            <Toaster position="top-center" />

            <div className="main-content" style={{ marginLeft: 0 }}>
                {/* ═══ MOBILE VIEWMODE DIALOG (High Precision Guidance) ═══ */}
                <Dialog
                    header="Experience Optimization"
                    visible={isMobile && !viewModeSelected && user}
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
                {/* ═══ TOPBAR — SYMMETRIC PREMIUM EDITION ═══ */}
                <div className="topbar">
                    {/* LEFT: BRANDING */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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

                    {/* CENTER: PROGRESS TRACKER (Hidden on Mobile) */}
                    <div className="topbar-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, background: '#F8FAFC', padding: '4px', borderRadius: 50, border: '1px solid #E2E8F0' }}>
                            {[{ label: 'Import', step: 1, done: !!csvData && !!templateUrl }, { label: 'Configure', step: 2, done: fields.length > 0 }, { label: 'Generate', step: 3, done: false }].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50,
                                        background: s.done ? 'rgba(16,185,129,0.08)' : (s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? '#fff' : 'transparent'),
                                        border: s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? '1.5px solid #2563EB' : '1px solid transparent',
                                        boxShadow: s.step === (fields.length > 0 ? 3 : (csvData ? 2 : 1)) ? '0 4px 10px rgba(37,99,235,0.1)' : 'none',
                                        transition: 'all 0.3s ease'
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
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, position: 'relative', zIndex: 999 }}>
                        <Button label="Quiz Hub" icon="pi pi-bolt" size="small"
                            style={{ borderRadius: 50, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', border: 'none', cursor: 'pointer' }}
                            onClick={() => navigate('/quiz')} />
                        {isGenerating && (
                            <Button icon="pi pi-stop-circle" size="small" className="p-button-danger p-button-text" onClick={stopGeneration} style={{ borderRadius: 50 }} />
                        )}

                        <div style={{ height: 32, width: 1, background: '#E2E8F0', margin: '0 8px' }} className="mobile-hide"></div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px', background: '#F8FAFC', borderRadius: 50, border: '1px solid #E2E8F0' }}>
                            <div style={{ textAlign: 'right' }} className="mobile-hide">
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{user.email || 'Industrial User'}</div>
                                <div style={{ fontSize: '0.58rem', color: '#94A3B8', fontWeight: 600 }}>Neon Auth Secure</div>
                            </div>
                            <Avatar image={`https://ui-avatars.com/api/?name=${user.email}&background=3B82F6&color=fff`} shape="circle" size="normal" />
                            <Button icon="pi pi-power-off" className="p-button-rounded p-button-text p-button-danger"
                                tooltip="Logout" size="small"
                                style={{ width: 32, height: 32 }}
                                onClick={() => authClient.signOut()} />
                        </div>
                    </div>
                </div>

                {/* ═══ PREMIUM KPI DASHBOARD ═══ */}
                <div style={{ padding: '20px 24px 0' }}>
                    <style>{`
                        @keyframes countUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                        @keyframes kpiPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.2); } 50% { box-shadow: 0 0 0 8px rgba(59,130,246,0); } }
                        .kpi-card { 
                            background: #fff; border-radius: 20px; padding: 20px; 
                            border: 1px solid #F1F5F9; transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
                            position: relative; overflow: hidden;
                        }
                        .kpi-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -12px rgba(0,0,0,0.08); border-color: rgba(59,130,246,0.15); }
                        .kpi-card::before { content: ''; position: absolute; top: 0; right: 0; width: 100px; height: 100px; opacity: 0.04; border-radius: 50%; transform: translate(30%, -30%); }
                        .step-wizard-card {
                            background: #fff; border-radius: 24px; padding: 28px;
                            border: 1px solid #F1F5F9;
                            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
                            transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
                        }
                        .step-wizard-card:hover { box-shadow: 0 20px 40px -12px rgba(0,0,0,0.06); }
                        .step-number {
                            width: 36px; height: 36px; border-radius: 12px;
                            display: flex; align-items: center; justify-content: center;
                            font-size: 0.8rem; font-weight: 900; font-family: 'Outfit';
                        }
                        .field-chip {
                            display: inline-flex; align-items: center; gap: 8px;
                            padding: 8px 16px; border-radius: 999px;
                            background: #F8FAFC; border: 1px solid #E2E8F0;
                            font-size: 0.8rem; font-weight: 700; color: #334155;
                            cursor: pointer; transition: all 0.2s;
                        }
                        .field-chip:hover { background: rgba(59,130,246,0.08); border-color: #3B82F6; color: #3B82F6; transform: translateY(-1px); }
                        .field-chip.mapped { background: rgba(59,130,246,0.06); border-color: rgba(59,130,246,0.3); color: #2563EB; }
                        .field-chip.mapped:hover { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.3); color: #DC2626; }
                        .action-btn-primary {
                            background: linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #A855F7 100%);
                            background-size: 200% auto;
                            border: none; border-radius: 16px;
                            color: #fff; font-weight: 800; font-size: 1rem;
                            padding: 16px 32px; cursor: pointer; width: 100%;
                            transition: all 0.4s ease; box-shadow: 0 8px 30px rgba(59,130,246,0.35);
                            display: flex; align-items: center; justify-content: center; gap: 10px;
                        }
                        .action-btn-primary:hover { background-position: right center; transform: translateY(-2px); box-shadow: 0 16px 40px rgba(59,130,246,0.45); }
                        .action-btn-secondary {
                            background: #fff; border: 1.5px solid #E2E8F0; border-radius: 16px;
                            color: #334155; font-weight: 700; font-size: 0.95rem;
                            padding: 14px 24px; cursor: pointer; width: 100%;
                            transition: all 0.25s; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                            display: flex; align-items: center; justify-content: center; gap: 10px;
                        }
                        .action-btn-secondary:hover { border-color: #3B82F6; color: #3B82F6; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59,130,246,0.12); }
                        .upload-zone-premium {
                            border: 2px dashed #E2E8F0; border-radius: 16px; padding: 20px;
                            transition: all 0.25s; cursor: pointer;
                            background: linear-gradient(135deg, rgba(59,130,246,0.01), rgba(168,85,247,0.01));
                        }
                        .upload-zone-premium:hover { border-color: #3B82F6; background: rgba(59,130,246,0.03); }
                        @media (max-width: 768px) {
                            .step-wizard-card h3 { font-size: 0.95rem !important; }
                            .step-wizard-card .step-number + div > div:first-child { font-size: 0.55rem !important; }
                            .action-btn-primary { padding: 20px 32px; font-size: 1.1rem; }
                        }
                    `}</style>
                    <div className="kpi-grid">
                        {/* KPI: TOTAL RECORDS */}
                        <div className="kpi-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <i className="pi pi-users" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                                </div>
                                {csvData && <div className="badge badge-green">LOADED</div>}
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit', color: '#0F172A', lineHeight: 1 }}>{csvData?.participants?.length || 0}</div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Total Records</div>
                            </div>
                        </div>

                        {/* KPI: MAPPED FIELDS */}
                        <div className="kpi-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <i className="pi pi-link" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                                </div>
                                {fields.length > 0 && <div className="badge badge-purple">ACTIVE</div>}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit', color: '#0F172A', lineHeight: 1 }}>{fields.length}</div>
                                    {csvData && <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1' }}>/ {csvData.columns.length}</div>}
                                </div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Mapped Fields</div>
                            </div>
                        </div>

                        {/* KPI: TEMPLATE */}
                        <div className="kpi-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: templateUrl ? 'linear-gradient(135deg, #10B981, #34D399)' : '#F1F5F9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <i className={`pi ${templateUrl ? 'pi-verified' : 'pi-image'}`} style={{ color: templateUrl ? '#fff' : '#CBD5E1', fontSize: '0.9rem' }}></i>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Outfit', color: templateUrl ? '#10B981' : '#CBD5E1', lineHeight: 1 }}>{templateUrl ? 'Ready' : 'Pending'}</div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Template Status</div>
                            </div>
                        </div>

                        {/* KPI: SECURITY */}
                        <div className="kpi-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <i className="pi pi-shield" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                                </div>
                                <div className="badge badge-amber">SOC2</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Outfit', color: '#0F172A', lineHeight: 1 }}>AES-256</div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Encryption</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ MAIN GRID (Forced Vertical Evolution) ═══ */}
                <div style={{ padding: '0 16px 40px', display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}
                    className="console-grid">
                    <style>{`
                        .console-grid { 
                            grid-template-columns: 1fr !important; 
                        }
                        
                        /* Layout Tweaks for Full-Width Controls */
                        .card-premium { width: 100%; }
                        
                        @media (max-width: 991px) {
                          .sidebar { transform: translateX(-100%); width: 280px; }
                          .sidebar.open { transform: translateX(0); }
                          .main-content { margin-left: 0 !important; }
                          .topbar { padding: 0 16px; }
                        }
                        @media (max-width: 768px) {
                          h1 { font-size: 1.75rem !important; }
                          .topbar { height: 60px; }
                          .card-premium { padding: 16px; border-radius: 16px; }
                          .stat-card { padding: 14px; border-radius: 12px; }
                          .mobile-hide { display: none !important; }
                          .desktop-hide { display: block !important; }
                        }

                        @media (min-width: 769px) {
                          .desktop-hide { display: none !important; }
                        }

                        .mobile-only { display: none; }
                        @media (max-width: 768px) {
                            .mobile-only { display: inline-flex !important; }
                        }

                        .canvas-viewport::-webkit-scrollbar {
                          height: 6px;
                        }
                        .canvas-viewport::-webkit-scrollbar-track {
                          background: rgba(0,0,0,0.05);
                          border-radius: 10px;
                        }
                        .canvas-viewport::-webkit-scrollbar-thumb {
                          background: var(--accent);
                          border-radius: 10px;
                        }

                        [data-aos] { transition-duration: 700ms !important }
                    `}</style>

                    {/* LEFT: Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* STEP 1: IMPORT ASSETS */}
                        <div className="step-wizard-card" data-aos="fade-right">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                <div className="step-number" style={{ background: (csvData && templateUrl) ? '#D1FAE5' : 'linear-gradient(135deg, #3B82F6, #6366F1)', color: (csvData && templateUrl) ? '#059669' : '#fff', boxShadow: (csvData && templateUrl) ? 'none' : '0 8px 20px rgba(59,130,246,0.35)' }}>
                                    {(csvData && templateUrl) ? <i className="pi pi-check" style={{ fontSize: '0.8rem' }}></i> : '01'}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>Step 1 — IMPORT</div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit', color: '#0F172A' }}>Data & Template</h3>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* CSV UPLOAD */}
                                <div className="upload-zone-premium">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: csvData ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className={`pi ${csvData ? 'pi-check-circle' : 'pi-file'}`} style={{ color: csvData ? '#10B981' : '#3B82F6', fontSize: '1rem' }}></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>CSV Data File</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{csvData ? `${csvData.participants.length} records, ${csvData.columns.length} columns loaded` : 'Accepts .csv — Max 10MB, 100 rows'}</div>
                                        </div>
                                        {csvData && <div style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 800, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: 999 }}>✓ Ready</div>}
                                    </div>
                                    <FileUpload mode="basic" name="csv" accept=".csv" maxFileSize={10000000} onSelect={onCsvUpload} auto chooseLabel={csvData ? 'Replace CSV' : 'Upload CSV'} className="w-full" />
                                </div>

                                {/* TEMPLATE UPLOAD */}
                                <div className="upload-zone-premium">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: templateUrl ? 'rgba(16,185,129,0.1)' : 'rgba(168,85,247,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className={`pi ${templateUrl ? 'pi-check-circle' : 'pi-image'}`} style={{ color: templateUrl ? '#10B981' : '#A855F7', fontSize: '1rem' }}></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Certificate Template</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{templateUrl ? 'Design uploaded to cloud canvas' : 'PNG/JPG — Max 2MB, Standard Res (Under 2500px)'}</div>
                                        </div>
                                        {templateUrl && <div style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 800, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: 999 }}>✓ Linked</div>}
                                    </div>
                                    <FileUpload mode="basic" name="template" accept="image/*" maxFileSize={2000000} onSelect={onTemplateUpload} auto chooseLabel={templateUrl ? 'Replace Design' : 'Upload Design'} className="w-full" />
                                </div>

                                {/* RESOLUTION TOGGLE */}
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
                                            <InputNumber value={customWidth} onValueChange={(e) => setCustomWidth(e.value)} className="w-full" min={100} max={5000} inputStyle={{ border: 'none', background: 'transparent', fontWeight: 800, padding: 0 }} />
                                        </div>
                                        <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '10px 14px', border: '1px solid #E2E8F0' }}>
                                            <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Height (px)</div>
                                            <InputNumber value={customHeight} onValueChange={(e) => setCustomHeight(e.value)} className="w-full" min={100} max={5000} inputStyle={{ border: 'none', background: 'transparent', fontWeight: 800, padding: 0 }} />
                                        </div>
                                    </div>
                                )}

                                {/* FREE TIER NOTICE */}
                                <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(168,85,247,0.05))', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(59,130,246,0.12)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <i className="pi pi-info-circle" style={{ color: '#3B82F6', fontSize: '0.85rem', marginTop: 2 }}></i>
                                        <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.6 }}>
                                            <strong style={{ color: '#3B82F6' }}>100% Free</strong> — Batches limited to 100 rows. Need higher limits or advanced features? <a href="#" style={{ color: '#7C3AED', fontWeight: 800 }}>Contact VSGRPS →</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STEP 2: CONFIGURE FIELDS */}
                        {csvData && (
                            <div className="step-wizard-card" data-aos="fade-right" data-aos-delay="100">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                    <div className="step-number" style={{ background: fields.length > 0 ? 'linear-gradient(135deg, #A855F7, #EC4899)' : '#F1F5F9', color: fields.length > 0 ? '#fff' : '#94A3B8', boxShadow: fields.length > 0 ? '0 8px 20px rgba(168,85,247,0.35)' : 'none' }}>
                                        {fields.length > 0 ? <i className="pi pi-check" style={{ fontSize: '0.8rem' }}></i> : '02'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#A855F7', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>Step 2 — CONFIGURE</div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit', color: '#0F172A' }}>Dynamic Field Mapping</h3>
                                    </div>
                                    {fields.length > 0 && (
                                        <div style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 800, color: '#A855F7', background: 'rgba(168,85,247,0.08)', padding: '5px 12px', borderRadius: 999, border: '1px solid rgba(168,85,247,0.2)' }}>
                                            {fields.length}/{csvData.columns.length} mapped
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Available Columns — Click to map to canvas</div>
                                        {csvData && (
                                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: fields.length >= (csvData.participants.length > 500 ? 2 : 4) ? '#F59E0B' : '#2563EB' }}>
                                                {fields.length} / {csvData.participants.length > 500 ? 2 : 4} mapped
                                            </div>
                                        )}
                                    </div>
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
                                        <DataTable value={fields} size="small" scrollable scrollHeight="200px"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                            emptyMessage="No fields mapped">
                                            <Column field="field" header="Field" style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.82rem' }}
                                                body={(f) => <span style={{ background: 'rgba(59,130,246,0.06)', padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, color: '#3B82F6', fontFamily: 'monospace' }}>{f.field}</span>} />
                                            <Column header="Size" style={{ width: 80 }} body={(f) => <InputNumber value={f.size} onValueChange={(e) => setFields(fields.map(fi => fi.field === f.field ? { ...fi, size: e.value } : fi))} min={8} max={100} inputStyle={{ width: 56, textAlign: 'center', fontSize: '0.8rem', borderRadius: 8 }} />} />
                                            <Column header="Color" body={(f) => <ColorPicker value={f.color} onChange={(e) => setFields(fields.map(fi => fi.field === f.field ? { ...fi, color: `#${e.value}` } : fi))} />} />
                                            <Column header="Edit" body={(f) => (
                                                <Button icon="pi pi-pencil" className="p-button-text p-button-sm" style={{ color: '#3B82F6', borderRadius: 8 }}
                                                    onClick={() => setActiveFieldId(f.field)} />
                                            )} />
                                            <Column body={(f) => <Button icon="pi pi-trash" className="p-button-text p-button-danger p-button-sm" style={{ borderRadius: 8 }} onClick={() => setFields(fields.filter(fi => fi.field !== f.field))} />} />
                                        </DataTable>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 3: EXECUTE & GENERATE */}
                        {fields.length > 0 && (
                            <div className="step-wizard-card" data-aos="fade-right" data-aos-delay="200">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                    <div className="step-number" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)', color: '#fff', boxShadow: '0 8px 20px rgba(16,185,129,0.35)' }}>03</div>
                                    <div>
                                        <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#10B981', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>Step 3 — EXECUTE</div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit', color: '#0F172A' }}>Generate Certificates</h3>
                                    </div>
                                </div>

                                {csvData && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20, background: '#F8FAFC', borderRadius: 14, padding: '14px 18px', border: '1px solid #E2E8F0' }}>
                                        <div><div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Records</div><div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Outfit', color: '#0F172A' }}>{csvData.participants.length}</div></div>
                                        <div><div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fields</div><div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Outfit', color: '#0F172A' }}>{fields.length}</div></div>
                                        <div><div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Est. Time</div><div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Outfit', color: '#3B82F6' }}>~{Math.max(3, Math.ceil(csvData.participants.length * 0.3))}s</div></div>
                                    </div>
                                )}

                                {hasEmailColumn && (
                                    <div style={{ background: 'rgba(59,130,246,0.04)', borderRadius: 14, padding: '16px 20px', border: '1px solid rgba(59,130,246,0.1)', marginBottom: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="pi pi-lock" style={{ color: '#2563EB', fontSize: '0.8rem' }}></i>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#0F172A', fontFamily: 'Outfit' }}>Delivery Authorization <span style={{ fontSize: '0.6rem', color: '#2563EB', opacity: 0.6 }}>v2.0</span></div>
                                        </div>
                                        <p style={{ fontSize: '0.7rem', color: '#64748B', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                                            The system detected <span style={{ color: '#2563EB', fontWeight: 800 }}>{csvData.participants.length}</span> potential recipients. You will be prompted to grant final delivery permission after clicking the button below.
                                        </p>
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

                    {/* RIGHT: Canvas & Progress */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Canvas Area Container — PREMIUM STUDIO EDITION */}
                        <div className="canvas-container" data-aos="fade-left" onClick={() => setActiveFieldId(null)}
                            style={{ background: '#fff', borderRadius: 24, border: '1px solid #F1F5F9', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>

                            {/* STUDIO TOOLBAR */}
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
                                    {/* ZOOM PILLS */}
                                    <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '3px 6px', gap: 2 }}>
                                        <Button icon="pi pi-minus" className="p-button-text p-button-sm"
                                            style={{ width: 26, height: 26, borderRadius: 7, color: '#64748B' }}
                                            onClick={(e) => { e.stopPropagation(); setCanvasZoom(Math.max(0.5, canvasZoom - 0.1)); }} />
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, minWidth: 38, textAlign: 'center', color: '#0F172A' }}>{Math.round(canvasZoom * 100)}%</span>
                                        <Button icon="pi pi-plus" className="p-button-text p-button-sm"
                                            style={{ width: 26, height: 26, borderRadius: 7, color: '#64748B' }}
                                            onClick={(e) => { e.stopPropagation(); setCanvasZoom(Math.min(3, canvasZoom + 0.1)); }} />
                                        <div style={{ width: 1, height: 16, background: '#E2E8F0', margin: '0 2px' }}></div>
                                        <Button icon="pi pi-refresh" className="p-button-text p-button-sm"
                                            style={{ width: 26, height: 26, borderRadius: 7, color: '#64748B' }}
                                            tooltip="Reset zoom" onClick={(e) => { e.stopPropagation(); setCanvasZoom(1); }} />
                                    </div>
                                    {activeFieldId && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', padding: '5px 12px', borderRadius: 999 }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', animation: 'kpiPulse 2s infinite' }}></div>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3B82F6', fontFamily: 'monospace' }}>{activeFieldId}</span>
                                        </div>
                                    )}
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
                                            {/* Alignment Guides */}
                                            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, borderTop: '1px dashed rgba(59,130,246,0.1)', pointerEvents: 'none' }}></div>
                                            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, borderLeft: '1px dashed rgba(59,130,246,0.1)', pointerEvents: 'none' }}></div>

                                            {!templateUrl && (
                                                <div style={{
                                                    width: '100%', height: '100%',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                    color: '#CBD5E1', gap: 12
                                                }}>
                                                    <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(168,85,247,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(59,130,246,0.2)' }}>
                                                        <i className="pi pi-image" style={{ fontSize: '2.2rem', color: 'rgba(59,130,246,0.3)' }}></i>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#94A3B8', letterSpacing: '0.02em' }}>Canvas Ready</div>
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

                                            {/* Watermark */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 12,
                                                right: 12,
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                color: 'rgba(0,0,0,0.25)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                fontFamily: 'Outfit',
                                                pointerEvents: 'none',
                                                zIndex: 30,
                                                background: 'rgba(255,255,255,0.4)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                backdropFilter: 'blur(4px)'
                                            }}>
                                                Generated by CertifyPro
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RENDER ADVANCED EDITOR PANEL (SaaS / Premium Design) */}
                        {activeFieldId && (
                            <div style={{ padding: '0 16px 40px' }} data-aos="fade-up">
                                <div className="editor-panel-container" style={{
                                    maxWidth: '1200px',
                                    margin: '0 auto',
                                    background: 'rgba(248, 250, 252, 0.8)',
                                    backdropFilter: 'blur(20px) saturate(160%)',
                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                    borderRadius: '30px',
                                    padding: window.innerWidth < 768 ? '24px' : '32px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255,255,255,0.5)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* HEADER */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                                        <div>
                                            <div style={{
                                                fontSize: '0.65rem', fontWeight: 900, color: '#64748B',
                                                letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6,
                                                display: 'flex', alignItems: 'center', gap: 8
                                            }}>
                                                <div style={{ width: 12, height: 2, background: '#2563EB', borderRadius: 2 }}></div>
                                                Design Engine Pro
                                            </div>
                                            <h3 style={{ fontSize: '1.75rem', margin: 0, fontFamily: 'Outfit', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                                                Advanced Editor: <span style={{ color: '#2563EB', position: 'relative' }}>{activeFieldId}
                                                    <span style={{ position: 'absolute', bottom: 4, left: 0, width: '100%', height: '8px', background: 'rgba(37,99,235,0.08)', zIndex: -1, borderRadius: 4 }}></span>
                                                </span>
                                            </h3>
                                        </div>
                                        <Button icon="pi pi-times" className="p-button-rounded p-button-text p-button-secondary"
                                            style={{
                                                width: 44, height: 44, background: '#fff',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9'
                                            }}
                                            onClick={() => setActiveFieldId(null)}
                                        />
                                    </div>

                                    {/* GRID CONTROLS — THE COMMAND CENTER */}
                                    <div className="editor-grid">
                                        {/* A. PRECISION MAP & NUDGE PAD */}
                                        <div className="control-card" data-aos="fade-up" data-aos-delay="50">
                                            <div className="card-label">
                                                <i className="pi pi-map-marker" style={{ color: '#2563EB' }}></i>
                                                <span>Precision Mapping</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <div style={{ flex: 1, position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.62rem', fontWeight: 900, color: '#2563EB', zIndex: 5 }}>X</span>
                                                    <InputNumber value={fields.find(f => f.field === activeFieldId)?.x || 0}
                                                        onValueChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, x: e.value } : f))}
                                                        inputStyle={{ width: '100%', paddingLeft: 28, height: 42, borderRadius: 12, fontSize: '0.85rem', fontWeight: 800 }} />
                                                </div>
                                                <div style={{ flex: 1, position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.62rem', fontWeight: 900, color: '#2563EB', zIndex: 5 }}>Y</span>
                                                    <InputNumber value={fields.find(f => f.field === activeFieldId)?.y || 0}
                                                        onValueChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, y: e.value } : f))}
                                                        inputStyle={{ width: '100%', paddingLeft: 28, height: 42, borderRadius: 12, fontSize: '0.85rem', fontWeight: 800 }} />
                                                </div>
                                            </div>
                                            {/* HIGH-END NUDGE PAD */}
                                            <div style={{
                                                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6,
                                                background: '#F1F5F9', padding: 8, borderRadius: 18,
                                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                            }}>
                                                <div />
                                                <Button icon="pi pi-chevron-up" className="p-button-text nudge-btn" onClick={() => nudge(0, -1)} />
                                                <div />
                                                <Button icon="pi pi-chevron-left" className="p-button-text nudge-btn" onClick={() => nudge(-1, 0)} />
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 900, color: '#94A3B8', letterSpacing: '0.1em' }}>STEP</div>
                                                <Button icon="pi pi-chevron-right" className="p-button-text nudge-btn" onClick={() => nudge(1, 0)} />
                                                <div />
                                                <Button icon="pi pi-chevron-down" className="p-button-text nudge-btn" onClick={() => nudge(0, 1)} />
                                                <div />
                                            </div>
                                        </div>

                                        {/* B. TYPOGRAPHY: FONT FAMILY */}
                                        <div className="control-card" data-aos="fade-up" data-aos-delay="100">
                                            <div className="card-label">
                                                <i className="pi pi-language" style={{ color: '#2563EB' }}></i>
                                                <span>Font Engine</span>
                                            </div>
                                            <select
                                                className="premium-select"
                                                value={fields.find(f => f.field === activeFieldId)?.fontFamily || 'Inter'}
                                                onChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, fontFamily: e.target.value } : f))}
                                            >
                                                <optgroup label="Sans Serif">
                                                    <option value="Inter">Inter (System)</option>
                                                    <option value="Outfit">Outfit (Display)</option>
                                                    <option value="Roboto">Roboto</option>
                                                    <option value="Montserrat">Montserrat</option>
                                                </optgroup>
                                                <optgroup label="Serif & Script">
                                                    <option value="PlayfairDisplay">Playfair Display</option>
                                                    <option value="DancingScript">Dancing Script</option>
                                                </optgroup>
                                            </select>
                                            <div style={{
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                                                borderRadius: 14, minHeight: 60, border: '1px solid #E2E8F0',
                                                fontFamily: fields.find(f => f.field === activeFieldId)?.fontFamily,
                                                fontSize: '1rem', fontWeight: 700, color: '#334155'
                                            }}>
                                                Sample Text
                                            </div>
                                        </div>

                                        {/* C. FONT WEIGHT & STYLE */}
                                        <div className="control-card" data-aos="fade-up" data-aos-delay="150">
                                            <div className="card-label">
                                                <i className="pi pi-align-left" style={{ color: '#2563EB' }}></i>
                                                <span>Weight & Style</span>
                                            </div>
                                            <select
                                                className="premium-select"
                                                value={fields.find(f => f.field === activeFieldId)?.fontWeight || 'normal'}
                                                onChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, fontWeight: e.target.value } : f))}
                                            >
                                                <option value="light">300 · Light</option>
                                                <option value="normal">400 · Regular</option>
                                                <option value="medium">500 · Medium</option>
                                                <option value="bold">700 · Bold</option>
                                                <option value="black">900 · Black</option>
                                            </select>
                                            <div style={{ display: 'flex', gap: 6, background: '#F8FAFC', padding: 4, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                                                {['left', 'center', 'right'].map(align => (
                                                    <Button
                                                        key={align}
                                                        icon={`pi pi-align-${align}`}
                                                        className={`p-button-text p-button-sm ${fields.find(f => f.field === activeFieldId)?.textAlign === align ? 'active-align' : ''}`}
                                                        style={{
                                                            flex: 1, height: 36, padding: 0, border: 'none',
                                                            background: fields.find(f => f.field === activeFieldId)?.textAlign === align ? '#2563EB' : 'transparent',
                                                            color: fields.find(f => f.field === activeFieldId)?.textAlign === align ? '#fff' : '#64748B',
                                                            borderRadius: 8, transition: 'all 0.2s'
                                                        }}
                                                        onClick={() => setFields(fields.map(f => f.field === activeFieldId ? { ...f, textAlign: align } : f))}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* D. TYPOGRAPHY & SCALE */}
                                        <div className="control-card" data-aos="fade-up" data-aos-delay="200">
                                            <div className="card-label">
                                                <i className="pi pi-text-color" style={{ color: '#2563EB' }}></i>
                                                <span>Typography Scale</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.62rem', fontWeight: 900, color: '#94A3B8', zIndex: 5 }}>SIZE</span>
                                                    <InputNumber value={fields.find(f => f.field === activeFieldId)?.size || 24}
                                                        onValueChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, size: e.value } : f))}
                                                        min={8} max={250} inputStyle={{ width: '100%', paddingLeft: 44, height: 42, borderRadius: 12, fontWeight: 800 }} />
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.62rem', fontWeight: 900, color: '#94A3B8', zIndex: 5 }}>TRS</span>
                                                    <InputNumber value={fields.find(f => f.field === activeFieldId)?.letterSpacing || 0}
                                                        onValueChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, letterSpacing: e.value } : f))}
                                                        min={-20} max={100} inputStyle={{ width: '100%', paddingLeft: 44, height: 42, borderRadius: 12, fontWeight: 800 }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* E. APPEARANCE & LOGIC */}
                                        <div className="control-card" data-aos="fade-up" data-aos-delay="250">
                                            <div className="card-label">
                                                <i className="pi pi-palette" style={{ color: '#2563EB' }}></i>
                                                <span>Color Theme</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFC', padding: '10px 12px', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                                                <div style={{ height: 38, width: 38, position: 'relative', overflow: 'hidden', borderRadius: 10, border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
                                                    <ColorPicker value={fields.find(f => f.field === activeFieldId)?.color || '#000000'}
                                                        onChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, color: `#${e.value}` } : f))}
                                                        style={{ position: 'absolute', top: -12, left: -12, width: 64, height: 64 }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <input type="text" value={(fields.find(f => f.field === activeFieldId)?.color || '#000000').toUpperCase()}
                                                        onChange={(e) => setFields(fields.map(f => f.field === activeFieldId ? { ...f, color: e.target.value } : f))}
                                                        style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', fontFamily: 'monospace', outline: 'none' }} />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                                                {['#000000', '#2563EB', '#7C3AED', '#DC2626', '#10B981', '#F59E0B'].map(c => (
                                                    <div key={c} onClick={() => setFields(fields.map(f => f.field === activeFieldId ? { ...f, color: c } : f))}
                                                        style={{
                                                            width: 22, height: 22, borderRadius: '6px', background: c, cursor: 'pointer',
                                                            border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                                            transform: fields.find(f => f.field === activeFieldId)?.color === c ? 'scale(1.2)' : 'none',
                                                            transition: 'transform 0.2s'
                                                        }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* FOOTER ACTIONS */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, borderTop: '1px solid rgba(226, 232, 240, 0.6)', paddingTop: 24 }}>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <Button
                                                label="Remove Layer" icon="pi pi-trash"
                                                className="p-button-danger p-button-text"
                                                style={{ borderRadius: 12, padding: '10px 20px', fontWeight: 800, fontSize: '0.8rem' }}
                                                onClick={() => { setFields(fields.filter(f => f.field !== activeFieldId)); setActiveFieldId(null); }}
                                            />
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, fontStyle: 'italic' }}>
                                            Select another field or click canvas to deselect.
                                        </div>
                                    </div>

                                    {/* DECORATIVE ELEMENTS */}
                                    <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
                                    <div style={{ position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
                                </div>
                            </div>
                        )}

                        {/* Progress Panel (Digital Command Center Dialog) */}
                        <Dialog
                            visible={isGenerating}
                            onHide={() => { }} // Prevent manual close
                            closable={false}
                            modal
                            header={null} // Custom Header in body
                            style={{ width: '95vw', maxWidth: 450, borderRadius: 28, overflow: 'hidden' }}
                            contentStyle={{ padding: 0, borderRadius: 28 }}
                            breakpoints={{ '960px': '75vw', '641px': '95vw' }}
                        >
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.98)',
                                padding: '32px 24px',
                                textAlign: 'center', color: '#334155'
                            }}>

                                {!progress || progress.stage === 'starting' ? (
                                    <div style={{ padding: '8px' }}>
                                        <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto 24px' }}>
                                            <i className="pi pi-cog pi-spin" style={{ fontSize: '2.8rem', color: '#2563EB', opacity: 0.9 }}></i>
                                        </div>
                                        <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.6rem', marginBottom: 8, color: '#0f172a', letterSpacing: '-0.02em' }}>Initializing Engine</h2>
                                        <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Provisioning your dedicated certificate processor...</p>
                                    </div>
                                ) : (progress.stage === 'queued' || progress.stage === 'server_busy') ? (
                                    <div style={{ padding: 8 }}>
                                        <div style={{ width: 64, height: 64, background: 'rgba(37,99,235,0.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                            <i className="pi pi-clock" style={{ fontSize: '2rem', color: '#2563EB' }}></i>
                                        </div>
                                        <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', marginBottom: 4, color: '#0f172a' }}>Priority Waitlist</h2>

                                        {progress.position !== undefined && (
                                            <div style={{ fontSize: '4.8rem', fontWeight: 900, color: '#2563EB', margin: '4px 0', fontFamily: 'Outfit', letterSpacing: '-0.05em', lineHeight: 1 }}>#{progress.position}</div>
                                        )}

                                        <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>You are in the queue. Please wait.</p>

                                        {progress.queue && progress.queue.length > 0 && (
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#3B82F6',
                                                fontWeight: 800,
                                                marginBottom: 16,
                                                background: 'rgba(37,99,235,0.05)',
                                                padding: '8px 16px',
                                                borderRadius: 12,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                border: '1px solid rgba(37,99,235,0.1)'
                                            }}>
                                                <i className="pi pi-users" style={{ fontSize: '0.9rem' }}></i>
                                                Server Load: {progress.queue.length} Active Batch{progress.queue.length !== 1 ? 'es' : ''}
                                            </div>
                                        )}

                                        {((progress.activeJob || progress.stage === 'server_busy') && progress.position === 1) && (
                                            <div style={{
                                                background: 'rgba(37,99,235,0.03)',
                                                borderRadius: 20,
                                                padding: 20,
                                                border: '1px dashed rgba(37,99,235,0.2)',
                                                marginTop: 16
                                            }}>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                    <i className="pi pi-sync pi-spin" style={{ fontSize: '0.6rem' }}></i>
                                                    Global Queue Processing
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 900, marginBottom: 10 }}>
                                                    <span>{progress.percent || progress.activeJob?.status?.percent || progress.activeJob?.percent || 0}%</span>
                                                    <span style={{ color: '#2563EB' }}>~{progress.estimatedTimeRemaining || progress.activeJob?.estimatedRemaining || progress.activeJob?.status?.estimatedTimeRemaining || 0}s</span>
                                                </div>
                                                <ProgressBar value={progress.percent || progress.activeJob?.status?.percent || 0} showValue={false} style={{ height: 8, borderRadius: 50, background: 'rgba(37,99,235,0.08)' }} />
                                            </div>
                                        )}

                                        {!progress.activeJob && progress.stage !== 'server_busy' && (
                                            <ProgressBar mode="indeterminate" style={{ height: 6, marginTop: 32, borderRadius: 50, background: 'rgba(37,99,235,0.08)' }} />
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ marginBottom: 32 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563EB', animation: 'pulse 1.5s infinite' }}></div>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                                        {progress.task || 'Gen Process'}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '2.8rem', fontWeight: 900, fontFamily: 'Outfit', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>{progress.percent || 0}%</span>
                                            </div>
                                            <ProgressBar value={progress.percent || 0} showValue={false} style={{ height: 12, borderRadius: 50, background: 'rgba(37,99,235,0.06)' }} />
                                        </div>

                                        <div style={{
                                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                                            background: '#F8FAFC', borderRadius: 24, padding: 24, border: '1px solid #E2E8F0',
                                            marginBottom: 24
                                        }}>
                                            <div style={{ textAlign: 'left', borderRight: '1px solid #E2E8F0', paddingRight: 10 }}>
                                                <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Processed</div>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Outfit', color: '#1e293b' }}>
                                                    {progress.current || 0} <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 700 }}>/ {progress.total || 0}</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'left', paddingLeft: 10 }}>
                                                <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Estimated</div>
                                                <div style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'Outfit', color: '#2563EB' }}>
                                                    {progress.estimatedTimeRemaining > 0 ? (
                                                        progress.estimatedTimeRemaining > 60 ?
                                                            `${Math.floor(progress.estimatedTimeRemaining / 60)}m ${progress.estimatedTimeRemaining % 60}s` :
                                                            `${progress.estimatedTimeRemaining}s`
                                                    ) : "Finishing"}
                                                </div>
                                            </div>
                                        </div>

                                        {progress.name && (
                                            <div style={{
                                                background: '#fff',
                                                padding: '10px 20px',
                                                borderRadius: 12,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                fontSize: '0.8rem',
                                                color: '#475569',
                                                fontWeight: 800,
                                                border: '1px solid #F1F5F9',
                                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)'
                                            }}>
                                                <i className="pi pi-user-check" style={{ color: '#2563EB', fontSize: '0.8rem' }}></i>
                                                {progress.name}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 36, borderTop: '1px solid #F1F5F9', paddingTop: 24 }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Industrial Production Engine</span>
                                </div>
                            </div>
                        </Dialog>

                        {/* COMPLETION CARD */}
                        {showDownload && (
                            <div data-aos="zoom-in" style={{ borderRadius: 24, overflow: 'hidden', position: 'relative' }}>
                                <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #059669 100%)', padding: '32px 20px', textAlign: 'center', color: 'white' }}>
                                    <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.03)', borderRadius: '50%', pointerEvents: 'none' }}></div>
                                    <div style={{ position: 'absolute', bottom: -60, left: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }}></div>
                                    <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                                        <i className="pi pi-check-circle" style={{ fontSize: '1.8rem' }}></i>
                                    </div>
                                    <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.5rem', marginBottom: 8, letterSpacing: '-0.01em' }}>Batch Generated! 🎉</h3>
                                    <p style={{ opacity: 0.7, marginBottom: 24, fontSize: '0.85rem', maxWidth: 280, margin: '0 auto 24px' }}>Your batch of certificates is ready for delivery.</p>
                                    <button onClick={handleDownload} style={{ width: '100%', maxWidth: 280, background: 'rgba(255,255,255,0.95)', color: '#065F46', border: 'none', borderRadius: 16, padding: '14px 20px', fontWeight: 900, fontSize: '0.92rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
                                        <i className="pi pi-download"></i>
                                        Download ZIP Package
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="security-card" style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(168,85,247,0.06))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.1)', flexShrink: 0
                            }} className="mobile-hide">
                                <i className="pi pi-shield" style={{ fontSize: '1.2rem', color: '#3B82F6' }}></i>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#3B82F6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Zero-Retention</div>
                                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>Data is destroyed 60s after export or 15m of inactivity.</p>
                            </div>
                            <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#10B981', background: 'rgba(16,185,129,0.08)', padding: '2px 8px', borderRadius: 50 }}>✓ Active</div>
                                <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#CBD5E1', marginTop: 4 }}>SOC2 · AES</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Dialog */}
                <Dialog visible={showPreviewDialog} onHide={() => setShowPreviewDialog(false)}
                    header="Certificate Preview" style={{ width: '90vw', maxWidth: 800 }}
                    className="shadow-8">
                    <div style={{ height: '70vh', background: 'var(--bg-secondary)', borderRadius: 12, overflow: 'hidden' }}>
                        <iframe src={previewUrl} width="100%" height="100%" frameBorder="0"></iframe>
                    </div>
                </Dialog>

                {/* Global Loader Overlay */}
                {(isPreviewing || isUploading || (isGenerating && (!progress || progress.stage === 'starting'))) && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{ textAlign: 'center', padding: '40px 60px', background: 'white', border: '1px solid var(--border)', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                            <Loader />
                            <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, marginTop: 24, color: '#0F172A', fontSize: '1.5rem' }}>
                                {isUploading ? 'Processing Asset...' : isPreviewing ? 'Generating Preview...' : 'Initializing Engine...'}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, marginTop: 8 }}>
                                Please wait while we set things up.
                            </p>
                        </div>
                    </div>
                )}
                <ConfirmDialog />
            </div>
        </div>
    );
}

export default Home;
