import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = () => {
    API.get('/notifications').then(r => setNotifications(r.data)).catch(() => {});
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read');
      toast.success('All marked as read!');
      fetchNotifications();
    } catch { toast.error('Failed!'); }
  };

  const unread = notifications.filter(n => !n.is_read).length;

  const formatTime = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(ts).toLocaleDateString('en-IN');
  };

  const getIcon = (message) => {
    if (message.includes('task')) return '✅';
    if (message.includes('AP')) return '⚡';
    if (message.includes('chat') || message.includes('message')) return '💬';
    if (message.includes('meeting')) return '📅';
    if (message.includes('approved')) return '✅';
    if (message.includes('rejected')) return '❌';
    return '🔔';
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Notifications 🔔</h1>
            <p style={styles.subheading}>
              {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unread > 0 && (
            <button style={styles.markBtn} onClick={markAllRead}>
              ✓ Mark all as read
            </button>
          )}
        </div>

        <div style={styles.list}>
          {notifications.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyIcon}>🔔</p>
              <p style={styles.emptyTitle}>No notifications!</p>
              <p style={styles.emptyText}>You're all caught up.</p>
            </div>
          ) : notifications.map(n => (
            <div key={n.id} style={{
              ...styles.notifCard,
              background: n.is_read ? '#fff' : '#F0F7FF',
              borderLeft: n.is_read ? '4px solid #E8EDF5' : '4px solid #1565C0'
            }}>
              <div style={styles.notifIcon}>{getIcon(n.message)}</div>
              <div style={styles.notifContent}>
                <p style={styles.notifMessage}>{n.message}</p>
                <p style={styles.notifTime}>{formatTime(n.created_at)}</p>
              </div>
              {!n.is_read && <div style={styles.unreadDot} />}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: '800px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  heading: { margin: '0 0 6px', fontSize: '26px', fontWeight: '700', color: '#1A1A2E' },
  subheading: { margin: 0, color: '#888', fontSize: '14px' },
  markBtn: { background: '#E3F0FF', color: '#1565C0', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  notifCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderRadius: '10px', border: '1px solid #E8EDF5' },
  notifIcon: { fontSize: '22px', minWidth: '30px', textAlign: 'center' },
  notifContent: { flex: 1 },
  notifMessage: { margin: '0 0 4px', fontSize: '14px', color: '#333', lineHeight: '1.5' },
  notifTime: { margin: 0, fontSize: '12px', color: '#aaa' },
  unreadDot: { width: '10px', height: '10px', background: '#1565C0', borderRadius: '50%', minWidth: '10px' },
  emptyBox: { background: '#F8FAFF', borderRadius: '12px', padding: '60px', textAlign: 'center', border: '1px dashed #D0DCF0' },
  emptyIcon: { fontSize: '40px', margin: '0 0 12px' },
  emptyTitle: { margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: '#555' },
  emptyText: { margin: 0, fontSize: '14px', color: '#aaa' },
};

export default Notifications;