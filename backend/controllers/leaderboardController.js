const db = require('../config/db');

// Get Leaderboard
exports.getLeaderboard = (req, res) => {
  db.query(
    `SELECT 
      id,
      name,
      email,
      role,
      ap_points,
      rp_points,
      (ap_points + rp_points) as total_points
     FROM users
     ORDER BY total_points DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed to get leaderboard!', error: err });
      
      // Add rank to each user
      const leaderboard = results.map((user, index) => ({
        rank: index + 1,
        ...user
      }));

      res.status(200).json(leaderboard);
    }
  );
};