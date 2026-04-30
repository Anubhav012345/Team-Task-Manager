import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2} from 'lucide-react';

const STATUSES = ['todo', 'inprogress', 'done'];
const LABELS = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };

export default function ProjectDetail() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTask, setShowTask] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: ''
  });

  // ✅ FIXED with useCallback
  const loadProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch {
      toast.error('Failed to load project');
    }
  }, [id]);

  const loadTasks = useCallback(async () => {
    try {
      const res = await api.get(`/tasks/project/${id}`);
      setTasks(res.data);
    } catch {
      toast.error('Failed to load tasks');
    }
  }, [id]);

  // ✅ FIXED dependency issue
  useEffect(() => {
    loadProject();
    loadTasks();
  }, [loadProject, loadTasks]);

  const createTask = async () => {
    if (!form.title) return toast.error('Title required');

    try {
      await api.post('/tasks', {
        ...form,
        projectId: id,
        assignedTo: form.assignedTo || undefined
      });

      toast.success('Task created');
      setShowTask(false);
      setForm({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        assignedTo: ''
      });

      loadTasks();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed');
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      loadTasks();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Cannot update');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Deleted');
      loadTasks();
    } catch {
      toast.error('Failed');
    }
  };
  const removeMember = async (uid) => {
    try {
      await api.delete(`/projects/${id}/members/${uid}`);
      toast.success('Removed');
      loadProject();
    } catch {
      toast.error('Failed');
    }
  };

  if (!project) {
    return <div style={{ color: '#94a3b8', padding: '2rem' }}>Loading...</div>;
  }

  const isAdmin = project.myRole === 'admin';

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ color: '#f1f5f9' }}>{project.name}</h1>
      <p style={{ color: '#64748b' }}>{project.description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem' }}>
        {/* TASKS */}
        <div>
          <h2 style={{ color: '#94a3b8' }}>Tasks</h2>

          {isAdmin && (
            <button onClick={() => setShowTask(!showTask)}>
              <Plus size={14} /> Add Task
            </button>
          )}

          {showTask && (
            <div>
              <input
                placeholder="Task title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
              <button onClick={createTask}>Create</button>
            </div>
          )}

          {STATUSES.map(s => (
            <div key={s}>
              <h3>{LABELS[s]}</h3>

              {tasks.filter(t => t.status === s).map(task => (
                <div key={task.id}>
                  <p>{task.title}</p>

                  <select
                    value={task.status}
                    onChange={e => updateStatus(task.id, e.target.value)}
                  >
                    {STATUSES.map(st => (
                      <option key={st} value={st}>{LABELS[st]}</option>
                    ))}
                  </select>

                  {isAdmin && (
                    <button onClick={() => deleteTask(task.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* MEMBERS */}
        <div>
          <h2>Members</h2>

          {project.members?.map(m => (
            <div key={m.User.id}>
              <p>{m.User.name}</p>

              {isAdmin && (
                <button onClick={() => removeMember(m.User.id)}>
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}