import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const statusConfig = {
  'not-started': { label: 'Not Started', bg: 'var(--muted-2)', color: 'var(--primary-dark)' },
  'in-progress': { label: 'In Progress', bg: 'var(--muted-2)', color: 'var(--primary-dark)' },
  completed: { label: 'Completed', bg: 'var(--muted-2)', color: 'var(--success)' },
};

const categoryPalette = {
  Software: { bg: 'var(--muted)', color: 'var(--primary)' },
  Hardware: { bg: 'var(--muted-2)', color: 'var(--success)' },
  'GENERAL Skill': { bg: 'var(--muted-2)', color: 'var(--primary-dark)' },
  Advanced: { bg: 'var(--muted-2)', color: 'var(--primary-dark)' },
  Beginner: { bg: 'var(--muted-2)', color: 'var(--primary-dark)' },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 44,
    rotateX: -52,
    rotateZ: -8,
    scale: 0.78,
    transformPerspective: 1200,
  },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    rotateZ: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 240,
      damping: 18,
      mass: 0.72,
      delay: index * 0.03,
    },
  }),
};

const partyBursts = [
  { top: '8%', left: '5%', delay: 0.02, drift: -18 },
  { top: '8%', left: '22%', delay: 0.12, drift: 14 },
  { top: '8%', left: '41%', delay: 0.04, drift: -10 },
  { top: '8%', left: '64%', delay: 0.16, drift: 20 },
  { top: '8%', left: '84%', delay: 0.08, drift: -16 },
  { top: '24%', left: '10%', delay: 0.18, drift: 16 },
  { top: '24%', left: '30%', delay: 0.06, drift: -22 },
  { top: '24%', left: '53%', delay: 0.14, drift: 12 },
  { top: '24%', left: '76%', delay: 0.03, drift: -12 },
  { top: '40%', left: '16%', delay: 0.1, drift: 22 },
  { top: '40%', left: '47%', delay: 0.02, drift: -14 },
  { top: '40%', left: '88%', delay: 0.15, drift: 18 },
];

