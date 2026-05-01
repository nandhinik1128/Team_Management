import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Polls = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [showVoters, setShowVoters] = useState(null);

  const canCreate = ['captain', 'vice-captain'].includes(user?.role);

  useEffect(() => { fetchPolls(); }, []);

  const fetchPolls = () => {
    API.get('/polls').then(r => setPolls(r.data)).catch(() => {});
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) return toast.error('Add at least 2 options!');
    try {
      await API.post('/polls', { question, options: validOptions });
      toast.success('Poll created!');
      setShowForm(false);
      setQuestion('');
      setOptions(['', '']);
      fetchPolls();
    } catch { toast.error('Failed!'); }
  };

  const handleVote = async (pollId, optionId) => {
    try {
      await API.post(`/polls/${pollId}/vote`, { option_id: optionId });
      toast.success('Vote updated!');
      fetchPolls();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed!');
    }
  };

  const getTotalVotes = (options) =>
    options.reduce((sum, o) => sum + Number(o.votes || 0), 0);

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Polls & Voting 🗳️</h1>
            <p style={styles.subheading}>Vote on team decisions</p>
          </div>
          {canCreate && (
            <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ Create Poll'}
            </button>
          )}
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Create New Poll</h3>
            <form onSubmit={handleCreate}>
              <div style={styles.field}>
                <label style={styles.label}>Question</label>
                <input style={styles.input} placeholder="Ask your question..."
                  value={question} onChange={e => setQuestion(e.target.value)} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Options</label>
                {options.map((opt, i) => (
                  <div key={i} style={styles.optionRow}>
                    <input style={styles.input} placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={e => {
                        const o = [...options];
                        o[i] = e.target.value;
                        setOptions(o);
                      }} />
                    {options.length > 2 && (
                      <button type="button" style={styles.removeBtn}
                        onClick={() => setOptions(options.filter((_, idx) => idx !== i))}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" style={styles.addOptionBtn}
                  onClick={() => setOptions([...options, ''])}>
                  + Add Option
                </button>
              </div>
              <button style={styles.submitBtn} type="submit">Create Poll</button>
            </form>
          </div>
        )}

        <div style={styles.pollsList}>
          {polls.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyIcon}>🗳️</p>
              <p style={styles.emptyTitle}>No polls yet!</p>
              <p style={styles.emptyText}>
                {canCreate ? 'Create a poll to get team input.' : 'No polls created yet.'}
              </p>
            </div>
          ) : polls.map(poll => {
            const total = getTotalVotes(poll.options || []);
            const myVote = poll.my_vote;
            return (
              <div key={poll.id} style={styles.pollCard}>
                <div style={styles.pollHeader}>
                  <h3 style={styles.pollQuestion}>{poll.question}</h3>
                  <span style={styles.totalVotes}>{total} votes total</span>
                </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
  <p style={{ ...styles.pollMeta, margin: 0 }}>By {poll.created_by_name}</p>
  {canCreate && (
    <button style={{ background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
      onClick={async () => {
        if (!window.confirm('Delete this poll?')) return;
        try {
          await API.delete(`/polls/${poll.id}`);
          toast.success('Poll deleted!');
          fetchPolls();
        } catch { toast.error('Failed!'); }
      }}>
      🗑️ Delete
    </button>
  )}
</div>

                <div style={styles.optionsList}>
                  {(poll.options || []).map(opt => {
                    const pct = total > 0 ? Math.round((Number(opt.votes) / total) * 100) : 0;
                    const isMyVote = myVote === opt.id;
                    const voters = opt.voter_names ? opt.voter_names.split(', ') : [];
                    return (
                      <div key={opt.id} style={{ ...styles.optionItem, border: isMyVote ? '1.5px solid #1565C0' : '1.5px solid #E8EDF5', background: isMyVote ? '#F0F7FF' : '#F8FAFF' }}>
                        <div style={styles.optionTop}>
                          <span style={styles.optionText}>{opt.option_text}</span>
                          <div style={styles.optionRight}>
                            <span style={{ ...styles.optionPct, color: isMyVote ? '#1565C0' : '#888' }}>
                              {pct}%
                            </span>
                            {isMyVote && <span style={styles.myVoteBadge}>✓ Your vote</span>}
                          </div>
                        </div>

                        <div style={styles.progressBar}>
                          <div style={{ ...styles.progressFill, width: `${pct}%`, background: isMyVote ? '#1565C0' : '#90CAF9' }} />
                        </div>

                        <div style={styles.optionBottom}>
                          <div style={styles.votersList}>
                            {voters.slice(0, 3).map((name, i) => (
                              <span key={i} style={styles.voterTag}>{name}</span>
                            ))}
                            {voters.length > 3 && (
                              <span style={styles.moreVoters}>+{voters.length - 3} more</span>
                            )}
                            {voters.length === 0 && (
                              <span style={styles.noVoters}>No votes yet</span>
                            )}
                          </div>
                          <button
                            style={{ ...styles.voteBtn, background: isMyVote ? '#1565C0' : '#E3F0FF', color: isMyVote ? '#fff' : '#1565C0' }}
                            onClick={() => handleVote(poll.id, opt.id)}>
                            {isMyVote ? '✓ Voted' : 'Vote'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: '800px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  heading: { margin: '0 0 6px', fontSize: '26px', fontWeight: '700', color: '#1A1A2E' },
  subheading: { margin: 0, color: '#888', fontSize: '14px' },
  addBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #E8EDF5', marginBottom: '24px' },
  formTitle: { margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#333' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #D0DCF0', fontSize: '14px', outline: 'none', background: '#FAFCFF', boxSizing: 'border-box', fontFamily: "'Segoe UI', sans-serif" },
  optionRow: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' },
  removeBtn: { background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontWeight: '700' },
  addOptionBtn: { background: '#E3F0FF', color: '#1565C0', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' },
  submitBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  pollsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  pollCard: { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #E8EDF5' },
  pollHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '4px' },
  pollQuestion: { margin: 0, fontSize: '17px', fontWeight: '700', color: '#1A1A2E', flex: 1 },
  totalVotes: { fontSize: '12px', background: '#E3F0FF', color: '#1565C0', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', whiteSpace: 'nowrap' },
  pollMeta: { margin: '0 0 20px', fontSize: '12px', color: '#888' },
  optionsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  optionItem: { borderRadius: '10px', padding: '14px', transition: 'all 0.2s' },
  optionTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  optionText: { fontSize: '14px', fontWeight: '500', color: '#333' },
  optionRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  optionPct: { fontSize: '14px', fontWeight: '700' },
  myVoteBadge: { fontSize: '11px', background: '#1565C0', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' },
  progressBar: { height: '6px', background: '#E8EDF5', borderRadius: '3px', marginBottom: '10px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  optionBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  votersList: { display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 },
  voterTag: { fontSize: '11px', background: '#E3F0FF', color: '#1565C0', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' },
  moreVoters: { fontSize: '11px', color: '#888', fontStyle: 'italic' },
  noVoters: { fontSize: '11px', color: '#aaa', fontStyle: 'italic' },
  voteBtn: { border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
};

export default Polls;