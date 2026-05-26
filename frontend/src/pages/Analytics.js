import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import API from '../api/axios';
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

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const percent = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);
const shortDate = (dateValue) => {
  if (!dateValue) return 'No date';
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? 'No date' : date.toLocaleDateString('en-IN');
};
const isDeadlinePast = (deadline) => {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  return deadlineDate < today;
};
const daysUntil = (deadline) => {
  if (!deadline) return null;
  const deadlineDate = new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  return Math.round((deadlineDate - today) / (1000 * 60 * 60 * 24));
};

const rolePalette = {
  captain: 'var(--primary)',
  'vice-captain': 'var(--primary-dark)',
  strategist: 'var(--primary-dark)',
  manager: 'var(--success)',
  member: 'var(--primary-dark)',
};

const StatCard = ({ label, value, color, bg, sublabel, suffix = '' }) => (
  <motion.div
    style={{ ...styles.statCard, background: bg }}
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -4 }}
  >
    <p style={{ ...styles.statValue, color }}><CountUp value={value} suffix={suffix} /></p>
    <p style={styles.statLabel}>{label}</p>
    {sublabel ? <p style={styles.statSubLabel}>{sublabel}</p> : null}
  </motion.div>
);

const DonutCard = ({ title, subtitle, segments, totalLabel, centerValue, centerText }) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const activeSegments = segments.filter(segment => segment.value > 0);
  let current = 0;
  const gradient = activeSegments.length > 0
    ? `conic-gradient(${activeSegments.map(segment => {
      const start = current;
      current += segment.value / total * 100;
      return `${segment.color} ${start}% ${current}%`;
    }).join(', ')})`
    : 'conic-gradient(var(--card-border) 0 100%)';

  return (
    <motion.div
      style={styles.panel}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
    >
      <div style={styles.panelHeader}>
        <div>
          <h3 style={styles.panelTitle}>{title}</h3>
          <p style={styles.panelSubTitle}>{subtitle}</p>
        </div>
        {totalLabel ? <span style={styles.panelTag}>{totalLabel}</span> : null}
      </div>

      <div style={styles.donutWrap}>
        <div style={{ ...styles.donut, background: gradient }}>
          <div style={styles.donutHole}>
            <p style={styles.donutValue}><CountUp value={centerValue} /></p>
            <p style={styles.donutText}>{centerText}</p>
          </div>
        </div>
        <div style={styles.legendList}>
          {segments.map(segment => (
            <div key={segment.label} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: segment.color }} />
              <span style={styles.legendLabel}>{segment.label}</span>
              <span style={styles.legendValue}>{segment.value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const BarChart = ({ title, subtitle, items, accent }) => {
  const maxValue = Math.max(...items.map(item => item.value), 1);
  return (
    <motion.div
      style={styles.panel}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
    >
      <div style={styles.panelHeader}>
        <div>
          <h3 style={styles.panelTitle}>{title}</h3>
          <p style={styles.panelSubTitle}>{subtitle}</p>
        </div>
        <span style={styles.panelTag}>{items.length} shown</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map(item => {
          const width = Math.max(8, Math.round((item.value / maxValue) * 100));
          return (
            <div key={item.label} style={styles.barRow}>
              <div style={styles.barMeta}>
                <span style={styles.barLabel}>{item.label}</span>
                <span style={styles.barValue}><CountUp value={item.value} /></span>
              </div>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${width}%`, background: item.color || accent }} />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const Analytics = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    API.get('/leaderboard').then(r => {
      const sorted = Array.isArray(r.data) ? [...r.data].sort((a, b) => (b.ap_points || 0) - (a.ap_points || 0)) : r.data;
      setMembers(sorted);
    }).catch(() => {});
    API.get('/tasks').then(r => setTasks(r.data)).catch(() => {});
    API.get('/skills/all').then(r => setSkills(r.data)).catch(() => {});
    API.get('/projects').then(r => setProjects(r.data || [])).catch(() => {});
  }, []);

  const totalAP = useMemo(() => members.reduce((sum, member) => sum + (member.ap_points || 0), 0), [members]);
  const avgAP = members.length > 0 ? Math.round(totalAP / members.length) : 0;
  const topPerformer = members[0];

  const taskBreakdown = useMemo(() => ({
    completed: tasks.filter(task => task.status === 'completed').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    todo: tasks.filter(task => task.status === 'todo').length,
    overdue: tasks.filter(task => task.status !== 'completed' && isDeadlinePast(task.deadline)).length,
    dueSoon: tasks.filter(task => task.status !== 'completed' && daysUntil(task.deadline) !== null && daysUntil(task.deadline) >= 0 && daysUntil(task.deadline) <= 3).length,
  }), [tasks]);

  const skillBreakdown = useMemo(() => ({
    completed: skills.filter(skill => skill.status === 'completed').length,
    inProgress: skills.filter(skill => skill.status === 'in-progress').length,
    notStarted: skills.filter(skill => skill.status === 'not-started').length,
  }), [skills]);

  const projectBreakdown = useMemo(() => ({
    completed: projects.filter(project => project.status === 'completed').length,
    inProgress: projects.filter(project => project.status === 'in-progress').length,
    incomplete: projects.filter(project => project.status === 'incomplete').length,
  }), [projects]);

  const roleBreakdown = useMemo(() => {
    const counts = members.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([role, value]) => ({ role, value }));
  }, [members]);

  const memberMetrics = useMemo(() => {
    const maxAP = Math.max(...members.map(member => member.ap_points || 0), 1);
    return members.map(member => {
      const memberTasks = tasks.filter(task => task.assigned_to === member.id);
      const completedTasks = memberTasks.filter(task => task.status === 'completed').length;
      const inProgressTasks = memberTasks.filter(task => task.status === 'in-progress').length;
      const overdueTasks = memberTasks.filter(task => task.status !== 'completed' && isDeadlinePast(task.deadline)).length;
      const dueSoonTasks = memberTasks.filter(task => task.status !== 'completed' && daysUntil(task.deadline) !== null && daysUntil(task.deadline) >= 0 && daysUntil(task.deadline) <= 3).length;

      const memberSkills = skills.filter(skill => skill.user_id === member.id);
      const completedSkills = memberSkills.filter(skill => skill.status === 'completed').length;
      const inProgressSkills = memberSkills.filter(skill => skill.status === 'in-progress').length;

      const taskCompletionRate = memberTasks.length ? completedTasks / memberTasks.length : 0.5;
      const skillCompletionRate = memberSkills.length ? completedSkills / Math.max(memberSkills.length, 1) : 0.5;
      const punctuality = memberTasks.length ? 1 - (overdueTasks / memberTasks.length) : 0.5;

      const speedScore = clamp(Math.round((taskCompletionRate * 50) + (skillCompletionRate * 30) + (punctuality * 20)), 0, 100);
      const riskScore = clamp(Math.round(((memberTasks.length ? overdueTasks / memberTasks.length : 0.5) * 50) + ((memberTasks.length ? (memberTasks.length - completedTasks) / memberTasks.length : 0.5) * 25) + ((100 - speedScore) * 0.25)), 0, 100);
      const momentum = clamp(Math.round(((completedTasks + completedSkills) * 10) + (member.ap_points || 0) / Math.max(maxAP / 10, 1)), 0, 100);

      return {
        ...member,
        memberTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        dueSoonTasks,
        memberSkills,
        completedSkills,
        inProgressSkills,
        taskCompletionRate: Math.round(taskCompletionRate * 100),
        skillCompletionRate: Math.round(skillCompletionRate * 100),
        punctuality: Math.round(punctuality * 100),
        speedScore,
        riskScore,
        momentum,
        workload: memberTasks.length,
        projectWork: projects.filter(project => project.created_by === member.id || (project.members || []).some(teamMember => teamMember.id === member.id)).length,
      };
    }).sort((a, b) => b.speedScore - a.speedScore);
  }, [members, tasks, skills, projects]);

  const activeMembers = memberMetrics.filter(member => member.ap_points > 0 || member.completedTasks > 0 || member.completedSkills > 0).length;
  const activeRate = percent(activeMembers, Math.max(members.length, 1));

  const completedTasks = taskBreakdown.completed;
  const totalTasks = tasks.length;
  const completionRate = percent(completedTasks, Math.max(totalTasks, 1));
  const completedSkills = skillBreakdown.completed;
  const totalSkills = skills.length;
  const skillCompletionRate = percent(completedSkills, Math.max(totalSkills, 1));
  const projectCompletionRate = percent(projectBreakdown.completed, Math.max(projects.length, 1));

  const averageSpeed = memberMetrics.length ? Math.round(memberMetrics.reduce((sum, member) => sum + member.speedScore, 0) / memberMetrics.length) : 0;
  const averageRisk = memberMetrics.length ? Math.round(memberMetrics.reduce((sum, member) => sum + member.riskScore, 0) / memberMetrics.length) : 0;
  const teamHealth = clamp(Math.round((completionRate * 0.3) + (skillCompletionRate * 0.25) + (projectCompletionRate * 0.15) + (activeRate * 0.15) + (averageSpeed * 0.15)), 0, 100);
  const healthColor = teamHealth >= 70 ? 'var(--success)' : teamHealth >= 40 ? 'var(--primary-dark)' : 'var(--danger)';

  const topSpeedMembers = [...memberMetrics].sort((a, b) => b.speedScore - a.speedScore).slice(0, 5);
  const atRiskMembers = [...memberMetrics].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  const apBarItems = [...members].slice(0, 6).map(member => ({ label: member.name, value: member.ap_points || 0, color: rolePalette[member.role] || 'var(--primary)' }));
  const speedBarItems = topSpeedMembers.map(member => ({ label: member.name, value: member.speedScore, color: member.riskScore >= 70 ? 'var(--danger)' : 'var(--primary)' }));
  const workloadBarItems = [...memberMetrics].sort((a, b) => b.workload - a.workload).slice(0, 6).map(member => ({ label: member.name, value: member.workload, color: 'var(--primary-dark)' }));

  const hottestProject = [...projects].sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))[0];
  const busiestMember = [...memberMetrics].sort((a, b) => b.workload - a.workload)[0];
  const fastestMember = memberMetrics[0];

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.heroCard}>
          <div>
            <h1 style={styles.heading}>Analytics & Insights <Icon title="analytics" /></h1>
            <p style={styles.subheading}>A full team dashboard for speed, mistakes, workload, and progress tracking.</p>
          </div>
          <motion.div
            style={styles.healthBlock}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ ...styles.healthCircle, background: `conic-gradient(${healthColor} 0 ${teamHealth}%, var(--muted) ${teamHealth}% 100%)` }}>
              <div style={styles.healthHole}>
                <p style={{ ...styles.healthScore, color: healthColor }}><CountUp value={teamHealth} /></p>
                <p style={styles.healthLabel}>Team Health</p>
              </div>
            </div>
            <div style={styles.healthMeta}>
              <p style={{ ...styles.healthStatus, color: healthColor }}>
                {teamHealth >= 70 ? <span><Icon title="status_excellent" /> Strong</span> : teamHealth >= 40 ? <span><Icon title="status_average" /> Stable</span> : <span><Icon title="status_needs_work" /> At Risk</span>}
              </p>
              <p style={styles.healthDesc}>Calculated from task completion, skill progress, project status, member activity, and speed.</p>
            </div>
          </motion.div>
        </div>

        <div style={styles.statsRow}>
          <StatCard label="Total AP Points" value={totalAP} color="var(--primary)" bg="var(--muted)" sublabel={`${avgAP} average per member`} />
          <StatCard label="Task Completion" value={completionRate} suffix="%" color="var(--success)" bg="var(--muted-2)" sublabel={`${completedTasks}/${Math.max(totalTasks, 1)} completed`} />
          <StatCard label="Skill Completion" value={skillCompletionRate} suffix="%" color="var(--primary-dark)" bg="var(--muted-2)" sublabel={`${completedSkills}/${Math.max(totalSkills, 1)} completed`} />
          <StatCard label="Project Completion" value={projectCompletionRate} suffix="%" color="var(--primary-dark)" bg="var(--muted-2)" sublabel={`${projectBreakdown.completed}/${Math.max(projects.length, 1)} completed`} />
          <StatCard label="Active Members" value={activeMembers} color="var(--primary-dark)" bg="#E0F7FA" sublabel={`${activeRate}% active`} />
          <StatCard label="Avg Speed Score" value={averageSpeed} color="var(--primary-dark)" bg="var(--muted-2)" sublabel={`Risk avg: ${averageRisk}`} />
        </div>

        <div style={styles.chartGrid}>
          <DonutCard
            title="Task Status"
            subtitle="Completed, in progress, and overdue work"
            segments={[
              { label: 'Completed', value: taskBreakdown.completed, color: 'var(--success)' },
              { label: 'In Progress', value: taskBreakdown.inProgress, color: 'var(--primary-dark)' },
              { label: 'To Do', value: taskBreakdown.todo, color: 'var(--primary-dark)' },
              { label: 'Overdue', value: taskBreakdown.overdue, color: 'var(--danger)' },
            ]}
            totalLabel={`${tasks.length} tasks`}
            centerValue={completionRate}
            centerText="Completion"
          />
          <DonutCard
            title="Skill Status"
            subtitle="Progress across all tracked skills"
            segments={[
              { label: 'Completed', value: skillBreakdown.completed, color: 'var(--success)' },
              { label: 'In Progress', value: skillBreakdown.inProgress, color: 'var(--primary-dark)' },
              { label: 'Not Started', value: skillBreakdown.notStarted, color: 'var(--primary-dark)' },
            ]}
            totalLabel={`${skills.length} skills`}
            centerValue={skillCompletionRate}
            centerText="Completed"
          />
          <DonutCard
            title="Project Status"
            subtitle="Team project breakdown"
            segments={[
              { label: 'Completed', value: projectBreakdown.completed, color: 'var(--success)' },
              { label: 'In Progress', value: projectBreakdown.inProgress, color: 'var(--primary-dark)' },
              { label: 'Incomplete', value: projectBreakdown.incomplete, color: 'var(--danger)' },
            ]}
            totalLabel={`${projects.length} projects`}
            centerValue={projectCompletionRate}
            centerText="Done"
          />
          <DonutCard
            title="Role Mix"
            subtitle="How your team is distributed"
            segments={roleBreakdown.map(item => ({ label: item.role, value: item.value, color: rolePalette[item.role] || 'var(--primary)' }))}
            totalLabel={`${members.length} members`}
            centerValue={members.length}
            centerText="Members"
          />
        </div>

        <div style={styles.chartGrid}>
          <BarChart title="Top AP Leaders" subtitle="Leaderboard by AP points" items={apBarItems} accent="var(--primary)" />
          <BarChart title="Fastest Members" subtitle="Speed score based on tasks, skills, and punctuality" items={speedBarItems} accent="var(--primary-dark)" />
          <BarChart title="Workload" subtitle="Members with the most assigned work" items={workloadBarItems} accent="var(--primary-dark)" />
        </div>

        <div style={styles.insightsRow}>
          <div style={styles.insightCard}>
            <h4 style={styles.insightTitle}><Icon title="trophy" /> Top Performer</h4>
            <div style={styles.insightContent}>
              <motion.div style={styles.insightAvatar} initial={{ scale: 0.85, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
                {topPerformer?.name?.charAt(0)}
              </motion.div>
              <div>
                <p style={styles.insightName}>{topPerformer?.name || 'N/A'}</p>
                <p style={styles.insightValue}><CountUp value={topPerformer?.ap_points || 0} suffix=" AP Points" /></p>
              </div>
            </div>
          </div>
          <div style={styles.insightCard}>
            <h4 style={styles.insightTitle}><Icon title="sync" /> Fastest Member</h4>
            <div style={styles.insightContent}>
              <motion.div style={styles.insightAvatar} initial={{ scale: 0.85, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: 0.05 }}>
                {fastestMember?.name?.charAt(0)}
              </motion.div>
              <div>
                <p style={styles.insightName}>{fastestMember?.name || 'N/A'}</p>
                <p style={styles.insightValue}><CountUp value={fastestMember?.speedScore || 0} suffix=" speed score" /></p>
              </div>
            </div>
          </div>
          <div style={styles.insightCard}>
            <h4 style={styles.insightTitle}><Icon title="folder" /> Most Workload</h4>
            <div style={styles.insightContent}>
              <motion.div style={styles.insightAvatar} initial={{ scale: 0.85, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: 0.1 }}>
                {busiestMember?.name?.charAt(0)}
              </motion.div>
              <div>
                <p style={styles.insightName}>{busiestMember?.name || 'N/A'}</p>
                <p style={styles.insightValue}><CountUp value={busiestMember?.workload || 0} suffix=" assigned tasks" /></p>
              </div>
            </div>
          </div>
          <div style={styles.insightCard}>
            <h4 style={styles.insightTitle}><Icon title="status_needs_work" /> Risk Watch</h4>
            <div style={styles.insightContent}>
              {atRiskMembers.filter(member => member.riskScore >= 60 || member.overdueTasks > 0).length > 0 ? (
                <div style={{ width: '100%' }}>
                  {atRiskMembers.filter(member => member.riskScore >= 60 || member.overdueTasks > 0).slice(0, 4).map(member => (
                    <div key={member.id} style={styles.riskLine}>
                      <div style={{ ...styles.insightAvatar, width: '28px', height: '28px', fontSize: '12px' }}>{member.name?.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <p style={styles.riskName}>{member.name}</p>
                        <p style={styles.riskMeta}>{member.overdueTasks} overdue, speed {member.speedScore}</p>
                      </div>
                      <span style={{ ...styles.riskPill, background: member.riskScore >= 70 ? '#FFEBEE' : 'var(--warning-light)', color: member.riskScore >= 70 ? 'var(--danger)' : 'var(--primary-dark)' }}>{member.riskScore}</span>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: 'var(--success)', fontSize: '14px', fontWeight: '600' }}><Icon title="check" /> No major risks detected</p>}
            </div>
          </div>
        </div>

        <div style={styles.tableCard}>
          <h3 style={styles.cardTitle}><Icon title="members" /> Member Performance Matrix</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Member</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>AP</th>
                <th style={styles.th}>Tasks</th>
                <th style={styles.th}>Overdue</th>
                <th style={styles.th}>Skills</th>
                <th style={styles.th}>Speed</th>
                <th style={styles.th}>Risk</th>
              </tr>
            </thead>
            <tbody>
              {memberMetrics.map(member => {
                const speedColor = member.speedScore >= 70 ? 'var(--success)' : member.speedScore >= 40 ? 'var(--primary-dark)' : 'var(--danger)';
                const riskColor = member.riskScore >= 70 ? 'var(--danger)' : member.riskScore >= 40 ? 'var(--primary-dark)' : 'var(--success)';
                const rowBg = member.id === user?.id ? 'var(--muted-2)' : '#fff';
                return (
                  <tr key={member.id} style={{ ...styles.tr, background: rowBg }}>
                    <td style={styles.td}>
                      <div style={styles.memberCell}>
                        <div style={styles.avatar}>{member.name?.charAt(0)}</div>
                        <div>
                          <p style={styles.memberName}>{member.name}{member.id === user?.id && <span style={styles.youBadge}>You</span>}</p>
                          <p style={styles.memberHint}>{member.workload} tasks · {member.projectWork} projects</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}><span style={{ ...styles.roleBadge, background: `${rolePalette[member.role] || '#F0F4F8'}18`, color: rolePalette[member.role] || 'var(--muted-text)' }}>{member.role}</span></td>
                    <td style={styles.td}><span style={styles.apPoints}>{member.ap_points}</span></td>
                    <td style={styles.td}>{member.completedTasks}/{member.workload}</td>
                    <td style={styles.td}><span style={{ ...styles.warnBadge, background: member.overdueTasks > 0 ? '#FFEBEE' : 'var(--success-light)', color: member.overdueTasks > 0 ? 'var(--danger)' : 'var(--success)' }}>{member.overdueTasks}</span></td>
                    <td style={styles.td}>{member.completedSkills}/{member.memberSkills.length}</td>
                    <td style={styles.td}><span style={{ ...styles.scoreBadge, background: `${speedColor}18`, color: speedColor }}>{member.speedScore}</span></td>
                    <td style={styles.td}><span style={{ ...styles.scoreBadge, background: `${riskColor}18`, color: riskColor }}>{member.riskScore}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={styles.footerGrid}>
          <div style={styles.footerCard}>
            <h4 style={styles.footerTitle}><Icon title="pending" /> Tasks Due Soon</h4>
            <div style={styles.footerList}>
              {tasks.filter(task => task.status !== 'completed' && daysUntil(task.deadline) !== null && daysUntil(task.deadline) >= 0 && daysUntil(task.deadline) <= 3).slice(0, 5).map(task => (
                <div key={task.id} style={styles.footerItem}>
                  <div>
                    <p style={styles.footerItemTitle}>{task.title}</p>
                    <p style={styles.footerItemMeta}>Assigned to {task.assigned_to_name || 'Unknown'} · Due {shortDate(task.deadline)}</p>
                  </div>
                  <span style={styles.footerTag}>{daysUntil(task.deadline)}d</span>
                </div>
              ))}
              {tasks.filter(task => task.status !== 'completed' && daysUntil(task.deadline) !== null && daysUntil(task.deadline) >= 0 && daysUntil(task.deadline) <= 3).length === 0 ? <p style={styles.emptyMini}>No urgent tasks right now.</p> : null}
            </div>
          </div>

          <div style={styles.footerCard}>
            <h4 style={styles.footerTitle}><Icon title="folder" /> Project Load</h4>
            <div style={styles.footerList}>
              {hottestProject ? (
                <div style={styles.footerItem}>
                  <div>
                    <p style={styles.footerItemTitle}>{hottestProject.title}</p>
                    <p style={styles.footerItemMeta}>{hottestProject.members?.length || 0} members · {hottestProject.status}</p>
                  </div>
                  <span style={styles.footerTag}>{hottestProject.status}</span>
                </div>
              ) : <p style={styles.emptyMini}>No projects available.</p>}
              {projects.slice(0, 3).map(project => (
                <div key={project.id} style={styles.footerItem}>
                  <div>
                    <p style={styles.footerItemTitle}>{project.title}</p>
                    <p style={styles.footerItemMeta}>Deadline {shortDate(project.deadline)}</p>
                  </div>
                  <span style={styles.footerTag}>{project.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: '1220px', margin: '0 auto' },
  heading: { margin: '0 0 8px', fontSize: '28px', fontWeight: '800', color: '#101828' },
  subheading: { margin: 0, color: '#667085', fontSize: '14px', maxWidth: '760px' },
  heroCard: { background: 'linear-gradient(135deg, #FFFFFF 0%, #F7FAFF 100%)', borderRadius: '20px', padding: '24px', border: '1px solid var(--card-border)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', boxShadow: '0 12px 30px rgba(16, 24, 40, 0.05)' },
  healthBlock: { display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' },
  healthCircle: { width: '140px', height: '140px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  healthHole: { width: '96px', height: '96px', borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px var(--muted)' },
  healthScore: { margin: 0, fontSize: '28px', fontWeight: '800' },
  healthLabel: { margin: 0, fontSize: '12px', color: '#667085', fontWeight: '600' },
  healthMeta: { maxWidth: '280px' },
  healthStatus: { margin: '0 0 8px', fontSize: '14px', fontWeight: '700' },
  healthDesc: { margin: 0, fontSize: '13px', color: '#667085', lineHeight: 1.6 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' },
  statCard: { borderRadius: '16px', padding: '18px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.03)' },
  statValue: { margin: '0 0 4px', fontSize: '28px', fontWeight: '800' },
  statLabel: { margin: 0, fontSize: '12px', color: '#344054', fontWeight: '600' },
  statSubLabel: { margin: '6px 0 0', fontSize: '11px', color: '#667085' },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  panel: { background: '#fff', borderRadius: '18px', border: '1px solid var(--card-border)', padding: '18px', boxShadow: '0 10px 26px rgba(16, 24, 40, 0.04)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start', marginBottom: '16px' },
  panelTitle: { margin: 0, fontSize: '16px', fontWeight: '800', color: '#101828' },
  panelSubTitle: { margin: '6px 0 0', fontSize: '12px', color: '#667085' },
  panelTag: { fontSize: '11px', padding: '5px 10px', borderRadius: '999px', background: '#F2F4F7', color: '#344054', fontWeight: '700', whiteSpace: 'nowrap' },
  donutWrap: { display: 'grid', gridTemplateColumns: '140px 1fr', gap: '16px', alignItems: 'center' },
  donut: { width: '140px', height: '140px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  donutHole: { width: '94px', height: '94px', borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px var(--muted)' },
  donutValue: { margin: 0, fontSize: '24px', fontWeight: '800', color: '#101828' },
  donutText: { margin: 0, fontSize: '11px', color: '#667085', fontWeight: '600' },
  legendList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  legendItem: { display: 'grid', gridTemplateColumns: '12px 1fr auto', alignItems: 'center', gap: '10px' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%' },
  legendLabel: { fontSize: '12px', color: '#344054', fontWeight: '600' },
  legendValue: { fontSize: '12px', color: '#667085', fontWeight: '700' },
  barRow: { display: 'flex', flexDirection: 'column', gap: '8px' },
  barMeta: { display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' },
  barLabel: { fontSize: '12px', color: '#344054', fontWeight: '600' },
  barValue: { fontSize: '12px', color: '#667085', fontWeight: '700' },
  barTrack: { height: '10px', background: 'var(--muted)', borderRadius: '999px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '999px' },
  insightsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  insightCard: { background: '#fff', borderRadius: '18px', padding: '18px', border: '1px solid var(--card-border)', boxShadow: '0 10px 26px rgba(16, 24, 40, 0.04)' },
  insightTitle: { margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#101828' },
  insightContent: { display: 'flex', alignItems: 'center', gap: '12px' },
  insightAvatar: { width: '42px', height: '42px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: '#fff', minWidth: '42px' },
  insightName: { margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: '#101828' },
  insightValue: { margin: 0, fontSize: '13px', color: '#667085' },
  riskLine: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  riskName: { margin: 0, fontSize: '13px', fontWeight: '700', color: '#101828' },
  riskMeta: { margin: '2px 0 0', fontSize: '11px', color: '#667085' },
  riskPill: { fontSize: '11px', fontWeight: '800', padding: '4px 8px', borderRadius: '999px', minWidth: '34px', textAlign: 'center' },
  tableCard: { background: '#fff', borderRadius: '18px', padding: '18px', border: '1px solid var(--card-border)', marginBottom: '20px', overflowX: 'auto', boxShadow: '0 10px 26px rgba(16, 24, 40, 0.04)' },
  cardTitle: { margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: '#101828' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '860px' },
  thead: { background: 'var(--muted-2)' },
  th: { padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#667085', borderBottom: '1px solid var(--card-border)' },
  tr: { borderBottom: '1px solid #F0F4F8' },
  td: { padding: '14px', fontSize: '13px', color: '#344054' },
  memberCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '36px', height: '36px', background: 'var(--muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '800', color: 'var(--primary)', minWidth: '36px' },
  memberName: { margin: 0, fontSize: '14px', fontWeight: '700', color: '#101828' },
  memberHint: { margin: '3px 0 0', fontSize: '11px', color: '#667085' },
  youBadge: { marginLeft: '6px', fontSize: '10px', background: 'var(--muted)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '999px', fontWeight: '800' },
  roleBadge: { fontSize: '11px', background: '#F2F4F7', padding: '4px 10px', borderRadius: '999px', fontWeight: '800', textTransform: 'capitalize' },
  apPoints: { fontSize: '14px', fontWeight: '800', color: 'var(--primary)' },
  warnBadge: { fontSize: '11px', fontWeight: '800', padding: '4px 8px', borderRadius: '999px' },
  scoreBadge: { fontSize: '11px', fontWeight: '800', padding: '4px 8px', borderRadius: '999px' },
  footerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  footerCard: { background: '#fff', borderRadius: '18px', padding: '18px', border: '1px solid var(--card-border)', boxShadow: '0 10px 26px rgba(16, 24, 40, 0.04)' },
  footerTitle: { margin: '0 0 14px', fontSize: '15px', fontWeight: '800', color: '#101828' },
  footerList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  footerItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: 'var(--muted-2)', border: '1px solid var(--card-border)' },
  footerItemTitle: { margin: 0, fontSize: '13px', fontWeight: '700', color: '#101828' },
  footerItemMeta: { margin: '4px 0 0', fontSize: '11px', color: '#667085' },
  footerTag: { fontSize: '11px', padding: '4px 8px', borderRadius: '999px', background: 'var(--muted)', color: 'var(--primary)', fontWeight: '800', whiteSpace: 'nowrap' },
  emptyMini: { margin: 0, color: '#667085', fontSize: '13px' },
};

export default Analytics;