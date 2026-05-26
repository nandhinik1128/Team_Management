const db = require('../config/db');

exports.getNotifications = (req, res) => {
  db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
};

exports.markAllRead = (req, res) => {
  db.query('DELETE FROM notifications WHERE user_id = ?',
    [req.user.id], (err) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json({ message: 'All cleared!' });
    });
};

exports.createNotification = (userId, message, db) => {
  db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [userId, message]);
};