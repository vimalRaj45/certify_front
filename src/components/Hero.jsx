import React, { useEffect, useRef, useState } from 'react';
import SparkleButton from './SparkleButton';
import gsap from 'gsap';

const Hero = ({ onOpenApp }) => {
    const [typedText, setTypedText] = useState('');
    const fullText = "Assessments & Recognition.";
    const [index, setIndex] = useState(0);
    const heroRef = useRef(null);

    useEffect(() => {
        if (index < fullText.length) {
            const t = setTimeout(() => {
                setTypedText(prev => prev + fullText.charAt(index));
                setIndex(prev => prev + 1);
            }, 60);
            return () => clearTimeout(t);
        }
    }, [index]);

    useEffect(() => {
        gsap.fromTo(heroRef.current.querySelectorAll('.gsap-anim'),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, delay: 0.2, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
        );
    }, []);

    return (
        <section ref={heroRef} style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            padding: '100px 20px'
        }}>
            {/* Ambient Background Elements */}
            <div style={{
                position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                width: '80vw', height: '80vw',
                background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />

            <div style={{ 
                width: '100%',
                maxWidth: 1000, 
                textAlign: 'center', 
                position: 'relative', 
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                
                {/* Status Badge */}
                <div className="gsap-anim" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', borderRadius: 99,
                    background: '#EFF6FF', border: '1px solid #DBEAFE',
                    marginBottom: 32
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 2s infinite' }}></div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3B82F6', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Now with 100% Data Privacy
                    </span>
                </div>

                <style>{`
                    @keyframes pulse {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                    }
                `}</style>

                {/* Heading */}
                <h1 className="gsap-anim" style={{
                    fontSize: 'clamp(2.25rem, 8vw, 4.5rem)',
                    fontWeight: 900, lineHeight: 1.1,
                    letterSpacing: '-0.04em', marginBottom: 24,
                    color: '#0F172A', fontFamily: 'Outfit'
                }}>
                    Professional <span style={{ 
                        background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>{typedText}</span><br />
                    <span style={{ color: '#64748B' }}>Without the Effort.</span>
                </h1>

                {/* Subtext */}
                <p className="gsap-anim" style={{
                    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                    color: '#475569', maxWidth: 640, margin: '0 auto 48px',
                    lineHeight: 1.6, fontWeight: 500
                }}>
                    <strong>We don't just generate certificates; we provide value.</strong> Validate knowledge through secure assessments and instantly recognize success with professional, verified credentials.
                    <span style={{ display: 'block', marginTop: 12, color: '#3B82F6', fontWeight: 700 }}>Proctoring • Bulk Generation • Instant Verification</span>
                </p>

                {/* CTAs */}
                <div className="gsap-anim" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                    <button 
                        onClick={onOpenApp}
                        style={{
                            padding: '16px 36px', fontSize: '1.1rem', fontWeight: 800,
                            background: '#2563EB', color: 'white', border: 'none',
                            borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                            boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <i className="pi pi-bolt"></i> Start Generating Now
                    </button>
                    <button 
                        onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{
                            padding: '16px 32px', fontSize: '1.1rem', fontWeight: 700,
                            background: 'white', color: '#475569', border: '1.5px solid #E2E8F0',
                            borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Learn How It Works
                    </button>
                </div>

                {/* Value Props */}
                <div className="gsap-anim" style={{
                    display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px 48px',
                    marginTop: 80, borderTop: '1px solid #F1F5F9', paddingTop: 40, width: '100%', maxWidth: 840
                }}>
                    {[
                        { icon: 'pi pi-bolt', text: 'Smart Assessments' },
                        { icon: 'pi pi-verified', text: 'Verified Certificates' },
                        { icon: 'pi pi-shield', text: 'Anti-Cheat Proctoring' },
                        { icon: 'pi pi-box', text: 'Bulk ZIP Export' },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className={item.icon} style={{ fontSize: '0.7rem' }}></i>
                            </div>
                            {item.text}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
