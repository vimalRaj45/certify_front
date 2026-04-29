import React from 'react';
import { motion } from 'framer-motion';

const BENEFITS = [
    { icon: 'pi pi-bolt',           text: 'Create AI-Powered Quiz Assessments',             color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
    { icon: 'pi pi-verified',       text: 'Issue Value-Driven Verified Certificates',       color: '#7C3AED', bg: 'rgba(124,58,237,0.10)',  border: 'rgba(124,58,237,0.22)' },
    { icon: 'pi pi-shield',         text: 'Security Proctoring & Tab-Switch Alerts',        color: '#2563EB', bg: 'rgba(37,99,235,0.10)',   border: 'rgba(37,99,235,0.22)'  },
    { icon: 'pi pi-sync',           text: 'One-Click Import from Quiz to Studio',           color: '#059669', bg: 'rgba(5,150,105,0.10)',   border: 'rgba(5,150,105,0.22)'  },
    { icon: 'pi pi-objects-column', text: 'Drag-and-Drop Visual Canvas Studio',             color: '#0891B2', bg: 'rgba(8,145,178,0.10)',   border: 'rgba(8,145,178,0.22)'  },
    { icon: 'pi pi-box',            text: 'Bulk ZIP Packaging for Quick Sharing',           color: '#DC2626', bg: 'rgba(220,38,38,0.10)',   border: 'rgba(220,38,38,0.22)'  },
];

const AUDIENCE = [
    { icon: 'pi pi-graduation-cap', label: 'Students & Academies' },
    { icon: 'pi pi-book',           label: 'Teachers & Trainers'  },
    { icon: 'pi pi-calendar',       label: 'Event Organizers'     },
    { icon: 'pi pi-briefcase',      label: 'Corporate HR Teams'   },
    { icon: 'pi pi-users',          label: 'Community Groups'     },
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};
const cardVariant = {
    hidden:  { opacity: 0, y: 40, scale: 0.96 },
    show:    { opacity: 1,  y: 0,  scale: 1,    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const BenefitsSection = () => (
    <section id="benefits" style={{ padding: '100px 24px', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{ textAlign: 'center', marginBottom: 64 }}
            >
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: 999, padding: '6px 16px', marginBottom: 20,
                }}>
                    <i className="pi pi-star-fill" style={{ color: 'var(--accent)', fontSize: '0.72rem' }} />
                    <span style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Benefits</span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, fontFamily: 'Outfit', marginBottom: 16, color: 'var(--text)' }}>
                    Why You'll Love CertLock
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
                    Built for anyone who values their time and wants results without complexity.
                </p>
            </motion.div>

            {/* Benefit Cards grid */}
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}
            >
                {BENEFITS.map((b, i) => (
                    <motion.div
                        key={i}
                        variants={cardVariant}
                        whileHover={{
                            y: -6, boxShadow: `0 20px 40px ${b.bg}`,
                            borderColor: b.border,
                            transition: { duration: 0.25 },
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 16,
                            padding: '20px 22px', borderRadius: 20,
                            background: 'var(--bg-card)', border: `1px solid var(--border)`,
                            boxShadow: 'var(--shadow-card)',
                            cursor: 'default', transition: 'border-color 0.25s',
                        }}
                    >
                        <div style={{
                            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                            background: b.bg, border: `1px solid ${b.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <i className={b.icon} style={{ color: b.color, fontSize: '1.15rem' }} />
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.5 }}>
                            {b.text}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Who is it for */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    marginTop: 56, borderRadius: 28, padding: '48px 40px',
                    background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
                    border: '1px solid var(--border)', textAlign: 'center',
                    boxShadow: 'var(--shadow-card)',
                }}
            >
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: 999, padding: '6px 16px', marginBottom: 20,
                }}>
                    <i className="pi pi-users" style={{ color: 'var(--accent)', fontSize: '0.72rem' }} />
                    <span style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Who Is This For?</span>
                </div>
                <h3 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--text)', marginBottom: 12 }}>
                    Anyone Creating Certificates in Bulk
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 28px' }}>
                    Students, teachers, event organizers, HR teams — if you need fast results without complexity, CertLock is built for you.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {AUDIENCE.map((tag, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.85 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07, duration: 0.4, type: 'spring', stiffness: 200 }}
                            whileHover={{ scale: 1.06, y: -3, transition: { duration: 0.2 } }}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '9px 18px', borderRadius: 999, fontSize: '0.83rem', fontWeight: 700,
                                background: 'rgba(255,255,255,0.05)', border: '1.5px solid var(--border)', color: 'var(--text)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'default',
                            }}
                        >
                            <i className={tag.icon} style={{ color: 'var(--accent)', fontSize: '0.8rem' }} />
                            {tag.label}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Verification Showcase Added */}
        </div>
    </section>
);

export default BenefitsSection;
