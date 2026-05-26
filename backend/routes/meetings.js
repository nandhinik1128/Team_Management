const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../config/db');

const ensureMeetingTable = (callback) => {
  db.query(
    `CREATE TABLE IF NOT EXISTS meetings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      meeting_link VARCHAR(500),
      scheduled_at DATETIME NOT NULL,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    callback
  );
};

router.get('/', verifyToken, (req, res) => {
  ensureMeetingTable((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare meetings table!', error: tableErr.message });
    db.query('SELECT m.*, u.name as created_by_name FROM meetings m LEFT JOIN users u ON m.created_by = u.id ORDER BY m.scheduled_at DESC', (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
      res.json(results);
    });
  });
});

router.post('/', verifyToken, (req, res) => {
  const { title, description, meeting_link, scheduled_at } = req.body;
  const created_by = req.user.id;
  ensureMeetingTable((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare meetings table!', error: tableErr.message });
    db.query('INSERT INTO meetings (title, description, meeting_link, scheduled_at, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, description, meeting_link, scheduled_at, created_by],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
        res.status(201).json({ message: 'Meeting created!', id: result.insertId });
      });
  });
});

router.delete('/:id', verifyToken, (req, res) => {
  ensureMeetingTable((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare meetings table!', error: tableErr.message });
    db.query('DELETE FROM meetings WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
      res.json({ message: 'Meeting deleted!' });
    });
  });
});

module.exports = router;