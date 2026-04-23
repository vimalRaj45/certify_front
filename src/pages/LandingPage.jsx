import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import { Button } from 'primereact/button';
import AOS from 'aos';
import CompanyReview from '../components/CompanyReview';
import { TermsModal, PrivacyModal, SecurityModal } from '../components/LegalModals';
import HowItWorks from '../components/HowItWorks';
import BenefitsSection from '../components/BenefitsSection';
import PerformanceSection from '../components/PerformanceSection';

const LandingPage = ({ onStartApp, onVerify, user }) => {
    const [showTerms, setShowTerms] = React.useState(false);
    const [showPrivacy, setShowPrivacy] = React.useState(false);
    const [showSecurity, setShowSecurity] = React.useState(false);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, easing: 'ease-out-quint' });
    }, []);

    const features = [
        { icon: 'pi pi-bolt', title: 'Smart Assessments', desc: 'Create AI-powered quizzes with proctoring and automated scoring to validate knowledge before certification.', color: '#F59E0B', bg: '#FEF3C7' },
        { icon: 'pi pi-verified', title: 'Value-Driven Rewards', desc: 'Instantly recognize top performers with professional, verified certificates that hold real career value.', color: '#A855F7', bg: '#F3E8FF' },
        { icon: 'pi pi-shield', title: 'Bank-Grade Security', desc: 'Anti-cheating proctoring and encrypted verification ensuring your credentials remain prestigious.', color: '#2563EB', bg: '#DBEAFE' },
        { icon: 'pi pi-sync', title: 'Unified Workflow', desc: 'Directly import quiz results into our design studio to generate thousands of certificates in one click.', color: '#059669', bg: '#D1FAE5' },
    ];

    const enterpriseFeatures = [
        { icon: 'pi pi-envelope', text: 'Automated Email Distribution' },
        { icon: 'pi pi-check-circle', text: 'Certificate Verification Portal' },
        { icon: 'pi pi-chart-bar', text: 'Personalized Admin Dashboard' },
        { icon: 'pi pi-cog', text: 'Custom API & Webhook Access' },
        { icon: 'pi pi-users', text: 'Multi-User Team Management' },
        { icon: 'pi pi-palette', text: 'White-Label Branding' },
    ];

    return (
        <div style={{ background: '#F8FAFF', color: '#0F172A' }}>
            {/* Top Navbar for Landing */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100,
                background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(226, 232, 240, 0.5)', padding: '0 12px', height: 60,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 32, height: 32,
                        background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <i className="pi pi-verified text-white" style={{ fontSize: '0.9rem' }}></i>
                    </div>
                    <div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.02em', lineHeight: 1, color: '#0F172A' }}>CertifyPro</div>
                        <div style={{ fontSize: '0.45rem', fontWeight: 800, color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Smart Bulk Generation</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="hidden md:flex" style={{ gap: 20, marginRight: 8 }}>
                        <a href="#features" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Features</a>
                        <a href="#how-it-works" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>How It Works</a>
                        <a href="#benefits" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Benefits</a>
                        <span onClick={() => window.location.href = '/guide'} style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>Guide</span>
                        <span onClick={onVerify} style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', cursor: 'pointer' }}>Verify</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid #E2E8F0', paddingLeft: 12 }}>
                        <div className="hidden md:flex" style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{user?.name}</div>
                            <div style={{ fontSize: '0.55rem', color: '#64748B', fontWeight: 700 }}>Pro Account</div>
                        </div>
                        <Button label="Launch Console" icon="pi pi-bolt" size="small" className="p-button-raised" style={{ 
                            background: '#2563EB', borderRadius: 50, fontSize: '0.7rem', padding: '6px 14px', border: 'none',
                            boxShadow: '0 4px 12px rgba(37,99,235,0.2)' 
                        }} onClick={onStartApp} />
                    </div>
                </div>
            </nav>

            <Hero onOpenApp={onStartApp} />

            <PerformanceSection />

            <style>{`
                @media (max-width: 375px) {
                    nav { padding: 0 8px !important; }
                }
            `}</style>

            {/* ═══ FEATURES ═══ */}
            <section id="features" style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }} data-aos="fade-up">
                    <div className="badge badge-blue" style={{ marginBottom: 16 }}>
                        <i className="pi pi-th-large"></i> Core Platform
                    </div>
                    <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 900, marginBottom: 16, fontFamily: 'Outfit' }}>
                        Enterprise-Grade Tooling
                    </h2>
                    <p style={{ color: '#64748B', maxWidth: 550, margin: '0 auto', fontSize: '1rem' }}>
                        Beyond simple generation — we provide an ecosystem that builds knowledge, validates skills, and rewards achievement.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                    {features.map((f, i) => (
                        <div key={i} className="card-premium" data-aos="fade-up" data-aos-delay={i * 100} style={{ cursor: 'default' }}>
                            <div className="stat-icon" style={{ background: f.bg, color: f.color, marginBottom: 20 }}>
                                <i className={f.icon}></i>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 10, fontFamily: 'Outfit' }}>{f.title}</h3>
                            <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.7 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ VERIFICATION SHOWCASE ═══ */}
            <section id="verification" style={{ padding: '80px 24px', background: 'linear-gradient(rgba(255,255,255,0), #F0F4FF)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'row', gap: 64, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div data-aos="fade-right" style={{ flex: 1.1, minWidth: 300 }}>
                        <div style={{ 
                            background: '#fff', borderRadius: 28, padding: 24, 
                            boxShadow: '0 30px 60px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0',
                            marginTop: '1.5rem'
                        }}>
                             <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, marginTop: -8 }}>
                                 <div style={{ background: '#10B981', color: '#fff', padding: '6px 14px', borderRadius: 50, fontSize: '0.65rem', fontWeight: 900, boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>AUTHENTIC FILE</div>
                             </div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #F1F5F9', paddingBottom: 20, marginBottom: 20 }}>
                                 <div style={{ width: 44, height: 44, background: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                     <i className="pi pi-check-circle" style={{ fontSize: '1.2rem' }}></i>
                                 </div>
                                 <div style={{ textAlign: 'left' }}>
                                     <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0F172A' }}>James Henderson</div>
                                     <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 700 }}>CertID: SEC-3945-X9</div>
                                 </div>
                             </div>
                             <div style={{ width: '100%', height: 140, background: '#F8FAFC', borderRadius: 16, border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                 <div style={{ textAlign: 'center' }}>
                                     <i className="pi pi-shield" style={{ fontSize: '2.5rem', color: '#10B981', marginBottom: 12, opacity: 0.8 }}></i>
                                     <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10B981', letterSpacing: '0.1em' }}>CRYPTOGRAPHIC SIGNATURE VERIFIED</div>
                                 </div>
                             </div>
                             <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                 <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9', gap: 6 }}>
                                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Cryptographic Hash</span>
                                    <span style={{ fontSize: '0.72rem', color: '#3B82F6', fontWeight: 800, fontFamily: 'monospace', wordBreak: 'break-all' }}>a8f7b3...e9c2d1</span>
                                 </div>
                                 <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9', gap: 6 }}>
                                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Issue Date</span>
                                    <span style={{ fontSize: '0.72rem', color: '#0F172A', fontWeight: 800 }}>April 05, 2026</span>
                                 </div>
                                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                                     <div style={{ flex: '1 1 120px', padding: '12px', background: 'rgba(16,185,129,0.06)', borderRadius: 10, fontSize: '0.75rem', color: '#10B981', fontWeight: 800, textAlign: 'center', border: '1px solid rgba(16,185,129,0.15)' }}>Authenticity: 100%</div>
                                     <div style={{ flex: '1 1 120px', padding: '12px', background: 'rgba(59,130,246,0.06)', borderRadius: 10, fontSize: '0.75rem', color: '#2563EB', fontWeight: 800, textAlign: 'center', border: '1px solid rgba(59,130,246,0.15)' }}>Status: Active</div>
                                 </div>
                             </div>
                        </div>
                    </div>
                    
                    <div data-aos="fade-left" style={{ flex: 1.2, minWidth: 300 }}>
                        <div className="badge badge-purple" style={{ marginBottom: 16 }}>
                            <i className="pi pi-lock"></i> Trust Foundation
                        </div>
                        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, marginBottom: 20, fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.03em', textAlign: 'left' }}>
                            Anti-Forgery Protection
                        </h2>
                        <p style={{ color: '#64748B', marginBottom: 24, fontSize: '1.05rem', lineHeight: 1.8, fontWeight: 500, textAlign: 'left' }}>
                            Fight fraudulent certificates with our built-in steganography. Every PDF we generate contains an invisible, bank-grade digital signature.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 32, textAlign: 'left' }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <i className="pi pi-cloud-upload" style={{ color: '#A855F7', marginTop: 3 }}></i>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>Public Verification Portal</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Recipients and employers can instantly check validity.</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <i className="pi pi-shield" style={{ color: '#A855F7', marginTop: 3 }}></i>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>Invisible Steganography</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Verification data is hidden within the PDF binary structures.</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <button className="btn btn-blue" onClick={onVerify}>
                                Try Verification Portal <i className="pi pi-arrow-right" style={{ marginLeft: 8 }}></i>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <HowItWorks />

            {/* ═══ BENEFITS ═══ */}
            <BenefitsSection />

            {/* ═══ ENTERPRISE ═══ */}
            <section id="enterprise" style={{ padding: '100px 24px', background: '#FFFFFF' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: window.innerWidth < 991 ? 'column' : 'row', gap: 64, alignItems: 'center' }}>
                    <div data-aos="fade-right" style={{ flex: 1.2 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            background: '#F5F3FF', border: '1px solid #DDD6FE',
                            borderRadius: 999, padding: '7px 18px', marginBottom: 20,
                        }}>
                            <i className="pi pi-briefcase" style={{ color: '#7C3AED', fontSize: '0.8rem' }} />
                            <span style={{ color: '#7C3AED', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                Advanced Solutions
                            </span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, marginBottom: 20, fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.02em' }}>
                            Scaling Your Reach?
                        </h2>
                        <p style={{ color: '#64748B', marginBottom: 32, lineHeight: 1.8, fontSize: '1.05rem', fontWeight: 500 }}>
                            CertifyPro is <strong>completely free</strong> with a 100-certificate limit per run. 
                            For organizations needing unlimited generation, custom branding, or integrated API access — we offer dedicated enterprise solutions.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: 40 }}>
                            {enterpriseFeatures.map((ef, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="pi pi-check" style={{ color: '#7C3AED', fontSize: '0.6rem', fontWeight: 900 }}></i>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>{ef.text}</span>
                                </div>
                            ))}
                        </div>
                        <button 
                            style={{ 
                                padding: '16px 36px', fontSize: '1rem', background: '#0F172A', color: 'white', 
                                fontWeight: 800, border: 'none', borderRadius: 14, cursor: 'pointer',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                            }} 
                            onClick={() => window.location.href = 'https://vsgrps.netlify.app/'}
                        >
                            <i className="pi pi-comment" style={{ marginRight: 10 }}></i> Discuss Requirements
                        </button>
                    </div>

                    <div data-aos="fade-left" style={{ flex: 1, width: '100%' }}>
                        {/* Dashboard Mockup (Premium Light Mode) */}
                        <div style={{
                            background: '#FFFFFF', borderRadius: 32, padding: 32,
                            boxShadow: '0 40px 80px rgba(0,0,0,0.08)', border: '1px solid #F1F5F9',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }}></div>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }}></div>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }}></div>
                                </div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live Analytics</span>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                                <div style={{ background: '#F8FAFC', borderRadius: 16, padding: '20px 16px', border: '1px solid #F1F5F9' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>42,840</div>
                                    <div style={{ fontSize: '0.6rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginTop: 4 }}>Completed</div>
                                </div>
                                <div style={{ background: '#F8FAFC', borderRadius: 16, padding: '20px 16px', border: '1px solid #F1F5F9' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10B981' }}>99.9%</div>
                                    <div style={{ fontSize: '0.6rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginTop: 4 }}>Uptime</div>
                                </div>
                            </div>
                            
                            <div style={{ background: '#F1F5F9', borderRadius: 16, height: 100, position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(T0 top, transparent, #3B82F610)', display: 'flex', alignItems: 'flex-end', gap: 4, padding: '0 12px' }}>
                                    {[40, 70, 45, 90, 65, 80, 50, 95, 70, 85].map((h, i) => (
                                        <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--aurora-gradient)', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CONTACT ═══ */}
            <section id="contact" style={{ padding: '80px 24px', background: '#F8FAFF' }}>
                <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }} data-aos="fade-up">
                    <div className="badge badge-blue" style={{ marginBottom: 16 }}>
                        <i className="pi pi-envelope"></i> Contact
                    </div>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 900, marginBottom: 12, fontFamily: 'Outfit' }}>
                        Get In Touch With VSGRPS
                    </h2>
                    <p style={{ color: '#64748B', marginBottom: 36, fontSize: '0.95rem', lineHeight: 1.7 }}>
                        Questions about Enterprise Features, custom integrations, or need professional guidance for your organization?
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                        <button className="btn btn-blue" onClick={() => window.location.href = 'https://vsgrps.netlify.app/'}>
                            <i className="pi pi-envelope"></i> Email Consultants
                        </button>
                        <button className="btn btn-ghost" onClick={() => window.location.href = 'tel:8807099288'}>
                            <i className="pi pi-phone"></i> Book Strategy Call
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══ PRIVACY ASSURANCE ═══ */}
            <section style={{ padding: '80px 24px', background: '#F8FAFF' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }} data-aos="fade-up">
                    <div style={{
                        borderRadius: 32, padding: 'clamp(24px, 5vw, 48px) clamp(20px, 4vw, 32px)',
                        background: '#FFFFFF',
                        border: '1.5px solid #E2E8F0',
                        display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', justifyContent: 'space-between',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{ flex: '1 1 250px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="pi pi-lock" style={{ color: '#2563EB', fontSize: '1.2rem' }}></i>
                                </div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2563EB' }}>Privacy First</span>
                            </div>
                            <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#0F172A', marginBottom: 14 }}>
                                Built to Protect Your Data
                            </h3>
                            <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                                We don't store your data. Period. Your CSV files, certificate templates, and generated ZIP packages are automatically purged from our servers within 60 seconds of processing.
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0 }}>
                            {[
                                { icon: 'pi pi-trash', label: 'Auto-delete after processing' },
                                { icon: 'pi pi-eye-slash', label: 'Zero permanent storage' },
                                { icon: 'pi pi-shield', label: 'End-to-end encryption' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className={item.icon} style={{ color: '#10B981', fontSize: '0.9rem' }}></i>
                                    </div>
                                    <span style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600 }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ COMPANY REVIEW ═══ */}
            <CompanyReview />

            {/* ═══ FINAL CTA ═══ */}
            <section style={{ padding: '100px 24px' }} data-aos="zoom-in">
                <div style={{ 
                    maxWidth: 1000, margin: '0 auto', textAlign: 'center', borderRadius: 40, padding: '80px 24px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1E40AF 100%)',
                    boxShadow: '0 25px 50px -12px rgba(37,99,235,0.3)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 250, height: 250, background: 'rgba(255,255,255,0.1)', filter: 'blur(60px)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 250, height: 250, background: 'rgba(139,92,246,0.2)', filter: 'blur(60px)', borderRadius: '50%' }}></div>
                    
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: 'white', marginBottom: 16, fontFamily: 'Outfit', letterSpacing: '-0.03em' }}>
                            Ready to Transform<br />Your Certification?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 520, margin: '0 auto 40px', fontSize: '1.05rem', lineHeight: 1.7, fontWeight: 500 }}>
                            Join thousands of educators and organizers who save hours every week. 100% Free, 100% Private.
                        </p>
                        <button 
                            className="p-button-raised"
                            style={{ 
                                padding: '18px 48px', fontSize: '1.1rem', background: '#FFFFFF', color: '#2563EB', 
                                fontWeight: 800, border: 'none', borderRadius: 50, cursor: 'pointer',
                                transition: 'transform 0.2s', boxShadow: '0 12px 24px -10px rgba(0,0,0,0.2)'
                            }} 
                            onClick={onStartApp}
                        >
                            <i className="pi pi-rocket" style={{ marginRight: 10 }}></i> Launch Dashboard Now
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer style={{ borderTop: '1px solid #E2E8F0', padding: '60px 24px', background: 'white' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="pi pi-verified text-white" style={{ fontSize: '1.2rem' }}></i>
                        </div>
                        <div>
                            <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.1rem', color: '#0F172A', display: 'block', lineHeight: 1 }}>CertifyPro</span>
                            <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Privacy-First Certification</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 32, fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>
                        <span onClick={() => setShowPrivacy(true)} style={{ transition: 'color 0.2s', cursor: 'pointer' }}>Privacy Policy</span>
                        <span onClick={() => setShowTerms(true)} style={{ transition: 'color 0.2s', cursor: 'pointer' }}>Terms of Use</span>
                        <span onClick={() => window.location.href = '/guide'} style={{ transition: 'color 0.2s', cursor: 'pointer' }}>User Guide</span>
                        <span onClick={onVerify} style={{ transition: 'color 0.2s', color: '#2563EB', cursor: 'pointer' }}>Verify Certificate</span>
                        <span onClick={() => setShowSecurity(true)} style={{ transition: 'color 0.2s', cursor: 'pointer' }}>Security</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500 }}>
                        © 2026 CertifyPro. Empowering creators.
                    </div>
                </div>
            </footer>

            <TermsModal visible={showTerms} onHide={() => setShowTerms(false)} />
            <PrivacyModal visible={showPrivacy} onHide={() => setShowPrivacy(false)} />
            <SecurityModal visible={showSecurity} onHide={() => setShowSecurity(false)} />
        </div>
    );
};

export default LandingPage;
