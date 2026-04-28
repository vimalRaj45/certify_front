import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const Loader = () => {
    return (
        <LoaderContainer>
            {/* Background Aurora Blurs */}
            <AuroraBlur
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    rotate: [0, 90, 0],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ top: '-10%', left: '-10%', background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
            />
            <AuroraBlur
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.4, 0.6, 0.4],
                    rotate: [0, -90, 0],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
            />

            <ContentWrapper>
                {/* Main Logo Hexagon / Circle with Glow */}
                <LogoWrapper
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        animate={{
                            boxShadow: [
                                "0 0 20px rgba(59, 130, 246, 0.2)",
                                "0 0 40px rgba(59, 130, 246, 0.6)",
                                "0 0 20px rgba(59, 130, 246, 0.2)"
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            width: 100, height: 100,
                            borderRadius: '24px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', zIndex: 2
                        }}
                    >
                        <img src="/logo.png" alt="CertLock" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
                    </motion.div>

                    {/* Orbiting Ring */}
                    <OrbitRing
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <OrbitRing
                        animate={{ rotate: -360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        style={{ width: 140, height: 140, border: '1px dashed rgba(59, 130, 246, 0.3)' }}
                    />
                </LogoWrapper>

                {/* Loading Text */}
                <TextWrapper
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Title>CertLock</Title>
                    <StatusText>
                        {["Initializing Secure Environment...", "Verifying Assets...", "Generating Certificate..."][0]}
                        <DotFlashing />
                    </StatusText>
                </TextWrapper>
            </ContentWrapper>
        </LoaderContainer>
    );
};

const LoaderContainer = styled.div`
    position: fixed;
    inset: 0;
    background: #0f172a;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    overflow: hidden;
`;

const AuroraBlur = styled(motion.div)`
    position: absolute;
    width: 60vw;
    height: 60vw;
    filter: blur(100px);
    pointer-events: none;
`;

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    position: relative;
    z-index: 10;
`;

const LogoWrapper = styled(motion.div)`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const OrbitRing = styled(motion.div)`
    position: absolute;
    width: 125px;
    height: 125px;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top: 2px solid #3b82f6;
    border-right: 2px solid rgba(139, 92, 246, 0.5);
    z-index: 1;
`;

const TextWrapper = styled(motion.div)`
    text-align: center;
`;

const Title = styled.h2`
    font-family: 'Outfit', sans-serif;
    font-size: 1.8rem;
    font-weight: 900;
    color: #fff;
    margin: 0 0 8px;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const StatusText = styled.p`
    font-size: 0.9rem;
    color: #94a3b8;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
`;

const DotFlashing = styled.span`
  position: relative;
  width: 4px;
  height: 4px;
  border-radius: 5px;
  background-color: #3b82f6;
  color: #3b82f6;
  animation: dot-flashing 1s infinite linear alternate;
  animation-delay: 0.5s;
  margin-left: 12px;

  &::before, &::after {
    content: "";
    display: inline-block;
    position: absolute;
    top: 0;
  }

  &::before {
    left: -10px;
    width: 4px;
    height: 4px;
    border-radius: 5px;
    background-color: #3b82f6;
    color: #3b82f6;
    animation: dot-flashing 1s infinite linear alternate;
    animation-delay: 0s;
  }

  &::after {
    left: 10px;
    width: 4px;
    height: 4px;
    border-radius: 5px;
    background-color: #3b82f6;
    color: #3b82f6;
    animation: dot-flashing 1s infinite linear alternate;
    animation-delay: 1s;
  }

  @keyframes dot-flashing {
    0% { background-color: #3b82f6; }
    50%, 100% { background-color: rgba(59, 130, 246, 0.2); }
  }
`;

export default Loader;
