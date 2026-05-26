import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '' });

  const canCreate = ['captain', 'vice-captain', 'manager'].includes(user?.role);

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = () => {
    API.get('/announcements').then(r => setAnnouncements(r.data)).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/announcements', form);
      toast.success('Announcement posted!');
      setShowForm(false);
      setForm({ title: '', message: '' });
      fetchAnnouncements();
    } catch { toast.error('Failed!'); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/announcements/${id}`);
      toast.success('Deleted!');
      fetchAnnouncements();
    } catch { toast.error('Failed!'); }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Announcements <Icon title="pin" /></h1>
            <p style={styles.subheading}>Important notices from team leadership</p>
          </div>
          {canCreate && (
            <button style={styles.addBtn} className="lift-button playful-button" onClick={() => setShowForm(!showForm)}>
              {showForm ? <><Icon title="close" /> Cancel</> : <><Icon title="add" /> Post Announcement</>}
            </button>
          )}
        </div>

        {showForm && (
          <div style={styles.formCard} className="lift-surface">
            <h3 style={styles.formTitle}>Post New Announcement</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Title</label>
                <input style={styles.input} className="lift-input" placeholder="Announcement title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Message</label>
                <textarea style={{ ...styles.input, height: '100px', resize: 'vertical' }} className="lift-input" placeholder="Write your announcement here..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              </div>
              <button style={styles.submitBtn} className="lift-button playful-button" type="submit">Post Announcement</button>
            </form>
          </div>
        )}

        <div style={styles.list}>
          {announcements.length === 0 ? (
            <div style={styles.emptyBox} className="lift-surface">
              <p style={styles.emptyIcon}><Icon title="pin" /></p>
              <p style={styles.emptyTitle}>No announcements yet!</p>
              <p style={styles.emptyText}>Important notices will appear here.</p>
            </div>
          ) : announcements.map(a => (
            <div key={a.id} style={styles.card} className="lift-surface">
              <div style={styles.cardLeft}>
                <div style={styles.pinIcon}><Icon title="pin" /></div>
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{a.title}</h3>
                <p style={styles.cardMessage}>{a.message}</p>
                <p style={styles.cardMeta}>Posted by {a.created_by_name} · {new Date(a.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              {canCreate && (
                <button style={styles.deleteBtn} className="lift-button" onClick={() => handleDelete(a.id)}><Icon title="delete" /></button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: '900px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' },
  heading: { margin: '0 0 6px', fontSize: '26px', fontWeight: '700', color: '#1A1A2E' },
  subheading: { margin: 0, color: 'var(--muted-text)', fontSize: '14px' },
  addBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  formCard: { background: 'var(--card-bg)', borderRadius: '12px', padding: '26px', border: '1px solid var(--card-border)', marginBottom: '24px' },
  formTitle: { margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#333' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--card-border)', fontSize: '14px', outline: 'none', background: 'var(--muted-2)', boxSizing: 'border-box', fontFamily: "'Segoe UI', sans-serif" },
  submitBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: '14px' },
  card: { background: 'var(--card-bg)', borderRadius: '12px', padding: '22px', border: '1px solid var(--card-border)', borderLeft: '4px solid var(--primary)', display: 'flex', gap: '16px', alignItems: 'flex-start' },
  cardLeft: {},
  pinIcon: { fontSize: '24px' },
  cardContent: { flex: 1 },
  cardTitle: { margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#1A1A2E' },
  cardMessage: { margin: '0 0 10px', fontSize: '14px', color: 'var(--muted-text)', lineHeight: '1.6' },
  cardMeta: { margin: 0, fontSize: '12px', color: 'var(--muted-text)' },
  deleteBtn: { background: '#FFEBEE', color: 'var(--danger)', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' },
  emptyBox: { background: 'var(--muted-2)', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px dashed var(--card-border)' },
  emptyIcon: { fontSize: '36px', margin: '0 0 8px' },
  emptyTitle: { margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: 'var(--muted-text)' },
  emptyText: { margin: 0, fontSize: '13px', color: 'var(--muted-text)' },
};

export default Announcements;