const Skills = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [users, setUsers] = useState([]);
  const [teamProgress, setTeamProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(true);
  const [selectedTeamMember, setSelectedTeamMember] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [celebratingId, setCelebratingId] = useState(null);
  const celebrationTimerRef = useRef(null);
  const isMember = user?.role === 'member';
  const canViewTeamSkills = !isMember;

  useEffect(() => {
    fetchSkills();
    if (canViewTeamSkills) {
      fetchUsers();
      fetchTeamProgress();
    } else {
      setTeamLoading(false);
      setUsers([]);
      setTeamProgress([]);
    }
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await API.get('/skills/predefined');
      setSkills(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load skills!');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamProgress = async () => {
    try {
      setTeamLoading(true);
      const res = await API.get('/skills/all-progress');
      setTeamProgress(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load team skills!');
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load members!');
    }
  };

  const updateProgress = async (skill, nextStatus, nextLevels, options = {}) => {
    const { preserveScroll = false } = options;
    const completedLevels = Math.max(0, Math.min(Number(nextLevels) || 0, skill.total_levels || 1));
    const scrollSnapshot = preserveScroll && typeof window !== 'undefined'
      ? { x: window.scrollX, y: window.scrollY }
      : null;
    try {
      setSavingId(skill.id);
      await API.post('/skills/progress', {
        skill_id: skill.id,
        completed_levels: completedLevels,
        status: nextStatus,
      });
      setSkills(prevSkills => prevSkills.map(item => (
        item.id === skill.id
          ? { ...item, completed_levels: completedLevels, status: nextStatus, user_status: nextStatus }
          : item
      )));
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
      }
      setCelebratingId(skill.id);
      celebrationTimerRef.current = setTimeout(() => {
        setCelebratingId(null);
      }, 4000);
      toast.success('Skill progress updated!');
      if (scrollSnapshot) {
        requestAnimationFrame(() => {
          window.scrollTo(scrollSnapshot.x, scrollSnapshot.y);
        });
        setTimeout(() => {
          window.scrollTo(scrollSnapshot.x, scrollSnapshot.y);
        }, 50);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update skill progress!');
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
      }
    };
  }, []);

  const categories = useMemo(() => {
    return [...new Set(skills.map(skill => skill.category))].filter(Boolean);
  }, [skills]);

  const sortedSkills = useMemo(() => {
    return [...skills].sort((a, b) => (a.skill_name || '').localeCompare((b.skill_name || ''), undefined, { sensitivity: 'base' }));
  }, [skills]);

  const sortedTeamProgress = useMemo(() => {
    return [...teamProgress].sort((a, b) => {
      const userCompare = (a.user_name || '').localeCompare(b.user_name || '', undefined, { sensitivity: 'base' });
      if (userCompare !== 0) return userCompare;
      return (a.skill_name || '').localeCompare(b.skill_name || '', undefined, { sensitivity: 'base' });
    });
  }, [teamProgress]);

  const teamMembers = useMemo(() => {
    return users
      .filter(member => member.id !== user?.id)
      .map(member => member.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [users, user?.id]);

  useEffect(() => {
    if (!canViewTeamSkills) return;
    if (!teamMembers.length) {
      setSelectedTeamMember('');
      return;
    }
    if (selectedTeamMember && !teamMembers.includes(selectedTeamMember)) {
      setSelectedTeamMember('');
    }
  }, [canViewTeamSkills, teamMembers, selectedTeamMember]);

  const selectedTeamSkillCards = useMemo(() => {
    if (!selectedTeamMember) return [];
    const memberProgressBySkillId = new Map(
      sortedTeamProgress
        .filter(item => item.user_name === selectedTeamMember)
        .map(item => [item.skill_id, item])
    );

    return sortedSkills.map(skill => {
      const progress = memberProgressBySkillId.get(skill.id);
      return {
        id: `${selectedTeamMember}-${skill.id}`,
        user_name: selectedTeamMember,
        skill_name: skill.skill_name,
        category: skill.category,
        course_for: skill.course_for,
        total_levels: skill.total_levels,
        completed_levels: progress?.completed_levels ?? 0,
        status: progress?.status ?? 'not-started',
      };
    });
  }, [selectedTeamMember, sortedSkills, sortedTeamProgress]);

  const displayedSkills = canViewTeamSkills && selectedTeamMember ? selectedTeamSkillCards : sortedSkills;

  const displayedSkillsLabel = canViewTeamSkills && selectedTeamMember
    ? `${selectedTeamMember}'s skills`
    : 'Your skills';

  const displayedStats = useMemo(() => {
    const statusOf = (skill) => skill.user_status ?? skill.status ?? 'not-started';
    const total = displayedSkills.length;
    const completed = displayedSkills.filter(skill => statusOf(skill) === 'completed').length;
    const inProgress = displayedSkills.filter(skill => statusOf(skill) === 'in-progress').length;
    const notStarted = displayedSkills.filter(skill => statusOf(skill) === 'not-started').length;
    return { total, completed, inProgress, notStarted };
  }, [displayedSkills]);

  const SkillCard = ({ skill, index }) => {
    const progressValue = skill.total_levels > 0
      ? Math.round((Number(skill.completed_levels || 0) / skill.total_levels) * 100)
      : 0;
    const category = categoryPalette[skill.category] || { bg: 'var(--muted)', color: 'var(--muted-text)' };
    const isCelebrating = celebratingId === skill.id;
    const inputRef = useRef(null);

    const handleLevelCommit = () => {
      const nextLevels = inputRef.current?.value ?? String(skill.completed_levels || 0);
      if (String(nextLevels).trim() === '') {
        if (inputRef.current) {
          inputRef.current.value = String(skill.completed_levels || 0);
        }
        return;
      }
      const nextStatus = Number(nextLevels) >= skill.total_levels
        ? 'completed'
        : Number(nextLevels) > 0
          ? 'in-progress'
          : 'not-started';
      updateProgress(skill, nextStatus, nextLevels, { preserveScroll: true });
    };

    const handleLevelKeyDown = (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      e.stopPropagation();
      handleLevelCommit();
    };

    return (
      <div style={styles.cardShell}>
        {isCelebrating ? (
          <div style={styles.partyLayer} aria-hidden="true">
            {partyBursts.map((burst, burstIndex) => (
              <motion.span
                key={`${skill.id}-${burstIndex}`}
                style={{
                  ...styles.partyBurst,
                  ...burst,
                  background: burstIndex % 3 === 0 ? '#FF7A59' : burstIndex % 3 === 1 ? '#FFD166' : '#4ECDC4',
                }}
                initial={{ opacity: 0, scale: 0.15, y: '-20vh', rotate: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.15, 1.25, 1.05, 0.8],
                  y: ['-20vh', '10vh', '45vh', '95vh'],
                  x: [0, burst.drift || 0, (burst.drift || 0) * -0.6, 0],
                  rotate: [0, 120, 240, 360],
                }}
                transition={{ duration: 4, delay: burst.delay, ease: 'easeOut' }}
              />
            ))}
          </div>
        ) : null}

        <motion.div
          style={{ ...styles.card, ...(isCelebrating ? styles.cardCelebrating : {}) }}
          className="lift-surface"
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05, margin: '180px 0px 180px 0px' }}
          custom={index}
          animate={isCelebrating ? { rotateX: [0, 360, 720], scale: [1, 1.03, 1] } : undefined}
          transition={isCelebrating ? { duration: 4, ease: 'easeInOut' } : undefined}
        >
          <div style={styles.cardTop}>
            <div>
              <h3 style={styles.skillName}>{skill.skill_name}</h3>
              <p style={styles.skillMeta}>{skill.total_levels} level{skill.total_levels === 1 ? '' : 's'} available</p>
            </div>
          </div>

          <div style={styles.cardBadges}>
            <span style={{ ...styles.categoryBadge, background: category.bg, color: category.color }}>{skill.category}</span>
            <span style={styles.levelText}>{Number(skill.completed_levels || 0)} / {skill.total_levels} completed</span>
          </div>

          <div style={styles.progressWrap}>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${progressValue}%` }} />
            </div>
            <div style={styles.progressMeta}>
              <span>{progressValue}% done</span>
              <span>{skill.course_for}</span>
            </div>
          </div>

          <div style={styles.controls}>
            <label style={styles.field}>
              <span style={styles.label}>Completed Levels</span>
              <input
                style={styles.input}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                max={skill.total_levels || 1}
                defaultValue={Number(skill.completed_levels || 0)}
                ref={inputRef}
                onKeyDown={handleLevelKeyDown}
                disabled={savingId === skill.id}
              />
            </label>
          </div>
        </motion.div>
      </div>
    );
  };

  const TeamSkillCard = ({ item, index }) => {
    const status = statusConfig[item.status] || statusConfig['not-started'];
    const category = categoryPalette[item.category] || { bg: 'var(--muted)', color: 'var(--muted-text)' };
    const totalLevels = Number(item.total_levels || 1);
    const completedLevels = Number(item.completed_levels || 0);
    const progressValue = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

    return (
      <motion.div
        style={styles.card}
        className="lift-surface"
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05, margin: '180px 0px 180px 0px' }}
        custom={index}
      >
        <div style={styles.cardTop}>
          <div>
            <h3 style={styles.skillName}>{item.skill_name}</h3>
            <p style={styles.skillMeta}>{item.user_name}</p>
          </div>
          <span style={{ ...styles.badge, background: status.bg, color: status.color }}>{status.label}</span>
        </div>

        <div style={styles.cardBadges}>
          <span style={{ ...styles.categoryBadge, background: category.bg, color: category.color }}>{item.category}</span>
          <span style={styles.levelText}>{completedLevels} / {item.total_levels} completed</span>
        </div>

        <div style={styles.progressWrap}>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progressValue}%` }} />
          </div>
          <div style={styles.progressMeta}>
            <span>{progressValue}% done</span>
            <span>{item.course_for}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Skills <Icon title="members" /></h1>
            <p style={styles.subheading}>Track predefined skills and update your progress</p>
          </div>
          <button style={styles.refreshBtn} className="lift-button playful-button" onClick={fetchSkills} disabled={loading}>
            <Icon title="sync" /> Refresh
          </button>
        </div>

        <div style={styles.statsRow}>
          {[
            { label: 'Total Skills', value: displayedStats.total, color: 'var(--primary)', bg: 'var(--muted)' },
            { label: 'Completed', value: displayedStats.completed, color: 'var(--success)', bg: 'var(--muted-2)' },
            { label: 'In Progress', value: displayedStats.inProgress, color: 'var(--primary-dark)', bg: 'var(--muted-2)' },
            { label: 'Not Started', value: displayedStats.notStarted, color: 'var(--primary-dark)', bg: 'var(--muted-2)' },
          ].map(item => (
            <div key={item.label} style={{ ...styles.statCard, background: item.bg }}>
              <p style={{ ...styles.statValue, color: item.color }}>{item.value}</p>
              <p style={styles.statLabel}>{item.label}</p>
            </div>
          ))}
        </div>

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Categories</h2>
          <div style={styles.categoryList}>
            {categories.length === 0 ? (
              <span style={styles.emptyHint}>No categories loaded yet</span>
            ) : categories.map(category => (
              <span
                key={category}
                style={{
                  ...styles.categoryChip,
                  background: categoryPalette[category]?.bg || 'var(--muted)',
                  color: categoryPalette[category]?.color || 'var(--muted-text)',
                }}
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
            <div style={styles.loadingBox} className="lift-surface">Loading skills...</div>
        ) : skills.length === 0 ? (
          <div style={styles.emptyBox} className="lift-surface">
            <p style={styles.emptyTitle}>No skills found</p>
            <p style={styles.emptyText}>The backend did not return any predefined skills.</p>
          </div>
        ) : (
          <>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>{displayedSkillsLabel}</h2>
              {canViewTeamSkills ? (
                <div style={styles.filterRow}>
                  <label style={styles.filterField}>
                    <span style={styles.filterLabel}>Member</span>
                    <select
                      style={styles.filterSelect}
                      value={selectedTeamMember}
                      onChange={(e) => setSelectedTeamMember(e.target.value)}
                      disabled={teamLoading || teamMembers.length === 0}
                    >
                      <option value="">Your skills</option>
                      {teamMembers.map(memberName => (
                        <option key={memberName} value={memberName}>{memberName}</option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}
            </div>

            {canViewTeamSkills && teamLoading ? (
              <div style={styles.loadingBox}>Loading team progress...</div>
            ) : canViewTeamSkills && teamMembers.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={styles.emptyTitle}>No members found</p>
                <p style={styles.emptyText}>There are no other members available to review yet.</p>
              </div>
            ) : (
              <div style={styles.grid}>
                {displayedSkills.map((skill, index) => canViewTeamSkills && selectedTeamMember ? (
                  <TeamSkillCard key={skill.id} item={skill} index={index} />
                ) : (
                  <SkillCard key={skill.id} skill={skill} index={index} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: '1160px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' },
  heading: { margin: '0 0 6px', fontSize: '28px', fontWeight: 700, color: '#1A1A2E' },
  subheading: { margin: 0, color: '#697386', fontSize: '14px' },
  refreshBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', border: 'none', borderRadius: '10px', padding: '10px 16px', background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '26px' },
  statCard: { borderRadius: '14px', padding: '18px', textAlign: 'center' },
  statValue: { margin: '0 0 4px', fontSize: '28px', fontWeight: 700 },
  statLabel: { margin: 0, fontSize: '13px', color: 'var(--muted-text)', fontWeight: 500 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' },
  sectionTitle: { margin: 0, fontSize: '18px', fontWeight: 700, color: '#1A1A2E' },
  teamSection: { marginTop: '28px' },
  teamHint: { fontSize: '12px', fontWeight: 600, color: '#697386' },
  filterRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' },
  filterField: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '260px' },
  filterLabel: { fontSize: '12px', fontWeight: 700, color: 'var(--muted-text)' },
  filterSelect: { height: '42px', borderRadius: '10px', border: '1px solid var(--card-border)', padding: '0 12px', background: '#fff', color: '#1A1A2E' },
  teamGroups: { display: 'flex', flexDirection: 'column', gap: '20px' },
  teamGroup: { display: 'flex', flexDirection: 'column', gap: '14px' },
  teamGroupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  teamGroupTitle: { margin: 0, fontSize: '16px', fontWeight: 700, color: '#1A1A2E' },
  teamGroupCount: { padding: '5px 10px', borderRadius: '999px', background: 'var(--muted)', color: 'var(--muted-text)', fontSize: '12px', fontWeight: 700 },
  categoryList: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  categoryChip: { padding: '6px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 },
  emptyHint: { color: '#697386', fontSize: '13px' },
  loadingBox: { padding: '28px', borderRadius: '14px', background: '#fff', border: '1px solid var(--card-border)', color: '#697386' },
  emptyBox: { padding: '28px', borderRadius: '14px', background: '#fff', border: '1px solid var(--card-border)' },
  emptyTitle: { margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#1A1A2E' },
  emptyText: { margin: 0, color: '#697386', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', perspective: '1400px', transformStyle: 'preserve-3d' },
  cardShell: { position: 'relative' },
  partyLayer: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' },
  partyBurst: { position: 'absolute', top: '-12vh', width: '16px', height: '22px', borderRadius: '6px 6px 10px 10px', boxShadow: '0 0 0 6px rgba(255,255,255,0.22)' },
  card: { background: '#fff', borderRadius: '14px', border: '1px solid var(--card-border)', padding: '20px', boxShadow: '0 12px 30px rgba(15,23,42,0.06)', transition: 'transform 160ms ease, box-shadow 160ms ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px', position: 'relative', zIndex: 1 },
  cardCelebrating: { transformOrigin: 'center center' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' },
  skillName: { margin: 0, fontSize: '16px', fontWeight: 700, color: '#1A1A2E' },
  skillMeta: { margin: '6px 0 0', fontSize: '13px', color: '#697386' },
  badge: { padding: '6px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' },
  cardBadges: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' },
  categoryBadge: { padding: '6px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 },
  levelText: { fontSize: '13px', color: 'var(--muted-text)', fontWeight: 600 },
  progressWrap: { marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  progressTrack: { height: '10px', borderRadius: '999px', background: 'var(--muted)', overflow: 'hidden', width: '100%' },
  progressFill: { height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, var(--primary), var(--primary-dark))' },
  progressMeta: { marginTop: '8px', display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px', color: '#697386' },
  controls: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', alignItems: 'end' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: 700, color: 'var(--muted-text)' },
  select: { height: '44px', borderRadius: '10px', border: '1px solid var(--card-border)', padding: '0 12px', background: '#fff', color: '#1A1A2E' },
  input: { height: '44px', borderRadius: '10px', border: '1px solid var(--card-border)', padding: '0 12px', background: '#fff', color: '#1A1A2E' },
};

export default Skills;