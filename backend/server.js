require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // ✅ IMPORTANT
const sequelize = require('./config/db');

const User = require('./models/User');
const Project = require('./models/Project');
const ProjectMember = require('./models/ProjectMember');
const Task = require('./models/Task');

// =====================
// ASSOCIATIONS
// =====================
Project.hasMany(ProjectMember, { foreignKey: 'projectId' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });

ProjectMember.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ProjectMember, { foreignKey: 'userId' });

Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });
Task.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

// =====================
// APP INIT
// =====================
const app = express();

app.use(cors());
app.use(express.json());

// =====================
// API ROUTES
// =====================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

// =====================
// 🔥 SERVE FRONTEND (VERY IMPORTANT)
// =====================
app.use(express.static(path.join(__dirname, '../frontend/build')));

// React routing support
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// =====================
// SERVER START
// =====================
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('DB synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB error:', err));