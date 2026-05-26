const db = require('../config/db');

const ensurePollTables = (callback) => {
  db.query(
    `CREATE TABLE IF NOT EXISTS polls (
      id INT PRIMARY KEY AUTO_INCREMENT,
      question VARCHAR(500) NOT NULL,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    (pollTableErr) => {
      if (pollTableErr) return callback(pollTableErr);
      db.query(
        `CREATE TABLE IF NOT EXISTS poll_options (
          id INT PRIMARY KEY AUTO_INCREMENT,
          poll_id INT NOT NULL,
          option_text VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        (optionTableErr) => {
          if (optionTableErr) return callback(optionTableErr);
          db.query(
            `CREATE TABLE IF NOT EXISTS poll_votes (
              id INT PRIMARY KEY AUTO_INCREMENT,
              poll_id INT NOT NULL,
              option_id INT NOT NULL,
              user_id INT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE KEY unique_poll_user_vote (poll_id, user_id)
            )`,
            callback
          );
        }
      );
    }
  );
};

exports.getPolls = (req, res) => {
  const userId = req.user.id;
  ensurePollTables((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare poll tables!', error: tableErr.message });
    db.query(
      `SELECT p.*, u.name as created_by_name FROM polls p 
       LEFT JOIN users u ON p.created_by = u.id 
       ORDER BY p.created_at DESC`,
      (err, polls) => {
        if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
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
      }
    );
  });
};

exports.createPoll = (req, res) => {
  const { question, options } = req.body;
  const created_by = req.user.id;
  ensurePollTables((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare poll tables!', error: tableErr.message });
    if (!question || !String(question).trim()) return res.status(400).json({ message: 'Question is required!' });
    if (!Array.isArray(options) || options.length < 2) return res.status(400).json({ message: 'Add at least 2 options!' });
    const cleanedOptions = options.map(option => String(option).trim()).filter(Boolean);
    if (cleanedOptions.length < 2) return res.status(400).json({ message: 'Add at least 2 options!' });

    db.query(
      'INSERT INTO polls (question, created_by) VALUES (?, ?)',
      [String(question).trim(), created_by],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
        const pollId = result.insertId;
        const values = cleanedOptions.map(option => [pollId, option]);
        db.query(
          'INSERT INTO poll_options (poll_id, option_text) VALUES ?',
          [values],
          (err2) => {
            if (err2) return res.status(500).json({ message: 'Failed!', error: err2.message });
            res.status(201).json({ message: 'Poll created!', id: pollId });
          }
        );
      }
    );
  });
};

exports.vote = (req, res) => {
  const { option_id } = req.body;
  const user_id = req.user.id;
  const poll_id = req.params.id;
  ensurePollTables((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare poll tables!', error: tableErr.message });
    if (!option_id) return res.status(400).json({ message: 'Option is required!' });

    // Delete existing vote first then insert new one
    db.query(
      'DELETE FROM poll_votes WHERE poll_id = ? AND user_id = ?',
      [poll_id, user_id],
      (err) => {
        if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
        db.query(
          'INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)',
          [poll_id, option_id, user_id],
          (err2) => {
            if (err2) return res.status(500).json({ message: 'Failed!', error: err2.message });
            res.json({ message: 'Vote recorded!' });
          }
        );
      }
    );
  });
};