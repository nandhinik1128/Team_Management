const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../config/db');

router.get('/predefined', verifyToken, (req, res) => {
  db.query(
    `SELECT ps.*, 
     COALESCE(usp.completed_levels, 0) as completed_levels,
     COALESCE(usp.status, 'not-started') as user_status,
     usp.id as progress_id
     FROM predefined_skills ps
     LEFT JOIN user_skill_progress usp ON ps.id = usp.skill_id AND usp.user_id = ?
     ORDER BY ps.category, ps.skill_name`,
    [req.user.id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
});

router.get('/all-progress', verifyToken, (req, res) => {
  db.query(
    `SELECT usp.*, ps.skill_name, ps.category, ps.total_levels, u.name as user_name
     FROM user_skill_progress usp
     JOIN predefined_skills ps ON usp.skill_id = ps.id
     JOIN users u ON usp.user_id = u.id
     ORDER BY u.name, ps.skill_name`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
});

router.post('/progress', verifyToken, (req, res) => {
  const { skill_id, completed_levels, status } = req.body;
  db.query(
    `INSERT INTO user_skill_progress (user_id, skill_id, completed_levels, status)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE completed_levels=?, status=?, updated_at=NOW()`,
    [req.user.id, skill_id, completed_levels, status, completed_levels, status],
    (err) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json({ message: 'Progress updated!' });
    });
});

module.exports = router;