import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

export const TermsModal = ({ visible, onHide }) => {
    return (
        <Dialog 
            header="Terms & Conditions" 
            visible={visible} 
            onHide={onHide}
            style={{ width: '90vw', maxWidth: '700px' }}
            breakpoints={{ '960px': '75vw', '641px': '100vw' }}
            footer={<Button label="I Accept" icon="pi pi-check" onClick={onHide} className="p-button-text" style={{ borderRadius: 50, color: '#2563EB', fontWeight: 800 }} />}
        >
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, padding: '0 10px' }}>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20, color: 'var(--text)' }}>CertLock Studio - Powered by VSGRPS Technologies</p>
                
                <h4 style={{ color: 'var(--text)', marginTop: 24, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 800 }}>1. Nature of Service</h4>
                <p>CertLock Studio is a free utility provided by VSGRPS Technologies for legitimate business and educational certificate generation. While the tool is free, users are capped at 100 certificates per batch to maintain server performance for all global users.</p>

                <h4 style={{ color: 'var(--text)', marginTop: 24, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 800 }}>2. Zero-Retention Data Policy</h4>
                <p>To ensure maximum privacy, VSGRPS enforces a strict zero-retention policy. All uploaded CSV files, image templates, and generated ZIP packages are purged from our servers within 15 minutes of inactivity or immediately after successful download. We do not maintain any long-term backups of your data.</p>

                <h4 style={{ color: 'var(--text)', marginTop: 24, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 800 }}>3. Prohibited Use Cases</h4>
                <p>Users are strictly prohibited from using CertLock Studio for the creation of fraudulent documentation, including but not limited to: counterfeit university degrees, government-issued identification, or deceptive financial records. VSGRPS reserved the right to terminate session access for any suspected misuse.</p>

                <h4 style={{ color: 'var(--text)', marginTop: 24, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 800 }}>4. Limitation of Liability</h4>
                <p>VSGRPS Technologies provides this tool "as-is" without warranty. We are not responsible for typographical errors in your generated files, data loss due to session timeouts, or any direct/indirect consequences resulting from the use of certificates generated via this platform.</p>

                <h4 style={{ color: 'var(--text)', marginTop: 24, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 800 }}>5. Intellectual Property</h4>
                <p>The code, design system, and "CertLock" brand are the exclusive property of VSGRPS Technologies. Users retain full ownership of the final PDF files generated using their own data and templates.</p>
                
                <div style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 20, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Last Updated: March 30, 2026 | official website: vsgrps.netlify.app
                </div>
            </div>
        </Dialog>
    );
};

export const PrivacyModal = ({ visible, onHide }) => {
    return (
        <Dialog 
            header="Privacy & Security" 
            visible={visible} 
            onHide={onHide}
            style={{ width: '90vw', maxWidth: '700px' }}
            breakpoints={{ '960px': '75vw', '641px': '100vw' }}
            footer={<Button label="Understood" icon="pi pi-shield" onClick={onHide} className="p-button-text" style={{ borderRadius: 50, color: '#10B981', fontWeight: 800 }} />}
        >
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, padding: '0 10px' }}>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20, color: 'var(--text)' }}>Your Privacy is Our Default Setting</p>
                
                <h4 style={{ color: 'var(--text)', marginTop: 24, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 800 }}>1. What Data We Process</h4>
                <p>We only process the data you explicitly upload (CSV headers, rows, and template images). This processing happens in real-time in our secure cloud environment. We do not collect names, email addresses, or IP addresses for tracking purposes.</p>

                <h4 style={{ color: 'var(--text)', marginTop: 24, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 800 }}>2. Security Standards</h4>
                <p>Session data is handled over encrypted HTTPS channels (AES-256). We utilize industry-standard cloud partners (Cloudinary, Render) with SOC2 compliance to ensure your templates are stored securely during the brief window of generation.</p>

                <h4 style={{ color: 'var(--text)', marginTop: 24, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 800 }}>3. No Third-Party Sales</h4>
                <p>VSGRPS Technologies does not sell, lease, or share your spreadsheet data with any third-party marketing entities. Our business model is based on software excellence, not data monetization.</p>

                <h4 style={{ color: '#0F172A', marginTop: 24, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 800 }}>4. Analytics</h4>
                <p>We use minimal, privacy-compliant session analytics (if any) to monitor server load. We do not use persistent tracking cookies or user-profiling scripts.</p>

                <div style={{ marginTop: 40, padding: 16, background: 'rgba(16,185,129,0.05)', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10B981', marginBottom: 4 }}>Did You Know?</div>
                    <div style={{ fontSize: '0.82rem', color: '#10B981' }}>CertLock is configured to "Self-Destruct" your assets 60 seconds after your ZIP download completes. We don't want your data; we just want your success.</div>
                </div>
            </div>
        </Dialog>
    );
};
export const SecurityModal = ({ visible, onHide }) => {
    return (
        <Dialog 
            header="Security & Compliance" 
            visible={visible} 
            onHide={onHide}
            style={{ width: '90vw', maxWidth: '700px' }}
            breakpoints={{ '960px': '75vw', '641px': '100vw' }}
            footer={<Button label="Secure & Protected" icon="pi pi-lock" onClick={onHide} className="p-button-text" style={{ borderRadius: 50, color: '#3B82F6', fontWeight: 800 }} />}
        >
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, padding: '0 10px' }}>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20, color: 'var(--text)' }}>Enterprise-Grade Protection for Every User</p>
                
                <h4 style={{ color: 'var(--text)', marginTop: 24, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 800 }}>1. Data Encryption</h4>
                <p>All data transit between your browser and our servers is protected using industry-standard TLS 1.3 encryption. This prevents any interception of your sensitive participant data or certificate templates.</p>

                <h4 style={{ color: 'var(--text)', marginTop: 24, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 800 }}>2. Server-Side Execution</h4>
                <p>Our heavy processing happens in a containerized server environment with limited permissions. This ensures your local machine isn't strained while also maintaining a controlled, secure environment for certificate generation.</p>

                <h4 style={{ color: 'var(--text)', marginTop: 24, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 800 }}>3. Asset Handling</h4>
                <p>Your templates and logos are processed in a volatile memory-first manner. We use secure cloud storage partners with SOC 2 compliance for the brief storage period required to generate your bulk ZIP file.</p>

                <h4 style={{ color: '#0F172A', marginTop: 24, marginBottom: 8, fontFamily: 'Outfit', fontWeight: 800 }}>4. Threat Prevention</h4>
                <p>We employ DDoS protection and web application firewalls (WAF) to defend against malicious attacks, ensuring the platform remains available and safe for all users.</p>

                <div style={{ marginTop: 40, padding: 16, background: 'rgba(59,130,246,0.05)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#3B82F6', marginBottom: 4 }}>Security Guarantee</div>
                    <div style={{ fontSize: '0.82rem', color: '#3B82F6' }}>CertLock doesn't just generate certificates; it protects your brand's integrity. We use the same security standards for our free users as we do for our enterprise partners.</div>
                </div>
            </div>
        </Dialog>
    );
};
