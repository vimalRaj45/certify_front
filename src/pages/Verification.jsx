import React, { useState } from 'react';
import axios from 'axios';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import toast, { Toaster } from 'react-hot-toast';
import AOS from 'aos';

const API_BASE ='https://certify-open.onrender.com'; // Use your actual API base

const VerificationPage = ({ onBack }) => {
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState(null);

    React.useEffect(() => {
        AOS.init({ duration: 800 });
    }, []);

    const onUpload = async (e) => {
        const file = e.files[0];
        if (!file) return;

        setVerifying(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const resp = await axios.post(`${API_BASE}/verify-pdf`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(resp.data);
            if (resp.data.verified) {
                toast.success('Certificate Successfully Verified!');
            } else {
                toast.error(resp.data.message || 'Verification Failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to process verification. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFF', padding: '40px 24px', fontFamily: 'Inter, sans-serif' }}>
            <Toaster position="top-center" />

            <nav style={{ maxWidth: 800, margin: '0 auto 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={onBack}>
                    <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #3B82F6, #A855F7)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="pi pi-verified" style={{ color: '#fff', fontSize: '1rem' }}></i>
                    </div>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.2rem', color: '#0F172A' }}>CertifyPro <span style={{ color: '#3B82F6', fontWeight: 400 }}>Verify</span></span>
                </div>
                <Button label="Back to Home" icon="pi pi-arrow-left" className="p-button-text p-button-secondary" onClick={onBack} />
            </nav>

            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <div style={{
                    background: '#fff', borderRadius: 32, padding: '48px 32px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9',
                    textAlign: 'center'
                }} data-aos="fade-up">
                    <div className="badge badge-blue" style={{ marginBottom: 16 }}>
                        <i className="pi pi-shield"></i> Security Audit
                    </div>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.5rem', marginBottom: 16, color: '#0F172A', letterSpacing: '-0.02em' }}>
                        Certificate Verification
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.6 }}>
                        Upload a digital certificate issued by CertifyPro to instantly verify its authenticity and metadata.
                    </p>

                    {!result && !verifying && (
                        <div style={{
                            border: '2px dashed #E2E8F0', borderRadius: 24, padding: '40px',
                            background: 'rgba(59,130,246,0.02)', cursor: 'pointer',
                            transition: 'all 0.3s'
                        }} className="hover:border-blue-500 hover:bg-blue-50">
                            <FileUpload mode="basic" name="file" accept="application/pdf" maxFileSize={10000000}
                                onSelect={onUpload} auto chooseLabel="Click to Upload PDF Certificate"
                                style={{ width: '100%', borderRadius: 16 }} />
                            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: 16 }}>
                                Max file size: 10MB · Format: PDF
                            </p>
                        </div>
                    )}

                    {verifying && (
                        <div style={{ padding: '40px 0' }}>
                            <div className="pi pi-spin pi-spinner" style={{ fontSize: '2.5rem', color: '#2563EB', marginBottom: 20 }}></div>
                            <h3 style={{ fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Analyzing Digital Signature...</h3>
                            <ProgressBar mode="indeterminate" style={{ height: 6, borderRadius: 50, maxWidth: 300, margin: '0 auto' }} />
                        </div>
                    )}

                    {result && (
                        <div style={{
                            padding: '32px', borderRadius: 24,
                            background: result.verified ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
                            border: `1px solid ${result.verified ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                        }} data-aos="zoom-in">
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: result.verified ? '#10B981' : '#EF4444',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                                boxShadow: `0 10px 20px ${result.verified ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                            }}>
                                <i className={`pi ${result.verified ? 'pi-check' : (result.message && result.message.includes('SECURITY ALERT') ? 'pi-shield' : 'pi-times')}`} style={{ color: '#fff', fontSize: '2rem' }}></i>
                            </div>

                            <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.75rem', marginBottom: 8, color: result.verified ? '#065F46' : '#991B1B' }}>
                                {result.verified ? 'Legitimate Certificate' : (result.message && result.message.includes('SECURITY ALERT') ? 'Tampered Document Detected' : 'Verification Failed')}
                            </h2>

                            {result.message && result.message.includes('SECURITY ALERT') ? (
                                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '16px', borderRadius: '12px', marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '12px', textAlign: 'left' }}>
                                    <i className="pi pi-exclamation-triangle" style={{ color: '#DC2626', marginTop: '4px', fontSize: '1.2rem' }}></i>
                                    <div>
                                        <h4 style={{ margin: 0, color: '#991B1B', fontWeight: 800, marginBottom: '4px', fontSize: '1rem' }}>Security Alert</h4>
                                        <p style={{ margin: 0, color: '#B91C1C', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                            {result.message.replace('SECURITY ALERT: ', '')}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: '#64748B', marginBottom: 32 }}>
                                    {result.verified ? 'This certificate is authentic and recorded in our secure registry.' : result.message}
                                </p>
                            )}

                            {result.verified && (
                                <div style={{
                                    background: '#fff', padding: '24px', borderRadius: 20,
                                    textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16,
                                    border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recipient</span>
                                        <span style={{ fontWeight: 800, color: '#0F172A' }}>{result.data.name}</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Issue Date</span>
                                        <span style={{ fontWeight: 800, color: '#0F172A' }}>{new Date(result.data.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cert ID</span>
                                        <span style={{ fontWeight: 700, color: '#3B82F6', fontFamily: 'monospace', fontSize: '0.8rem' }}>{result.data.id}</span>
                                    </div>
                                </div>
                            )}

                            <Button label="Verify Another" icon="pi pi-refresh" className="p-button-text p-button-secondary"
                                style={{ marginTop: 32, fontWeight: 800 }} onClick={() => setResult(null)} />
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 40, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <i className="pi pi-lock" style={{ color: '#10B981', fontSize: '0.8rem' }}></i>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Enterprise Bank-Grade Security</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;
