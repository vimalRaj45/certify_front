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
    const userWithRole = { ...tempUser, user_type: roleId };
    localStorage.setItem("user", JSON.stringify(userWithRole));

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
          console.log("✅ [SIGNIN] Token received and saved to localStorage:", data.token.substring(0, 15) + "...");
          localStorage.setItem("quiz_token", data.token);
          
          // Redirect ONLY after successful token storage
          setTimeout(() => {
            window.location.href = "/";
          }, 100);
        } else {
          console.warn("⚠️ [SIGNIN] Server responded but no token was provided.", data);
          setLoading(false); // Stop loading if failed
        }
      })
      .catch(err => {
        console.error("❌ [SIGNIN] Network error during signup/login:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    window.__certifyGoogleCB = async (response) => {
      const user = parseJwt(response.credential);
      if (!user) return;

      setTempUser(user);
      
      // OPTIMIZATION: Check if user already exists with a role
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
        
        // If user already has a role (not the default 'User'), log them in immediately
        if (data.token && data.user_type && data.user_type !== 'User') {
          console.log("🚀 [SIGNIN] Returning user detected with role:", data.user_type);
          localStorage.setItem("quiz_token", data.token);
          localStorage.setItem("user", JSON.stringify({ ...user, user_type: data.user_type }));
          window.location.href = "/";
        } else {
          // New user or no role yet, show the role selection screen
          setStep("role");
        }
      } catch (err) {
        console.error("Error during auto-login check:", err);
        setStep("role"); // Fallback to role selection
      }
    };

    let attempts = 0;
    const tryRender = () => {
      /* global google */
      if (typeof google === "undefined" || !google?.accounts?.id) {
        if (++attempts < 80) setTimeout(tryRender, 150);
        return;
      }

      try {
        google.accounts.id.disableAutoSelect();
      } catch (_) { }

      if (!window.__certifyGoogleInitialized) {
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: window.__certifyGoogleCB,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.__certifyGoogleInitialized = true;
      }

      setTimeout(() => {
        const el = document.getElementById("googleBtn");
        if (!el) {
          tryRender();
          return;
        }

        google.accounts.id.renderButton(el, {
          theme: "outline",
          size: "large",
          width: window.innerWidth < 480 ? "280" : "320",
          logo_alignment: "left",
          shape: "pill",
        });
      }, 150);
    };

    tryRender();

    return () => {
      delete window.__certifyGoogleCB;
    };
  }, []);

  /* ── Loading overlay (Aurora Dark Theme) ── */
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--bg-primary)",
          flexDirection: "column",
          gap: 32,
          padding: 24,
        }}
      >
        <style>{`
          @keyframes spin360  { to{transform:rotate(360deg)} }
          @keyframes orbPulse { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
          @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          @keyframes dotBounce{ 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-8px);opacity:1} }
        `}</style>

        <div style={{ position: "relative", width: 84, height: 84 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px solid var(--border)",
              borderTopColor: "var(--accent)",
              animation: "spin360 0.8s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 16,
              background: "var(--aurora-gradient)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "orbPulse 1.5s ease-in-out infinite",
              boxShadow: "var(--shadow-blue)",
            }}
          >
            <i className="pi pi-check" style={{ color: "#fff", fontSize: "1.2rem" }} />
          </div>
        </div>

        <div style={{ textAlign: "center", animation: "fadeUp .6s ease both" }}>
          <h3
            style={{
              fontFamily: "var(--font-h)",
              fontWeight: 800,
              fontSize: "1.5rem",
              color: "var(--text)",
              marginBottom: 12,
            }}
          >
            Almost there...
          </h3>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  animation: `dotBounce 1s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: 500 }}>
            Verifying your identity with Google
          </p>
        </div>
      </div>
    );
  }

  /* ── Sign-in card (Aurora Dark Theme) ── */
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--bg-primary)",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Blur Elements (Aurora Theme) */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-10%",
          width: "50vw",
          height: "50vw",
          background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-5%",
          left: "-5%",
          width: "40vw",
          height: "40vw",
          background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <style>{`
        @keyframes fadeInScale { from{opacity:0;transform:scale(0.98) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .signin-card { animation: fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .feature-item { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          padding: 8px 14px; 
          background: rgba(255,255,255,0.03); 
          border-radius: 99px; 
          color: var(--text-secondary); 
          font-size: 0.75rem; 
          font-weight: 600;
          border: 1px solid var(--border);
        }
      `}</style>

      <div
        className="signin-card"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--bg-card)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--border)",
          borderRadius: 32,
          padding: "48px 32px",
          textAlign: "center",
          boxShadow: "var(--shadow-card-hover)",
          zIndex: 1,
          color: "var(--text)"
        }}
      >
        {step === "auth" ? (
          <>
            {/* App Icon */}
            <div
              style={{
                width: 64,
                height: 64,
                background: "transparent",
                borderRadius: 20,
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src="/logo.png" alt="CertLock Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            <div style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: '#3B82F6',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 8
            }}>
              product of vsgrps
            </div>

            <h1
              style={{
                fontFamily: "Outfit",
                fontWeight: 800,
                fontSize: "2.25rem",
                color: "var(--text)",
                margin: "0 0 12px",
                letterSpacing: "-0.02em",
              }}
            >
              Launch Your Vision
            </h1>

            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1rem",
                lineHeight: "1.6",
                marginBottom: 36,
                fontWeight: 500,
                maxWidth: "320px",
                marginInline: "auto",
              }}
            >
              The fastest way to generate professional certificates in bulk. Welcome to the future of certification.
            </p>

            {/* Feature Pills (Responsive Layout) */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                justifyContent: "center",
                marginBottom: 40,
              }}
            >
              {[
                { icon: "pi pi-shield", label: "Private & Secure" },
                { icon: "pi pi-bolt", label: "Instant Export" },
                { icon: "pi pi-star", label: "Premium Output" },
              ].map((f, i) => (
                <div key={i} className="feature-item">
                  <i className={f.icon} style={{ color: "#3B82F6", fontSize: "0.8rem" }} />
                  <span>{f.label}</span>
                </div>
              ))}
            </div>

            {/* Agreement Checkbox */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 24,
              padding: '12px 16px',
              background: agreed ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
              borderRadius: 16,
              border: agreed ? '1px solid var(--accent)' : '1px solid var(--border)',
              transition: 'all 0.2s ease'
            }}>
              <Checkbox
                inputId="agree"
                checked={agreed}
                onChange={e => setAgreed(e.checked)}
                style={{ width: 18, height: 18 }}
              />
              <label htmlFor="agree" style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: agreed ? 'var(--text)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}>
                I agree to the Terms and Privacy
              </label>
            </div>

            {/* Google Button Container */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
                minHeight: 48,
                opacity: agreed ? 1 : 0.45,
                pointerEvents: agreed ? 'auto' : 'none',
                transition: 'opacity 0.3s ease',
                position: 'relative'
              }}
            >
              {!agreed && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'not-allowed' }} title="Please agree to terms first" />
              )}
              <div id="googleBtn" />
            </div>

            {/* 🛡️ Public Verification Access */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Public Audit</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              </div>
              <button
                onClick={() => window.location.href = '/verify'}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <i className="pi pi-shield" style={{ color: 'var(--accent)' }}></i>
                Verify a Certificate
              </button>
            </div>

            {/* Footer Text */}
            <p
              style={{
                color: "#94A3B8",
                fontSize: "0.8rem",
                lineHeight: "1.5",
                marginTop: 12,
                fontWeight: 500,
              }}
            >
              Need to review? Check out our <br />
              <span
                onClick={() => setShowTerms(true)}
                style={{ color: "#3B82F6", cursor: "pointer", fontWeight: 700 }}
              >
                Terms of Service
              </span> & {" "}
              <span
                onClick={() => setShowPrivacy(true)}
                style={{ color: "#3B82F6", cursor: "pointer", fontWeight: 700 }}
              >
                Privacy Policy
              </span>
            </p>
          </>
        ) : (
          <div style={{ animation: 'fadeUp 0.6s ease both' }}>
            <div style={{
              width: 56, height: 56, background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%',
              margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <i className="pi pi-users" style={{ color: 'var(--accent)', fontSize: '1.5rem' }} />
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.8rem', color: 'var(--text)', marginBottom: 8 }}>Select Your Role</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 32 }}>Tell us how you'll use CertLock</p>

            <div style={{ display: 'grid', gap: 12 }}>
              {roles.map(r => (
                <div
                  key={r.id}
                  onClick={() => finishSignup(r.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                    background: 'rgba(255,255,255,0.02)', border: '1.5px solid var(--border)', borderRadius: 20,
                    textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                >
                  <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`pi ${r.icon}`} style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>{r.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.desc}</div>
                  </div>
                  <i className="pi pi-chevron-right" style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Support Link */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid #F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            color: "#64748B",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          <i className="pi pi-question-circle" style={{ fontSize: "0.9rem" }} />
          <span>Need help? Contact support</span>
        </div>
      </div>

      <TermsModal visible={showTerms} onHide={() => setShowTerms(false)} />
      <PrivacyModal visible={showPrivacy} onHide={() => setShowPrivacy(false)} />
    </div>
  );
}
