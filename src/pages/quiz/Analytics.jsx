import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import quizApi from '../../services/quizApi';
import Breadcrumbs from '../../components/quiz/Breadcrumbs';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizRes, analyticsRes] = await Promise.all([
          quizApi.getQuiz(id),
          quizApi.getQuizAnalytics(id)
        ]);
        
        if (quizRes.success) setQuiz(quizRes.quiz);
        if (analyticsRes.success) setData(analyticsRes);
      } catch (err) {
        toast.error("Failed to load analytics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#3b82f6', marginBottom: 20 }}></i>
        <p>Analyzing performance data...</p>
      </div>
    </div>
  );

  if (!data) return <div>Data not found</div>;

  const { stats, distribution, questions } = data;

  const statCards = [
    { label: 'Total Attempts', value: stats.total_attempts, icon: 'pi-users', color: '#3b82f6' },
    { label: 'Unique Takers', value: stats.unique_participants, icon: 'pi-user-check', color: '#8b5cf6' },
    { label: 'Average Score', value: `${Math.round(stats.avg_score || 0)}%`, icon: 'pi-chart-bar', color: '#10b981' },
    { label: 'Highest Score', value: `${stats.top_score || 0}%`, icon: 'pi-star', color: '#f59e0b' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Breadcrumbs items={[{ label: 'Quiz Hub', url: '/quiz' }, { label: quiz?.title || 'Quiz' }]} />
        
        <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit', margin: 0 }}>Quiz Analytics</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Detailed performance breakdown for "{quiz?.title}"</p>
          </div>
          <div style={{ display: 'flex', gap: 15 }}>
            <Button label="Export Results" icon="pi pi-download" className="p-button-outlined" 
                    onClick={async () => {
                        const res = await quizApi.exportQuizResults(id);
                        if (res.success) {
                            localStorage.setItem('cert_participants', JSON.stringify(res.participants));
                            toast.success("Ready for Certificate Studio!");
                            navigate('/');
                        }
                    }} 
                    style={{ borderRadius: 12, borderColor: '#3b82f6', color: '#3b82f6' }} />
            <Button label="Back to Hub" icon="pi pi-arrow-left" onClick={() => navigate('/quiz')} 
                    style={{ borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
        </header>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
          {statCards.map((s, i) => (
            <Card key={i} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <div style={{ width: 48, height: 48, background: `${s.color}20`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`pi ${s.icon}`} style={{ color: s.color, fontSize: '1.2rem' }}></i>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{s.label}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{s.value}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 30, marginBottom: 40 }}>
          {/* Distribution */}
          <Card header={<h3 style={{ margin: '20px 25px 0', fontSize: '1.2rem' }}>Score Distribution</h3>} 
                style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24 }}>
            <div style={{ padding: '0 10px 20px' }}>
              {Array.from({ length: 11 }).map((_, i) => {
                const range = i * 10;
                const d = distribution.find(dist => dist.range === range);
                const count = d ? d.count : 0;
                const percent = stats.total_attempts > 0 ? (count / stats.total_attempts) * 100 : 0;
                
                return (
                  <div key={range} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4, color: '#94a3b8' }}>
                      <span>{range}% - {range + 10}%</span>
                      <span>{count} takers</span>
                    </div>
                    <ProgressBar value={percent} showValue={false} style={{ height: 8, background: 'rgba(255,255,255,0.05)' }} color="#3b82f6" />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Question Breakdown */}
          <Card header={<h3 style={{ margin: '20px 25px 0', fontSize: '1.2rem' }}>Question Difficulty</h3>}
                style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24 }}>
            <DataTable value={questions} className="p-datatable-sm" style={{ background: 'transparent' }} responsiveLayout="scroll">
              <Column field="question" header="Question" body={(rowData) => (
                <div style={{ fontSize: '0.85rem', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rowData.question}</div>
              )} style={{ width: '60%' }} />
              <Column field="rate" header="Success Rate" body={(rowData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${rowData.rate}%`, height: '100%', background: rowData.rate > 70 ? '#10b981' : (rowData.rate > 40 ? '#f59e0b' : '#ef4444') }}></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: 35 }}>{rowData.rate}%</span>
                </div>
              )} style={{ width: '40%' }} />
            </DataTable>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
