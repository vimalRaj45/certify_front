import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import quizApi from '../../services/quizApi';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../components/quiz/Breadcrumbs';
import './quiz.css';

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
      color: '#f8fafc',
      paddingTop: 40
    }} className="quiz-container">
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Breadcrumbs items={[{ label: 'History' }]} />

        <header style={{ marginBottom: 40 }} className="quiz-header">
           <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit', margin: 0 }}>Performance History</h1>
           <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: 5 }}>Track your progress and review past assessment results.</p>
        </header>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: 20, overflow: 'hidden' }}>
          <DataTable value={history} loading={loading} emptyMessage="No attempts recorded yet." className="custom-table" responsiveLayout="stack">
            <Column field="quiz_title" header="Assessment" body={(item) => (
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.quiz_title}</div>
            )} />
            <Column field="total_score" header="Score" body={(item) => (
              <div style={{ color: '#3b82f6', fontWeight: 800 }}>{item.total_score || 0} pts</div>
            )} />
            <Column field="time_taken_seconds" header="Duration" body={(item) => (
              <div style={{ color: '#94a3b8' }}>{item.time_taken_seconds ? `${Math.floor(item.time_taken_seconds / 60)}m ${item.time_taken_seconds % 60}s` : 'N/A'}</div>
            )} />
            <Column field="submitted_at" header="Date" body={(item) => (
               <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'In Progress'}
               </div>
            )} />
            <Column header="Insights" body={(item) => (
              <Button label="View Ranking" icon="pi pi-chart-bar" size="small" rounded 
                      style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6' }} 
                      onClick={() => navigate(`/quiz/leaderboard/${item.quiz_id}`)} />
            )} />
          </DataTable>
        </div>
        
        <style>{`
          .custom-table .p-datatable-thead > tr > th { background: transparent; color: #64748b; border-bottom: 1px solid #334155; padding: 25px 20px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; font-weight: 800; }
          .custom-table .p-datatable-tbody > tr { background: transparent; color: #fff; transition: background 0.2s; }
          .custom-table .p-datatable-tbody > tr:hover { background: rgba(255,255,255,0.02); }
          .custom-table .p-datatable-tbody > tr > td { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 25px 20px; }
        `}</style>
      </div>
    </div>
  );
};

export default History;
