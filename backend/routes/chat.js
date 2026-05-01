const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../config/db');

router.get('/groups', verifyToken, (req, res) => {
  db.query(
    `SELECT cg.* FROM chat_groups cg
     JOIN group_members gm ON cg.id = gm.group_id
     WHERE gm.user_id = ?
     ORDER BY cg.is_general DESC, cg.created_at ASC`,
    [req.user.id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
});

router.post('/groups', verifyToken, (req, res) => {
  if (!['captain', 'vice-captain'].includes(req.user.role))
    return res.status(403).json({ message: 'Only Captain or Vice-Captain can create groups!' });
  const { name, memberIds } = req.body;
  db.query('INSERT INTO chat_groups (name, created_by) VALUES (?, ?)',
    [name, req.user.id], (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      const groupId = result.insertId;
      const allMembers = [...new Set([...memberIds, req.user.id])];
      const values = allMembers.map(id => [groupId, id]);
      db.query('INSERT INTO group_members (group_id, user_id) VALUES ?', [values], (err2) => {
        if (err2) return res.status(500).json({ message: 'Failed!' });
        res.status(201).json({ message: 'Group created!', groupId });
      });
    });
});

// Delete group — captain/vice-captain only
router.delete('/groups/:groupId', verifyToken, (req, res) => {
  if (!['captain', 'vice-captain'].includes(req.user.role))
    return res.status(403).json({ message: 'Only Captain or Vice-Captain can delete groups!' });
  db.query('SELECT * FROM chat_groups WHERE id = ?', [req.params.groupId], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Group not found!' });
    if (results[0].is_general) return res.status(403).json({ message: 'Cannot delete general group!' });
    db.query('DELETE FROM chat_groups WHERE id = ?', [req.params.groupId], (err2) => {
      if (err2) return res.status(500).json({ message: 'Failed!' });
      res.json({ message: 'Group deleted!' });
    });
  });
});

// Add member to group
router.post('/groups/:groupId/members', verifyToken, (req, res) => {
  if (!['captain', 'vice-captain'].includes(req.user.role))
    return res.status(403).json({ message: 'Only Captain or Vice-Captain can add members!' });
  const { user_id } = req.body;
  db.query('INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)',
    [req.params.groupId, user_id], (err) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json({ message: 'Member added!' });
    });
});

// Remove member from group
router.delete('/groups/:groupId/members/:userId', verifyToken, (req, res) => {
  if (!['captain', 'vice-captain'].includes(req.user.role))
    return res.status(403).json({ message: 'Only Captain or Vice-Captain can remove members!' });
  db.query('DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
    [req.params.groupId, req.params.userId], (err) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json({ message: 'Member removed!' });
    });
});

router.get('/groups/:groupId/members', verifyToken, (req, res) => {
  db.query(
    `SELECT u.id, u.name, u.role FROM users u
     JOIN group_members gm ON u.id = gm.user_id
     WHERE gm.group_id = ?`,
    [req.params.groupId], (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
});

router.get('/groups/:groupId/messages', verifyToken, (req, res) => {
  db.query(
    `SELECT cm.id, cm.group_id, cm.sender_id, cm.message,
     cm.created_at, cm.is_edited, cm.is_deleted,
     u.name as sender_name, u.role as sender_role
     FROM chat_messages cm
     JOIN users u ON cm.sender_id = u.id
     WHERE cm.group_id = ? AND cm.is_deleted = 0
     ORDER BY cm.created_at ASC`,
    [req.params.groupId], (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
      res.json(results);
    });
});

router.post('/groups/:groupId/messages', verifyToken, (req, res) => {
  const { message } = req.body;
  const { groupId } = req.params;
  const sender_id = req.user.id;
  if (!message || !message.trim())
    return res.status(400).json({ message: 'Message cannot be empty!' });
  db.query('INSERT INTO chat_messages (group_id, sender_id, message) VALUES (?, ?, ?)',
    [groupId, sender_id, message.trim()], (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
      db.query(`SELECT user_id FROM group_members WHERE group_id = ? AND user_id != ?`,
        [groupId, sender_id], (err2, members) => {
          if (!err2 && members.length > 0) {
            const notifValues = members.map(m => [m.user_id, `New message in group chat`]);
            db.query('INSERT INTO notifications (user_id, message) VALUES ?', [notifValues]);
          }
        });
      res.status(201).json({ message: 'Sent!', id: result.insertId });
    });
});

router.put('/messages/:id', verifyToken, (req, res) => {
  const { message } = req.body;
  db.query('UPDATE chat_messages SET message = ?, is_edited = TRUE WHERE id = ? AND sender_id = ?',
    [message, req.params.id, req.user.id], (err) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json({ message: 'Edited!' });
    });
});

router.delete('/messages/:id', verifyToken, (req, res) => {
  db.query('UPDATE chat_messages SET is_deleted = 1 WHERE id = ? AND sender_id = ?',
    [req.params.id, req.user.id], (err) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json({ message: 'Deleted!' });
    });
});

router.get('/messages/:id/reads', verifyToken, (req, res) => {
  db.query(
    `SELECT u.name, u.role, mr.read_at FROM message_reads mr
     JOIN users u ON mr.user_id = u.id
     WHERE mr.message_id = ?`,
    [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
});

module.exports = router;