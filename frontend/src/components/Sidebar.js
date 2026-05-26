import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import { motion } from 'framer-motion';

const Parrot = () => (
  <motion.div
    style={styles.parrot}
    initial={{ opacity: 0, scale: 0.8, y: -10 }}
    animate={{ opacity: 1, scale: 1, y: [0, -2, 0] }}
    transition={{ duration: 0.5, y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
  >
    <svg viewBox="0 0 100 100" role="img" aria-label="normal green parrot" style={styles.parrotSvg}>
      <defs>
        <linearGradient id="parrotBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
        <linearGradient id="parrotWing" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
      </defs>
      
      {/* Tail */}
      <motion.path d="M 42 70 C 35 85, 25 95, 20 100 C 35 90, 45 85, 52 70 Z" fill="#14532D" animate={{ rotate: [0, 3, -2, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '40px 70px' }} />
      <motion.path d="M 45 70 C 40 85, 30 95, 25 100 C 40 90, 50 85, 55 70 Z" fill="#15803D" animate={{ rotate: [0, -2, 3, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }} style={{ transformOrigin: '45px 70px' }} />

      {/* Branch */}
      <path d="M 5 85 Q 50 90 95 75" stroke="#78350F" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 20 87 Q 30 95 35 95" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Back leg */}
      <path d="M 46 72 L 44 84 M 44 84 L 40 86 M 44 84 L 48 86" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Body & Belly */}
      <path d="M 45 20 C 55 10, 70 15, 70 28 C 70 35, 65 40, 65 45 C 70 55, 70 70, 50 75 C 30 70, 35 45, 40 35 C 35 25, 35 20, 45 20 Z" fill="url(#parrotBody)" />
      <path d="M 50 75 C 65 70, 65 55, 60 45 C 55 55, 45 65, 50 75 Z" fill="#16A34A" opacity="0.4" />

      {/* Front leg */}
      <path d="M 53 72 L 51 83 M 51 83 L 47 86 M 51 83 L 55 85" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Beak */}
      <path d="M 68 22 C 82 20, 86 32, 77 36 C 74 31, 70 29, 68 22 Z" fill="#FCD34D" />
      <path d="M 69 23 C 80 22, 83 31, 76 35 C 73 30, 69 28, 69 23 Z" fill="#F59E0B" />
      <path d="M 68 28 C 76 30, 78 36, 73 39 C 71 36, 68 33, 68 28 Z" fill="#B45309" />

      {/* Eye Patch & Eye */}
      <circle cx="62" cy="24" r="5" fill="#FFFFFF" />
      <circle cx="63" cy="24" r="2" fill="#111827" />
      <circle cx="63.5" cy="23.5" r="0.5" fill="#FFFFFF" />

      {/* Wing */}
      <motion.g animate={{ rotate: [0, -3, 2, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '42px 35px' }}>
        <path d="M 42 35 C 58 40, 60 65, 48 72 C 32 60, 32 45, 42 35 Z" fill="url(#parrotWing)" />
        <path d="M 42 35 C 48 37, 52 42, 45 46 C 40 42, 38 38, 42 35 Z" fill="#EF4444" opacity="0.8" />
        <path d="M 42 50 Q 48 55 45 62" stroke="#14532D" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
        <path d="M 47 53 Q 52 58 49 65" stroke="#14532D" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      </motion.g>
    </svg>
  </motion.div>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/tasks', icon: 'check', label: 'Tasks' },
    { path: '/projects', icon: 'folder', label: 'Projects' },
    { path: '/leaderboard', icon: 'trophy', label: 'Leaderboard' },
    { path: '/chat', icon: 'chat', label: 'Chat' },
    { path: '/meetings', icon: 'calendar', label: 'Meetings' },
    { path: '/skills', icon: 'members', label: 'Skills' },
    { path: '/polls', icon: 'poll', label: 'Polls' },
    { path: '/announcements', icon: 'announcement', label: 'Announcements' },
    { path: '/analytics', icon: 'analytics', label: 'Analytics' },
    { path: '/profile', icon: 'user', label: 'Profile' },
  ];

  const roleInfo = {
    captain:        { bg: 'var(--muted)', color: 'var(--primary)', label: 'Captain' },
    'vice-captain': { bg: 'var(--muted-2)', color: 'var(--primary-dark)', label: 'Vice Captain' },
    manager:        { bg: 'var(--success-light)', color: 'var(--success)', label: 'Team Manager' },
    strategist:     { bg: 'var(--warning-light)', color: 'var(--primary-dark)', label: 'Strategist' },
    member:         { bg: 'var(--info-light)', color: 'var(--primary-dark)', label: 'Member' },
  };

  const role = roleInfo[user?.role] || roleInfo.member;

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <div style={styles.brandWrap}>
          <Parrot />
          <div style={styles.brandRow}>
            <div style={styles.logo}>IX</div>
            <span style={styles.brandName}>InnovateX</span>
          </div>
        </div>
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
          <NavLink key={item.path} to={item.path} title={item.label} aria-label={item.label} style={({ isActive }) => ({
            ...styles.navItem,
            background: isActive ? 'var(--muted)' : 'transparent',
            color: isActive ? 'var(--primary)' : 'var(--muted-text)',
            fontWeight: isActive ? '600' : '400',
            borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
          })}>
            <span style={styles.navIcon}><Icon title={item.icon} /></span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button style={styles.logoutBtn} onClick={handleLogout} title="Logout" aria-label="Logout">
        <span><Icon title="logout" /></span>
        <span>Logout</span>
      </button>
    </div>
  );
};

const styles = {
  sidebar: { width: '240px', minWidth: '240px', height: '100vh', background: '#fff', borderRight: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 100, overflowY: 'hidden' },
  header: { padding: '42px 16px 22px', borderBottom: '1px solid var(--card-border)' },
  brandWrap: { position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', minHeight: '70px' },
  brandRow: { display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '24px', position: 'relative' },
  logo: { width: '36px', height: '36px', minWidth: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' },
  brandName: { fontSize: '18px', fontWeight: '700', color: 'var(--primary)', position: 'relative' },
  parrot: { position: 'absolute', top: '-38px', left: '-18px', zIndex: 3, pointerEvents: 'none' },
  parrotSvg: { width: '72px', height: '72px', display: 'block', filter: 'drop-shadow(0 6px 10px rgba(15,23,42,0.15))' },
  userCard: { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', borderBottom: '1px solid var(--card-border)', background: 'var(--muted-2)' },
  avatar: { width: '40px', height: '40px', minWidth: '40px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#fff' },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { margin: '0 0 5px', fontSize: '13px', fontWeight: '600', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  roleBadge: { fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px' },
  nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'hidden' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', transition: 'all 0.15s', cursor: 'pointer' },
  navIcon: { fontSize: '16px', minWidth: '20px', textAlign: 'center' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', background: 'none', border: 'none', borderTop: '1px solid var(--card-border)', cursor: 'pointer', fontSize: '14px', color: 'var(--danger)', width: '100%' },
};

export default Sidebar;