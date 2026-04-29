import React, { useState, useEffect } from 'react';
import Loader from './Loader';

const API_URL = import.meta.env.VITE_API_URL || '';

const StartupCheck = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [retries, setRetries] = useState(0);
    const [msgIndex, setMsgIndex] = useState(0);

    const messages = [
        "Initializing High-Secure Engine...",
        "Connecting to Assessment Center...",
        "Establishing Secure Verification Tunnel...",
        "Preparing Pixel-Perfect Renderer...",
        "Optimizing High-Speed Generation Worker...",
        "Syncing with CertLock Database...",
        "Securing Document Integrity Layers..."
    ];

    useEffect(() => {
        const msgInterval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % messages.length);
        }, 3000); // Change message every 3 seconds

        const checkConnection = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const resp = await fetch(`${API_URL}/ping`, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (resp.ok) {
                    setIsReady(true);
                    clearInterval(msgInterval);
                } else {
                    throw new Error("Server not ready");
                }
            } catch (err) {
                console.log(`📡 Connection attempt ${retries + 1} failed. Engine warming up...`);
                setRetries(prev => prev + 1);
                setTimeout(checkConnection, 2000);
            }
        };

        checkConnection();
        return () => clearInterval(msgInterval);
    }, []);

    if (!isReady) {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                background: 'var(--bg-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'var(--text)',
                padding: 24,
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999
            }}>
                <div style={{ transform: 'scale(1.2)', marginBottom: 40 }}>
                    <Loader />
                </div>
                
                <div className="loader-content" style={{ 
                    animation: 'fadeInUp 0.8s ease-out both',
                    maxWidth: '90vw',
                    width: 600,
                    padding: '40px 20px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 32,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                }}>
                    <h2 style={{ 
                        fontFamily: 'Outfit', 
                        fontWeight: 900, 
                        fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', 
                        marginBottom: 12,
                        lineHeight: 1.2,
                        background: 'var(--aurora-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {messages[msgIndex]}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', lineHeight: '1.6', fontWeight: 500, letterSpacing: '0.01em', margin: '0 auto', maxWidth: 450 }}>
                        Connecting to the CertLock environment. 
                        Our high-performance engine is preparing your workspace.
                    </p>
                    
                    <div style={{ 
                        marginTop: 40, 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 15
                    }}>
                        <div className="pulse-dot" style={{ 
                            width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)',
                            boxShadow: '0 0 15px var(--accent)'
                        }}></div>
                        <div style={{ 
                            fontSize: '0.7rem', 
                            color: 'var(--text-muted)', 
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.25em'
                        }}>
                            Integrity Status: {retries > 0 ? 'Warming Up' : 'Checking'}
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .pulse-dot {
                        animation: dotPulse 1.5s infinite ease-in-out;
                    }
                    @keyframes dotPulse {
                        0% { transform: scale(1); opacity: 1; filter: brightness(1); }
                        50% { transform: scale(1.4); opacity: 0.6; filter: brightness(1.5); }
                        100% { transform: scale(1); opacity: 1; filter: brightness(1); }
                    }
                    @media (max-width: 480px) {
                        .loader-content {
                            padding: 30px 15px;
                            border-radius: 24px;
                        }
                    }
                `}</style>
            </div>
        );
    }

    return children;
};

export default StartupCheck;
