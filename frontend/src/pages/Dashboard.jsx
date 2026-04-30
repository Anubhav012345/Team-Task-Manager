import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get('/dashboard').then(r => setData(r.data)); }, []);

  if (!data) return <div style={{ color: '#94a3b8', padding: '2rem' }}>Loading...</div>;

  const statusData = [
    { name: 'To Do', value: data.byStatus.todo, color: '#64748b' },
    { name: 'In Progress', value: data.byStatus.inprogress, color: '#38bdf8' },
    { name: 'Done', value: data.byStatus.done, color: '#4ade80' },
  ];

  const userData = Object.entries(data.byUser).map(([name, value]) => ({ name, value }));

  const card = (title, value, color = '#38bdf8') => (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.5rem', flex: 1, minWidth: 140 }}>
      <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 8 }}>{title}</div>
      <div style={{ color, fontSize: '2.5rem', fontWeight: 800 }}>{value}</div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ color: '#f1f5f9', marginBottom: '2rem' }}>Dashboard</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {card('Total Tasks', data.total)}
        {card('To Do', data.byStatus.todo, '#94a3b8')}
        {card('In Progress', data.byStatus.inprogress, '#38bdf8')}
        {card('Done', data.byStatus.done, '#4ade80')}
        {card('Overdue', data.overdue, '#f87171')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9' }} />
              <Bar dataKey="value">
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>Tasks per User</h3>
          {userData.length === 0 ? <p style={{ color: '#475569' }}>No data yet</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={userData}>
                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9' }} />
                <Bar dataKey="value" fill="#a78bfa" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}