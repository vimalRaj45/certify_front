import React from 'react';
import { useNavigate } from 'react-router-dom';

const Breadcrumbs = ({ items = [] }) => {
  const navigate = useNavigate();

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
      <span onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#3b82f6'} onMouseOut={(e) => e.target.style.color = '#64748b'}>
        <i className="pi pi-verified" style={{ fontSize: '0.8rem' }}></i>
        Generator
      </span>
      <i className="pi pi-chevron-right" style={{ fontSize: '0.6rem', color: '#334155' }}></i>
      <span onClick={() => navigate('/quiz')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#3b82f6'} onMouseOut={(e) => e.target.style.color = '#64748b'}>
        <i className="pi pi-home" style={{ fontSize: '0.8rem', marginRight: 5 }}></i>
        Assessments
      </span>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <i className="pi pi-chevron-right" style={{ fontSize: '0.6rem', color: '#334155' }}></i>
          <span 
            onClick={() => item.path && navigate(item.path)} 
            style={{ 
              cursor: item.path ? 'pointer' : 'default', 
              color: index === items.length - 1 ? '#3b82f6' : '#64748b',
              fontWeight: index === items.length - 1 ? 700 : 500
            }}
            onMouseOver={(e) => item.path && (e.target.style.color = '#3b82f6')}
            onMouseOut={(e) => item.path && (e.target.style.color = index === items.length - 1 ? '#3b82f6' : '#64748b')}
          >
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
