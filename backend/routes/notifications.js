const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../config/db');

router.get('/', verifyToken, (req, res) => {
  db.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
});

router.put('/read', verifyToken, (req, res) => {
  db.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
    [req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json({ message: 'All marked as read!' });
    });
});

router.post('/', verifyToken, (req, res) => {
  const { user_id, message } = req.body;
  db.query(
    'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
    [user_id, message],
    (err) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.status(201).json({ message: 'Notification sent!' });
    });
});

module.exports = router;