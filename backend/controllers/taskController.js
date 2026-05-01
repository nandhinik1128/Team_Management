const db = require('../config/db');

exports.createTask = (req, res) => {
  const { title, description, assigned_to, priority, deadline } = req.body;
  const created_by = req.user.id;
  db.query(
    'INSERT INTO tasks (title, description, assigned_to, created_by, priority, deadline) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, assigned_to, created_by, priority || 'medium', deadline],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed!', error: err });
      // Notify assigned member
      db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)',
        [assigned_to, `You have been assigned a new task: ${title}`]);
      res.status(201).json({ message: 'Task created!', taskId: result.insertId });
    });
};

exports.getTasks = (req, res) => {
  db.query(
    `SELECT tasks.*, users.name as assigned_to_name 
     FROM tasks 
     LEFT JOIN users ON tasks.assigned_to = users.id 
     ORDER BY tasks.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed!', error: err });
      res.status(200).json(results);
    });
};

exports.updateTask = (req, res) => {
  const { title, description, status, priority, deadline } = req.body;
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  db.query('SELECT * FROM tasks WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Task not found!' });
    const task = results[0];
    const canUpdate = task.assigned_to === userId ||
      role === 'strategist' || role === 'captain' || role === 'vice-captain' || role === 'manager';
    if (!canUpdate) return res.status(403).json({ message: 'No permission to update this task!' });

    db.query(
      'UPDATE tasks SET title=?, description=?, status=?, priority=?, deadline=? WHERE id=?',
      [title || task.title, description || task.description, status || task.status,
       priority || task.priority, deadline || task.deadline, id],
      (err2) => {
        if (err2) return res.status(500).json({ message: 'Failed!' });
        res.status(200).json({ message: 'Task updated!' });
      });
  });
};

exports.deleteTask = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tasks WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Failed!' });
    res.status(200).json({ message: 'Task deleted!' });
  });
};