import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import quizApi from '../../services/quizApi';
import toast from 'react-hot-toast';
import './quiz.css';

const Leaderboard = () => {
  const { quizId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, [quizId]);

  const fetchLeaderboard = async () => {
    try {
      const res = await quizApi.getLeaderboard(quizId);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f8fafc'
    }} className="quiz-container">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <header style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="mobile-flex-column">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Button icon="pi pi-arrow-left" rounded text style={{ color: '#f8fafc' }} onClick={() => navigate('/quiz')} />
            <h1 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit' }}>Leaderboard</h1>
          </div>
          {data && <h2 style={{ fontSize: '1.2rem', color: '#3b82f6', margin: 0 }}>{data.quiz?.title}</h2>}
        </header>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: 20 }}>
          <DataTable value={data?.leaderboard || []} loading={loading} emptyMessage="No attempts yet" 
                     className="custom-table" responsiveLayout="stack">
            <Column header="#" body={(data, options) => (
              <div style={{ 
                width: 30, height: 30, borderRadius: '50%', 
                background: options.rowIndex === 0 ? '#fbbf24' : (options.rowIndex === 1 ? '#94a3b8' : (options.rowIndex === 2 ? '#b45309' : 'transparent')),
                color: options.rowIndex < 3 ? '#000' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900
              }}>
                {options.rowIndex + 1}
              </div>
            )} />
            <Column field="user_name" header="Champion" body={(item) => (
              <div style={{ fontWeight: 700 }}>{item.user_name}</div>
            )} />
            <Column field="total_score" header="Score" body={(item) => (
              <div style={{ color: '#3b82f6', fontWeight: 800 }}>{item.total_score} pts</div>
            )} />
            <Column field="time_taken_seconds" header="Time" body={(item) => (
              <div style={{ color: '#94a3b8' }}>{Math.floor(item.time_taken_seconds / 60)}m {item.time_taken_seconds % 60}s</div>
            )} />
            <Column field="submitted_at" header="Date" body={(item) => (
               <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(item.submitted_at).toLocaleDateString()}</div>
            )} />
          </DataTable>
        </div>
        
        <style>{`
          .custom-table .p-datatable-thead > tr > th { background: transparent; color: #64748b; border-bottom: 1px solid #334155; padding: 20px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; }
          .custom-table .p-datatable-tbody > tr { background: transparent; color: #fff; }
          .custom-table .p-datatable-tbody > tr > td { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 20px; }
          .custom-table.p-datatable .p-datatable-loading-overlay { background: rgba(15, 23, 42, 0.8); }
        `}</style>
      </div>
    </div>
  );
};

export default Leaderboard;
