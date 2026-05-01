const db = require('../config/db');

// Get all users
exports.getUsers = (req, res) => {
  db.query('SELECT id, name, email, role, ap_points, rp_points FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to get users!', error: err });
    res.status(200).json(results);
  });
};

// Get profile
exports.getProfile = (req, res) => {
  const userId = req.user.id;
  db.query('SELECT id, name, email, role, ap_points, rp_points FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to get profile!', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'User not found!' });
    res.status(200).json(results[0]);
  });
};

// Update AP/RP points — only manager
exports.updatePoints = (req, res) => {
  const { id } = req.params;
  const { ap_points, rp_points } = req.body;
  db.query(
    'UPDATE users SET ap_points = ?, rp_points = ? WHERE id = ?',
    [ap_points ?? 0, rp_points ?? 0, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to update points!', error: err });
      res.status(200).json({ message: 'Points updated successfully! ✅' });
    }
  );
};