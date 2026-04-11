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
    <section id="benefits" style={{ padding: '100px 24px', background: '#F8FAFF' }}>
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
                    background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
                    borderRadius: 999, padding: '6px 16px', marginBottom: 20,
                }}>
                    <i className="pi pi-star-fill" style={{ color: '#2563EB', fontSize: '0.72rem' }} />
                    <span style={{ color: '#2563EB', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Benefits</span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, fontFamily: 'Outfit', marginBottom: 16, color: '#0F172A' }}>
                    Why You'll Love CertifyPro
                </h2>
                <p style={{ color: '#64748B', maxWidth: 480, margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
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
                            background: '#fff', border: `1px solid #F1F5F9`,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
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
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.5 }}>
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
                    background: 'linear-gradient(135deg, #fff 0%, #EEF2FF 100%)',
                    border: '1px solid #E0E8FF', textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(37,99,235,0.06)',
                }}
            >
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
                    borderRadius: 999, padding: '6px 16px', marginBottom: 20,
                }}>
                    <i className="pi pi-users" style={{ color: '#2563EB', fontSize: '0.72rem' }} />
                    <span style={{ color: '#2563EB', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Who Is This For?</span>
                </div>
                <h3 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 900, fontFamily: 'Outfit', color: '#0F172A', marginBottom: 12 }}>
                    Anyone Creating Certificates in Bulk
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 28px' }}>
                    Students, teachers, event organizers, HR teams — if you need fast results without complexity, CertifyPro is built for you.
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
                                background: '#fff', border: '1.5px solid #E2E8F0', color: '#334155',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'default',
                            }}
                        >
                            <i className={tag.icon} style={{ color: '#2563EB', fontSize: '0.8rem' }} />
                            {tag.label}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Verification Showcase Added */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    marginTop: 56, borderRadius: 28, padding: '48px 40px',
                    background: '#FFFFFF', border: '1px solid #E2E8F0',
                    boxShadow: '0 8px 32px rgba(37,99,235,0.06)',
                    display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center'
                }}
            >
                <div style={{ flex: 1, minWidth: 300 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                        borderRadius: 999, padding: '6px 16px', marginBottom: 20,
                    }}>
                        <i className="pi pi-shield" style={{ color: '#10B981', fontSize: '0.72rem' }} />
                        <span style={{ color: '#10B981', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Built-in Authencity</span>
                    </div>
                    <h3 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 900, fontFamily: 'Outfit', color: '#0F172A', marginBottom: 12 }}>
                        Instant Anti-Forgery Protection
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 520, marginBottom: 24 }}>
                        Every certificate you generate includes invisible meta-signatures. Verify cryptographic hashes, issue dates, and file matches instantly—giving employers 100% confidence.
                    </p>
                </div>
                <div style={{ flex: 1.2, minWidth: 300 }}>
                    <div style={{ 
                        background: '#fff', borderRadius: 28, padding: 24, 
                        boxShadow: '0 30px 60px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0',
                        marginTop: '1.5rem'
                    }}>
                         <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, marginTop: -8 }}>
                             <div style={{ background: '#10B981', color: '#fff', padding: '6px 14px', borderRadius: 50, fontSize: '0.65rem', fontWeight: 900, boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>AUTHENTIC FILE</div>
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
                             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                                 <div style={{ flex: '1 1 120px', padding: '12px', background: 'rgba(16,185,129,0.06)', borderRadius: 10, fontSize: '0.75rem', color: '#10B981', fontWeight: 800, textAlign: 'center', border: '1px solid rgba(16,185,129,0.15)' }}>Authenticity: 100%</div>
                                 <div style={{ flex: '1 1 120px', padding: '12px', background: 'rgba(59,130,246,0.06)', borderRadius: 10, fontSize: '0.75rem', color: '#2563EB', fontWeight: 800, textAlign: 'center', border: '1px solid rgba(59,130,246,0.15)' }}>Status: Active</div>
                             </div>
                         </div>
                    </div>
                </div>
            </motion.div>
        </div>
    </section>
);

export default BenefitsSection;
