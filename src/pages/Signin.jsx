import React, { useEffect, useState } from "react";
import { TermsModal, PrivacyModal } from "../components/LegalModals";
import { Checkbox } from "primereact/checkbox";

const CLIENT_ID = "874124870796-n5ha5v7cpomjs0ineoga2h2oenpcaiku.apps.googleusercontent.com";

export default function Signin() {
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [step, setStep] = useState("auth"); // "auth" or "role"
  const [tempUser, setTempUser] = useState(null);

  const roles = [
    { id: 'Student', icon: 'pi-user', label: 'Student / Learner', desc: 'Validating my own skills' },
    { id: 'Teacher', icon: 'pi-book', label: 'Teacher / Educator', desc: 'Certifying my students' },
    { id: 'HR', icon: 'pi-briefcase', label: 'HR / Business', desc: 'Enterprise training & hiring' },
    { id: 'Organizer', icon: 'pi-calendar', label: 'Event Organizer', desc: 'Hackathons & workshops' }
  ];

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const finishSignup = (roleId) => {
    setLoading(true);
    const API_BASE = import.meta.env.VITE_API_URL || 'https://certify-vsgrps.onrender.com';
    
    fetch(`${API_BASE}/save-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sub: tempUser.sub,
        name: tempUser.name,
        email: tempUser.email,
        picture: tempUser.picture,
        user_type: roleId
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem("quiz_token", data.token);
          localStorage.setItem("user", JSON.stringify({ ...tempUser, user_type: data.user_type }));
          
          setTimeout(() => {
            window.location.href = "/";
          }, 100);
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("❌ [SIGNIN] Network error during signup:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    window.__certifyGoogleCB = async (response) => {
      const user = parseJwt(response.credential);
      if (!user) return;

      setTempUser(user);
      setLoading(true);
      
      const API_BASE = import.meta.env.VITE_API_URL || 'https://certify-vsgrps.onrender.com';
      try {
        const res = await fetch(`${API_BASE}/save-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sub: user.sub,
            name: user.name,
            email: user.email,
            picture: user.picture
          }),
        });
        const data = await res.json();
        
        if (data.token && data.user_type && data.user_type !== 'User') {
          localStorage.setItem("quiz_token", data.token);
          localStorage.setItem("user", JSON.stringify({ ...user, user_type: data.user_type }));
          window.location.href = "/";
        } else {
          setLoading(false);
          setStep("role");
        }
      } catch (err) {
        console.error("Error during auto-login check:", err);
        setLoading(false);
        setStep("role");
      }
    };

    let attempts = 0;
    const tryRender = () => {
      if (typeof google === "undefined" || !google?.accounts?.id) {
        if (++attempts < 80) setTimeout(tryRender, 150);
        return;
      }

      if (!window.__certifyGoogleInitialized) {
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: window.__certifyGoogleCB,
          auto_select: false,
        });
        window.__certifyGoogleInitialized = true;
      }

      setTimeout(() => {
        const el = document.getElementById("googleBtn");
        if (!el) return;
        google.accounts.id.renderButton(el, {
          theme: "outline",
          size: "large",
          width: "320",
          shape: "pill",
        });
      }, 150);
    };

    tryRender();
    return () => delete window.__certifyGoogleCB;
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-primary)", flexDirection: "column", gap: 32 }}>
        <div style={{ position: "relative", width: 84, height: 84 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          <div style={{ position: "absolute", inset: 16, background: "var(--aurora-gradient)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-blue)" }}>
            <i className="pi pi-shield" style={{ color: "#fff", fontSize: "1.2rem" }} />
          </div>
        </div>
        <h3 style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "1.5rem", color: "var(--text)" }}>Authenticating...</h3>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="signin-page">
      <style>{`
        .signin-page {
          display: flex; align-items: center; justify-content: center; min-height: 100vh;
          background: var(--bg-primary); padding: 20px; position: relative; overflow: hidden;
        }
        .signin-container {
          width: 100%; max-width: ${step === "auth" ? '1000px' : '500px'};
          display: flex; flex-direction: row;
          background: var(--bg-card); border: 1px solid var(--border);
          borderRadius: 40px; overflow: hidden; boxShadow: var(--shadow-card-hover);
          zIndex: 1; min-height: ${step === "auth" ? '600px' : 'auto'};
          transition: all 0.4s ease;
        }
        .signin-content {
          flex: 1.2; padding: 60px 48px; display: flex; flex-direction: column; justify-content: center;
        }
        .signin-illustration-container {
          flex: 1; background: rgba(0, 0, 0, 0.2); border-left: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center; padding: 40px; position: relative;
        }
        .signin-illustration {
          width: 100%; height: auto; max-width: 440px; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.4));
        }
        .mobile-illustration { display: none; }
        
        @media (max-width: 991px) {
          .signin-container { flex-direction: column; max-width: 500px; min-height: auto; }
          .signin-illustration-container { display: none; }
          .signin-content { text-align: center; padding: 48px 24px; }
          .signin-content img { align-self: center !important; }
          .mobile-illustration { display: flex; justify-content: center; padding: 0 40px 40px; }
          .mobile-illustration img { width: 100%; max-width: 320px; }
          .signin-tags { justify-content: center !important; }
          .signin-google { justify-content: center !important; }
          .signin-agree { justify-content: center !important; }
        }
      `}</style>

      {/* Aurora Blurs */}
      <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="signin-container">
        {/* Left Column: Content/Form */}
        <div className="signin-content">
          {step === "auth" ? (
            <>
              <img src="/logo.png" alt="Logo" style={{ height: 56, width: 'auto', marginBottom: 40, alignSelf: 'flex-start' }} />
              
              <h1 style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: "clamp(2rem, 4vw, 2.75rem)", color: "var(--text)", marginBottom: 20, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                Join the Future <br /><span style={{ color: 'var(--accent)' }}>of Certification</span>
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: 40, fontWeight: 500, maxWidth: 440 }}>
                Generate bulk professional certificates in seconds. Secure, scalable, and stunningly fast.
              </p>

              <div className="signin-tags" style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 40 }}>
                {['Private', 'Encrypted', 'Cloud Native'].map((tag, i) => (
                  <div key={i} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {tag}
                  </div>
                ))}
              </div>

              <div className="signin-agree" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                <Checkbox inputId="agree" checked={agreed} onChange={e => setAgreed(e.checked)} style={{ width: 20, height: 20 }} />
                <label htmlFor="agree" style={{ fontSize: '0.9rem', color: agreed ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
                  I agree to the <span onClick={(e) => { e.preventDefault(); setShowTerms(true); }} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Terms</span> & <span onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Privacy</span>
                </label>
              </div>

              <div className="signin-google" style={{ opacity: agreed ? 1 : 0.5, pointerEvents: agreed ? 'auto' : 'none', transition: 'all 0.3s ease', display: 'flex' }}>
                <div id="googleBtn" />
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 20, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="pi pi-users" style={{ color: 'var(--accent)', fontSize: '1.8rem' }} />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2rem', color: 'var(--text)', marginBottom: 8 }}>Select Your Role</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>One-time selection for your profile</p>

              <div style={{ display: 'grid', gap: 12 }}>
                {roles.map(r => (
                  <div key={r.id} onClick={() => finishSignup(r.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 20,
                    textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease'
                  }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`pi ${r.icon}`} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>{r.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Illustration (Desktop Only) */}
        {step === "auth" && (
          <div className="signin-illustration-container">
            <img 
              src="/auth_illustration.png" 
              alt="Illustration" 
              className="signin-illustration"
            />
            <div style={{ position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Secure • Scalable • Professional
              </div>
            </div>
          </div>
        )}

        {step === "role" && window.innerWidth >= 992 && (
           <div className="signin-illustration-container">
              <img 
                src="/role_illustration.png" 
                alt="Illustration" 
                className="signin-illustration"
              />
           </div>
        )}
        
        {/* Mobile Illustration (Mobile Only) */}
        <div className="mobile-illustration">
             <img src={step === "auth" ? "/auth_illustration.png" : "/role_illustration.png"} alt="Illustration" />
        </div>
      </div>

      <TermsModal visible={showTerms} onHide={() => setShowTerms(false)} />
      <PrivacyModal visible={showPrivacy} onHide={() => setShowPrivacy(false)} />
    </div>
  );
}
