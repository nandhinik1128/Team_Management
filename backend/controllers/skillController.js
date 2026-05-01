const db = require('../config/db');

exports.getSkills = (req, res) => {
  db.query(
    `SELECT s.*, u.name as user_name FROM skills s 
     LEFT JOIN users u ON s.user_id = u.id 
     WHERE s.user_id = ? ORDER BY s.created_at DESC`,
    [req.user.id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
};

exports.getAllSkills = (req, res) => {
  db.query(
    `SELECT s.*, u.name as user_name FROM skills s 
     LEFT JOIN users u ON s.user_id = u.id 
     ORDER BY s.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
};

exports.addSkill = (req, res) => {
  const { skill_name, status } = req.body;
  db.query('INSERT INTO skills (user_id, skill_name, status) VALUES (?, ?, ?)',
    [req.user.id, skill_name, status || 'not-started'],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.status(201).json({ message: 'Skill added!', id: result.insertId });
    });
};

exports.updateSkill = (req, res) => {
  const { status } = req.body;
  db.query('UPDATE skills SET status = ? WHERE id = ? AND user_id = ?',
    [status, req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json({ message: 'Skill updated!' });
    });
};

exports.deleteSkill = (req, res) => {
  db.query('DELETE FROM skills WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json({ message: 'Skill deleted!' });
    });
};