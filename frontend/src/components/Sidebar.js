import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/tasks', icon: '✅', label: 'Tasks' },
    { path: '/projects', icon: '📁', label: 'Projects' },
    { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
    { path: '/chat', icon: '💬', label: 'Chat' },
    { path: '/meetings', icon: '📅', label: 'Meetings' },
    { path: '/skills', icon: '🧠', label: 'Skills' },
    { path: '/polls', icon: '🗳️', label: 'Polls' },
    { path: '/announcements', icon: '📌', label: 'Announcements' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  const roleInfo = {
    captain:        { bg: '#E3F2FD', color: '#1565C0', label: 'Captain' },
    'vice-captain': { bg: '#E8EAF6', color: '#3949AB', label: 'Vice Captain' },
    manager:        { bg: '#E8F5E9', color: '#2E7D32', label: 'Team Manager' },
    strategist:     { bg: '#FFF3E0', color: '#E65100', label: 'Strategist' },
    member:         { bg: '#F3E5F5', color: '#6A1B9A', label: 'Member' },
  };

  const role = roleInfo[user?.role] || roleInfo.member;

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <div style={styles.logo}>IX</div>
        <span style={styles.brandName}>InnovateX</span>
      </div>

      <div style={styles.userCard}>
        <div style={styles.avatar}>{user?.name?.charAt(0)}</div>
        <div style={styles.userInfo}>
          <p style={styles.userName}>{user?.name?.split(' ')[0]} {user?.name?.split(' ')[1]}</p>
          <span style={{ ...styles.roleBadge, background: role.bg, color: role.color }}>{role.label}</span>
        </div>
      </div>

      <nav style={styles.nav}>
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
            ...styles.navItem,
            background: isActive ? '#E3F0FF' : 'transparent',
            color: isActive ? '#1565C0' : '#555',
            fontWeight: isActive ? '600' : '400',
            borderLeft: isActive ? '3px solid #1565C0' : '3px solid transparent',
          })}>
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button style={styles.logoutBtn} onClick={handleLogout}>
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </div>
  );
};

const styles = {
  sidebar: { width: '240px', minWidth: '240px', height: '100vh', background: '#fff', borderRight: '1px solid #E8EDF5', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 100, overflowY: 'auto' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 16px', borderBottom: '1px solid #E8EDF5' },
  logo: { width: '36px', height: '36px', minWidth: '36px', background: '#1565C0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' },
  brandName: { fontSize: '18px', fontWeight: '700', color: '#1565C0' },
  userCard: { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', borderBottom: '1px solid #E8EDF5', background: '#F8FAFF' },
  avatar: { width: '40px', height: '40px', minWidth: '40px', background: '#1565C0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#fff' },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { margin: '0 0 5px', fontSize: '13px', fontWeight: '600', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  roleBadge: { fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px' },
  nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', transition: 'all 0.15s', cursor: 'pointer' },
  navIcon: { fontSize: '16px', minWidth: '20px', textAlign: 'center' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', background: 'none', border: 'none', borderTop: '1px solid #E8EDF5', cursor: 'pointer', fontSize: '14px', color: '#E53935', width: '100%' },
};

export default Sidebar;