
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api/axios';
import { toast } from 'react-toastify';

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
    API.get('/leaderboard').then(r => setMembers(r.data)).catch(() => {});
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
    return { bg: '#E8EDF5', color: '#888' };
  };

  const totalAP = members.reduce((sum, m) => sum + (m.ap_points || 0), 0);

  return (
    <Layout>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Leaderboard 🏆</h1>
            <p style={styles.subheading}>
              Team performance ranked by Activity Points (AP)
            </p>
          </div>
          <div style={styles.totalApBadge}>
            <p style={styles.totalApLabel}>Total Team AP</p>
            <p style={styles.totalApValue}>{totalAP}</p>
          </div>
        </div>

        {/* Manager Notice */}
        {isManager && (
          <div style={styles.noticeBanner}>
            <span style={styles.noticeIcon}>⚡</span>
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
            <div style={styles.podiumItem}>
              <div style={{ ...styles.podiumAvatar, background: '#C0C0C0', fontSize: '28px' }}>
                {members[1]?.name?.charAt(0)}
              </div>
              <p style={styles.podiumName}>{members[1]?.name?.split(' ')[0]}</p>
              <p style={styles.podiumPoints}>{members[1]?.ap_points} AP</p>
              <div style={{ ...styles.podiumBlock, height: '60px', background: '#C0C0C0' }}>
                <span style={styles.podiumRank}>2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div style={styles.podiumItem}>
              <div style={styles.crownIcon}>👑</div>
              <div style={{ ...styles.podiumAvatar, background: '#FFD700', fontSize: '32px', width: '72px', height: '72px' }}>
                {members[0]?.name?.charAt(0)}
              </div>
              <p style={{ ...styles.podiumName, fontWeight: '700', fontSize: '16px' }}>
                {members[0]?.name?.split(' ')[0]}
              </p>
              <p style={{ ...styles.podiumPoints, color: '#E65100', fontSize: '18px' }}>
                {members[0]?.ap_points} AP
              </p>
              <div style={{ ...styles.podiumBlock, height: '90px', background: '#FFD700' }}>
                <span style={styles.podiumRank}>1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div style={styles.podiumItem}>
              <div style={{ ...styles.podiumAvatar, background: '#CD7F32', fontSize: '28px' }}>
                {members[2]?.name?.charAt(0)}
              </div>
              <p style={styles.podiumName}>{members[2]?.name?.split(' ')[0]}</p>
              <p style={styles.podiumPoints}>{members[2]?.ap_points} AP</p>
              <div style={{ ...styles.podiumBlock, height: '45px', background: '#CD7F32' }}>
                <span style={styles.podiumRank}>3</span>
              </div>
            </div>
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
                  <tr key={m.id} style={{
                    ...styles.tr,
                    background: m.id === user?.id ? '#F0F7FF' : '#fff'
                  }}>
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
                      <span style={styles.apPoints}>{m.ap_points} AP</span>
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
                              ✕
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
                            ✏️ Edit
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
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
  subheading: { margin: 0, color: '#888', fontSize: '14px' },
  totalApBadge: {
    background: '#1565C0', borderRadius: '12px',
    padding: '14px 24px', textAlign: 'center'
  },
  totalApLabel: { margin: '0 0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  totalApValue: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#fff' },
  noticeBanner: {
    background: '#E3F2FD', border: '1px solid #BBDEFB',
    borderRadius: '10px', padding: '14px 18px',
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'
  },
  noticeIcon: { fontSize: '20px' },
  noticeText: { margin: 0, fontSize: '13px', color: '#1565C0', fontWeight: '500' },
  podiumRow: {
    display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
    gap: '20px', marginBottom: '32px', padding: '24px',
    background: '#fff', borderRadius: '12px', border: '1px solid #E8EDF5'
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
  podiumPoints: { margin: 0, fontSize: '14px', fontWeight: '700', color: '#1565C0' },
  podiumBlock: {
    width: '80px', borderRadius: '8px 8px 0 0',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  podiumRank: { fontSize: '20px', fontWeight: '700', color: '#fff' },
  tableCard: {
    background: '#fff', borderRadius: '12px',
    padding: '24px', border: '1px solid #E8EDF5'
  },
  cardTitle: { margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#333' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#F8FAFF' },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: '12px', fontWeight: '600',
    color: '#888', borderBottom: '1px solid #E8EDF5'
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
    width: '38px', height: '38px', background: '#E3F0FF',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#1565C0'
  },
  memberName: { margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#333' },
  memberEmail: { margin: 0, fontSize: '12px', color: '#aaa' },
  youBadge: {
    marginLeft: '8px', fontSize: '10px', background: '#E3F0FF',
    color: '#1565C0', padding: '2px 8px', borderRadius: '20px', fontWeight: '600'
  },
  roleBadge: {
    fontSize: '11px', background: '#F0F4F8', color: '#555',
    padding: '3px 10px', borderRadius: '20px',
    fontWeight: '600', textTransform: 'capitalize'
  },
  apPoints: { fontSize: '15px', fontWeight: '700', color: '#1565C0' },
  editRow: { display: 'flex', gap: '6px', alignItems: 'center' },
  editInput: {
    width: '80px', padding: '6px 10px', borderRadius: '6px',
    border: '1.5px solid #D0DCF0', fontSize: '13px', outline: 'none'
  },
  saveBtn: {
    background: '#1565C0', color: '#fff', border: 'none',
    borderRadius: '6px', padding: '6px 12px',
    fontSize: '12px', cursor: 'pointer', fontWeight: '600'
  },
  cancelBtn: {
    background: '#FFEBEE', color: '#C62828', border: 'none',
    borderRadius: '6px', padding: '6px 10px',
    fontSize: '12px', cursor: 'pointer', fontWeight: '600'
  },
  editBtn: {
    background: '#F0F4F8', color: '#555', border: 'none',
    borderRadius: '6px', padding: '6px 14px',
    fontSize: '12px', cursor: 'pointer', fontWeight: '600'
  },
};

export default Leaderboard;