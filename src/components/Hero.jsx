import React, { useEffect, useRef, useState } from 'react';
import SparkleButton from './SparkleButton';
import gsap from 'gsap';

const Hero = ({ onOpenApp, onLearnMore }) => {
    const [typedText, setTypedText] = useState('');
    const fullText = "Bulk Certificate Automation.";
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
            background: 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            padding: '100px 20px'
        }}>
            {/* Ambient Background Elements */}
            <div style={{
                position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                width: '80vw', height: '80vw',
                background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
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
                    background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
                    marginBottom: 32
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 2s infinite' }}></div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3B82F6', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Generate 999+ certificates within 10 minutes
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
                    color: 'var(--text)', fontFamily: 'Outfit'
                }}>
                    Professional <span style={{ 
                        background: 'var(--aurora-gradient)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>{typedText}</span><br />
                    <span style={{ color: 'var(--text-secondary)' }}>Without the Effort.</span>
                </h1>

                {/* Subtext */}
                <p className="gsap-anim" style={{
                    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                    color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 48px',
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
                            background: 'var(--accent)', color: 'white', border: 'none',
                            borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                            boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <i className="pi pi-bolt"></i> Start Generating Now
                    </button>
                    <button 
                        onClick={onLearnMore}
                        style={{
                            padding: '16px 32px', fontSize: '1.1rem', fontWeight: 700,
                            background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1.5px solid var(--border)',
                            borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Learn How It Works
                    </button>
                </div>

                {/* Value Props */}
                <div className="gsap-anim" style={{
                    display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px 48px',
                    marginTop: 80, borderTop: '1px solid var(--border)', paddingTop: 40, width: '100%', maxWidth: 840
                }}>
                    {[
                        { icon: 'pi pi-bolt', text: 'Smart Assessments' },
                        { icon: 'pi pi-verified', text: 'Verified Certificates' },
                        { icon: 'pi pi-shield', text: 'Anti-Cheat Proctoring' },
                        { icon: 'pi pi-box', text: 'Bulk ZIP Export' },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
