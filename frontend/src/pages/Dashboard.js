import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import API from '../api/axios';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, color, icon }) => (
  <div style={styles.statCard} className="lift-surface">
    <div style={styles.statLeft}>
      <p style={styles.statLabel}>{label}</p>
      <h2 style={{ ...styles.statValue, color }}>{value}</h2>
    </div>
    <div style={{ ...styles.statIcon, background: color + '18' }}>
      {icon}
    </div>
  </div>
);

const DashboardRobot = () => (
  <motion.div
    style={styles.robot}
    initial={{ x: 96, y: 0, opacity: 0, scale: 0.85 }}
    animate={{ x: [96, 32, -56, 32, 96], y: [0, -2, 0, -2, 0], opacity: [0, 1, 1, 1, 0], scale: [0.85, 1, 1, 1, 0.92], rotate: [0, -2, 0, 2, 0] }}
    transition={{ duration: 2.0, times: [0, 0.45, 1], ease: 'easeInOut' }}
  >
    <div style={styles.robotShadow} />
    <div style={styles.robotAntenna} />
    <div style={styles.robotHead}>
      <div style={styles.robotEyeRow}>
        <span style={styles.robotEye} />
        <span style={styles.robotEye} />
      </div>
      <div style={styles.robotMouth} />
    </div>
    <div style={styles.robotBody}>
      <motion.div
        style={styles.robotArm}
        animate={{ rotate: [ -18, 26, -12, 0 ] }}
        transition={{ duration: 1.5, repeat: 2, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <div style={styles.robotCore} />
      <div style={styles.robotArm} />
    </div>
    <div style={styles.robotLegs}>
      <span style={styles.robotLeg} />
      <span style={styles.robotLeg} />
    </div>
  </motion.div>
);

const Dashboard = () => {
const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showRobot, setShowRobot] = useState(false);

  useEffect(() => {
    API.get('/leaderboard').then(r => {
      const sorted = Array.isArray(r.data) ? [...r.data].sort((a, b) => (b.ap_points || 0) - (a.ap_points || 0)) : r.data;
      setLeaderboard(sorted.slice(0, 5));
    }).catch(() => {});
    API.get('/tasks').then(r => setTasks(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const enabledKey = 'innovatex-dashboard-robot-enabled';
    const showKey = 'innovatex-show-dashboard-robot';
    const enabled = sessionStorage.getItem(enabledKey) === '1' || sessionStorage.getItem(showKey) === '1';

    if (!enabled) {
      return undefined;
    }

    sessionStorage.setItem(enabledKey, '1');
    sessionStorage.removeItem(showKey);

    const playRobot = () => {
      setShowRobot(true);
      window.setTimeout(() => setShowRobot(false), 2000);
    };

    playRobot();
    const interval = window.setInterval(playRobot, 10000);

    return () => window.clearInterval(interval);
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
              Innaiku productive ah irupoma… paakalaam!
            </h1>
            <p style={styles.subheading}>
indria seithigal            </p>
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
           <StatCard label="Activity Points (AP)" value={user?.ap_points || 0} color="var(--primary)" icon={<Icon title="bolt" />} />
           <StatCard label="Tasks Completed" value={completedTasks} color="var(--success)" icon={<Icon title="check" />} />
           <StatCard label="In Progress" value={inProgressTasks} color="var(--primary-dark)" icon={<Icon title="sync" />} />
           <StatCard label="Pending Tasks" value={pendingTasks} color="var(--primary-dark)" icon={<Icon title="pending" />} />
        </div>

        {/* Bottom Row */}
        <div style={styles.bottomRow}>

          {/* Leaderboard */}
          <div style={styles.card} className="lift-surface">
            <h3 style={styles.cardTitle}><Icon title="trophy" /> top - 5</h3>
            {leaderboard.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={styles.emptyText}>No leaderboard data yet.</p>
              </div>
            ) : leaderboard.map((u, i) => (
              <div key={u.id} style={styles.leaderRow}>
                <span style={{
                  ...styles.rank,
                    background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--card-bg)',
                    color: i < 3 ? '#fff' : 'var(--muted-text)'
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
          <div style={styles.summaryStage}>
            {showRobot && <DashboardRobot />}
            <div style={styles.profileCard} className="lift-surface">
              <h3 style={styles.cardTitle}><Icon title="user" /> ennai pathi</h3>
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
                    <p style={styles.emptyText}><Icon title="check" /> nee summa irundha podhum</p>
                  </div>
                ) : myTasks.slice(0, 3).map(task => (
                  <div key={task.id} style={styles.taskPreviewItem}>
                    <span style={{
                      ...styles.taskStatus,
                        background: task.status === 'completed' ? 'var(--success-light)' : task.status === 'in-progress' ? 'var(--warning-light)' : 'var(--info-light)',
                        color: task.status === 'completed' ? 'var(--success)' : task.status === 'in-progress' ? 'var(--warning)' : 'var(--info)',
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
      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: '1100px' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px'
  },
  heading: { margin: '0 0 6px', fontSize: '26px', fontWeight: '700', color: '#1A1A2E' },
  subheading: { margin: 0, color: 'var(--muted-text)', fontSize: '14px' },
  dateBadge: {
    background: '#fff', border: '1px solid var(--card-border)',
    borderRadius: '10px', padding: '10px 16px',
    fontSize: '13px', color: 'var(--muted-text)', fontWeight: '500'
  },
  statsRow: {
    display: 'flex', gap: '18px',
    marginBottom: '28px', flexWrap: 'wrap'
  },
  statCard: {
    background: '#fff', borderRadius: '12px', padding: '20px 24px',
    border: '1px solid var(--card-border)', flex: 1, minWidth: '200px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  statLeft: {},
  statLabel: { margin: '0 0 8px', fontSize: '13px', color: 'var(--muted-text)', fontWeight: '500' },
  statValue: { margin: 0, fontSize: '32px', fontWeight: '700' },
  statIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' },
  bottomRow: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  summaryStage: { position: 'relative', flex: 1, minWidth: '260px', overflow: 'hidden', paddingTop: '78px' },
  card: {
    flex: 2, minWidth: '300px', background: '#fff',
    borderRadius: '12px', padding: '26px', border: '1px solid var(--card-border)'
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
    width: '36px', height: '36px', background: 'var(--muted)',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '15px', fontWeight: '700',
    color: 'var(--primary)', minWidth: '36px'
  },
  leaderName: { margin: 0, fontSize: '14px', fontWeight: '600', color: '#333' },
  leaderRole: { margin: 0, fontSize: '12px', color: 'var(--muted-text)', textTransform: 'capitalize' },
  leaderPoints: { fontSize: '15px', fontWeight: '700', color: 'var(--primary)' },
  profileCard: {
    position: 'relative', zIndex: 2,
    flex: 1, minWidth: '260px', background: '#fff',
    borderRadius: '12px', padding: '26px', border: '1px solid var(--card-border)',
    display: 'flex', flexDirection: 'column', alignItems: 'center'
  },
  robot: {
    position: 'absolute',
    right: '12px',
    top: '16px',
    zIndex: 4,
    pointerEvents: 'none',
    width: '112px',
    transform: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    filter: 'drop-shadow(0 14px 18px rgba(4, 47, 46, 0.16))'
  },
  robotShadow: {
    width: '64px', height: '14px', borderRadius: '50%',
    background: 'rgba(4, 47, 46, 0.10)', marginBottom: '6px'
  },
  robotAntenna: {
    width: '6px', height: '16px', background: 'var(--primary-dark)', borderRadius: '999px',
    marginBottom: '-4px', position: 'relative'
  },
  robotHead: {
    width: '64px', height: '54px', background: '#D9F6EC', border: '2px solid var(--primary-dark)',
    borderRadius: '18px 18px 14px 14px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2
  },
  robotEyeRow: { display: 'flex', gap: '8px', marginBottom: '6px' },
  robotEye: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-dark)' },
  robotMouth: { width: '18px', height: '5px', borderRadius: '999px', background: 'var(--primary)' },
  robotBody: {
    width: '78px', height: '62px', background: '#ffffff', border: '2px solid var(--primary-dark)',
    borderRadius: '16px', marginTop: '6px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '8px 6px 10px', position: 'relative'
  },
  robotCore: {
    width: '26px', height: '26px', borderRadius: '50%', background: 'var(--muted)',
    border: '2px solid var(--primary)', boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.85)'
  },
  robotArm: {
    width: '10px', height: '30px', background: 'var(--primary-dark)', borderRadius: '999px',
    transformOrigin: 'top center'
  },
  robotLegs: { display: 'flex', gap: '18px', marginTop: '4px' },
  robotLeg: {
    width: '10px', height: '24px', background: 'var(--primary-dark)', borderRadius: '999px'
  },
  profileAvatar: {
    width: '70px', height: '70px', background: 'var(--primary)',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '28px', fontWeight: '700',
    color: '#fff', margin: '12px 0'
  },
  profileName: { margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#333' },
  profileRole: {
    fontSize: '12px', background: 'var(--muted)', color: 'var(--primary)',
    padding: '3px 12px', borderRadius: '20px', fontWeight: '600',
    textTransform: 'capitalize', marginBottom: '16px'
  },
  profileStats: {
    display: 'flex', width: '100%', background: 'var(--muted-2)',
    borderRadius: '10px', padding: '14px', justifyContent: 'space-around'
  },
  profileStat: { textAlign: 'center' },
  profileStatValue: { margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: 'var(--primary)' },
  profileStatLabel: { margin: 0, fontSize: '11px', color: 'var(--muted-text)' },
  profileStatDivider: { width: '1px', background: 'var(--card-border)' },
  taskPreviewTitle: { margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: 'var(--muted-text)', alignSelf: 'flex-start' },
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
    background: 'var(--muted-2)', borderRadius: '8px',
    padding: '20px', textAlign: 'center', width: '100%', boxSizing: 'border-box'
  },
  emptyText: { margin: 0, color: 'var(--muted-text)', fontSize: '13px' },
};

export default Dashboard;