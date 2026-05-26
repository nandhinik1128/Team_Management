const db = require('../config/db');

const ensureAnnouncementTable = (callback) => {
  db.query(
    `CREATE TABLE IF NOT EXISTS announcements (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    callback
  );
};

exports.getAnnouncements = (req, res) => {
  ensureAnnouncementTable((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare announcements table!', error: tableErr.message });
    db.query(
      `SELECT a.*, u.name as created_by_name FROM announcements a 
       LEFT JOIN users u ON a.created_by = u.id 
       ORDER BY a.created_at DESC`,
      (err, results) => {
        if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
        res.json(results);
      }
    );
  });
};

exports.createAnnouncement = (req, res) => {
  const { title, message } = req.body;
  ensureAnnouncementTable((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare announcements table!', error: tableErr.message });

    if (!title || !String(title).trim()) return res.status(400).json({ message: 'Title is required!' });
    if (!message || !String(message).trim()) return res.status(400).json({ message: 'Message is required!' });

    db.query(
      'INSERT INTO announcements (title, message, created_by) VALUES (?, ?, ?)',
      [String(title).trim(), String(message).trim(), req.user.id],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
        res.status(201).json({ message: 'Announcement posted!', id: result.insertId });
      }
    );
  });
};

exports.deleteAnnouncement = (req, res) => {
  ensureAnnouncementTable((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare announcements table!', error: tableErr.message });
    db.query('DELETE FROM announcements WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
      res.json({ message: 'Deleted!' });
    });
  });
};