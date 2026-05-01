const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../config/db');

// Get all projects with members
router.get('/', verifyToken, (req, res) => {
  db.query(
    `SELECT p.*, u.name as created_by_name FROM projects p 
     LEFT JOIN users u ON p.created_by = u.id 
     ORDER BY p.created_at DESC`,
    (err, projects) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      if (projects.length === 0) return res.json([]);
      let done = 0;
      projects.forEach((project, i) => {
        db.query(
          `SELECT u.id, u.name, u.role FROM users u
           JOIN project_members pm ON u.id = pm.user_id
           WHERE pm.project_id = ?`,
          [project.id], (err2, members) => {
            projects[i].members = members || [];
            done++;
            if (done === projects.length) res.json(projects);
          });
      });
    });
});

// Create project — Captain only
router.post('/', verifyToken, (req, res) => {
  if (!['captain', 'vice-captain'].includes(req.user.role))
    return res.status(403).json({ message: 'Only Captain or Vice-Captain can create projects!' });
  const { title, description, status, deadline, memberIds } = req.body;
  db.query(
    'INSERT INTO projects (title, description, status, deadline, created_by) VALUES (?, ?, ?, ?, ?)',
    [title, description, status || 'in-progress', deadline, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      const projectId = result.insertId;
      if (memberIds && memberIds.length > 0) {
        const values = memberIds.map(id => [projectId, id]);
        db.query('INSERT INTO project_members (project_id, user_id) VALUES ?', [values]);
      }
      res.status(201).json({ message: 'Project created!', id: projectId });
    });
});

// Update project status — members of project can update
router.put('/:id', verifyToken, (req, res) => {
  const { title, description, status, deadline } = req.body;
  db.query(
    'UPDATE projects SET title=?, description=?, status=?, deadline=? WHERE id=?',
    [title, description, status, deadline, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json({ message: 'Project updated!' });
    });
});

// Delete project
router.delete('/:id', verifyToken, (req, res) => {
  if (!['captain', 'vice-captain'].includes(req.user.role))
    return res.status(403).json({ message: 'Only Captain can delete projects!' });
  db.query('DELETE FROM projects WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Failed!' });
    res.json({ message: 'Project deleted!' });
  });
});

module.exports = router;