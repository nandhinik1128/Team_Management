
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const CountUp = ({ value, suffix = '', duration = 2000 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const targetValue = Number(value || 0);
    const startTime = performance.now();
    let frameId;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(targetValue * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <>{displayValue}{suffix}</>;
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [apValue, setApValue] = useState('');

  const isManager = user?.role === 'manager';

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = () => {
    API.get('/leaderboard').then(r => {
      const sorted = Array.isArray(r.data) ? [...r.data].sort((a, b) => (b.ap_points || 0) - (a.ap_points || 0)) : r.data;
      setMembers(sorted);
    }).catch(() => {});
  };

  const handleUpdateAP = async (id) => {
    if (!apValue && apValue !== 0) return toast.error('Enter AP value!');
    try {
      await API.put(`/users/points/${id}`, { ap_points: Number(apValue) });
      toast.success('AP Points updated!');
      setEditId(null);
      setApValue('');
      fetchLeaderboard();
    } catch {
      toast.error('Failed to update AP!');
    }
  };

  const getMedalColor = (i) => {
    if (i === 0) return { bg: '#FFD700', color: '#7B5E00' };
    if (i === 1) return { bg: '#C0C0C0', color: '#4A4A4A' };
    if (i === 2) return { bg: '#CD7F32', color: '#5C3A1E' };
    return { bg: 'var(--card-border)', color: 'var(--muted-text)' };
  };

  const totalAP = members.reduce((sum, m) => sum + (m.ap_points || 0), 0);

  return (
    <Layout>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Leaderboard <Icon title="trophy" /></h1>
            <p style={styles.subheading}>
              Team performance ranked by Activity Points (AP)
            </p>
          </div>
          <div style={styles.totalApBadge}>
            <p style={styles.totalApLabel}>Total Team AP</p>
            <p style={styles.totalApValue}><CountUp value={totalAP} /></p>
          </div>
        </div>

        {/* Manager Notice */}
        {isManager && (
          <div style={styles.noticeBanner}>
            <span style={styles.noticeIcon}><Icon title="bolt" /></span>
            <p style={styles.noticeText}>
              As Team Manager, you can update AP points for any member.
              Click the edit button next to a member to update their points.
            </p>
          </div>
        )}

        {/* Top 3 Podium */}
        {members.length >= 3 && (
          <div style={styles.podiumRow}>
            {/* 2nd Place */}
            <motion.div
              style={styles.podiumItem}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ ...styles.podiumAvatar, background: '#C0C0C0', fontSize: '28px' }}>
                {members[1]?.name?.charAt(0)}
              </div>
              <p style={styles.podiumName}>{members[1]?.name?.split(' ')[0]}</p>
              <p style={styles.podiumPoints}><CountUp value={members[1]?.ap_points || 0} suffix=" AP" /></p>
              <motion.div
                style={{ ...styles.podiumBlock, background: '#C0C0C0' }}
                initial={{ height: 0 }}
                animate={{ height: '60px' }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <span style={styles.podiumRank}>2</span>
              </motion.div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              style={{ ...styles.podiumItem, transformOrigin: 'bottom center' }}
              initial={{ opacity: 0, y: 70, scale: 0.86 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={styles.crownIcon}><Icon title="crown" /></div>
              <motion.div
                style={{ ...styles.podiumAvatar, background: '#FFD700', fontSize: '32px', width: '72px', height: '72px' }}
                initial={{ y: 20, scale: 0.9 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                {members[0]?.name?.charAt(0)}
              </motion.div>
              <p style={{ ...styles.podiumName, fontWeight: '700', fontSize: '16px' }}>
                {members[0]?.name?.split(' ')[0]}
              </p>
              <p style={{ ...styles.podiumPoints, color: 'var(--primary-dark)', fontSize: '18px' }}>
                <CountUp value={members[0]?.ap_points || 0} suffix=" AP" />
              </p>
              <motion.div
                style={{ ...styles.podiumBlock, background: '#FFD700' }}
                initial={{ height: 0 }}
                animate={{ height: '90px' }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <span style={styles.podiumRank}>1</span>
              </motion.div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              style={styles.podiumItem}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ ...styles.podiumAvatar, background: '#CD7F32', fontSize: '28px' }}>
                {members[2]?.name?.charAt(0)}
              </div>
              <p style={styles.podiumName}>{members[2]?.name?.split(' ')[0]}</p>
              <p style={styles.podiumPoints}><CountUp value={members[2]?.ap_points || 0} suffix=" AP" /></p>
              <motion.div
                style={{ ...styles.podiumBlock, background: '#CD7F32' }}
                initial={{ height: 0 }}
                animate={{ height: '45px' }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span style={styles.podiumRank}>3</span>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div style={styles.tableCard}>
          <h3 style={styles.cardTitle}>Full Rankings</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>Member</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>AP Points</th>
                {isManager && <th style={styles.th}>Update AP</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => {
                const medal = getMedalColor(i);
                return (
                  <motion.tr
                    key={m.id}
                    style={{
                      ...styles.tr,
                      background: m.id === user?.id ? 'var(--muted-2)' : '#fff'
                    }}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <td style={styles.td}>
                      <span style={{
                        ...styles.rankBadge,
                        background: medal.bg,
                        color: medal.color
                      }}>
                        {i + 1}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.memberCell}>
                        <div style={styles.memberAvatar}>
                          {m.name?.charAt(0)}
                        </div>
                        <div>
                          <p style={styles.memberName}>
                            {m.name}
                            {m.id === user?.id && (
                              <span style={styles.youBadge}>You</span>
                            )}
                          </p>
                          <p style={styles.memberEmail}>{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.roleBadge}>{m.role}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.apPoints}><CountUp value={m.ap_points || 0} suffix=" AP" /></span>
                    </td>
                    {isManager && (
                      <td style={styles.td}>
                        {editId === m.id ? (
                          <div style={styles.editRow}>
                            <input
                              style={styles.editInput}
                              type="number"
                              placeholder="New AP"
                              value={apValue}
                              onChange={e => setApValue(e.target.value)}
                            />
                            <button
                              style={styles.saveBtn}
                              onClick={() => handleUpdateAP(m.id)}
                            >
                              Save
                            </button>
                            <button
                              style={styles.cancelBtn}
                              onClick={() => setEditId(null)}
                            >
                              <Icon title="close" />
                            </button>
                          </div>
                        ) : (
                            <button
                            style={styles.editBtn}
                            onClick={() => {
                              setEditId(m.id);
                              setApValue(m.ap_points);
                            }}
                          >
                            <Icon title="edit" /> Edit
                          </button>
                        )}
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
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
  subheading: { margin: 0, color: 'var(--muted-text)', fontSize: '14px' },
  totalApBadge: {
    background: 'var(--primary)', borderRadius: '12px',
    padding: '14px 24px', textAlign: 'center'
  },
  totalApLabel: { margin: '0 0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  totalApValue: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#fff' },
  noticeBanner: {
    background: 'var(--muted)', border: '1px solid #BBDEFB',
    borderRadius: '10px', padding: '14px 18px',
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'
  },
  noticeIcon: { fontSize: '20px' },
  noticeText: { margin: 0, fontSize: '13px', color: 'var(--primary)', fontWeight: '500' },
  podiumRow: {
    display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
    gap: '20px', marginBottom: '32px', padding: '24px',
    background: '#fff', borderRadius: '12px', border: '1px solid var(--card-border)'
  },
  podiumItem: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '6px'
  },
  crownIcon: { fontSize: '24px', marginBottom: '4px' },
  podiumAvatar: {
    width: '60px', height: '60px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', color: '#fff'
  },
  podiumName: { margin: 0, fontSize: '14px', fontWeight: '600', color: '#333' },
  podiumPoints: { margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--primary)' },
  podiumBlock: {
    width: '80px', borderRadius: '8px 8px 0 0',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  podiumRank: { fontSize: '20px', fontWeight: '700', color: '#fff' },
  tableCard: {
    background: '#fff', borderRadius: '12px',
    padding: '24px', border: '1px solid var(--card-border)'
  },
  cardTitle: { margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#333' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'var(--muted-2)' },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: '12px', fontWeight: '600',
    color: 'var(--muted-text)', borderBottom: '1px solid var(--card-border)'
  },
  tr: { borderBottom: '1px solid #F0F4F8', transition: 'background 0.15s' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#333' },
  rankBadge: {
    width: '30px', height: '30px', borderRadius: '50%',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '700'
  },
  memberCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  memberAvatar: {
    width: '38px', height: '38px', background: 'var(--muted)',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: 'var(--primary)'
  },
  memberName: { margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#333' },
  memberEmail: { margin: 0, fontSize: '12px', color: 'var(--muted-text)' },
  youBadge: {
    marginLeft: '8px', fontSize: '10px', background: 'var(--muted)',
    color: 'var(--primary)', padding: '2px 8px', borderRadius: '20px', fontWeight: '600'
  },
  roleBadge: {
    fontSize: '11px', background: '#F0F4F8', color: 'var(--muted-text)',
    padding: '3px 10px', borderRadius: '20px',
    fontWeight: '600', textTransform: 'capitalize'
  },
  apPoints: { fontSize: '15px', fontWeight: '700', color: 'var(--primary)' },
  editRow: { display: 'flex', gap: '6px', alignItems: 'center' },
  editInput: {
    width: '80px', padding: '6px 10px', borderRadius: '6px',
    border: '1.5px solid var(--card-border)', fontSize: '13px', outline: 'none'
  },
  saveBtn: {
    background: 'var(--primary)', color: '#fff', border: 'none',
    borderRadius: '6px', padding: '6px 12px',
    fontSize: '12px', cursor: 'pointer', fontWeight: '600'
  },
  cancelBtn: {
    background: '#FFEBEE', color: 'var(--danger)', border: 'none',
    borderRadius: '6px', padding: '6px 10px',
    fontSize: '12px', cursor: 'pointer', fontWeight: '600'
  },
  editBtn: {
    background: '#F0F4F8', color: 'var(--muted-text)', border: 'none',
    borderRadius: '6px', padding: '6px 14px',
    fontSize: '12px', cursor: 'pointer', fontWeight: '600'
  },
};

export default Leaderboard;