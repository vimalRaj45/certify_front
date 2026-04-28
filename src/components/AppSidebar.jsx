import React from 'react';

const AppSidebar = ({ activeSection, onNavigate, mobileOpen, onMobileClose }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'pi pi-home' },
        { id: 'upload', label: 'Data & Design', icon: 'pi pi-cloud-upload' },
        { id: 'mapping', label: 'Field Mapping', icon: 'pi pi-sitemap' },
        { id: 'generate', label: 'Generate', icon: 'pi pi-play-circle' },
    ];
    const bottomItems = [
        { id: 'enterprise', label: 'Enterprise', icon: 'pi pi-building' },
        { id: 'contact', label: 'Contact VSGRPS', icon: 'pi pi-send' },
    ];

    const content = (
        <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
            {/* Logo Block */}
            <div style={{ padding:'28px 24px 20px', display:'flex', alignItems:'center' }}>
                <img src="/logo.png" alt="CertLock Logo" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            </div>

            <div style={{ height:1, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', margin:'0 20px 16px' }}></div>

            {/* Section */}
            <div style={{ padding:'4px 28px 8px', fontSize:'0.6rem', fontWeight:800, color:'#3B4F72', letterSpacing:'0.18em', textTransform:'uppercase' }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:12, height:2, background:'linear-gradient(90deg, #2563EB, #7C3AED)', borderRadius:2 }}></span>
                    Main Workspace
                </span>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:2, flex:1, padding:'2px 0' }}>
                {menuItems.map(item => (
                    <button key={item.id}
                        className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
                        onClick={() => { onNavigate(item.id); onMobileClose?.(); }}>
                        <i className={item.icon}></i>
                        <span>{item.label}</span>
                        {activeSection === item.id && (
                            <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'#fff', boxShadow:'0 0 8px rgba(255,255,255,0.5)' }}></div>
                        )}
                    </button>
                ))}
            </div>

            <div style={{ height:1, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)', margin:'8px 20px' }}></div>

            <div style={{ padding:'4px 28px 8px', fontSize:'0.6rem', fontWeight:800, color:'#3B4F72', letterSpacing:'0.18em', textTransform:'uppercase' }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:12, height:2, background:'linear-gradient(90deg, #7C3AED, #EC4899)', borderRadius:2 }}></span>
                    VSGRPS
                </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:2, paddingBottom:12 }}>
                {bottomItems.map(item => (
                    <button key={item.id} className="sidebar-link"
                        onClick={() => { onNavigate(item.id); onMobileClose?.(); }}>
                        <i className={item.icon}></i>
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Free Tier Card */}
            <div style={{
                margin:'auto 16px 20px',
                background:'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.08) 100%)',
                border:'1px solid rgba(96,165,250,0.15)',
                borderRadius:16, padding:'20px',
                position:'relative', overflow:'hidden'
            }}>
                <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:'rgba(37,99,235,0.08)' }}></div>
                <div style={{ position:'relative' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                        <i className="pi pi-gift" style={{ color:'#60A5FA', fontSize:'0.85rem' }}></i>
                        <span style={{ fontSize:'0.68rem', fontWeight:800, color:'#60A5FA', letterSpacing:'0.1em', textTransform:'uppercase' }}>Free Forever</span>
                    </div>
                    <div style={{ fontSize:'0.82rem', color:'#CBD5E1', lineHeight:1.6 }}>
                        Generate up to <span style={{ color:'#fff', fontWeight:800 }}>100 certificates</span> completely free. No credit card required.
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="sidebar" style={{ display: window.innerWidth >= 992 ? 'flex' : 'none' }}>{content}</div>
            <div className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`} onClick={onMobileClose}></div>
            <div className={`sidebar ${mobileOpen ? 'open' : ''}`} style={{ display: mobileOpen ? 'flex' : (window.innerWidth >= 992 ? 'none' : 'flex') }}>{content}</div>
        </>
    );
};

export default AppSidebar;
