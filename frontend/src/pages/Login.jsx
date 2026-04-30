import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success('Welcome back!');
      nav('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1e293b', padding: '2.5rem', borderRadius: 12, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: '#f1f5f9', marginBottom: '0.5rem', fontFamily: 'monospace' }}>⚡ TaskFlow</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Sign in to your account</p>
        <form onSubmit={submit}>
          {['email', 'password'].map(f => (
            <div key={f} style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: 4 }}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
              <input
                type={f === 'password' ? 'password' : 'text'}
                value={form[f]}
                onChange={e => setForm({ ...form, [f]: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: '#38bdf8', color: '#0f172a',
            border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem'
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ color: '#64748b', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          No account? <Link to="/signup" style={{ color: '#38bdf8' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}