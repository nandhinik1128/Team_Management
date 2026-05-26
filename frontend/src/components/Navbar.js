import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}><Icon title="trophy" /> USCPP</div>
      <div style={styles.links}>
        <Link to="/dashboard" className="lift-nav-item" style={styles.link}>Dashboard</Link>
        <Link to="/tasks" className="lift-nav-item" style={styles.link}>Tasks</Link>
        <Link to="/leaderboard" className="lift-nav-item" style={styles.link}>Leaderboard</Link>
        <Link to="/profile" className="lift-nav-item" style={styles.link}>Profile</Link>
        <span style={styles.user}><Icon title="user" /> {user?.name}</span>
        <button onClick={handleLogout} className="lift-button" style={styles.button}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 32px',
    backgroundColor: '#1a1a2e',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.10)'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#e94560'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px'
  },
  user: {
    color: '#e94560',
    fontWeight: 'bold'
  },
  button: {
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    padding: '9px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default Navbar;