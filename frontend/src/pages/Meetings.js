import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Meetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', meeting_link: '', scheduled_at: '' });

  const canCreate = user?.role === 'captain' || user?.role === 'vice-captain';

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = () => {
    API.get('/meetings').then(r => setMeetings(r.data)).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/meetings', form);
      toast.success('Meeting scheduled!');
      setShowForm(false);
      setForm({ title: '', description: '', meeting_link: '', scheduled_at: '' });
      fetchMeetings();
    } catch { toast.error('Failed to schedule meeting!'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meeting?')) return;
    try {
      await API.delete(`/meetings/${id}`);
      toast.success('Meeting deleted!');
      fetchMeetings();
    } catch { toast.error('Failed!'); }
  };

  const upcoming = meetings.filter(m => new Date(m.scheduled_at) >= new Date());
  const past = meetings.filter(m => new Date(m.scheduled_at) < new Date());

  const MeetingCard = ({ meeting }) => (
    <div style={styles.meetingCard}>
      <div style={styles.meetingLeft}>
        <div style={styles.meetingDateBox}>
          <p style={styles.meetingDay}>{new Date(meeting.scheduled_at).toLocaleDateString('en-IN', { day: '2-digit' })}</p>
          <p style={styles.meetingMonth}>{new Date(meeting.scheduled_at).toLocaleDateString('en-IN', { month: 'short' })}</p>
        </div>
      </div>
      <div style={styles.meetingInfo}>
        <h4 style={styles.meetingTitle}>{meeting.title}</h4>
        <p style={styles.meetingDesc}>{meeting.description}</p>
        <div style={styles.meetingMeta}>
          <span style={styles.metaItem}>🕐 {new Date(meeting.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          <span style={styles.metaItem}>👤 {meeting.created_by_name}</span>
        </div>
      </div>
      <div style={styles.meetingActions}>
        {meeting.meeting_link && (
          <a href={meeting.meeting_link} target="_blank" rel="noreferrer" style={styles.joinBtn}>
            Join Meet 🔗
          </a>
        )}
        {canCreate && (
          <button style={styles.deleteBtn} onClick={() => handleDelete(meeting.id)}>🗑️</button>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Meetings 📅</h1>
            <p style={styles.subheading}>
              {canCreate ? 'Schedule and manage team meetings' : 'View upcoming team meetings'}
            </p>
          </div>
          {canCreate && (
            <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ Schedule Meeting'}
            </button>
          )}
        </div>

        {showForm && canCreate && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Schedule New Meeting</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Meeting Title</label>
                  <input style={styles.input} placeholder="e.g. Weekly Standup" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Date & Time</label>
                  <input style={styles.input} type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} required />
                </div>
                <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Google Meet Link</label>
                  <input style={styles.input} placeholder="https://meet.google.com/xxx-xxxx-xxx" value={form.meeting_link} onChange={e => setForm({ ...form, meeting_link: e.target.value })} />
                </div>
                <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Description / Agenda</label>
                  <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }} placeholder="Meeting agenda or notes" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <button style={styles.submitBtn} type="submit">Schedule Meeting</button>
            </form>
          </div>
        )}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔔 Upcoming Meetings</h3>
          {upcoming.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyIcon}>📅</p>
              <p style={styles.emptyTitle}>No upcoming meetings!</p>
              <p style={styles.emptyText}>
                {canCreate ? 'Schedule a meeting using the button above.' : 'No meetings scheduled yet. Check back later!'}
              </p>
            </div>
          ) : upcoming.map(m => <MeetingCard key={m.id} meeting={m} />)}
        </div>

        {past.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📂 Past Meetings</h3>
            {past.map(m => <MeetingCard key={m.id} meeting={m} />)}
          </div>
        )}
      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: '1100px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
  heading: { margin: '0 0 6px', fontSize: '26px', fontWeight: '700', color: '#1A1A2E' },
  subheading: { margin: 0, color: '#888', fontSize: '14px' },
  addBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #E8EDF5', marginBottom: '28px' },
  formTitle: { margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#333' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #D0DCF0', fontSize: '14px', color: '#333', outline: 'none', background: '#FAFCFF', fontFamily: "'Segoe UI', sans-serif" },
  submitBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  section: { marginBottom: '32px' },
  sectionTitle: { margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#333' },
  meetingCard: { background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #E8EDF5', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' },
  meetingLeft: {},
  meetingDateBox: { width: '56px', height: '56px', background: '#E3F0FF', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  meetingDay: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#1565C0' },
  meetingMonth: { margin: 0, fontSize: '11px', color: '#1565C0', fontWeight: '600', textTransform: 'uppercase' },
  meetingInfo: { flex: 1 },
  meetingTitle: { margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: '#1A1A2E' },
  meetingDesc: { margin: '0 0 8px', fontSize: '13px', color: '#888' },
  meetingMeta: { display: 'flex', gap: '16px' },
  metaItem: { fontSize: '12px', color: '#666' },
  meetingActions: { display: 'flex', gap: '8px', alignItems: 'center' },
  joinBtn: { background: '#E8F5E9', color: '#2E7D32', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' },
  deleteBtn: { background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' },
  emptyBox: { background: '#F8FAFF', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px dashed #D0DCF0' },
  emptyIcon: { fontSize: '36px', margin: '0 0 8px' },
  emptyTitle: { margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#555' },
  emptyText: { margin: 0, fontSize: '13px', color: '#aaa' },
};

export default Meetings;