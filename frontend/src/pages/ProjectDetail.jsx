import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, UserPlus } from 'lucide-react';

const STATUSES = ['todo', 'inprogress', 'done'];
const LABELS = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
const COLORS = { todo: '#64748b', inprogress: '#38bdf8', done: '#4ade80' };
const PRIORITY_COLORS = { low: '#4ade80', medium: '#fbbf24', high: '#f87171' };

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTask, setShowTask] = useState(false);
  const [showMember, setShowMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', assignedTo: '' });

  const loadProject = () => api.get(`/projects/${id}`).then(r => setProject(r.data));
  const loadTasks = () => api.get(`/tasks/project/${id}`).then(r => setTasks(r.data));

  useEffect(() => { loadProject(); loadTasks(); }, [id]);

  const createTask = async () => {
    if (!form.title) return toast.error('Title required');
    try {
      await api.post('/tasks', { ...form, projectId: id, assignedTo: form.assignedTo || undefined });
      toast.success('Task created');
      setShowTask(false);
      setForm({ title: '', description: '', dueDate: '', priority: 'medium', assignedTo: '' });
      loadTasks();
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      loadTasks();
    } catch (err) { toast.error(err.response?.data?.msg || 'Cannot update'); }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Deleted');
      loadTasks();
    } catch (err) { toast.error('Failed'); }
  };

  const addMember = async () => {
    if (!memberEmail) return;
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      toast.success('Member added');
      setMemberEmail(''); setShowMember(false);
      loadProject();
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed'); }
  };

  const removeMember = async (uid) => {
    try {
      await api.delete(`/projects/${id}/members/${uid}`);
      toast.success('Removed');
      loadProject();
    } catch (err) { toast.error('Failed'); }
  };

  if (!project) return <div style={{ color: '#94a3b8', padding: '2rem' }}>Loading...</div>;

  const isAdmin = project.myRole === 'admin';

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#f1f5f9' }}>{project.name}</h1>
        <p style={{ color: '#64748b' }}>{project.description}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem' }}>
        {/* Tasks */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: '#94a3b8', fontSize: '1rem' }}>Tasks</h2>
            {isAdmin && (
              <button onClick={() => setShowTask(!showTask)} style={{
                background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: 8,
                padding: '6px 14px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem'
              }}>
                <Plus size={14} /> Add Task
              </button>
            )}
          </div>

          {showTask && isAdmin && (
            <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
              <input placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                style={{ width: '100%', marginBottom: 8, padding: 10, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', boxSizing: 'border-box' }} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%', marginBottom: 8, padding: 10, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', boxSizing: 'border-box', resize: 'vertical', minHeight: 60 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  style={{ padding: 10, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                  style={{ padding: 10, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                  style={{ padding: 10, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}>
                  <option value="">Unassigned</option>
                  {project.members?.map(m => (
                    <option key={m.User.id} value={m.User.id}>{m.User.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={createTask} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 700 }}>
                Create Task
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {STATUSES.map(s => (
              <div key={s}>
                <div style={{ color: COLORS[s], fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {LABELS[s]} ({tasks.filter(t => t.status === s).length})
                </div>
                {tasks.filter(t => t.status === s).map(task => (
                  <div key={task.id} style={{ background: '#1e293b', borderRadius: 10, padding: '1rem', marginBottom: '0.75rem', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>{task.title}</span>
                      {isAdmin && (
                        <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0 }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    {task.description && <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0' }}>{task.description}</p>}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', background: '#0f172a', color: PRIORITY_COLORS[task.priority] }}>
                        {task.priority}
                      </span>
                      {task.assignee && <span style={{ color: '#64748b', fontSize: '0.75rem' }}>@{task.assignee.name}</span>}
                      {task.dueDate && <span style={{ color: '#475569', fontSize: '0.7rem' }}>{task.dueDate}</span>}
                    </div>
                    <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
                      style={{ marginTop: 8, width: '100%', padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#94a3b8', fontSize: '0.8rem' }}>
                      {STATUSES.map(st => <option key={st} value={st}>{LABELS[st]}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Members */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: '#94a3b8', fontSize: '1rem' }}>Members</h2>
            {isAdmin && (
              <button onClick={() => setShowMember(!showMember)} style={{ background: 'none', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                <UserPlus size={14} />
              </button>
            )}
          </div>
          {showMember && isAdmin && (
            <div style={{ marginBottom: '1rem' }}>
              <input placeholder="Member email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)}
                style={{ width: '100%', padding: 8, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', boxSizing: 'border-box', marginBottom: 6 }} />
              <button onClick={addMember} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: 8, padding: '6px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                Add
              </button>
            </div>
          )}
          {project.members?.map(m => (
            <div key={m.User.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#1e293b', borderRadius: 8, marginBottom: 6 }}>
              <div>
                <div style={{ color: '#f1f5f9', fontSize: '0.85rem' }}>{m.User.name}</div>
                <div style={{ color: '#475569', fontSize: '0.75rem' }}>{m.User.email}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.7rem', color: m.role === 'admin' ? '#38bdf8' : '#4ade80' }}>{m.role}</span>
                {isAdmin && m.role !== 'admin' && (
                  <button onClick={() => removeMember(m.User.id)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}