const db = require('../config/db');

// Get all groups for a user
exports.getGroups = (req, res) => {
  const userId = req.user.id;
  db.query(
    `SELECT cg.* FROM chat_groups cg
     JOIN group_members gm ON cg.id = gm.group_id
     WHERE gm.user_id = ?
     ORDER BY cg.is_general DESC, cg.created_at ASC`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed to get groups!', error: err });
      res.status(200).json(results);
    }
  );
};

// Create a new group
exports.createGroup = (req, res) => {
  const { name, memberIds } = req.body;
  const created_by = req.user.id;
  db.query(
    'INSERT INTO chat_groups (name, created_by) VALUES (?, ?)',
    [name, created_by],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to create group!', error: err });
      const groupId = result.insertId;
      const allMembers = [...new Set([...memberIds, created_by])];
      const values = allMembers.map(id => [groupId, id]);
      db.query(
        'INSERT INTO group_members (group_id, user_id) VALUES ?',
        [values],
        (err2) => {
          if (err2) return res.status(500).json({ message: 'Failed to add members!', error: err2 });
          res.status(201).json({ message: 'Group created!', groupId });
        }
      );
    }
  );
};

// Get messages for a group
exports.getMessages = (req, res) => {
  const { groupId } = req.params;
  db.query(
    `SELECT cm.*, u.name as sender_name, u.role as sender_role
     FROM chat_messages cm
     JOIN users u ON cm.sender_id = u.id
     WHERE cm.group_id = ?
     ORDER BY cm.created_at ASC`,
    [groupId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed to get messages!', error: err });
      res.status(200).json(results);
    }
  );
};

// Send a message
exports.sendMessage = (req, res) => {
  const { groupId } = req.params;
  const { message } = req.body;
  const sender_id = req.user.id;
  db.query(
    'INSERT INTO chat_messages (group_id, sender_id, message) VALUES (?, ?, ?)',
    [groupId, sender_id, message],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to send message!', error: err });
      res.status(201).json({ message: 'Message sent!', id: result.insertId });
    }
  );
};

// Get members of a group
exports.getGroupMembers = (req, res) => {
  const { groupId } = req.params;
  db.query(
    `SELECT u.id, u.name, u.role FROM users u
     JOIN group_members gm ON u.id = gm.user_id
     WHERE gm.group_id = ?`,
    [groupId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed to get members!', error: err });
      res.status(200).json(results);
    }
  );
};