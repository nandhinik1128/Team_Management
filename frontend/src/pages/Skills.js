import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api/axios';
import { toast } from 'react-toastify';

const categoryColors = {
  'GENERAL':  { bg: '#E3F0FF', color: '#1565C0' },
  'Software': { bg: '#E8F5E9', color: '#2E7D32' },
  'Hardware': { bg: '#FFF3E0', color: '#E65100' },
  'Beginner': { bg: '#F3E5F5', color: '#6A1B9A' },
  'Advanced': { bg: '#FFEBEE', color: '#C62828' },
};

const Skills = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [updating, setUpdating] = useState(null);

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = () => {
    API.get('/skills/predefined').then(r => setSkills(r.data)).catch(() => {});
  };

  const handleUpdateProgress = async (skill, completedLevels) => {
    setUpdating(skill.id);
    const status = completedLevels === 0 ? 'not-started'
      : completedLevels >= skill.total_levels ? 'completed' : 'in-progress';
    try {
      await API.post('/skills/progress', {
        skill_id: skill.id,
        completed_levels: completedLevels,
        status
      });
      toast.success('Progress updated!');
      fetchSkills();
    } catch { toast.error('Failed!'); }
    finally { setUpdating(null); }
  };

  const categories = ['All', ...new Set(skills.map(s => s.category))];
  const filteredSkills = skills.filter(s => {
    const catMatch = activeCategory === 'All' || s.category === activeCategory;
    if (activeTab === 'incomplete') return catMatch && s.user_status !== 'completed';
    if (activeTab === 'completed') return catMatch && s.user_status === 'completed';
    return catMatch;
  });

  const completedCount = skills.filter(s => s.user_status === 'completed').length;
  const inProgressCount = skills.filter(s => s.user_status === 'in-progress').length;
  const totalProgress = skills.length > 0 ? Math.round((completedCount / skills.length) * 100) : 0;

  const SkillCard = ({ skill }) => {
    const pct = skill.total_levels > 0 ? Math.round((skill.completed_levels / skill.total_levels) * 100) : 0;
    const catStyle = categoryColors[skill.category] || categoryColors['GENERAL'];
    const isCompleted = skill.user_status === 'completed';
    const isInProgress = skill.user_status === 'in-progress';

    return (
      <div style={{ ...styles.skillCard, border: isCompleted ? '1.5px solid #4CAF50' : '1px solid #E8EDF5' }}>
        <div style={styles.skillTop}>
          <div style={styles.skillInfo}>
            <h4 style={styles.skillName}>{skill.skill_name}</h4>
            <span style={{ ...styles.catBadge, background: catStyle.bg, color: catStyle.color }}>
              {skill.category}
            </span>
          </div>
          <div style={{ ...styles.statusIcon, background: isCompleted ? '#E8F5E9' : isInProgress ? '#FFF3E0' : '#F3F4F6' }}>
            {isCompleted ? '✅' : isInProgress ? '🔄' : '⭕'}
          </div>
        </div>

        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>{skill.completed_levels}/{skill.total_levels} levels</span>
            <span style={{ ...styles.progressPct, color: isCompleted ? '#2E7D32' : '#1565C0' }}>{pct}%</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${pct}%`, background: isCompleted ? '#4CAF50' : '#1565C0' }} />
          </div>
        </div>

        <div style={styles.levelBtns}>
          <span style={styles.levelLabel}>Update progress:</span>
          <div style={styles.levelBtnRow}>
            {Array.from({ length: skill.total_levels + 1 }, (_, i) => (
              <button key={i} style={{ ...styles.levelBtn, background: i <= skill.completed_levels ? '#1565C0' : '#E8EDF5', color: i <= skill.completed_levels ? '#fff' : '#888' }}
                onClick={() => handleUpdateProgress(skill, i)}
                disabled={updating === skill.id}>
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div style={styles.container}>
        <h1 style={styles.heading}>Skills Tracker 🧠</h1>
        <p style={styles.subheading}>Track your progress across all {skills.length} college courses</p>

        {/* Overall Progress */}
        <div style={styles.overallCard}>
          <div style={styles.overallLeft}>
            <h3 style={styles.overallTitle}>My Overall Progress</h3>
            <div style={styles.overallStats}>
              <div style={styles.overallStat}>
                <p style={styles.overallValue}>{completedCount}</p>
                <p style={styles.overallLabel}>Completed</p>
              </div>
              <div style={styles.overallStat}>
                <p style={{ ...styles.overallValue, color: '#E65100' }}>{inProgressCount}</p>
                <p style={styles.overallLabel}>In Progress</p>
              </div>
              <div style={styles.overallStat}>
                <p style={{ ...styles.overallValue, color: '#888' }}>{skills.length - completedCount - inProgressCount}</p>
                <p style={styles.overallLabel}>Not Started</p>
              </div>
            </div>
          </div>
          <div style={styles.overallRight}>
            <div style={styles.bigProgressBar}>
              <div style={{ ...styles.bigProgressFill, width: `${totalProgress}%` }} />
            </div>
            <p style={styles.bigProgressLabel}>{totalProgress}% Complete</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[['all', 'All Skills'], ['incomplete', 'Incomplete'], ['completed', 'Completed']].map(([val, label]) => (
            <button key={val} style={{ ...styles.tab, borderBottom: activeTab === val ? '2px solid #1565C0' : '2px solid transparent', color: activeTab === val ? '#1565C0' : '#888' }}
              onClick={() => setActiveTab(val)}>{label}</button>
          ))}
        </div>

        {/* Category Filter */}
        <div style={styles.categoryRow}>
          {categories.map(cat => (
            <button key={cat} style={{ ...styles.catBtn, background: activeCategory === cat ? '#1565C0' : '#F0F4F8', color: activeCategory === cat ? '#fff' : '#555' }}
              onClick={() => setActiveCategory(cat)}>{cat}</button>
          ))}
        </div>

        {/* Skills Grid */}
        <div style={styles.skillsGrid}>
          {filteredSkills.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyText}>No skills in this category.</p>
            </div>
          ) : filteredSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: '1100px' },
  heading: { margin: '0 0 6px', fontSize: '26px', fontWeight: '700', color: '#1A1A2E' },
  subheading: { margin: '0 0 24px', color: '#888', fontSize: '14px' },
  overallCard: { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #E8EDF5', marginBottom: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' },
  overallLeft: { flex: 1 },
  overallTitle: { margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#333' },
  overallStats: { display: 'flex', gap: '24px' },
  overallStat: { textAlign: 'center' },
  overallValue: { margin: '0 0 4px', fontSize: '24px', fontWeight: '700', color: '#2E7D32' },
  overallLabel: { margin: 0, fontSize: '12px', color: '#888' },
  overallRight: { flex: 1, minWidth: '200px' },
  bigProgressBar: { height: '16px', background: '#E8EDF5', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' },
  bigProgressFill: { height: '100%', background: 'linear-gradient(90deg, #1565C0, #42A5F5)', borderRadius: '8px', transition: 'width 0.5s' },
  bigProgressLabel: { margin: 0, fontSize: '14px', fontWeight: '600', color: '#1565C0', textAlign: 'center' },
  tabs: { display: 'flex', borderBottom: '1px solid #E8EDF5', marginBottom: '16px' },
  tab: { padding: '10px 20px', background: 'none', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  categoryRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' },
  catBtn: { border: 'none', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  skillsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  skillCard: { background: '#fff', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' },
  skillTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  skillInfo: { flex: 1 },
  skillName: { margin: '0 0 6px', fontSize: '14px', fontWeight: '600', color: '#1A1A2E', lineHeight: '1.3' },
  catBadge: { fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px' },
  statusIcon: { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', minWidth: '36px' },
  progressSection: {},
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
  progressLabel: { fontSize: '12px', color: '#888' },
  progressPct: { fontSize: '12px', fontWeight: '700' },
  progressBar: { height: '6px', background: '#E8EDF5', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  levelBtns: {},
  levelLabel: { fontSize: '11px', color: '#888', marginBottom: '6px', display: 'block' },
  levelBtnRow: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  levelBtn: { width: '28px', height: '28px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  emptyBox: { background: '#F8FAFF', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px dashed #D0DCF0', gridColumn: '1 / -1' },
  emptyText: { margin: 0, color: '#aaa', fontSize: '14px' },
};

export default Skills;