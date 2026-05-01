const db = require('../config/db');

exports.getActivity = (req, res) => {
  db.query(
    `SELECT a.*, u.name as user_name, u.role as user_role 
     FROM activity_feed a 
     LEFT JOIN users u ON a.user_id = u.id 
     ORDER BY a.created_at DESC LIMIT 50`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
};

exports.addActivity = (userId, action, db) => {
  db.query('INSERT INTO activity_feed (user_id, action) VALUES (?, ?)', [userId, action]);
};