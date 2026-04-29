import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

/* ─── Particle Canvas (Light Theme Particles) ─── */
const ParticleCanvas = () => {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let raf;
        const fit = () => {
            const p = canvas.parentElement;
            canvas.width = p ? p.offsetWidth : window.innerWidth;
            canvas.height = p ? p.offsetHeight : 700;
        };
        fit();
        window.addEventListener('resize', fit);

        const particles = Array.from({ length: 50 }, () => ({
            x: Math.random(), 
            y: Math.random(),
            r: Math.random() * 2 + 0.5,
            off: Math.random() * Math.PI * 2,
            spd: Math.random() * 0.3 + 0.1,
            color: Math.random() > 0.5 ? '#3B82F6' : '#8B5CF6',
        }));

        let t = 0;
        const draw = () => {
            t += 0.016;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                const alpha = ((Math.sin(t * p.spd + p.off) + 1) / 2) * 0.15; // Very subtle for light theme
                if (alpha < 0.01) return;
                const cx = p.x * canvas.width;
                const cy = p.y * canvas.height;
                ctx.beginPath();
                ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = alpha;
                ctx.fill();
                ctx.globalAlpha = 1;
            });
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', fit); };
    }, []);
    return (
        <canvas ref={ref} style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 1,
        }} />
    );
};

/* ─── Data ─── */
const STEPS = [
    { step: '01', icon: 'pi pi-upload',   color: '#3B82F6', title: 'Upload Your Data',       desc: 'Upload a CSV file with participant details. Everything gets organized automatically — no formatting headaches.' },
    { step: '02', icon: 'pi pi-image',    color: '#8B5CF6', title: 'Upload Your Design',     desc: 'Upload your certificate template as an image (PNG/JPG). This becomes the base canvas for every certificate.' },
    { step: '03', icon: 'pi pi-palette',  color: '#10B981', title: 'Customize Layout',       desc: 'Use the live visual designer to drag and place text fields. Adjust font, size, and color to match your design.' },
    { step: '04', icon: 'pi pi-bolt',     color: '#F59E0B', title: 'Start Generation',       desc: 'Click generate and relax. Certificates are processed with live progress updates and queue monitoring.' },
    { step: '05', icon: 'pi pi-download', color: '#06B6D4', title: 'Download Instantly',     desc: 'Download all your certificates in a single ZIP file. No extra steps, no waiting, no complications.' },
];

/* ─── Single Step Card (Light Theme) ─── */
const StepCard = ({ item, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -8, boxShadow: '0 12px 30px rgba(0,0,0,0.08)', borderColor: item.color + '40', transition: { duration: 0.2 } }}
        style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 24, padding: '32px 24px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
            cursor: 'default',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
    >
        {/* watermark number */}
        <div style={{
            position: 'absolute', top: -10, right: 10,
            fontSize: '5rem', fontFamily: 'Outfit', fontWeight: 900,
            color: 'rgba(255,255,255,0.03)', lineHeight: 1,
            userSelect: 'none', pointerEvents: 'none',
        }}>{item.step}</div>

        {/* Icon bubble */}
        <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 20px',
            background: `${item.color}15`,
            border: `1.5px solid ${item.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 2,
        }}>
            <i className={item.icon} style={{ color: item.color, fontSize: '1.5rem' }} />
        </div>

        {/* Step label */}
        <div style={{
            display: 'inline-block', fontSize: '0.65rem', fontWeight: 800,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            padding: '4px 12px', borderRadius: 999, marginBottom: 16,
        }}>Step {item.step}</div>

        <h3 style={{
            fontSize: '1.1rem', fontWeight: 800,
            fontFamily: 'Outfit', color: 'var(--text)',
            margin: '0 0 12px', letterSpacing: '-0.01em',
        }}>{item.title}</h3>
        <p style={{
            color: 'var(--text-secondary)', fontSize: '0.9rem',
            lineHeight: 1.6, margin: 0, fontWeight: 500,
        }}>{item.desc}</p>
    </motion.div>
);

/* ─── Main Component ─── */
const HowItWorks = () => {
    const orb1 = useRef(null);
    const orb2 = useRef(null);

    /* GSAP floating orbs (more subtle for light theme) */
    useEffect(() => {
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.to(orb1.current, { x: 30, y: -20, duration: 8, ease: 'sine.inOut' })
          .to(orb2.current, { x: -30, y: 20,  duration: 10, ease: 'sine.inOut' }, 0);
        return () => tl.kill();
    }, []);

    return (
        <section id="how-it-works" style={{
            padding: '100px 16px',
            background: 'var(--bg-primary)', 
            position: 'relative', overflow: 'hidden',
        }}>
            <ParticleCanvas />

            {/* Ambient subtle glow orbs */}
            <div ref={orb1} style={{
                position: 'absolute', top: '5%', left: '0%',
                width: '40vw', height: '40vw', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
                pointerEvents: 'none', zIndex: 1,
            }} />
            <div ref={orb2} style={{
                position: 'absolute', bottom: '5%', right: '0%',
                width: '40vw', height: '40vw', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
                pointerEvents: 'none', zIndex: 1,
            }} />

            {/* ── Content ── */}
            <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative', zIndex: 2 }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    style={{ textAlign: 'center', marginBottom: 64 }}
                >
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: 999, padding: '7px 18px', marginBottom: 20,
                    }}>
                        <i className="pi pi-list-check" style={{ color: '#3B82F6', fontSize: '0.8rem' }} />
                        <span style={{ color: '#3B82F6', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                            The Process
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900,
                        fontFamily: 'Outfit', lineHeight: 1.15, marginBottom: 20,
                        color: 'var(--text)', letterSpacing: '-0.02em',
                    }}>
                        Crafted for Simplicity
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>
                        We've boiled down a complex process into five easy steps. From start to finish, you're in control.
                    </p>
                </motion.div>

                {/* Grid styles (Mobile First) */}
                <style>{`
                    .hiw-grid {
                        display: grid;
                        grid-template-columns: repeat(1, 1fr);
                        gap: 24px;
                    }
                    @media (min-width: 640px) {
                        .hiw-grid { grid-template-columns: repeat(2, 1fr); }
                    }
                    @media (min-width: 1024px) {
                        .hiw-grid { grid-template-columns: repeat(3, 1fr); }
                        .hiw-item:nth-child(4) { grid-column: 1 / span 1.5; margin-left: 50%; } /* Offset Trick */
                        /* Actually a better way for 3+2 in light theme */
                    }
                    /* Improved 3+2 Layout for Desktop */
                    .hiw-grid-desktop {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    .hiw-grid-desktop-bottom {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                        width: 66%;
                        margin: 0 auto;
                    }
                    @media (max-width: 1023px) {
                        .hiw-grid-desktop { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
                        .hiw-grid-desktop-bottom { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); width: 100%; }
                    }
                `}</style>

                {/* Grid - Top Steps */}
                <div className="hiw-grid-desktop">
                    {STEPS.slice(0, 3).map((s, i) => <StepCard key={i} item={s} index={i} />)}
                </div>

                {/* Grid - Bottom Steps centered */}
                <div className="hiw-grid-desktop-bottom">
                    {STEPS.slice(3).map((s, i) => <StepCard key={i + 3} item={s} index={i + 3} />)}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
