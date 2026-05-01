const db = require('../config/db');

exports.getAnnouncements = (req, res) => {
  db.query(
    `SELECT a.*, u.name as created_by_name FROM announcements a 
     LEFT JOIN users u ON a.created_by = u.id 
     ORDER BY a.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
};

exports.createAnnouncement = (req, res) => {
  const { title, message } = req.body;
  db.query('INSERT INTO announcements (title, message, created_by) VALUES (?, ?, ?)',
    [title, message, req.user.id], (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.status(201).json({ message: 'Announcement posted!', id: result.insertId });
    });
};

exports.deleteAnnouncement = (req, res) => {
  db.query('DELETE FROM announcements WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Failed!' });
    res.json({ message: 'Deleted!' });
  });
};