import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, FolderOpen } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [show, setShow] = useState(false);
  const nav = useNavigate();

  const load = () => api.get('/projects').then(r => setProjects(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name) return toast.error('Name required');
    try {
      await api.post('/projects', { name, description: desc });
      toast.success('Project created');
      setName(''); setDesc(''); setShow(false);
      load();
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#f1f5f9' }}>Projects</h1>
        <button onClick={() => setShow(!show)} style={{
          background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: 8,
          padding: '8px 16px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6
        }}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {show && (
        <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <input placeholder="Project name" value={name} onChange={e => setName(e.target.value)}
            style={{ width: '100%', marginBottom: 8, padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', boxSizing: 'border-box' }} />
          <input placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)}
            style={{ width: '100%', marginBottom: 8, padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', boxSizing: 'border-box' }} />
          <button onClick={create} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 700 }}>
            Create
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {projects.map(p => (
          <div key={p.id} onClick={() => nav(`/projects/${p.id}`)}
            style={{ background: '#1e293b', borderRadius: 12, padding: '1.5rem', cursor: 'pointer', border: '1px solid #334155', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#38bdf8'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}>
            <FolderOpen size={24} color="#38bdf8" style={{ marginBottom: 8 }} />
            <h3 style={{ color: '#f1f5f9', marginBottom: 4 }}>{p.name}</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{p.description || 'No description'}</p>
            <span style={{
              display: 'inline-block', marginTop: 8, padding: '2px 10px',
              background: p.role === 'admin' ? '#1e3a5f' : '#1e2d1e',
              color: p.role === 'admin' ? '#38bdf8' : '#4ade80',
              borderRadius: 20, fontSize: '0.75rem'
            }}>{p.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}