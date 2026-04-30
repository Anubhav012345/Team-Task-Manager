const router = require('express').Router();
const auth = require('../middleware/auth');
const { Op } = require('sequelize');
const Task = require('../models/Task');
const ProjectMember = require('../models/ProjectMember');
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
  try {
    const memberships = await ProjectMember.findAll({ where: { userId: req.user.id } });
    const projectIds = memberships.map(m => m.projectId);

    const allTasks = await Task.findAll({
      where: { projectId: { [Op.in]: projectIds } },
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name'] }],
    });

    const today = new Date().toISOString().split('T')[0];

    const byStatus = { todo: 0, inprogress: 0, done: 0 };
    const byUser = {};
    let overdue = 0;

    for (const t of allTasks) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      if (t.assignee) {
        byUser[t.assignee.name] = (byUser[t.assignee.name] || 0) + 1;
      }
      if (t.dueDate && t.dueDate < today && t.status !== 'done') overdue++;
    }

    res.json({
      total: allTasks.length,
      byStatus,
      byUser,
      overdue,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;