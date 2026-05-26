const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../config/db');

router.get('/groups', verifyToken, (req, res) => {
  // Return groups the user belongs to and include member ids as an array (member_ids)
  const sql = `
    SELECT cg.*, (
      SELECT GROUP_CONCAT(user_id) FROM group_members gm2 WHERE gm2.group_id = cg.id
    ) AS member_ids_csv
    FROM chat_groups cg
    JOIN group_members gm ON cg.id = gm.group_id
    WHERE gm.user_id = ?
    GROUP BY cg.id
    ORDER BY cg.is_general DESC, cg.created_at ASC`;
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed!' });
    const mapped = (results || []).map(r => ({ ...r, member_ids: r.member_ids_csv ? r.member_ids_csv.split(',').map(Number) : [] }));
    res.json(mapped);
  });
});

router.post('/groups', verifyToken, (req, res) => {
  const { name, memberIds } = req.body;
<<<<<<< Updated upstream
  db.query('INSERT INTO chat_groups (name, created_by) VALUES (?, ?)',
    [name, req.user.id], (err, result) => {
=======
  // Allow any user to create a 1:1 direct-message group (DM).
  // For multi-member groups (more than 1 other member), restrict creation to captain/vice-captain.
  const otherCount = Array.isArray(memberIds) ? memberIds.length : 0;
  if (otherCount > 1 && !['captain', 'vice-captain'].includes(req.user.role))
    return res.status(403).json({ message: 'Only Captain or Vice-Captain can create multi-member groups!' });
  db.query(
    'INSERT INTO chat_groups (name, created_by) VALUES (?, ?)',
    [name, req.user.id],
    (err, result) => {
>>>>>>> Stashed changes
      if (err) return res.status(500).json({ message: 'Failed!' });
      const groupId = result.insertId;
      const allMembers = [...new Set([...(memberIds || []), req.user.id])];
      const values = allMembers.map(id => [groupId, id]);
<<<<<<< Updated upstream
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
=======
      db.query(
        'INSERT INTO group_members (group_id, user_id) VALUES ?',
        [values],
        (err2) => {
          if (err2) return res.status(500).json({ message: 'Failed to add members!', error: err2 });
          // Fetch created group and members to return full object with member_ids
          db.query('SELECT * FROM chat_groups WHERE id = ?', [groupId], (err3, groups) => {
            if (err3 || !groups || groups.length === 0) return res.status(201).json({ message: 'Group created!', groupId });
            const group = groups[0];
            db.query(
              'SELECT u.id, u.name, u.role FROM users u JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = ?',
              [groupId],
              (err4, members) => {
                if (err4) return res.status(201).json({ message: 'Group created!', groupId });
                group.members = members;
                group.member_ids = (members || []).map(m => m.id);
                return res.status(201).json({ message: 'Group created!', group });
              }
            );
          });
        });
>>>>>>> Stashed changes
    });
});

router.delete('/groups/:groupId', verifyToken, (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;
  console.log(`[chat] DELETE group request: groupId=${groupId} by user=${userId} role=${req.user.role}`);
  // Check group exists and members
  db.query('SELECT created_by FROM chat_groups WHERE id = ?', [groupId], (err, groups) => {
    if (err) return res.status(500).json({ message: 'Failed!' });
    if (!groups || groups.length === 0) return res.status(404).json({ message: 'Group not found' });
    const createdBy = groups[0].created_by;
    // get member count and whether requester is member
    db.query('SELECT COUNT(*) AS cnt, SUM(user_id = ?) AS is_member FROM group_members WHERE group_id = ?', [userId, groupId], (err2, rows) => {
      if (err2) return res.status(500).json({ message: 'Failed!' });
      const cnt = (rows && rows[0] && rows[0].cnt) || 0;
      const isMember = (rows && rows[0] && rows[0].is_member) && rows[0].is_member > 0;
      // Permission: allow if creator, captain/vice-captain, or DM (<=2 members) and requester is member
      const allowedRoles = ['captain', 'vice-captain'];
      if (createdBy === userId || allowedRoles.includes(req.user.role) || (cnt <= 2 && isMember)) {
        // delete messages, members, and group
        db.query('DELETE FROM chat_messages WHERE group_id = ?', [groupId], (e1) => {
          if (e1) return res.status(500).json({ message: 'Failed to delete messages' });
          db.query('DELETE FROM group_members WHERE group_id = ?', [groupId], (e2) => {
            if (e2) return res.status(500).json({ message: 'Failed to delete members' });
            db.query('DELETE FROM chat_groups WHERE id = ?', [groupId], (e3) => {
              if (e3) return res.status(500).json({ message: 'Failed to delete group' });
              return res.json({ message: 'Group deleted' });
            });
          });
        });
      } else {
        return res.status(403).json({ message: 'Not allowed to delete this group' });
      }
    });
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
<<<<<<< Updated upstream
     WHERE cm.group_id = ? AND cm.is_deleted = 0
     ORDER BY cm.created_at ASC`,
    [req.params.groupId], (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
=======
     WHERE cm.group_id = ?
     ORDER BY cm.created_at ASC`,
    [req.params.groupId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
>>>>>>> Stashed changes
      res.json(results);
    });
});

router.post('/groups/:groupId/messages', verifyToken, (req, res) => {
  const { message } = req.body;
  const { groupId } = req.params;
  const sender_id = req.user.id;
  if (!message || !message.trim())
    return res.status(400).json({ message: 'Message cannot be empty!' });
<<<<<<< Updated upstream
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
=======

  db.query(
    'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
    [groupId, sender_id],
    (memberErr, memberRows) => {
      if (memberErr) return res.status(500).json({ message: 'Failed!', error: memberErr });
      if (!memberRows || memberRows.length === 0) {
        return res.status(403).json({ message: 'You are not a member of this chat group!' });
      }

  db.query(
    'INSERT INTO chat_messages (group_id, sender_id, message) VALUES (?, ?, ?)',
    [groupId, sender_id, message.trim()],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed!', error: err });
      // Keep sending reliable: notifications are optional and should never fail the message send.
      db.query(
        `SELECT user_id FROM group_members WHERE group_id = ? AND user_id != ?`,
        [groupId, sender_id],
        () => {}
      );
      return res.status(201).json({ message: 'Sent!', id: result.insertId });
>>>>>>> Stashed changes
    });
    }
  );
});

router.put('/messages/:id', verifyToken, (req, res) => {
  const { message } = req.body;
<<<<<<< Updated upstream
  db.query('UPDATE chat_messages SET message = ?, is_edited = TRUE WHERE id = ? AND sender_id = ?',
    [message, req.params.id, req.user.id], (err) => {
=======
  db.query(
    'UPDATE chat_messages SET message = ? WHERE id = ? AND sender_id = ?',
    [message, req.params.id, req.user.id],
    (err) => {
>>>>>>> Stashed changes
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json({ message: 'Edited!' });
    });
});

router.delete('/messages/:id', verifyToken, (req, res) => {
<<<<<<< Updated upstream
  db.query('UPDATE chat_messages SET is_deleted = 1 WHERE id = ? AND sender_id = ?',
    [req.params.id, req.user.id], (err) => {
=======
  db.query(
    'DELETE FROM chat_messages WHERE id = ? AND sender_id = ?',
    [req.params.id, req.user.id],
    (err) => {
>>>>>>> Stashed changes
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json({ message: 'Deleted!' });
    });
});

router.get('/messages/:id/reads', verifyToken, (req, res) => {
<<<<<<< Updated upstream
  db.query(
    `SELECT u.name, u.role, mr.read_at FROM message_reads mr
     JOIN users u ON mr.user_id = u.id
     WHERE mr.message_id = ?`,
    [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!' });
      res.json(results);
    });
=======
  // Schema does not include a message_reads table in this project setup.
  // Return an empty list so the UI can remain functional without failing.
  res.json([]);
>>>>>>> Stashed changes
});

module.exports = router;