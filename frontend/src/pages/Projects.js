import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import API from '../api/axios';
import { toast } from 'react-toastify';

const categoryColor = {
  'in-progress': { bg: 'var(--warning-light)', color: 'var(--primary-dark)', label: 'In Progress' },
  completed:     { bg: 'var(--success-light)', color: 'var(--success)', label: 'Completed' },
  incomplete:    { bg: '#FFEBEE', color: 'var(--danger)', label: 'Incomplete' },
};

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', status: 'in-progress', deadline: '', memberIds: [] });

  const canCreate = ['captain', 'vice-captain', 'strategist'].includes(user?.role);

  useEffect(() => {
    fetchProjects();
    API.get('/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const fetchProjects = () => {
    API.get('/projects').then(r => setProjects(r.data)).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.memberIds.length === 0) return toast.error('Team illa na task yaar panradhu 😭');
    try {
      await API.post('/projects', form);
      toast.success('Project senjachu!');
      setShowForm(false);
      setForm({ title: '', description: '', status: 'in-progress', deadline: '', memberIds: [] });
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed!'); }
  };

  const toggleMember = (id) => {
    setForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(id)
        ? prev.memberIds.filter(memberId => memberId !== id)
        : [...prev.memberIds, id]
    }));
  };

  const handleStatusChange = async (project, status) => {
    try {
      await API.put(`/projects/${project.id}`, {
        title: project.title,
        description: project.description,
        status,
        deadline: project.deadline,
      });
      toast.success('Status updated!');
      fetchProjects();
    } catch { toast.error('Failed!'); }
  };

  const handleMemberStatusChange = async (projectId, status) => {
    try {
      await API.put(`/projects/${projectId}/member-status`, { status });
      toast.success('Un participation update aayiduchu');
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete pannunama?')) return;
    try {
      await API.delete(`/projects/${id}`);
      toast.success('Panniachu!');
      fetchProjects();
    } catch { toast.error('Mudiala!'); }
  };

  const myProjects = projects.filter(p => p.members?.some(m => m.id === user?.id) || p.created_by === user?.id);
  const displayProjects = activeTab === 'all' ? projects : myProjects;

  const inProgress = displayProjects.filter(p => p.status === 'in-progress');
  const completed = displayProjects.filter(p => p.status === 'completed');
  const incomplete = displayProjects.filter(p => p.status === 'incomplete');

  const ProjectCard = ({ project }) => {
    const isMember = project.members?.some(m => m.id === user?.id) || project.created_by === user?.id;
    return (
      <div style={styles.projectCard} className="lift-surface">
        <div style={styles.projectTop}>
          <div style={styles.projectHeader}>
            <h4 style={styles.projectTitle}>{project.title}</h4>
            <span style={{ ...styles.statusBadge, background: categoryColor[project.status]?.bg, color: categoryColor[project.status]?.color }}>
              {categoryColor[project.status]?.label}
            </span>
          </div>
          <p style={styles.projectDesc}>{project.description}</p>
        </div>

        {/* Members */}
        <div style={styles.membersRow}>
          <p style={styles.membersLabel}><Icon title="members" /> Team Members:</p>
          <div style={styles.memberList}>
            {(project.members || []).map(m => {
              const isMine = m.id === user?.id;
              const isCompleted = (m.member_status || 'in-progress') === 'completed';
              return (
                <div key={m.id} style={styles.memberRow}>
                  <span style={styles.memberNameTag}>{m.name}</span>
                  <div style={styles.memberRight}>
                    {isMine ? (
                      <button
                        type="button"
                        className="lift-button"
                        style={{ ...styles.memberStatusTag, cursor: 'pointer', border: 'none', background: isCompleted ? 'var(--success-light)' : 'var(--warning-light)', color: isCompleted ? 'var(--success)' : 'var(--primary-dark)' }}
                        onClick={() => handleMemberStatusChange(project.id, isCompleted ? 'in-progress' : 'completed')}
                        aria-pressed={isCompleted}
                      >
                        {isCompleted ? 'Completed' : 'In Progress'}
                      </button>
                    ) : (
                      <span style={{ ...styles.memberStatusTag, background: isCompleted ? 'var(--success-light)' : 'var(--warning-light)', color: isCompleted ? 'var(--success)' : 'var(--primary-dark)' }}>
                        {isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.projectMeta}>
          <span style={styles.metaItem}><Icon title="user" /> Created by {project.created_by_name}</span>
          {project.deadline && <span style={styles.metaItem}><Icon title="calendar" /> {new Date(project.deadline).toLocaleDateString('en-IN')}</span>}
        </div>

        {canCreate && (
          <div style={styles.projectFooter}>
            <button style={styles.deleteBtn} onClick={() => handleDelete(project.id)}><Icon title="delete" /> Delete</button>
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, items, color }) => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={{ ...styles.sectionTitle, color }}>{title}</h3>
        <span style={{ ...styles.countBadge, background: color + '18', color }}>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div style={styles.emptyBox}><p style={styles.emptyText}>No projects here yet.</p></div>
      ) : (
        <div style={styles.projectGrid}>
          {items.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Projects <Icon title="folder" /></h1>
            <p style={styles.subheading}>Track all team projects and contributions</p>
          </div>
          {canCreate && (
            <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? <><Icon title="close" /> Cancel</> : <><Icon title="add" /> New Project</>}
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total', value: projects.length, color: 'var(--primary)', bg: 'var(--muted)' },
            { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: 'var(--success)', bg: 'var(--success-light)' },
            { label: 'In Progress', value: projects.filter(p => p.status === 'in-progress').length, color: 'var(--primary-dark)', bg: 'var(--warning-light)' },
            { label: 'Incomplete', value: projects.filter(p => p.status === 'incomplete').length, color: 'var(--danger)', bg: '#FFEBEE' },
          ].map(s => (
            <div key={s.label} style={{ ...styles.statCard, background: s.bg }}>
              <p style={{ ...styles.statValue, color: s.color }}>{s.value}</p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Create Form */}
        {showForm && canCreate && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Create New Project</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Project Title</label>
                  <input style={styles.input} placeholder="Enter project title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Status</label>
                  <select style={styles.input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="incomplete">Incomplete</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Deadline</label>
                  <input style={styles.input} type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                </div>
                <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Description</label>
                  <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }} placeholder="What is this project about?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Assign Members (select all who will work on this)</label>
                  <div style={styles.membersGrid}>
                    {users.map(u => (
                      <div
                        key={u.id}
                        style={{
                          ...styles.memberCheckItem,
                          background: form.memberIds.includes(u.id) ? 'var(--muted)' : 'var(--muted-2)',
                          border: form.memberIds.includes(u.id) ? '1.5px solid var(--primary)' : '1.5px solid var(--card-border)'
                        }}
                        onClick={() => toggleMember(u.id)}
                      >
                        <div style={styles.memberCheckAvatar}>{u.name?.charAt(0)}</div>
                        <div>
                          <p style={styles.memberCheckName}>{u.name}</p>
                          <p style={styles.memberCheckRole}>{u.role}</p>
                        </div>
                        {form.memberIds.includes(u.id) && <span style={styles.checkmark}><Icon title="check" /></span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button style={styles.submitBtn} type="submit">Create Project</button>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={{ ...styles.tab, borderBottom: activeTab === 'all' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'all' ? 'var(--primary)' : 'var(--muted-text)' }}
            onClick={() => setActiveTab('all')}>All Projects ({projects.length})</button>
          <button style={{ ...styles.tab, borderBottom: activeTab === 'mine' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'mine' ? 'var(--primary)' : 'var(--muted-text)' }}
            onClick={() => setActiveTab('mine')}>My Projects ({myProjects.length})</button>
        </div>

        <Section title={<><Icon title="inprogress" /> In Progress</>} items={inProgress} color="var(--primary-dark)" />
        <Section title={<><Icon title="check" /> Completed</>} items={completed} color="var(--success)" />
        <Section title={<><Icon title="close" /> Incomplete</>} items={incomplete} color="var(--danger)" />
      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: '1100px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  heading: { margin: '0 0 6px', fontSize: '26px', fontWeight: '700', color: '#1A1A2E' },
  subheading: { margin: 0, color: 'var(--muted-text)', fontSize: '14px' },
  addBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: '120px', borderRadius: '12px', padding: '20px', textAlign: 'center' },
  statValue: { margin: '0 0 4px', fontSize: '28px', fontWeight: '700' },
  statLabel: { margin: 0, fontSize: '13px', color: 'var(--muted-text)', fontWeight: '500' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)', marginBottom: '24px' },
  formTitle: { margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#333' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' },
  field: { display: 'flex', flexDirection: 'column', marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--card-border)', fontSize: '14px', outline: 'none', background: 'var(--muted-2)', fontFamily: "'Segoe UI', sans-serif" },
  membersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' },
  memberCheckItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', cursor: 'pointer' },
  memberCheckAvatar: { width: '34px', height: '34px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', minWidth: '34px' },
  memberCheckName: { margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: '#333' },
  memberCheckRole: { margin: 0, fontSize: '11px', color: 'var(--muted-text)', textTransform: 'capitalize' },
  checkmark: { marginLeft: 'auto', color: 'var(--primary)', fontWeight: '700' },
  submitBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  tabs: { display: 'flex', borderBottom: '1px solid var(--card-border)', marginBottom: '24px' },
  tab: { padding: '10px 20px', background: 'none', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  section: { marginBottom: '32px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: '600' },
  countBadge: { fontSize: '13px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px' },
  projectGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  projectCard: { background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 10px 26px rgba(15,23,42,0.06)', minHeight: '160px', transition: 'transform 160ms ease, box-shadow 160ms ease' },
  projectTop: {},
  projectHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' },
  projectTitle: { margin: 0, fontSize: '15px', fontWeight: '600', color: '#1A1A2E' },
  statusBadge: { fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap' },
  projectDesc: { margin: 0, fontSize: '13px', color: 'var(--muted-text)', lineHeight: '1.4' },
  membersRow: { background: 'var(--muted-2)', borderRadius: '8px', padding: '10px' },
  membersLabel: { margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: 'var(--muted-text)' },
  memberList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  memberRow: { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '12px' },
  memberNameTag: { fontSize: '13px', background: 'var(--muted-2)', color: 'var(--primary)', padding: '6px 10px', borderRadius: '10px', fontWeight: '600' },
  memberRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  memberStatusTag: { fontSize: '12px', padding: '6px 10px', borderRadius: '10px', fontWeight: '700', minWidth: '110px', textAlign: 'center' },
  memberStatusBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginLeft: '12px' },
  projectMeta: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  metaItem: { fontSize: '12px', color: 'var(--muted-text)' },
  projectFooter: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center' },
  deleteBtn: { background: '#FFEBEE', color: 'var(--danger)', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  emptyBox: { background: 'var(--muted-2)', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px dashed var(--card-border)' },
  emptyText: { margin: 0, color: 'var(--muted-text)', fontSize: '13px' },
};

export default Projects;