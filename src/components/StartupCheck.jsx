import React, { useState, useEffect } from 'react';
import Loader from './Loader';

const API_URL = import.meta.env.VITE_API_URL || '';

const StartupCheck = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [retries, setRetries] = useState(0);
    const [error, setError] = useState(false);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for each ping

                const resp = await fetch(`${API_URL}/ping`, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (resp.ok) {
                    setIsReady(true);
                } else {
                    throw new Error("Server not ready");
                }
            } catch (err) {
                console.log(`📡 Connection attempt ${retries + 1} failed. Server may be sleeping...`);
                setRetries(prev => prev + 1);
                // Keep retrying every 2 seconds
                setTimeout(checkConnection, 2000);
            }
        };

        checkConnection();
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
                    maxWidth: 500
                }}>
                    <h2 style={{ 
                        fontFamily: 'Outfit', 
                        fontWeight: 900, 
                        fontSize: '2rem', 
                        marginBottom: 16,
                        background: 'var(--aurora-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Waking Up the Engine
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', fontWeight: 500 }}>
                        We are working hard to connect to our high-secure certificate and assessment engine. 
                        <br/>
                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                            (Render free tier takes ~30s to wake up after inactivity)
                        </span>
                    </p>
                    
                    <div style={{ 
                        marginTop: 30, 
                        fontSize: '0.8rem', 
                        color: 'var(--accent)', 
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        Attempting Connection... ({retries})
                    </div>
                </div>

                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        );
    }

    return children;
};

export default StartupCheck;
