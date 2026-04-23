import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import quizApi from '../../services/quizApi';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../components/quiz/Breadcrumbs';
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
      color: '#f8fafc',
      paddingTop: 40
    }} className="quiz-container">
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Breadcrumbs items={[{ label: 'Leaderboard' }]} />

        <header style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="mobile-flex-column">
           <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit', margin: 0 }}>Leaderboard</h1>
              {data && <p style={{ color: '#3b82f6', fontSize: '1.1rem', marginTop: 5, fontWeight: 700 }}>{data.quiz?.title}</p>}
           </div>
           <div style={{ display: 'flex', gap: 10 }} className="mt-3">
              <Button label="Take Assessment" icon="pi pi-play" size="small" onClick={() => navigate(`/quiz/take/${quizId}`)} 
                      style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: 10 }} />
           </div>
        </header>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: 20, overflow: 'hidden' }}>
          <DataTable value={data?.leaderboard || []} loading={loading} emptyMessage="No attempts yet" 
                     className="custom-table" responsiveLayout="stack">
            <Column header="Rank" body={(data, options) => (
              <div style={{ 
                width: 35, height: 35, borderRadius: '50%', 
                background: options.rowIndex === 0 ? '#fbbf24' : (options.rowIndex === 1 ? '#94a3b8' : (options.rowIndex === 2 ? '#b45309' : 'rgba(255,255,255,0.05)')),
                color: options.rowIndex < 3 ? '#000' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem'
              }}>
                {options.rowIndex + 1}
              </div>
            )} />
            <Column field="user_name" header="Candidate" body={(item) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>
                    {item.user_name.charAt(0).toUpperCase()}
                 </div>
                 <div style={{ fontWeight: 700 }}>{item.user_name}</div>
              </div>
            )} />
            <Column field="total_score" header="Score" body={(item) => (
              <div style={{ color: '#3b82f6', fontWeight: 800 }}>{item.total_score} pts</div>
            )} />
            <Column field="time_taken_seconds" header="Time" body={(item) => (
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{Math.floor(item.time_taken_seconds / 60)}m {item.time_taken_seconds % 60}s</div>
            )} />
            <Column field="submitted_at" header="Date" body={(item) => (
               <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(item.submitted_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            )} />
          </DataTable>
        </div>
        
        <style>{`
          .custom-table .p-datatable-thead > tr > th { background: transparent; color: #64748b; border-bottom: 1px solid #334155; padding: 25px 20px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; font-weight: 800; }
          .custom-table .p-datatable-tbody > tr { background: transparent; color: #fff; transition: background 0.2s; }
          .custom-table .p-datatable-tbody > tr:hover { background: rgba(255,255,255,0.02); }
          .custom-table .p-datatable-tbody > tr > td { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 25px 20px; }
          .custom-table.p-datatable .p-datatable-loading-overlay { background: rgba(15, 23, 42, 0.8); }
        `}</style>
      </div>
    </div>
  );
};

export default Leaderboard;
