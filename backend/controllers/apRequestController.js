const db = require('../config/db');

exports.getRequests = (req, res) => {
  const isManager = req.user.role === 'manager';
  const query = isManager
    ? `SELECT r.*, u.name as user_name FROM ap_requests r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC`
    : `SELECT r.*, u.name as user_name FROM ap_requests r LEFT JOIN users u ON r.user_id = u.id WHERE r.user_id = ? ORDER BY r.created_at DESC`;
  const params = isManager ? [] : [req.user.id];
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed!' });
    res.json(results);
  });
};

exports.submitRequest = (req, res) => {
  const { ap_value, reason } = req.body;
  db.query(
    'INSERT INTO ap_requests (user_id, ap_value, reason) VALUES (?, ?, ?)',
    [req.user.id, ap_value, reason],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.status(201).json({ message: 'AP request submitted!', id: result.insertId });
    });
};

exports.reviewRequest = (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  db.query('SELECT * FROM ap_requests WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Not found!' });
    const request = results[0];
    db.query(
      'UPDATE ap_requests SET status = ?, reviewed_by = ? WHERE id = ?',
      [status, req.user.id, id],
      (err2) => {
        if (err2) return res.status(500).json({ message: 'Failed!' });
        if (status === 'approved') {
          db.query(
            'UPDATE users SET ap_points = ap_points + ? WHERE id = ?',
            [request.ap_value, request.user_id]);
          db.query(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [request.user_id, `Your AP request for ${request.ap_value} points has been approved!`]);
        } else {
          db.query(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [request.user_id, `Your AP request for ${request.ap_value} points has been rejected.`]);
        }
        res.json({ message: `Request ${status}!` });
      });
  });
};