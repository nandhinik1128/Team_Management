const db = require('../config/db');

exports.getPolls = (req, res) => {
  const userId = req.user.id;
  db.query(
    `SELECT p.*, u.name as created_by_name FROM polls p 
     LEFT JOIN users u ON p.created_by = u.id 
     ORDER BY p.created_at DESC`,
    (err, polls) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      if (polls.length === 0) return res.json([]);
      let done = 0;
      polls.forEach((poll, i) => {
        db.query(
          `SELECT po.*, COUNT(pv.id) as votes,
           GROUP_CONCAT(u.name SEPARATOR ', ') as voter_names,
           MAX(CASE WHEN pv.user_id = ? THEN 1 ELSE 0 END) as user_voted
           FROM poll_options po 
           LEFT JOIN poll_votes pv ON po.id = pv.option_id 
           LEFT JOIN users u ON pv.user_id = u.id
           WHERE po.poll_id = ? 
           GROUP BY po.id`,
          [userId, poll.id],
          (err2, options) => {
            polls[i].options = options || [];
            polls[i].my_vote = options?.find(o => o.user_voted)?.id || null;
            done++;
            if (done === polls.length) res.json(polls);
          });
      });
    });
};

exports.createPoll = (req, res) => {
  const { question, options } = req.body;
  const created_by = req.user.id;
  db.query(
    'INSERT INTO polls (question, created_by) VALUES (?, ?)',
    [question, created_by],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      const pollId = result.insertId;
      const values = options.map(o => [pollId, o]);
      db.query(
        'INSERT INTO poll_options (poll_id, option_text) VALUES ?',
        [values],
        (err2) => {
          if (err2) return res.status(500).json({ message: 'Failed!' });
          res.status(201).json({ message: 'Poll created!', id: pollId });
        });
    });
};

exports.vote = (req, res) => {
  const { option_id } = req.body;
  const user_id = req.user.id;
  const poll_id = req.params.id;
  // Delete existing vote first then insert new one
  db.query(
    'DELETE FROM poll_votes WHERE poll_id = ? AND user_id = ?',
    [poll_id, user_id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      db.query(
        'INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)',
        [poll_id, option_id, user_id],
        (err2) => {
          if (err2) return res.status(500).json({ message: 'Failed!' });
          res.json({ message: 'Vote recorded!' });
        });
    });
};