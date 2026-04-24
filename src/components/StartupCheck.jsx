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
        "Syncing with CertifyPro Database...",
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
                
                <div style={{ 
                    animation: 'fadeInUp 0.8s ease-out both',
                    maxWidth: 600
                }}>
                    <h2 style={{ 
                        fontFamily: 'Outfit', 
                        fontWeight: 900, 
                        fontSize: '2.2rem', 
                        marginBottom: 12,
                        background: 'var(--aurora-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {messages[msgIndex]}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', fontWeight: 500, letterSpacing: '0.01em' }}>
                        Please wait while we establish a secure connection to the CertifyPro environment. 
                        Our high-performance engine is preparing your workspace for production.
                    </p>
                    
                    <div style={{ 
                        marginTop: 40, 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 15
                    }}>
                        <div style={{ 
                            width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
                            animation: 'dotPulse 1.2s infinite' 
                        }}></div>
                        <div style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--text-muted)', 
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em'
                        }}>
                            Connection Integrity Status: {retries > 0 ? 'Warming Up' : 'Checking'}
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes dotPulse {
                        0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                        70% { transform: scale(1.2); opacity: 0.5; box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                        100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                    }
                `}</style>
            </div>
        );
    }

    return children;
};

export default StartupCheck;
