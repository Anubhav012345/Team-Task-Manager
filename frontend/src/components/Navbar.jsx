import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FolderKanban } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => { logout(); nav('/login'); };

  return (
    <nav style={{
      background: '#0f172a', color: '#f1f5f9', padding: '0 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '60px', position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
    }}>
      <Link to="/" style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.2rem', textDecoration: 'none', fontFamily: 'monospace' }}>
        ⚡ TaskFlow
      </Link>
      {user && (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link to="/projects" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <FolderKanban size={16} /> Projects
          </Link>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Hi, {user.name}</span>
          <button onClick={handleLogout} style={{
            background: 'none', border: '1px solid #334155', color: '#94a3b8',
            padding: '6px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
          }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}