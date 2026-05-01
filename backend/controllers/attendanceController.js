const db = require('../config/db');

exports.getAttendance = (req, res) => {
  db.query(
    `SELECT a.*, u.name as user_name, m.title as meeting_title
     FROM attendance a
     LEFT JOIN users u ON a.user_id = u.id
     LEFT JOIN meetings m ON a.meeting_id = m.id
     ORDER BY a.id DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
};

exports.markAttendance = (req, res) => {
  const { meeting_id, user_id, status } = req.body;
  db.query(
    'SELECT * FROM attendance WHERE meeting_id = ? AND user_id = ?',
    [meeting_id, user_id],
    (err, existing) => {
      if (existing && existing.length > 0) {
        db.query(
          'UPDATE attendance SET status = ? WHERE meeting_id = ? AND user_id = ?',
          [status, meeting_id, user_id],
          (err2) => {
            if (err2) return res.status(500).json({ message: 'Failed!' });
            res.json({ message: 'Attendance updated!' });
          });
      } else {
        db.query(
          'INSERT INTO attendance (user_id, meeting_id, status) VALUES (?, ?, ?)',
          [user_id, meeting_id, status],
          (err2) => {
            if (err2) return res.status(500).json({ message: 'Failed!' });
            res.status(201).json({ message: 'Attendance marked!' });
          });
      }
    });
};

exports.getMeetingAttendance = (req, res) => {
  const { meetingId } = req.params;
  db.query(
    `SELECT u.id, u.name, u.role, COALESCE(a.status, 'absent') as status
     FROM users u
     LEFT JOIN attendance a ON u.id = a.user_id AND a.meeting_id = ?`,
    [meetingId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
};