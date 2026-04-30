const router = require('express').Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const User = require('../models/User');

// Create project
router.post('/', auth, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ msg: 'Name required' });
  try {
    const project = await Project.create({ name, description, createdBy: req.user.id });
    await ProjectMember.create({ projectId: project.id, userId: req.user.id, role: 'admin' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get my projects
router.get('/', auth, async (req, res) => {
  try {
    const memberships = await ProjectMember.findAll({
      where: { userId: req.user.id },
      include: [{ model: Project }],
    });
    res.json(memberships.map(m => ({ ...m.Project.dataValues, role: m.role })));
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single project with members
router.get('/:id', auth, async (req, res) => {
  try {
    const membership = await ProjectMember.findOne({ where: { projectId: req.params.id, userId: req.user.id } });
    if (!membership) return res.status(403).json({ msg: 'Access denied' });

    const project = await Project.findByPk(req.params.id);
    const members = await ProjectMember.findAll({
      where: { projectId: req.params.id },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    });
    res.json({ ...project.dataValues, members, myRole: membership.role });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add member (admin only)
router.post('/:id/members', auth, async (req, res) => {
  const { email } = req.body;
  try {
    const myRole = await ProjectMember.findOne({ where: { projectId: req.params.id, userId: req.user.id } });
    if (!myRole || myRole.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const exists = await ProjectMember.findOne({ where: { projectId: req.params.id, userId: user.id } });
    if (exists) return res.status(400).json({ msg: 'Already a member' });

    await ProjectMember.create({ projectId: req.params.id, userId: user.id, role: 'member' });
    res.json({ msg: 'Member added' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Remove member (admin only)
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const myRole = await ProjectMember.findOne({ where: { projectId: req.params.id, userId: req.user.id } });
    if (!myRole || myRole.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });

    await ProjectMember.destroy({ where: { projectId: req.params.id, userId: req.params.userId } });
    res.json({ msg: 'Member removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;