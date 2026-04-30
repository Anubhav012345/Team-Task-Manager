const router = require('express').Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const ProjectMember = require('../models/ProjectMember');
const User = require('../models/User');

// =======================
// HELPER: CHECK ACCESS
// =======================
const checkAccess = async (userId, projectId) => {
  return await ProjectMember.findOne({
    where: {
      userId: Number(userId),
      projectId: Number(projectId)
    }
  });
};

// =======================
// CREATE TASK (ADMIN ONLY)
// =======================
router.post('/', auth, async (req, res) => {
  try {
    let { title, description, dueDate, priority, projectId, assignedTo } = req.body;

    // 🔥 SAFETY FIXES
    projectId = Number(projectId);
    if (assignedTo) assignedTo = Number(assignedTo);

    if (!title || !projectId) {
      return res.status(400).json({ msg: 'Title and projectId required' });
    }

    // 🔥 SAFE USER ID EXTRACTION
    const userId = req.user.id || req.user.user?.id;

    const m = await checkAccess(userId, projectId);

    if (!m || m.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin only' });
    }

    const task = await Task.create({
      title,
      description: description || null,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      projectId,
      assignedTo: assignedTo || null,
      createdBy: userId
    });

    res.json(task);

  } catch (err) {
    console.error('🔥 TASK CREATE ERROR:', err);
    res.status(500).json({ msg: err.message });
  }
});

// =======================
// GET TASKS FOR PROJECT
// =======================
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = req.user.id || req.user.user?.id;

    const m = await checkAccess(userId, projectId);

    if (!m) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const where = { projectId };

    if (m.role === 'member') {
      where.assignedTo = userId;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
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
  try {
    const { status } = req.body;
    const taskId = Number(req.params.id);
    const userId = req.user.id || req.user.user?.id;

    if (!['todo', 'inprogress', 'done'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    const m = await checkAccess(userId, task.projectId);

    if (!m) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    if (m.role === 'member' && task.assignedTo !== userId) {
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
    const taskId = Number(req.params.id);
    const userId = req.user.id || req.user.user?.id;

    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    const m = await checkAccess(userId, task.projectId);

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
    const taskId = Number(req.params.id);
    const userId = req.user.id || req.user.user?.id;

    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    const m = await checkAccess(userId, task.projectId);

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