import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api/axios';

const Profile = () => {
 const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    API.get('/tasks').then(r => setTasks(r.data)).catch(() => {});
    API.get('/leaderboard').then(r => setMembers(r.data)).catch(() => {});
  }, []);

  const myTasks = tasks.filter(t => t.assigned_to === user?.id);
  const completedTasks = myTasks.filter(t => t.status === 'completed');
  const inProgressTasks = myTasks.filter(t => t.status === 'in-progress');
  const pendingTasks = myTasks.filter(t => t.status === 'todo');

  const myRank = members.findIndex(m => m.id === user?.id) + 1;

  const roleInfo = {
    captain:        { bg: '#E3F2FD', color: '#1565C0', label: 'Captain' },
    'vice-captain': { bg: '#E8EAF6', color: '#3949AB', label: 'Vice Captain' },
    manager:        { bg: '#E8F5E9', color: '#2E7D32', label: 'Team Manager' },
    strategist:     { bg: '#FFF3E0', color: '#E65100', label: 'Strategist' },
    member:         { bg: '#F3E5F5', color: '#6A1B9A', label: 'Member' },
  };

  const role = roleInfo[user?.role] || roleInfo.member;

  const statusColor = {
    'todo':        { bg: '#F3E5F5', color: '#6A1B9A' },
    'in-progress': { bg: '#FFF3E0', color: '#E65100' },
    'completed':   { bg: '#E8F5E9', color: '#2E7D32' },
  };

  const priorityColor = {
    high:   { bg: '#FFEBEE', color: '#C62828' },
    medium: { bg: '#FFF8E1', color: '#F57F17' },
    low:    { bg: '#E8F5E9', color: '#2E7D32' },
  };

  const completionRate = myTasks.length > 0
    ? Math.round((completedTasks.length / myTasks.length) * 100)
    : 0;

  return (
    <Layout>
      <div style={styles.container}>

        {/* Header */}
        <h1 style={styles.heading}>My Profile</h1>
        <p style={styles.subheading}>Your personal performance summary</p>

        <div style={styles.topRow}>

          {/* Profile Card */}
          <div style={styles.profileCard}>
            <div style={styles.avatarCircle}>
              {user?.name?.charAt(0)}
            </div>
            <h2 style={styles.name}>{user?.name}</h2>
            <span style={{
              ...styles.roleBadge,
              background: role.bg,
              color: role.color
            }}>
              {role.label}
            </span>
            <p style={styles.email}>{user?.email}</p>

            <div style={styles.divider} />

            <div style={styles.statRow}>
              <div style={styles.statItem}>
                <p style={styles.statValue}>{user?.ap_points || 0}</p>
                <p style={styles.statLabel}>AP Points</p>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <p style={styles.statValue}>#{myRank || '-'}</p>
                <p style={styles.statLabel}>Rank</p>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <p style={styles.statValue}>{completionRate}%</p>
                <p style={styles.statLabel}>Completion</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressSection}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Task Completion Rate</span>
                <span style={styles.progressValue}>{completionRate}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${completionRate}%`
                }} />
              </div>
            </div>
          </div>

          {/* Task Summary */}
          <div style={styles.summaryCard}>
            <h3 style={styles.cardTitle}>📊 Task Summary</h3>

            <div style={styles.summaryGrid}>
              <div style={{ ...styles.summaryItem, background: '#E8F5E9' }}>
                <p style={{ ...styles.summaryValue, color: '#2E7D32' }}>
                  {completedTasks.length}
                </p>
                <p style={{ ...styles.summaryLabel, color: '#2E7D32' }}>
                  Completed
                </p>
              </div>
              <div style={{ ...styles.summaryItem, background: '#FFF3E0' }}>
                <p style={{ ...styles.summaryValue, color: '#E65100' }}>
                  {inProgressTasks.length}
                </p>
                <p style={{ ...styles.summaryLabel, color: '#E65100' }}>
                  In Progress
                </p>
              </div>
              <div style={{ ...styles.summaryItem, background: '#F3E5F5' }}>
                <p style={{ ...styles.summaryValue, color: '#6A1B9A' }}>
                  {pendingTasks.length}
                </p>
                <p style={{ ...styles.summaryLabel, color: '#6A1B9A' }}>
                  Pending
                </p>
              </div>
              <div style={{ ...styles.summaryItem, background: '#E3F0FF' }}>
                <p style={{ ...styles.summaryValue, color: '#1565C0' }}>
                  {myTasks.length}
                </p>
                <p style={{ ...styles.summaryLabel, color: '#1565C0' }}>
                  Total Tasks
                </p>
              </div>
            </div>

            {/* Role Permissions */}
            <div style={styles.permissionsBox}>
              <h4 style={styles.permTitle}>🔐 Your Permissions</h4>
              {[
                { label: 'Assign Tasks', allowed: ['captain', 'vice-captain', 'strategist'] },
                { label: 'Update AP Points', allowed: ['manager'] },
                { label: 'Schedule Meetings', allowed: ['captain', 'vice-captain'] },
                { label: 'Create Groups', allowed: ['captain', 'vice-captain'] },
                { label: 'View All Tasks', allowed: ['captain', 'vice-captain', 'strategist', 'manager'] },
              ].map(p => {
                const hasAccess = p.allowed.includes(user?.role);
                return (
                  <div key={p.label} style={styles.permRow}>
                    <span style={styles.permLabel}>{p.label}</span>
                    <span style={{
                      ...styles.permBadge,
                      background: hasAccess ? '#E8F5E9' : '#FFEBEE',
                      color: hasAccess ? '#2E7D32' : '#C62828'
                    }}>
                      {hasAccess ? '✓ Yes' : '✕ No'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* My Tasks List */}
        <div style={styles.tasksSection}>
          <h3 style={styles.cardTitle}>📋 My Assigned Tasks</h3>
          {myTasks.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyIcon}>🎉</p>
              <p style={styles.emptyTitle}>No tasks assigned yet!</p>
              <p style={styles.emptyText}>Enjoy your free time or help your teammates.</p>
            </div>
          ) : (
            <div style={styles.taskList}>
              {myTasks.map(task => (
                <div key={task.id} style={styles.taskRow}>
                  <div style={styles.taskLeft}>
                    <span style={{
                      ...styles.statusDot,
                      background: statusColor[task.status]?.color
                    }} />
                    <div>
                      <p style={styles.taskTitle}>{task.title}</p>
                      <p style={styles.taskDesc}>{task.description}</p>
                    </div>
                  </div>
                  <div style={styles.taskRight}>
                    <span style={{
                      ...styles.priorityBadge,
                      background: priorityColor[task.priority]?.bg,
                      color: priorityColor[task.priority]?.color
                    }}>
                      {task.priority}
                    </span>
                    <span style={{
                      ...styles.statusBadge,
                      background: statusColor[task.status]?.bg,
                      color: statusColor[task.status]?.color
                    }}>
                      {task.status}
                    </span>
                    {task.deadline && (
                      <span style={styles.deadline}>
                        📅 {new Date(task.deadline).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: '1100px' },
  heading: { margin: '0 0 6px', fontSize: '26px', fontWeight: '700', color: '#1A1A2E' },
  subheading: { margin: '0 0 28px', color: '#888', fontSize: '14px' },
  topRow: { display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' },
  profileCard: {
    width: '280px', minWidth: '260px', background: '#fff',
    borderRadius: '12px', padding: '28px 24px',
    border: '1px solid #E8EDF5', display: 'flex',
    flexDirection: 'column', alignItems: 'center'
  },
  avatarCircle: {
    width: '80px', height: '80px', background: '#1565C0',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '32px', fontWeight: '700',
    color: '#fff', marginBottom: '16px'
  },
  name: { margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#1A1A2E' },
  roleBadge: {
    fontSize: '12px', fontWeight: '600', padding: '4px 14px',
    borderRadius: '20px', marginBottom: '8px'
  },
  email: { margin: '0 0 16px', fontSize: '12px', color: '#aaa' },
  divider: { width: '100%', height: '1px', background: '#E8EDF5', marginBottom: '16px' },
  statRow: { display: 'flex', width: '100%', justifyContent: 'space-around', marginBottom: '20px' },
  statItem: { textAlign: 'center' },
  statValue: { margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#1565C0' },
  statLabel: { margin: 0, fontSize: '11px', color: '#888' },
  statDivider: { width: '1px', background: '#E8EDF5' },
  progressSection: { width: '100%' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  progressLabel: { fontSize: '12px', color: '#888', fontWeight: '500' },
  progressValue: { fontSize: '12px', color: '#1565C0', fontWeight: '700' },
  progressBar: { height: '8px', background: '#E8EDF5', borderRadius: '4px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#1565C0', borderRadius: '4px', transition: 'width 0.5s' },
  summaryCard: {
    flex: 1, minWidth: '300px', background: '#fff',
    borderRadius: '12px', padding: '24px', border: '1px solid #E8EDF5'
  },
  cardTitle: { margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#333' },
  summaryGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '12px', marginBottom: '24px'
  },
  summaryItem: {
    borderRadius: '10px', padding: '16px',
    textAlign: 'center'
  },
  summaryValue: { margin: '0 0 4px', fontSize: '28px', fontWeight: '700' },
  summaryLabel: { margin: 0, fontSize: '12px', fontWeight: '600' },
  permissionsBox: {
    background: '#F8FAFF', borderRadius: '10px', padding: '16px'
  },
  permTitle: { margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#333' },
  permRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '8px 0',
    borderBottom: '1px solid #E8EDF5'
  },
  permLabel: { fontSize: '13px', color: '#555' },
  permBadge: {
    fontSize: '11px', fontWeight: '600',
    padding: '3px 10px', borderRadius: '20px'
  },
  tasksSection: {
    background: '#fff', borderRadius: '12px',
    padding: '24px', border: '1px solid #E8EDF5'
  },
  taskList: { display: 'flex', flexDirection: 'column', gap: '2px' },
  taskRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '14px 0',
    borderBottom: '1px solid #F0F4F8', flexWrap: 'wrap', gap: '8px'
  },
  taskLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  statusDot: { width: '10px', height: '10px', borderRadius: '50%', minWidth: '10px' },
  taskTitle: { margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#333' },
  taskDesc: { margin: 0, fontSize: '12px', color: '#aaa' },
  taskRight: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  priorityBadge: {
    fontSize: '11px', fontWeight: '600',
    padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize'
  },
  statusBadge: {
    fontSize: '11px', fontWeight: '600',
    padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize'
  },
  deadline: { fontSize: '12px', color: '#888' },
  emptyBox: {
    background: '#F8FAFF', borderRadius: '12px',
    padding: '40px', textAlign: 'center', border: '1px dashed #D0DCF0'
  },
  emptyIcon: { fontSize: '36px', margin: '0 0 8px' },
  emptyTitle: { margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#555' },
  emptyText: { margin: 0, fontSize: '13px', color: '#aaa' },
};

export default Profile;