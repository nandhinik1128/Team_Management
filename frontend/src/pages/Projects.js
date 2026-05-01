import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api/axios';
import { toast } from 'react-toastify';

const categoryColor = {
  'in-progress': { bg: '#FFF3E0', color: '#E65100', label: 'In Progress' },
  completed:     { bg: '#E8F5E9', color: '#2E7D32', label: 'Completed' },
  incomplete:    { bg: '#FFEBEE', color: '#C62828', label: 'Incomplete' },
};

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', status: 'in-progress', deadline: '', memberIds: [] });

  const canCreate = ['captain', 'vice-captain'].includes(user?.role);

  useEffect(() => {
    fetchProjects();
    API.get('/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const fetchProjects = () => {
    API.get('/projects').then(r => setProjects(r.data)).catch(() => {});
  };

  const toggleMember = (id) => {
    setForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(id)
        ? prev.memberIds.filter(m => m !== id)
        : [...prev.memberIds, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.memberIds.length === 0) return toast.error('Select at least one member!');
    try {
      await API.post('/projects', form);
      toast.success('Project created!');
      setShowForm(false);
      setForm({ title: '', description: '', status: 'in-progress', deadline: '', memberIds: [] });
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed!'); }
  };

  const handleStatusChange = async (project, status) => {
    try {
      await API.put(`/projects/${project.id}`, { ...project, status });
      toast.success('Status updated!');
      fetchProjects();
    } catch { toast.error('Failed!'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await API.delete(`/projects/${id}`);
      toast.success('Deleted!');
      fetchProjects();
    } catch { toast.error('Failed!'); }
  };

  const myProjects = projects.filter(p => p.members?.some(m => m.id === user?.id) || p.created_by === user?.id);
  const displayProjects = activeTab === 'all' ? projects : myProjects;

  const inProgress = displayProjects.filter(p => p.status === 'in-progress');
  const completed = displayProjects.filter(p => p.status === 'completed');
  const incomplete = displayProjects.filter(p => p.status === 'incomplete');

  const ProjectCard = ({ project }) => {
    const isMember = project.members?.some(m => m.id === user?.id) || project.created_by === user?.id;
    return (
      <div style={styles.projectCard}>
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
          <p style={styles.membersLabel}>👥 Team Members:</p>
          <div style={styles.memberAvatars}>
            {(project.members || []).map(m => (
              <div key={m.id} title={m.name} style={{ ...styles.memberAvatar, background: m.id === user?.id ? '#1565C0' : '#E3F0FF', color: m.id === user?.id ? '#fff' : '#1565C0' }}>
                {m.name?.charAt(0)}
              </div>
            ))}
          </div>
          <div style={styles.memberNames}>
            {(project.members || []).map(m => (
              <span key={m.id} style={styles.memberNameTag}>{m.name?.split(' ')[0]}</span>
            ))}
          </div>
        </div>

        <div style={styles.projectMeta}>
          <span style={styles.metaItem}>👤 Created by {project.created_by_name}</span>
          {project.deadline && <span style={styles.metaItem}>📅 {new Date(project.deadline).toLocaleDateString('en-IN')}</span>}
        </div>

        {isMember && (
          <div style={styles.projectFooter}>
            <select style={styles.statusSelect} value={project.status}
              onChange={e => handleStatusChange(project, e.target.value)}>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
            {canCreate && (
              <button style={styles.deleteBtn} onClick={() => handleDelete(project.id)}>🗑️ Delete</button>
            )}
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
            <h1 style={styles.heading}>Projects 📁</h1>
            <p style={styles.subheading}>Track all team projects and contributions</p>
          </div>
          {canCreate && (
            <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ New Project'}
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total', value: projects.length, color: '#1565C0', bg: '#E3F0FF' },
            { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#2E7D32', bg: '#E8F5E9' },
            { label: 'In Progress', value: projects.filter(p => p.status === 'in-progress').length, color: '#E65100', bg: '#FFF3E0' },
            { label: 'Incomplete', value: projects.filter(p => p.status === 'incomplete').length, color: '#C62828', bg: '#FFEBEE' },
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
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Assign Members (select all who will work on this)</label>
                <div style={styles.membersGrid}>
                  {users.map(u => (
                    <div key={u.id} style={{ ...styles.memberCheckItem, background: form.memberIds.includes(u.id) ? '#E3F0FF' : '#F8FAFF', border: form.memberIds.includes(u.id) ? '1.5px solid #1565C0' : '1.5px solid #E8EDF5' }}
                      onClick={() => toggleMember(u.id)}>
                      <div style={styles.memberCheckAvatar}>{u.name?.charAt(0)}</div>
                      <div>
                        <p style={styles.memberCheckName}>{u.name}</p>
                        <p style={styles.memberCheckRole}>{u.role}</p>
                      </div>
                      {form.memberIds.includes(u.id) && <span style={styles.checkmark}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
              <button style={styles.submitBtn} type="submit">Create Project</button>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={{ ...styles.tab, borderBottom: activeTab === 'all' ? '2px solid #1565C0' : '2px solid transparent', color: activeTab === 'all' ? '#1565C0' : '#888' }}
            onClick={() => setActiveTab('all')}>All Projects ({projects.length})</button>
          <button style={{ ...styles.tab, borderBottom: activeTab === 'mine' ? '2px solid #1565C0' : '2px solid transparent', color: activeTab === 'mine' ? '#1565C0' : '#888' }}
            onClick={() => setActiveTab('mine')}>My Projects ({myProjects.length})</button>
        </div>

        <Section title="🔄 In Progress" items={inProgress} color="#E65100" />
        <Section title="✅ Completed" items={completed} color="#2E7D32" />
        <Section title="❌ Incomplete" items={incomplete} color="#C62828" />
      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: '1100px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  heading: { margin: '0 0 6px', fontSize: '26px', fontWeight: '700', color: '#1A1A2E' },
  subheading: { margin: 0, color: '#888', fontSize: '14px' },
  addBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: '120px', borderRadius: '12px', padding: '20px', textAlign: 'center' },
  statValue: { margin: '0 0 4px', fontSize: '28px', fontWeight: '700' },
  statLabel: { margin: 0, fontSize: '13px', color: '#555', fontWeight: '500' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #E8EDF5', marginBottom: '24px' },
  formTitle: { margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#333' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' },
  field: { display: 'flex', flexDirection: 'column', marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #D0DCF0', fontSize: '14px', outline: 'none', background: '#FAFCFF', fontFamily: "'Segoe UI', sans-serif" },
  membersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' },
  memberCheckItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', cursor: 'pointer' },
  memberCheckAvatar: { width: '34px', height: '34px', background: '#1565C0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', minWidth: '34px' },
  memberCheckName: { margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: '#333' },
  memberCheckRole: { margin: 0, fontSize: '11px', color: '#888', textTransform: 'capitalize' },
  checkmark: { marginLeft: 'auto', color: '#1565C0', fontWeight: '700' },
  submitBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  tabs: { display: 'flex', borderBottom: '1px solid #E8EDF5', marginBottom: '24px' },
  tab: { padding: '10px 20px', background: 'none', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  section: { marginBottom: '32px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: '600' },
  countBadge: { fontSize: '13px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px' },
  projectGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' },
  projectCard: { background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #E8EDF5', display: 'flex', flexDirection: 'column', gap: '12px' },
  projectTop: {},
  projectHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' },
  projectTitle: { margin: 0, fontSize: '15px', fontWeight: '600', color: '#1A1A2E' },
  statusBadge: { fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap' },
  projectDesc: { margin: 0, fontSize: '13px', color: '#888', lineHeight: '1.4' },
  membersRow: { background: '#F8FAFF', borderRadius: '8px', padding: '10px' },
  membersLabel: { margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: '#555' },
  memberAvatars: { display: 'flex', gap: '4px', marginBottom: '6px' },
  memberAvatar: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' },
  memberNames: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  memberNameTag: { fontSize: '11px', background: '#E3F0FF', color: '#1565C0', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' },
  projectMeta: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  metaItem: { fontSize: '12px', color: '#666' },
  projectFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusSelect: { padding: '6px 12px', borderRadius: '20px', border: '1.5px solid #D0DCF0', fontSize: '12px', fontWeight: '600', cursor: 'pointer', outline: 'none' },
  deleteBtn: { background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  emptyBox: { background: '#F8FAFF', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px dashed #D0DCF0' },
  emptyText: { margin: 0, color: '#aaa', fontSize: '13px' },
};

export default Projects;