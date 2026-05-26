const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../config/db');

const ensureProjectTables = (callback) => {
  db.query(
    `CREATE TABLE IF NOT EXISTS projects (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'in-progress',
      deadline DATE,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    (projectErr) => {
      if (projectErr) return callback(projectErr);
      db.query(
        `CREATE TABLE IF NOT EXISTS project_members (
          id INT PRIMARY KEY AUTO_INCREMENT,
          project_id INT NOT NULL,
          user_id INT NOT NULL,
            member_status ENUM('in-progress', 'completed') NOT NULL DEFAULT 'in-progress',
          UNIQUE KEY unique_project_member (project_id, user_id)
        )`,
        callback
      );
    }
  );
};

const ensureProjectSchema = (callback) => {
    ensureProjectTables(callback);
};

const insertProjectMembers = (projectId, memberIds, callback) => {
  const uniqueMemberIds = [...new Set(memberIds.map(id => Number(id)).filter(Boolean))];

  if (uniqueMemberIds.length === 0) {
    return callback(null);
  }

  const insertNext = (index) => {
    if (index >= uniqueMemberIds.length) {
      return callback(null);
    }

    db.query(
      'INSERT INTO project_members (project_id, user_id) VALUES (?, ?)',
      [projectId, uniqueMemberIds[index]],
      (err) => {
        if (err) return callback(err);
        insertNext(index + 1);
      }
    );
  };

  insertNext(0);
};

// Get all projects with members
router.get('/', verifyToken, (req, res) => {
  ensureProjectSchema((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare project tables!', error: tableErr.message });
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
          `SELECT u.id, u.name, u.role, pm.member_status FROM users u
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
});

// Create project — Captain only
router.post('/', verifyToken, (req, res) => {
  if (!['captain', 'vice-captain', 'strategist'].includes(req.user.role))
    return res.status(403).json({ message: 'Only Captain, Vice-Captain, or Strategist can create projects!' });
  const { title, description, status, deadline, memberIds, assigned_to } = req.body;
  const projectMembers = Array.isArray(memberIds)
    ? memberIds.map(id => Number(id)).filter(Boolean)
    : assigned_to
      ? [Number(assigned_to)].filter(Boolean)
      : [];

  ensureProjectSchema((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare project tables!', error: tableErr.message });
    db.query(
      'INSERT INTO projects (title, description, status, deadline, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, description, status || 'in-progress', deadline, req.user.id],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
        const projectId = result.insertId;
        if (!projectMembers.length) {
          return res.status(201).json({ message: 'Project created!', id: projectId });
        }

        insertProjectMembers(projectId, projectMembers, (memberErr) => {
          if (memberErr) {
            return res.status(500).json({ message: 'Project created, but member assignment failed!', error: memberErr.message });
          }
          res.status(201).json({ message: 'Project created!', id: projectId });
        });
      }
    );
  });
});

const updateMemberStatus = (req, res) => {
  const { status } = req.body;
  if (!['in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid member status!' });
  }

  ensureProjectSchema((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare project tables!', error: tableErr.message });

    db.query(
      `SELECT pm.id, pm.project_id, pm.user_id
       FROM project_members pm
       WHERE pm.project_id = ? AND pm.user_id = ?`,
      [req.params.id, req.user.id],
      (findErr, rows) => {
        if (findErr) return res.status(500).json({ message: 'Failed!', error: findErr.message });
        if (!rows || rows.length === 0) {
          return res.status(403).json({ message: 'You are not a participant in this project!' });
        }

        db.query(
          'UPDATE project_members SET member_status = ? WHERE project_id = ? AND user_id = ?',
          [status, req.params.id, req.user.id],
          (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'Failed!', error: updateErr.message });
            res.json({ message: 'Your project status was updated!' });
          }
        );
      }
    );
  });
};

// Update personal project participation status
router.patch('/:id/member-status', verifyToken, updateMemberStatus);
router.put('/:id/member-status', verifyToken, updateMemberStatus);

// Update project status — members of project can update
router.put('/:id', verifyToken, (req, res) => {
  ensureProjectTables((tableErr) => {
    if (tableErr) {
      return res.status(500).json({ message: 'Failed to prepare project tables!', error: tableErr.message });
    }

    db.query('SELECT * FROM projects WHERE id = ?', [req.params.id], (findErr, rows) => {
      if (findErr) return res.status(500).json({ message: 'Failed!', error: findErr.message });
      if (!rows || rows.length === 0) return res.status(404).json({ message: 'Project not found!' });

      const currentProject = rows[0];
      const { title, description, status, deadline } = req.body;
      const nextTitle = title !== undefined ? title : currentProject.title;
      const nextDescription = description !== undefined ? description : currentProject.description;
      const nextStatus = status !== undefined ? status : currentProject.status;
      const nextDeadline = deadline !== undefined ? (deadline || null) : currentProject.deadline;

      db.query(
        'UPDATE projects SET title=?, description=?, status=?, deadline=? WHERE id=?',
        [nextTitle, nextDescription, nextStatus, nextDeadline, req.params.id],
        (err) => {
          if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
          res.json({ message: 'Project updated!' });
        }
      );
    });
  });
});

// Delete project
router.delete('/:id', verifyToken, (req, res) => {
  if (!['captain', 'vice-captain', 'strategist'].includes(req.user.role))
    return res.status(403).json({ message: 'Only Captain, Vice-Captain, or Strategist can delete projects!' });
  db.query('DELETE FROM projects WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Failed!' });
    res.json({ message: 'Project deleted!' });
  });
});

module.exports = router;