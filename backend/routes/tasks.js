const router = require('express').Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const ProjectMember = require('../models/ProjectMember');
const User = require('../models/User');

const checkAccess = async (userId, projectId) => {
  return await ProjectMember.findOne({ where: { userId, projectId } });
};



// =======================
// CREATE TASK (ADMIN ONLY)
// =======================
router.post('/', auth, async (req, res) => {
  const { title, description, dueDate, priority, projectId, assignedTo } = req.body;

  if (!title || !projectId) {
    return res.status(400).json({ msg: 'Title and projectId required' });
  }

  try {
    const m = await checkAccess(req.user.id, projectId);

    if (!m || m.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin only' });
    }

    const task = await Task.create({
      title,
      description: description || null,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      projectId,
      assignedTo: assignedTo || null,   // 🔥 FIX
      createdBy: req.user.id
    });

    res.json(task);

  } catch (err) {
    console.error('🔥 TASK CREATE ERROR:', err);   // 🔥 DEBUG
    res.status(500).json({ msg: err.message });    // 🔥 REAL ERROR
  }
});



// =======================
// GET TASKS FOR PROJECT
// =======================
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const m = await checkAccess(req.user.id, req.params.projectId);

    if (!m) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const where = { projectId: req.params.projectId };

    if (m.role === 'member') {
      where.assignedTo = req.user.id;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json(tasks);

  } catch (err) {
    console.error('🔥 GET TASKS ERROR:', err);
    res.status(500).json({ msg: err.message });
  }
});



// =======================
// UPDATE TASK STATUS
// =======================
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;

  if (!['todo', 'inprogress', 'done'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }

  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    const m = await checkAccess(req.user.id, task.projectId);

    if (!m) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    if (m.role === 'member' && task.assignedTo !== req.user.id) {
      return res.status(403).json({ msg: 'Not your task' });
    }

    await task.update({ status });

    res.json(task);

  } catch (err) {
    console.error('🔥 UPDATE STATUS ERROR:', err);
    res.status(500).json({ msg: err.message });
  }
});



// =======================
// UPDATE FULL TASK (ADMIN)
// =======================
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    const m = await checkAccess(req.user.id, task.projectId);

    if (!m || m.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin only' });
    }

    await task.update(req.body);

    res.json(task);

  } catch (err) {
    console.error('🔥 UPDATE TASK ERROR:', err);
    res.status(500).json({ msg: err.message });
  }
});



// =======================
// DELETE TASK (ADMIN)
// =======================
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    const m = await checkAccess(req.user.id, task.projectId);

    if (!m || m.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin only' });
    }

    await task.destroy();

    res.json({ msg: 'Deleted' });

  } catch (err) {
    console.error('🔥 DELETE TASK ERROR:', err);
    res.status(500).json({ msg: err.message });
  }
});


module.exports = router;