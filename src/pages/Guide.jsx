import React, { useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import AOS from 'aos';

const Guide = ({ onBack }) => {
    useEffect(() => {
        AOS.init({ duration: 800 });
    }, []);

    const sections = [
        {
            title: "🚀 How to Use CertifyPro",
            icon: "pi-directions",
            color: "#3B82F6",
            steps: [
                { label: "Upload Template", desc: "Upload your certificate design (JPG/PNG/PDF) to the Studio." },
                { label: "Import Data", desc: "Upload a CSV file containing participant names and emails." },
                { label: "Map Fields", desc: "Drag and drop dynamic fields onto your design." },
                { label: "Bulk Generate", desc: "Start the engine to generate hundreds of certificates in minutes." }
            ]
        },
        {
            title: "🔐 Verification Protocol",
            icon: "pi-shield",
            color: "#10B981",
            content: "Our 3-layer security system ensures every certificate is tamper-proof:",
            layers: [
                { name: "Layer 1: Hashing", detail: "Cryptographic SHA-256 fingerprinting of the file content." },
                { name: "Layer 2: Metadata", detail: "Decoding hidden UUIDs embedded in the PDF structure." },
                { name: "Layer 3: Registry", detail: "Cross-validation with our official issuance database." }
            ]
        },
        {
            title: "📤 Sharing Your Success",
            icon: "pi-share-alt",
            color: "#A855F7",
            tips: [
                "LinkedIn: Use your unique Certificate ID in your profile certifications.",
                "Email: Certificates are auto-sent via Brevo API during generation.",
                "Public Links: Host your PDF on Google Drive and share the link for public audit."
            ]
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)', padding: '60px 24px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '60px' }} data-aos="fade-down">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#DBEAFE', padding: '8px 16px', borderRadius: '20px', marginBottom: '20px' }}>
                        <i className="pi pi-book" style={{ color: '#2563EB' }}></i>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E40AF', letterSpacing: '0.05em' }}>OFFICIAL USER GUIDE</span>
                    </div>
                    <h1 style={{ fontFamily: 'Outfit', fontSize: '3rem', fontWeight: 900, color: '#0F172A', margin: '0 0 16px' }}>Mastering CertifyPro</h1>
                    <p style={{ fontSize: '1.1rem', color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>Everything you need to know about generating, securing, and verifying professional certificates.</p>
                </div>

                {/* Grid Layout */}
                <div style={{ display: 'grid', gap: '32px' }}>
                    
                    {sections.map((sec, idx) => (
                        <div key={idx} data-aos="fade-up" data-aos-delay={idx * 100}>
                            <Card style={{ borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${sec.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <i className={`pi ${sec.icon}`} style={{ color: sec.color, fontSize: '1.5rem' }}></i>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>{sec.title}</h3>
                                        
                                        {sec.steps && (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                                {sec.steps.map((step, sidx) => (
                                                    <div key={sidx} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: sec.color, marginBottom: '4px' }}>STEP 0{sidx + 1}</div>
                                                        <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>{step.label}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{step.desc}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {sec.layers && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <p style={{ color: '#475569', marginBottom: '8px' }}>{sec.content}</p>
                                                {sec.layers.map((layer, lidx) => (
                                                    <div key={lidx} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 16px', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #DCFCE7' }}>
                                                        <i className="pi pi-check-circle" style={{ color: '#10B981' }}></i>
                                                        <span style={{ fontSize: '0.9rem', color: '#065F46' }}><strong>{layer.name}:</strong> {layer.detail}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {sec.tips && (
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
                                                {sec.tips.map((tip, tidx) => (
                                                    <li key={tidx} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 16px', background: '#F5F3FF', borderRadius: '12px', border: '1px solid #EDE9FE' }}>
                                                        <i className="pi pi-send" style={{ color: '#8B5CF6' }}></i>
                                                        <span style={{ fontSize: '0.9rem', color: '#5B21B6' }}>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}

                    {/* Dos and Don'ts */}
                    <div data-aos="fade-up">
                        <Card style={{ borderRadius: '24px', border: '1px solid #FECACA', background: '#FFF5F5' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991B1B', marginBottom: '24px', textAlign: 'center' }}>Best Practices: Dos and Don'ts</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                                <div style={{ background: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #FEE2E2' }}>
                                    <h4 style={{ color: '#059669', fontSize: '1rem', fontWeight: 900, marginBottom: '16px' }}>✅ THE DOS</h4>
                                    <ul style={{ display: 'grid', gap: '12px', color: '#065F46', fontSize: '0.95rem' }}>
                                        <li>Always maintain a local backup of your issued certificates.</li>
                                        <li>Verify important documents before official submission.</li>
                                        <li>Use high-resolution (300 DPI) templates for best results.</li>
                                    </ul>
                                </div>
                                <div style={{ background: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #FEE2E2' }}>
                                    <h4 style={{ color: '#DC2626', fontSize: '1rem', fontWeight: 900, marginBottom: '16px' }}>❌ THE DON'TS</h4>
                                    <ul style={{ display: 'grid', gap: '12px', color: '#991B1B', fontSize: '0.95rem' }}>
                                        <li>Never edit a generated PDF; it will break the digital seal.</li>
                                        <li>Don't use "Online PDF Compressors" (they strip security data).</li>
                                        <li>Avoid cropping or removing CertifyPro tracking margins.</li>
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: 'center', marginTop: '60px' }} data-aos="zoom-in">
                    <Button label="Back to Dashboard" icon="pi pi-arrow-left" onClick={onBack} 
                        style={{ borderRadius: '14px', padding: '14px 32px', background: '#0F172A', border: 'none' }} />
                </div>
            </div>
        </div>
    );
};

export default Guide;
