import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

// ═══ ANIMATIONS ═══
const sparkleAnim = keyframes`
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(1) rotate(90deg); opacity: 1; }
  100% { transform: scale(0) rotate(180deg); opacity: 0; }
`;

const bgSweep = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// ═══ STYLED COMPONENTS ═══
const StyledWrapper = styled.button`
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 36px;
  border-radius: 50px;
  font-weight: 800;
  font-size: 1.05rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-decoration: none;
  z-index: 1;
  border: none;

  ${({ $mode }) => $mode === 'dark' ? css`
    /* DARK THEME (Blue Primary) */
    background: linear-gradient(135deg, #1E3A8A, #2563EB, #7C3AED, #1E3A8A);
    background-size: 300% 300%;
    color: white;
    box-shadow: 0 8px 32px -8px rgba(37,99,235,0.4), inset 0 2px 4px rgba(255,255,255,0.2);
    animation: ${bgSweep} 8s ease infinite;

    &:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 40px -8px rgba(37,99,235,0.6), inset 0 2px 4px rgba(255,255,255,0.3);
    }
  ` : css`
    /* LIGHT THEME (White/Ghost) */
    background: white;
    color: #2563EB;
    border: 1px solid #E2E8F0;
    box-shadow: 0 4px 16px rgba(0,0,0,0.04);
    
    &:hover {
      border-color: #60A5FA;
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 30px rgba(37,99,235,0.15);
      background: linear-gradient(135deg, white, #F8FAFF);
    }
  `}

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: -1;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const SparkleIcon = styled.svg`
  position: absolute;
  pointer-events: none;
  z-index: 2;
  animation: ${sparkleAnim} 1500ms linear forwards;
  path {
    fill: ${({ color }) => color};
  }
`;

const Content = styled.span`
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
`;

// ═══ UTILITIES ═══
const generateSparkle = (color) => {
  return {
    id: String(Math.random()),
    createdAt: Date.now(),
    color: color,
    size: Math.random() * 10 + 10,
    style: {
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
    }
  };
};

// ═══ COMPONENT ═══
const SparkleButton = ({ children, mode = 'dark', onClick, className, icon }) => {
  const [sparkles, setSparkles] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    
    const interval = setInterval(() => {
      const sparkleColor = mode === 'dark' ? '#FFFFFF' : '#60A5FA';
      const newSparkle = generateSparkle(sparkleColor);
      
      setSparkles(current => {
        const active = current.filter(s => Date.now() - s.createdAt < 1500);
        return [...active, newSparkle];
      });
    }, 250); // Spawn faster on hover

    return () => clearInterval(interval);
  }, [isHovered, mode]);

  useEffect(() => {
    // Occasional passive sparkle
    if (isHovered) return;
    const interval = setInterval(() => {
      const sparkleColor = mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(96,165,250,0.6)';
      const newSparkle = generateSparkle(sparkleColor);
      setSparkles(current => {
        const active = current.filter(s => Date.now() - s.createdAt < 1500);
        return [...active, newSparkle];
      });
    }, 800);
    return () => clearInterval(interval);
  }, [isHovered, mode]);

  return (
    <StyledWrapper 
      $mode={mode} 
      onClick={onClick} 
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {sparkles.map(s => (
        <SparkleIcon
          key={s.id}
          color={s.color}
          style={{ ...s.style, width: s.size, height: s.size }}
          viewBox="0 0 160 160"
        >
          <path d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z" />
        </SparkleIcon>
      ))}
      <Content>
        {icon && <i className={icon}></i>}
        {children}
      </Content>
    </StyledWrapper>
  );
};

export default SparkleButton;
