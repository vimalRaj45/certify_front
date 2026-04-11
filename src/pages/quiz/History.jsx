import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import quizApi from '../../services/quizApi';
import toast from 'react-hot-toast';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('quiz_user'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/quiz');
      return;
    }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await quizApi.getUserHistory(user.id);
      if (res.success) {
        setHistory(res.history);
      }
    } catch (err) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '40px 20px',
      color: '#f8fafc'
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <header style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 20 }}>
          <Button icon="pi pi-arrow-left" rounded text style={{ color: '#f8fafc' }} onClick={() => navigate('/quiz')} />
          <h1 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit' }}>My Quiz History</h1>
        </header>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: 20 }}>
          <DataTable value={history} loading={loading} emptyMessage="No attempts recorded" className="custom-table" responsiveLayout="stack">
            <Column field="quiz_title" header="Quiz" body={(item) => (
              <div style={{ fontWeight: 700 }}>{item.quiz_title}</div>
            )} />
            <Column field="total_score" header="Score" body={(item) => (
              <div style={{ color: '#3b82f6', fontWeight: 800 }}>{item.total_score || 0} pts</div>
            )} />
            <Column field="time_taken_seconds" header="Duration" body={(item) => (
              <div style={{ color: '#94a3b8' }}>{item.time_taken_seconds ? `${Math.floor(item.time_taken_seconds / 60)}m ${item.time_taken_seconds % 60}s` : 'N/A'}</div>
            )} />
            <Column field="submitted_at" header="Date" body={(item) => (
               <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : 'In Progress'}</div>
            )} />
            <Column header="Actions" body={(item) => (
              <Button label="Result" icon="pi pi-external-link" size="small" rounded text 
                      style={{ color: '#3b82f6' }} 
                      onClick={() => navigate(`/quiz/leaderboard/${item.quiz_id}`)} />
            )} />
          </DataTable>
        </div>
        
        <style>{`
          .custom-table .p-datatable-thead > tr > th { background: transparent; color: #64748b; border-bottom: 1px solid #334155; padding: 20px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; }
          .custom-table .p-datatable-tbody > tr { background: transparent; color: #fff; }
          .custom-table .p-datatable-tbody > tr > td { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 20px; }
        `}</style>
      </div>
    </div>
  );
};

export default History;
