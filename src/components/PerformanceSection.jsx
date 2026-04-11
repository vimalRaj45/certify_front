import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const PerformanceSection = () => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  // Number counting animation logic
  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = 100;
      const duration = 2000; // 2 seconds
      const increment = 1;
      const stepTime = duration / end;

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, stepTime);
      
      return () => clearInterval(timer);
    }
  }, [isInView]);

  return (
    <section ref={ref} style={{ padding: '80px 16px', background: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative Orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '-20%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '-20%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        
        {/* Value Props Row (Mobile Friendly) */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px 32px',
          marginBottom: 60, opacity: 0.6
        }}>
          {[
            { icon: 'pi pi-shield', text: 'Privacy Guaranteed' },
            { icon: 'pi pi-box', text: 'Bulk ZIP Export' },
            { icon: 'pi pi-sync', text: 'Live Progress' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <i className={item.icon} style={{ color: '#3B82F6', fontSize: '0.85rem' }}></i>
              {item.text}
            </div>
          ))}
        </div>

        {/* Main Performance Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFF 100%)',
            border: '1.2px solid #E2E8F0',
            borderRadius: 32,
            padding: '60px 24px',
            textAlign: 'center',
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Glow Background */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.02) 0%, transparent 80%)', pointerEvents: 'none' }} />

          {/* Icon Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            style={{
              width: 72, height: 72, background: '#F0F7FF', borderRadius: 20,
              margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(59,130,246,0.08)'
            }}
          >
            <i className="pi pi-bolt" style={{ color: '#3B82F6', fontSize: '2.2rem' }} />
          </motion.div>

          {/* Headline */}
          <h2 style={{ 
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, fontFamily: 'Outfit', 
            color: '#0F172A', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.04em' 
          }}>
            Generate <span style={{ color: '#3B82F6' }}>{count}+</span> Certificates<br />
            In Under <span style={{ padding: '2px 10px', background: 'rgba(59,130,246,0.08)', borderRadius: 10, color: '#2563EB', display: 'inline-block', marginTop: 8 }}>3 Minutes</span>
          </h2>

          {/* Subtext */}
          <p style={{ color: '#64748B', maxWidth: 640, margin: '0 auto 40px', fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500 }}>
            Turn hours of manual work into minutes. Design once and let our engine handle the rest — automatically.
          </p>

          {/* Progress Bar Mockup */}
          <div style={{ maxWidth: 460, margin: '0 auto 48px', background: '#F1F5F9', height: 10, borderRadius: 99, overflow: 'hidden', padding: 2 }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={isInView ? { width: '100%' } : {}}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)', borderRadius: 99 }}
            />
          </div>

          {/* Value Points Grid (Responsive) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '16px 24px', 
            maxWidth: 800, 
            margin: '0 auto' 
          }}>
            {[
              { icon: 'pi pi-times-circle', label: 'No Manual Editing' },
              { icon: 'pi pi-check-square', label: 'One-Click Generation' },
              { icon: 'pi pi-chart-line', label: 'Real-Time Tracking' },
              { icon: 'pi pi-cloud-download', label: 'Instant ZIP Export' },
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 14, 
                  justifyContent: 'flex-start',
                  padding: '8px 16px',
                  background: '#FFFFFF',
                  border: '1px solid #F1F5F9',
                  borderRadius: 16
                }}
              >
                <div style={{ width: 28, height: 28, background: '#F0F9FF', borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={v.icon} style={{ color: '#3B82F6', fontSize: '0.8rem' }} />
                </div>
                <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.85rem', letterSpacing: '-0.01em' }}>{v.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Experience Line (Mobile Responsive) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1, duration: 0.8 }}
          style={{ textAlign: 'center', marginTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'center' }}>
             <div style={{ height: 1, flex: 1, maxWidth: 40, background: 'linear-gradient(270deg, #3B82F6, transparent)' }} />
             <span style={{ 
                fontSize: '0.85rem', fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase', 
                letterSpacing: '0.12em', fontFamily: 'Outfit' 
              }}>
                Redefining the Workflow
              </span>
             <div style={{ height: 1, flex: 1, maxWidth: 40, background: 'linear-gradient(90deg, #3B82F6, transparent)' }} />
          </div>
          <p style={{ color: '#64748B', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
             From slow, repetitive work <span style={{ color: '#3B82F6' }}>→</span> to instant results
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default PerformanceSection;
