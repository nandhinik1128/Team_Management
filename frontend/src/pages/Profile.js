import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import API from '../api/axios';

const Profile = () => {
 const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    API.get('/tasks').then(r => setTasks(r.data)).catch(() => {});
    API.get('/leaderboard').then(r => {
      const sorted = Array.isArray(r.data) ? [...r.data].sort((a, b) => (b.ap_points || 0) - (a.ap_points || 0)) : r.data;
      setMembers(sorted);
    }).catch(() => {});
  }, []);

  const myTasks = tasks.filter(t => t.assigned_to === user?.id);
  const completedTasks = myTasks.filter(t => t.status === 'completed');
  const inProgressTasks = myTasks.filter(t => t.status === 'in-progress');
  const pendingTasks = myTasks.filter(t => t.status === 'todo');

  const myRank = members.findIndex(m => m.id === user?.id) + 1;

  const roleInfo = {
    captain:        { bg: 'var(--muted)', color: 'var(--primary)', label: 'Captain' },
    'vice-captain': { bg: 'var(--muted-2)', color: 'var(--primary-dark)', label: 'Vice Captain' },
    manager:        { bg: 'var(--success-light)', color: 'var(--success)', label: 'Team Manager' },
    strategist:     { bg: 'var(--warning-light)', color: 'var(--primary-dark)', label: 'Strategist' },
    member:         { bg: 'var(--info-light)', color: 'var(--primary-dark)', label: 'Member' },
  };

  const permissionMatrix = {
    captain: {
      'Assign Tasks': true,
      'Update AP Points': true,
      'Schedule Meetings': true,
      'Create Groups': true,
      'Create Projects': true,
      'Create Polls': true,
      'Create Announcements': true,
      'View All Tasks': true,
      'View Leaderboard': true,
      'Chat With Anyone': true,
    },
    'vice-captain': {
      'Assign Tasks': true,
      'Update AP Points': false,
      'Schedule Meetings': true,
      'Create Groups': true,
      'Create Projects': true,
      'Create Polls': true,
      'Create Announcements': true,
      'View All Tasks': true,
      'View Leaderboard': true,
      'Chat With Anyone': true,
    },
    strategist: {
      'Assign Tasks': true,
      'Update AP Points': false,
      'Schedule Meetings': false,
      'Create Groups': true,
      'Create Projects': false,
      'Create Polls': false,
      'Create Announcements': false,
      'View All Tasks': true,
      'View Leaderboard': true,
      'Chat With Anyone': true,
    },
    manager: {
      'Assign Tasks': false,
      'Update AP Points': true,
      'Schedule Meetings': false,
      'Create Groups': true,
      'Create Projects': false,
      'Create Polls': false,
      'Create Announcements': true,
      'View All Tasks': true,
      'View Leaderboard': true,
      'Chat With Anyone': true,
    },
    member: {
      'Assign Tasks': false,
      'Update AP Points': false,
      'Schedule Meetings': false,
      'Create Groups': false,
      'Create Projects': false,
      'Create Polls': false,
      'Create Announcements': false,
      'View All Tasks': false,
      'View Leaderboard': true,
      'Chat With Anyone': true,
    },
  };

  const role = roleInfo[user?.role] || roleInfo.member;

  const statusColor = {
    'todo':        { bg: 'var(--info-light)', color: 'var(--primary-dark)' },
    'in-progress': { bg: 'var(--warning-light)', color: 'var(--primary-dark)' },
    'completed':   { bg: 'var(--success-light)', color: 'var(--success)' },
  };

  const priorityColor = {
    high:   { bg: '#FFEBEE', color: 'var(--danger)' },
    medium: { bg: '#FFF8E1', color: '#F57F17' },
    low:    { bg: 'var(--success-light)', color: 'var(--success)' },
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
            <h3 style={styles.cardTitle}><Icon title="analytics" /> Task Summary</h3>

            <div style={styles.summaryGrid}>
              <div style={{ ...styles.summaryItem, background: 'var(--success-light)' }}>
                <p style={{ ...styles.summaryValue, color: 'var(--success)' }}>
                  {completedTasks.length}
                </p>
                <p style={{ ...styles.summaryLabel, color: 'var(--success)' }}>
                  Completed
                </p>
              </div>
              <div style={{ ...styles.summaryItem, background: 'var(--warning-light)' }}>
                <p style={{ ...styles.summaryValue, color: 'var(--primary-dark)' }}>
                  {inProgressTasks.length}
                </p>
                <p style={{ ...styles.summaryLabel, color: 'var(--primary-dark)' }}>
                  In Progress
                </p>
              </div>
              <div style={{ ...styles.summaryItem, background: 'var(--info-light)' }}>
                <p style={{ ...styles.summaryValue, color: 'var(--primary-dark)' }}>
                  {pendingTasks.length}
                </p>
                <p style={{ ...styles.summaryLabel, color: 'var(--primary-dark)' }}>
                  Pending
                </p>
              </div>
              <div style={{ ...styles.summaryItem, background: 'var(--muted)' }}>
                <p style={{ ...styles.summaryValue, color: 'var(--primary)' }}>
                  {myTasks.length}
                </p>
                <p style={{ ...styles.summaryLabel, color: 'var(--primary)' }}>
                  Total Tasks
                </p>
              </div>
            </div>

            {/* Role Permissions */}
            <div style={styles.permissionsBox}>
              <h4 style={styles.permTitle}><Icon title="lock" /> Your Permissions</h4>
              {[
                'Assign Tasks',
                'Update AP Points',
                'Schedule Meetings',
                'Create Groups',
                'Create Projects',
                'Create Polls',
                'Create Announcements',
                'View All Tasks',
                'View Leaderboard',
                'Chat With Anyone',
              ].map(p => {
                const hasAccess = permissionMatrix[user?.role || 'member']?.[p] ?? false;
                return (
                  <div key={p} style={styles.permRow}>
                    <span style={styles.permLabel}>{p}</span>
                    <span style={{
                      ...styles.permBadge,
                      background: hasAccess ? 'var(--success-light)' : '#FFEBEE',
                      color: hasAccess ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {hasAccess ? <><Icon title="check" /> Yes</> : <><Icon title="close" /> No</>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* My Tasks List */}
        <div style={styles.tasksSection}>
          <h3 style={styles.cardTitle}><Icon title="pending" /> My Assigned Tasks</h3>
          {myTasks.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyIcon}><Icon title="check" /></p>
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
                      <span style={styles.deadline}><Icon title="calendar" /> {new Date(task.deadline).toLocaleDateString('en-IN')}</span>
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
  subheading: { margin: '0 0 28px', color: 'var(--muted-text)', fontSize: '14px' },
  topRow: { display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' },
  profileCard: {
    width: '280px', minWidth: '260px', background: '#fff',
    borderRadius: '12px', padding: '28px 24px',
    border: '1px solid var(--card-border)', display: 'flex',
    flexDirection: 'column', alignItems: 'center'
  },
  avatarCircle: {
    width: '80px', height: '80px', background: 'var(--primary)',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '32px', fontWeight: '700',
    color: '#fff', marginBottom: '16px'
  },
  name: { margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#1A1A2E' },
  roleBadge: {
    fontSize: '12px', fontWeight: '600', padding: '4px 14px',
    borderRadius: '20px', marginBottom: '8px'
  },
  email: { margin: '0 0 16px', fontSize: '12px', color: 'var(--muted-text)' },
  divider: { width: '100%', height: '1px', background: 'var(--card-border)', marginBottom: '16px' },
  statRow: { display: 'flex', width: '100%', justifyContent: 'space-around', marginBottom: '20px' },
  statItem: { textAlign: 'center' },
  statValue: { margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: 'var(--primary)' },
  statLabel: { margin: 0, fontSize: '11px', color: 'var(--muted-text)' },
  statDivider: { width: '1px', background: 'var(--card-border)' },
  progressSection: { width: '100%' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  progressLabel: { fontSize: '12px', color: 'var(--muted-text)', fontWeight: '500' },
  progressValue: { fontSize: '12px', color: 'var(--primary)', fontWeight: '700' },
  progressBar: { height: '8px', background: 'var(--card-border)', borderRadius: '4px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.5s' },
  summaryCard: {
    flex: 1, minWidth: '300px', background: '#fff',
    borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)'
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
    background: 'var(--muted-2)', borderRadius: '10px', padding: '16px'
  },
  permTitle: { margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#333' },
  permRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '8px 0',
    borderBottom: '1px solid var(--card-border)'
  },
  permLabel: { fontSize: '13px', color: 'var(--muted-text)' },
  permBadge: {
    fontSize: '11px', fontWeight: '600',
    padding: '3px 10px', borderRadius: '20px'
  },
  tasksSection: {
    background: '#fff', borderRadius: '12px',
    padding: '24px', border: '1px solid var(--card-border)'
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
  taskDesc: { margin: 0, fontSize: '12px', color: 'var(--muted-text)' },
  taskRight: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  priorityBadge: {
    fontSize: '11px', fontWeight: '600',
    padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize'
  },
  statusBadge: {
    fontSize: '11px', fontWeight: '600',
    padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize'
  },
  deadline: { fontSize: '12px', color: 'var(--muted-text)' },
  emptyBox: {
    background: 'var(--muted-2)', borderRadius: '12px',
    padding: '40px', textAlign: 'center', border: '1px dashed var(--card-border)'
  },
  emptyIcon: { fontSize: '36px', margin: '0 0 8px' },
  emptyTitle: { margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: 'var(--muted-text)' },
  emptyText: { margin: 0, fontSize: '13px', color: 'var(--muted-text)' },
};

export default Profile;