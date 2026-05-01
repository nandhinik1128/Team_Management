import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api/axios';

const Analytics = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    API.get('/leaderboard').then(r => setMembers(r.data)).catch(() => {});
    API.get('/tasks').then(r => setTasks(r.data)).catch(() => {});
    API.get('/skills/all').then(r => setSkills(r.data)).catch(() => {});
  }, []);

  const totalAP = members.reduce((sum, m) => sum + (m.ap_points || 0), 0);
  const avgAP = members.length > 0 ? Math.round(totalAP / members.length) : 0;
  const topPerformer = members[0];
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getMemberTaskCount = (memberId) => tasks.filter(t => t.assigned_to === memberId && t.status === 'completed').length;
  const getMemberSkillCount = (memberId) => skills.filter(s => s.user_id === memberId && s.status === 'completed').length;

  const healthScore = Math.min(100, Math.round(
    (completionRate * 0.4) +
    (members.filter(m => m.ap_points > 0).length / Math.max(members.length, 1) * 100 * 0.3) +
    (skills.filter(s => s.status === 'completed').length / Math.max(skills.length, 1) * 100 * 0.3)
  ));

  const healthColor = healthScore >= 70 ? '#2E7D32' : healthScore >= 40 ? '#E65100' : '#C62828';

  return (
    <Layout>
      <div style={styles.container}>
        <h1 style={styles.heading}>Analytics & Insights 📈</h1>
        <p style={styles.subheading}>Team performance overview</p>

        {/* Team Health Score */}
        <div style={styles.healthCard}>
          <div style={styles.healthLeft}>
            <h3 style={styles.healthTitle}>🏥 Team Health Score</h3>
            <p style={styles.healthDesc}>Based on task completion, AP points, and skills progress</p>
          </div>
          <div style={styles.healthRight}>
            <div style={{ ...styles.healthCircle, border: `6px solid ${healthColor}` }}>
              <p style={{ ...styles.healthScore, color: healthColor }}>{healthScore}</p>
              <p style={styles.healthLabel}>/ 100</p>
            </div>
            <p style={{ ...styles.healthStatus, color: healthColor }}>
              {healthScore >= 70 ? '🟢 Excellent' : healthScore >= 40 ? '🟡 Average' : '🔴 Needs Work'}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total AP Points', value: totalAP, color: '#1565C0', bg: '#E3F0FF' },
            { label: 'Average AP', value: avgAP, color: '#2E7D32', bg: '#E8F5E9' },
            { label: 'Task Completion', value: `${completionRate}%`, color: '#E65100', bg: '#FFF3E0' },
            { label: 'Skills Completed', value: skills.filter(s => s.status === 'completed').length, color: '#6A1B9A', bg: '#F3E5F5' },
          ].map(s => (
            <div key={s.label} style={{ ...styles.statCard, background: s.bg }}>
              <p style={{ ...styles.statValue, color: s.color }}>{s.value}</p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Member Performance Table */}
        <div style={styles.tableCard}>
          <h3 style={styles.cardTitle}>👥 Member Performance</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Member</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>AP Points</th>
                <th style={styles.th}>Tasks Done</th>
                <th style={styles.th}>Skills Done</th>
                <th style={styles.th}>Performance</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => {
                const tasksDone = getMemberTaskCount(m.id);
                const skillsDone = getMemberSkillCount(m.id);
                const perf = m.ap_points > avgAP ? 'Above Avg' : m.ap_points === 0 ? 'Inactive' : 'Average';
                const perfColor = perf === 'Above Avg' ? '#2E7D32' : perf === 'Inactive' ? '#C62828' : '#E65100';
                const perfBg = perf === 'Above Avg' ? '#E8F5E9' : perf === 'Inactive' ? '#FFEBEE' : '#FFF3E0';
                return (
                  <tr key={m.id} style={{ ...styles.tr, background: m.id === user?.id ? '#F0F7FF' : '#fff' }}>
                    <td style={styles.td}>
                      <div style={styles.memberCell}>
                        <div style={styles.avatar}>{m.name?.charAt(0)}</div>
                        <div>
                          <p style={styles.memberName}>{m.name}{m.id === user?.id && <span style={styles.youBadge}>You</span>}</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}><span style={styles.roleBadge}>{m.role}</span></td>
                    <td style={styles.td}><span style={styles.apPoints}>{m.ap_points}</span></td>
                    <td style={styles.td}>{tasksDone}</td>
                    <td style={styles.td}>{skillsDone}</td>
                    <td style={styles.td}><span style={{ ...styles.perfBadge, background: perfBg, color: perfColor }}>{perf}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Top Insights */}
        <div style={styles.insightsRow}>
          <div style={styles.insightCard}>
            <h4 style={styles.insightTitle}>🏆 Top Performer</h4>
            <div style={styles.insightContent}>
              <div style={styles.insightAvatar}>{topPerformer?.name?.charAt(0)}</div>
              <div>
                <p style={styles.insightName}>{topPerformer?.name || 'N/A'}</p>
                <p style={styles.insightValue}>{topPerformer?.ap_points || 0} AP Points</p>
              </div>
            </div>
          </div>
          <div style={styles.insightCard}>
            <h4 style={styles.insightTitle}>📋 Most Tasks Done</h4>
            <div style={styles.insightContent}>
              {(() => {
                const top = members.reduce((best, m) => getMemberTaskCount(m.id) > getMemberTaskCount(best?.id || 0) ? m : best, members[0]);
                return top ? (
                  <>
                    <div style={styles.insightAvatar}>{top.name?.charAt(0)}</div>
                    <div>
                      <p style={styles.insightName}>{top.name}</p>
                      <p style={styles.insightValue}>{getMemberTaskCount(top.id)} tasks completed</p>
                    </div>
                  </>
                ) : <p style={{ color: '#aaa' }}>No data</p>;
              })()}
            </div>
          </div>
          <div style={styles.insightCard}>
            <h4 style={styles.insightTitle}>⚠️ Needs Attention</h4>
            <div style={styles.insightContent}>
              {(() => {
                const inactive = members.filter(m => m.ap_points === 0);
                return inactive.length > 0 ? (
                  <div>
                    {inactive.map(m => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ ...styles.insightAvatar, width: '28px', height: '28px', fontSize: '12px' }}>{m.name?.charAt(0)}</div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>{m.name}</p>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: '#2E7D32', fontSize: '14px', fontWeight: '600' }}>✅ All members active!</p>;
              })()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: '1100px' },
  heading: { margin: '0 0 6px', fontSize: '26px', fontWeight: '700', color: '#1A1A2E' },
  subheading: { margin: '0 0 28px', color: '#888', fontSize: '14px' },
  healthCard: { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #E8EDF5', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  healthLeft: { flex: 1 },
  healthTitle: { margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#1A1A2E' },
  healthDesc: { margin: 0, fontSize: '13px', color: '#888' },
  healthRight: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  healthCircle: { width: '90px', height: '90px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  healthScore: { margin: 0, fontSize: '28px', fontWeight: '700' },
  healthLabel: { margin: 0, fontSize: '12px', color: '#888' },
  healthStatus: { margin: 0, fontSize: '14px', fontWeight: '600' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: '140px', borderRadius: '12px', padding: '20px', textAlign: 'center' },
  statValue: { margin: '0 0 4px', fontSize: '28px', fontWeight: '700' },
  statLabel: { margin: 0, fontSize: '12px', color: '#555', fontWeight: '500' },
  tableCard: { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #E8EDF5', marginBottom: '24px', overflowX: 'auto' },
  cardTitle: { margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#333' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#F8FAFF' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', borderBottom: '1px solid #E8EDF5' },
  tr: { borderBottom: '1px solid #F0F4F8' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#333' },
  memberCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '36px', height: '36px', background: '#E3F0FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: '#1565C0', minWidth: '36px' },
  memberName: { margin: 0, fontSize: '14px', fontWeight: '600', color: '#333' },
  youBadge: { marginLeft: '6px', fontSize: '10px', background: '#E3F0FF', color: '#1565C0', padding: '2px 6px', borderRadius: '10px', fontWeight: '600' },
  roleBadge: { fontSize: '11px', background: '#F0F4F8', color: '#555', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', textTransform: 'capitalize' },
  apPoints: { fontSize: '15px', fontWeight: '700', color: '#1565C0' },
  perfBadge: { fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },
  insightsRow: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  insightCard: { flex: 1, minWidth: '240px', background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #E8EDF5' },
  insightTitle: { margin: '0 0 16px', fontSize: '15px', fontWeight: '600', color: '#333' },
  insightContent: { display: 'flex', alignItems: 'center', gap: '12px' },
  insightAvatar: { width: '40px', height: '40px', background: '#1565C0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#fff', minWidth: '40px' },
  insightName: { margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#333' },
  insightValue: { margin: 0, fontSize: '13px', color: '#888' },
};

export default Analytics;