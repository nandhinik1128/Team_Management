import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api/axios';

const StatCard = ({ label, value, color, icon }) => (
  <div style={styles.statCard}>
    <div style={styles.statLeft}>
      <p style={styles.statLabel}>{label}</p>
      <h2 style={{ ...styles.statValue, color }}>{value}</h2>
    </div>
    <div style={{ ...styles.statIcon, background: color + '18' }}>
      {icon}
    </div>
  </div>
);

const Dashboard = () => {
const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    API.get('/leaderboard').then(r => setLeaderboard(r.data.slice(0, 5))).catch(() => {});
    API.get('/tasks').then(r => setTasks(r.data)).catch(() => {});
  }, []);

  const myTasks = tasks.filter(t => t.assigned_to === user?.id);
  const completedTasks = myTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = myTasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = myTasks.filter(t => t.status === 'todo').length;

  return (
    <Layout>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>
              Good day, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p style={styles.subheading}>
              Here's what's happening with your team today.
            </p>
          </div>
          <div style={styles.dateBadge}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric'
            })}
          </div>
        </div>

        {/* Stat Cards */}
        <div style={styles.statsRow}>
          <StatCard label="Activity Points (AP)" value={user?.ap_points || 0} color="#1565C0" icon="⚡" />
          <StatCard label="Tasks Completed" value={completedTasks} color="#2E7D32" icon="✅" />
          <StatCard label="In Progress" value={inProgressTasks} color="#E65100" icon="🔄" />
          <StatCard label="Pending Tasks" value={pendingTasks} color="#6A1B9A" icon="📋" />
        </div>

        {/* Bottom Row */}
        <div style={styles.bottomRow}>

          {/* Leaderboard */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🏆 AP Leaderboard — Top 5</h3>
            {leaderboard.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={styles.emptyText}>No leaderboard data yet.</p>
              </div>
            ) : leaderboard.map((u, i) => (
              <div key={u.id} style={styles.leaderRow}>
                <span style={{
                  ...styles.rank,
                  background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#E8EDF5',
                  color: i < 3 ? '#fff' : '#888'
                }}>
                  {i + 1}
                </span>
                <div style={styles.leaderAvatar}>{u.name?.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <p style={styles.leaderName}>{u.name}</p>
                  <p style={styles.leaderRole}>{u.role}</p>
                </div>
                <span style={styles.leaderPoints}>{u.ap_points} AP</span>
              </div>
            ))}
          </div>

          {/* Profile Summary */}
          <div style={styles.profileCard}>
            <h3 style={styles.cardTitle}>👤 My Summary</h3>
            <div style={styles.profileAvatar}>
              {user?.name?.charAt(0)}
            </div>
            <h4 style={styles.profileName}>{user?.name}</h4>
            <span style={styles.profileRole}>{user?.role}</span>

            <div style={styles.profileStats}>
              <div style={styles.profileStat}>
                <p style={styles.profileStatValue}>{user?.ap_points || 0}</p>
                <p style={styles.profileStatLabel}>AP Points</p>
              </div>
              <div style={styles.profileStatDivider} />
              <div style={styles.profileStat}>
                <p style={styles.profileStatValue}>{completedTasks}</p>
                <p style={styles.profileStatLabel}>Tasks Done</p>
              </div>
              <div style={styles.profileStatDivider} />
              <div style={styles.profileStat}>
                <p style={styles.profileStatValue}>{myTasks.length}</p>
                <p style={styles.profileStatLabel}>Total Tasks</p>
              </div>
            </div>

            {/* My Tasks Preview */}
            <div style={{ marginTop: '16px', width: '100%' }}>
              <p style={styles.taskPreviewTitle}>My Recent Tasks</p>
              {myTasks.length === 0 ? (
                <div style={styles.emptyBox}>
                  <p style={styles.emptyText}>🎉 No tasks today! Take rest.</p>
                </div>
              ) : myTasks.slice(0, 3).map(task => (
                <div key={task.id} style={styles.taskPreviewItem}>
                  <span style={{
                    ...styles.taskStatus,
                    background: task.status === 'completed' ? '#E8F5E9' : task.status === 'in-progress' ? '#FFF3E0' : '#F3E5F5',
                    color: task.status === 'completed' ? '#2E7D32' : task.status === 'in-progress' ? '#E65100' : '#6A1B9A',
                  }}>
                    {task.status}
                  </span>
                  <p style={styles.taskTitle}>{task.title}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
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
  dateBadge: {
    background: '#fff', border: '1px solid #E8EDF5',
    borderRadius: '8px', padding: '8px 16px',
    fontSize: '13px', color: '#555', fontWeight: '500'
  },
  statsRow: {
    display: 'flex', gap: '16px',
    marginBottom: '24px', flexWrap: 'wrap'
  },
  statCard: {
    background: '#fff', borderRadius: '12px', padding: '20px 24px',
    border: '1px solid #E8EDF5', flex: 1, minWidth: '200px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  statLeft: {},
  statLabel: { margin: '0 0 8px', fontSize: '13px', color: '#888', fontWeight: '500' },
  statValue: { margin: 0, fontSize: '32px', fontWeight: '700' },
  statIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' },
  bottomRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  card: {
    flex: 2, minWidth: '300px', background: '#fff',
    borderRadius: '12px', padding: '24px', border: '1px solid #E8EDF5'
  },
  cardTitle: { margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#333' },
  leaderRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 0', borderBottom: '1px solid #F0F4F8'
  },
  rank: {
    width: '28px', height: '28px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '700', minWidth: '28px'
  },
  leaderAvatar: {
    width: '36px', height: '36px', background: '#E3F0FF',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '15px', fontWeight: '700',
    color: '#1565C0', minWidth: '36px'
  },
  leaderName: { margin: 0, fontSize: '14px', fontWeight: '600', color: '#333' },
  leaderRole: { margin: 0, fontSize: '12px', color: '#888', textTransform: 'capitalize' },
  leaderPoints: { fontSize: '15px', fontWeight: '700', color: '#1565C0' },
  profileCard: {
    flex: 1, minWidth: '260px', background: '#fff',
    borderRadius: '12px', padding: '24px', border: '1px solid #E8EDF5',
    display: 'flex', flexDirection: 'column', alignItems: 'center'
  },
  profileAvatar: {
    width: '70px', height: '70px', background: '#1565C0',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '28px', fontWeight: '700',
    color: '#fff', margin: '12px 0'
  },
  profileName: { margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#333' },
  profileRole: {
    fontSize: '12px', background: '#E3F0FF', color: '#1565C0',
    padding: '3px 12px', borderRadius: '20px', fontWeight: '600',
    textTransform: 'capitalize', marginBottom: '16px'
  },
  profileStats: {
    display: 'flex', width: '100%', background: '#F8FAFF',
    borderRadius: '10px', padding: '14px', justifyContent: 'space-around'
  },
  profileStat: { textAlign: 'center' },
  profileStatValue: { margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#1565C0' },
  profileStatLabel: { margin: 0, fontSize: '11px', color: '#888' },
  profileStatDivider: { width: '1px', background: '#E8EDF5' },
  taskPreviewTitle: { margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#555', alignSelf: 'flex-start' },
  taskPreviewItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '8px 0', borderBottom: '1px solid #F0F4F8', width: '100%'
  },
  taskStatus: {
    fontSize: '10px', fontWeight: '600', padding: '3px 8px',
    borderRadius: '20px', whiteSpace: 'nowrap', textTransform: 'capitalize'
  },
  taskTitle: { margin: 0, fontSize: '13px', color: '#333' },
  emptyBox: {
    background: '#F8FAFF', borderRadius: '8px',
    padding: '20px', textAlign: 'center', width: '100%', boxSizing: 'border-box'
  },
  emptyText: { margin: 0, color: '#aaa', fontSize: '13px' },
};

export default Dashboard;