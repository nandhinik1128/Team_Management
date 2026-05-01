import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F4F7FC',
    fontFamily: "'Segoe UI', sans-serif"
  },
  main: {
    marginLeft: '240px',
    flex: 1,
    padding: '32px',
    minHeight: '100vh',
    overflowY: 'auto'
  }
};

export default Layout;