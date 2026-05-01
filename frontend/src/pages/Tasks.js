import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Tasks = () => {
const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', assigned_to: '',
    priority: 'medium', deadline: ''
  });

  const isStrategist = user?.role === 'strategist';
  const isManager = user?.role === 'manager';
  const isCaptain = user?.role === 'captain';
  const isViceCaptain = user?.role === 'vice-captain';

  const canAssign = isStrategist || isCaptain || isViceCaptain;

  useEffect(() => {
    fetchTasks();
    API.get('/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const fetchTasks = () => {
    API.get('/tasks').then(r => setTasks(r.data)).catch(() => {});
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tasks', form);
      toast.success('Task assigned successfully!');
      setShowForm(false);
      setForm({ title: '', description: '', assigned_to: '', priority: 'medium', deadline: '' });
      fetchTasks();
    } catch (err) {
      toast.error('Failed to assign task!');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Status updated!');
      fetchTasks();
    } catch {
      toast.error('Failed to update status!');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      toast.success('Task deleted!');
      fetchTasks();
    } catch {
      toast.error('Failed to delete task!');
    }
  };

  const myTasks = tasks.filter(t => t.assigned_to === user?.id);
  const allTasks = tasks;

  const priorityColor = {
    high: { bg: '#FFEBEE', color: '#C62828' },
    medium: { bg: '#FFF8E1', color: '#F57F17' },
    low: { bg: '#E8F5E9', color: '#2E7D32' },
  };

  const statusColor = {
    'todo': { bg: '#F3E5F5', color: '#6A1B9A' },
    'in-progress': { bg: '#FFF3E0', color: '#E65100' },
    'completed': { bg: '#E8F5E9', color: '#2E7D32' },
  };

  const TaskCard = ({ task }) => (
    <div style={styles.taskCard}>
      <div style={styles.taskHeader}>
        <div style={{ flex: 1 }}>
          <h4 style={styles.taskTitle}>{task.title}</h4>
          <p style={styles.taskDesc}>{task.description}</p>
        </div>
        <span style={{
          ...styles.priorityBadge,
          background: priorityColor[task.priority]?.bg,
          color: priorityColor[task.priority]?.color
        }}>
          {task.priority}
        </span>
      </div>

      <div style={styles.taskMeta}>
        <span style={styles.metaItem}>
          👤 {users.find(u => u.id === task.assigned_to)?.name || 'Unknown'}
        </span>
        {task.deadline && (
          <span style={styles.metaItem}>
            📅 {new Date(task.deadline).toLocaleDateString('en-IN')}
          </span>
        )}
      </div>

      <div style={styles.taskFooter}>
        <select
          style={{
            ...styles.statusSelect,
            background: statusColor[task.status]?.bg,
            color: statusColor[task.status]?.color,
          }}
          value={task.status}
          onChange={(e) => handleStatusChange(task.id, e.target.value)}
          disabled={task.assigned_to !== user?.id && !canAssign && !isManager}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {(canAssign || isManager) && (
          <button
            style={styles.deleteBtn}
            onClick={() => handleDelete(task.id)}
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Tasks</h1>
            <p style={styles.subheading}>
              {canAssign
                ? 'Assign and manage tasks for your team'
                : 'View and update your assigned tasks'}
            </p>
          </div>
          {canAssign && (
            <button
              style={styles.addBtn}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '✕ Cancel' : '+ Assign Task'}
            </button>
          )}
        </div>

        {/* Assign Task Form — only for strategist/captain/vice-captain */}
        {showForm && canAssign && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Assign New Task</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Task Title</label>
                  <input
                    style={styles.input}
                    name="title"
                    placeholder="Enter task title"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Assign To</label>
                  <select
                    style={styles.input}
                    name="assigned_to"
                    value={form.assigned_to}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select member</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Priority</label>
                  <select
                    style={styles.input}
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Deadline</label>
                  <input
                    style={styles.input}
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                  name="description"
                  placeholder="Enter task description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
              <button style={styles.submitBtn} type="submit">
                Assign Task
              </button>
            </form>
          </div>
        )}

        {/* My Tasks */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📋 My Tasks</h3>
          {myTasks.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyIcon}>🎉</p>
              <p style={styles.emptyTitle}>No tasks for today!</p>
              <p style={styles.emptyText}>You're all caught up. Take rest or help your teammates!</p>
            </div>
          ) : (
            <div style={styles.taskGrid}>
              {myTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          )}
        </div>

        {/* All Tasks — visible to captain, vice-captain, strategist, manager */}
        {(canAssign || isManager) && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>👥 All Team Tasks</h3>
            {allTasks.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={styles.emptyText}>No tasks assigned yet.</p>
              </div>
            ) : (
              <div style={styles.taskGrid}>
                {allTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: '1100px' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px'
  },
  heading: { margin: '0 0 6px', fontSize: '26px', fontWeight: '700', color: '#1A1A2E' },
  subheading: { margin: 0, color: '#888', fontSize: '14px' },
  addBtn: {
    background: '#1565C0', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '10px 20px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer'
  },
  formCard: {
    background: '#fff', borderRadius: '12px', padding: '24px',
    border: '1px solid #E8EDF5', marginBottom: '28px'
  },
  formTitle: { margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#333' },
  formGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px', marginBottom: '16px'
  },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' },
  input: {
    padding: '10px 14px', borderRadius: '8px',
    border: '1.5px solid #D0DCF0', fontSize: '14px',
    color: '#333', outline: 'none', background: '#FAFCFF',
    fontFamily: "'Segoe UI', sans-serif"
  },
  submitBtn: {
    background: '#1565C0', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '11px 28px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', marginTop: '8px'
  },
  section: { marginBottom: '32px' },
  sectionTitle: { margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#333' },
  taskGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px'
  },
  taskCard: {
    background: '#fff', borderRadius: '12px', padding: '20px',
    border: '1px solid #E8EDF5', display: 'flex',
    flexDirection: 'column', gap: '12px'
  },
  taskHeader: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  taskTitle: { margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: '#1A1A2E' },
  taskDesc: { margin: 0, fontSize: '13px', color: '#888', lineHeight: '1.4' },
  priorityBadge: {
    fontSize: '11px', fontWeight: '600', padding: '3px 10px',
    borderRadius: '20px', whiteSpace: 'nowrap', textTransform: 'capitalize'
  },
  taskMeta: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  metaItem: { fontSize: '12px', color: '#666' },
  taskFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusSelect: {
    padding: '6px 12px', borderRadius: '20px', border: 'none',
    fontSize: '12px', fontWeight: '600', cursor: 'pointer', outline: 'none'
  },
  deleteBtn: {
    background: '#FFEBEE', color: '#C62828', border: 'none',
    borderRadius: '6px', padding: '6px 12px', fontSize: '12px',
    cursor: 'pointer', fontWeight: '600'
  },
  emptyBox: {
    background: '#F8FAFF', borderRadius: '12px',
    padding: '40px', textAlign: 'center', border: '1px dashed #D0DCF0'
  },
  emptyIcon: { fontSize: '36px', margin: '0 0 8px' },
  emptyTitle: { margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#555' },
  emptyText: { margin: 0, fontSize: '13px', color: '#aaa' },
};

export default Tasks;