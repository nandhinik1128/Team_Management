const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../config/db');

router.get('/', verifyToken, (req, res) => {
  db.query('SELECT m.*, u.name as created_by_name FROM meetings m LEFT JOIN users u ON m.created_by = u.id ORDER BY m.scheduled_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed!' });
    res.json(results);
  });
});

router.post('/', verifyToken, (req, res) => {
  const { title, description, meeting_link, scheduled_at } = req.body;
  const created_by = req.user.id;
  db.query('INSERT INTO meetings (title, description, meeting_link, scheduled_at, created_by) VALUES (?, ?, ?, ?, ?)',
    [title, description, meeting_link, scheduled_at, created_by],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.status(201).json({ message: 'Meeting created!', id: result.insertId });
    });
});

router.delete('/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM meetings WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Failed!' });
    res.json({ message: 'Meeting deleted!' });
  });
});

module.exports = router;