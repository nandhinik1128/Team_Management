import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: index * 0.05,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const optionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      delay: index * 0.045,
      ease: 'easeOut',
    },
  }),
};

const Polls = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const canCreate = ['captain', 'vice-captain'].includes(user?.role);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = () => {
    API.get('/polls').then(r => setPolls(r.data || [])).catch(() => {});
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const validOptions = options.filter(option => option.trim());
    if (validOptions.length < 2) return toast.error('Add at least 2 options!');
    try {
      await API.post('/polls', { question, options: validOptions });
      toast.success('Poll created!');
      setShowForm(false);
      setQuestion('');
      setOptions(['', '']);
      fetchPolls();
    } catch {
      toast.error('Failed!');
    }
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

  const getTotalVotes = (pollOptions) => pollOptions.reduce((sum, option) => sum + Number(option.votes || 0), 0);

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Polls & Voting <Icon title="poll" /></h1>
            <p style={styles.subheading}>Vote on team decisions</p>
          </div>
          {canCreate && (
            <button
              style={styles.addBtn}
              className="lift-button playful-button"
              onClick={() => setShowForm(previous => !previous)}
            >
              {showForm ? <><Icon title="close" /> Cancel</> : <><Icon title="add" /> Create Poll</>}
            </button>
          )}
        </div>

        {showForm && (
          <div style={styles.formCard} className="lift-surface">
            <h3 style={styles.formTitle}>Create New Poll</h3>
            <form onSubmit={handleCreate}>
              <div style={styles.field}>
                <label style={styles.label}>Question</label>
                <input
                  style={styles.input}
                  className="lift-input"
                  placeholder="Ask your question..."
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Options</label>
                {options.map((option, index) => (
                  <div key={index} style={styles.optionRow}>
                    <input
                      style={styles.input}
                      className="lift-input"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={e => {
                        const nextOptions = [...options];
                        nextOptions[index] = e.target.value;
                        setOptions(nextOptions);
                      }}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        style={styles.removeBtn}
                        onClick={() => setOptions(options.filter((_, optionIndex) => optionIndex !== index))}
                      >
                        <Icon title="close" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  style={styles.addOptionBtn}
                  className="lift-button playful-button"
                  onClick={() => setOptions([...options, ''])}
                >
                  <Icon title="add" /> Add Option
                </button>
              </div>
              <button style={styles.submitBtn} className="lift-button playful-button" type="submit">Create Poll</button>
            </form>
          </div>
        )}

        <div style={styles.pollsList}>
          {polls.length === 0 ? (
            <div style={styles.emptyBox} className="lift-surface">
              <p style={styles.emptyIcon}><Icon title="poll" /></p>
              <p style={styles.emptyTitle}>No polls yet!</p>
              <p style={styles.emptyText}>
                {canCreate ? 'Create a poll to get team input.' : 'No polls created yet.'}
              </p>
            </div>
          ) : polls.map((poll, pollIndex) => {
            const total = getTotalVotes(poll.options || []);
            const myVote = poll.my_vote;

            return (
              <motion.div
                key={poll.id}
                style={styles.pollCard}
                className="lift-surface"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2, margin: '120px 0px 120px 0px' }}
                custom={pollIndex}
                whileHover={{ y: -4 }}
              >
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
                  {(poll.options || []).map((option, optionIndex) => {
                    const pct = total > 0 ? Math.round((Number(option.votes) / total) * 100) : 0;
                    const isMyVote = myVote === option.id;
                    const voters = option.voter_names ? option.voter_names.split(', ') : [];

                    return (
                      <motion.div
                        key={option.id}
                        style={{
                          ...styles.optionItem,
                          border: isMyVote ? '1.5px solid var(--primary)' : '1.5px solid var(--card-border)',
                          background: isMyVote ? 'linear-gradient(180deg, #F6FAFF, #EFF6FF)' : 'linear-gradient(180deg, #FFFFFF, #F8FAFC)',
                        }}
                        variants={optionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        custom={optionIndex}
                        whileHover={{ y: -2, scale: 1.01 }}
                      >
                        <div style={styles.optionTop}>
                          <span style={styles.optionText}>{option.option_text}</span>
                          <div style={styles.optionRight}>
                            <span style={{ ...styles.optionPct, color: isMyVote ? 'var(--primary)' : 'var(--muted-text)' }}>
                              {pct}%
                            </span>
                            {isMyVote && (
                              <span style={styles.myVoteBadge}><Icon title="check" /> Your vote</span>
                            )}
                          </div>
                        </div>

                        <div style={styles.progressBar}>
                          <motion.div
                            style={{
                              ...styles.progressFill,
                              background: isMyVote
                                ? 'linear-gradient(90deg, var(--primary), #4F8DFF)'
                                : 'linear-gradient(90deg, #7AB8FF, #A6D4FF)',
                            }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 + optionIndex * 0.03 }}
                          />
                        </div>

                        <div style={styles.optionBottom}>
                          <div style={styles.votersList}>
                            {voters.slice(0, 3).map((name, voterIndex) => (
                              <span key={voterIndex} style={styles.voterTag}>{name}</span>
                            ))}
                            {voters.length > 3 && (
                              <span style={styles.moreVoters}>+{voters.length - 3} more</span>
                            )}
                            {voters.length === 0 && (
                              <span style={styles.noVoters}>No votes yet</span>
                            )}
                          </div>
                          <button
                            className="lift-button playful-button"
                            style={{
                              ...styles.voteBtn,
                              background: isMyVote ? 'var(--primary)' : 'var(--muted)',
                              color: isMyVote ? '#fff' : 'var(--primary)',
                            }}
                            onClick={() => handleVote(poll.id, option.id)}
                          >
                            {isMyVote ? <><Icon title="check" /> Voted</> : 'Vote'}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: { width: '70%', maxWidth: '70%', margin: '0 auto', padding: '0 8px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '18px' },
  heading: { margin: '0 0 6px', fontSize: '30px', fontWeight: '800', color: '#101828', letterSpacing: '-0.02em' },
  subheading: { margin: 0, color: 'var(--muted-text)', fontSize: '14px' },
  addBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '999px', padding: '10px 16px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 12px 22px rgba(15, 23, 42, 0.1)' },
  formCard: { background: 'linear-gradient(180deg, #FFFFFF, #FBFDFF)', borderRadius: '22px', padding: '30px 34px', border: '1px solid rgba(148, 163, 184, 0.28)', marginBottom: '28px', boxShadow: '0 18px 46px rgba(15, 23, 42, 0.08)' },
  formTitle: { margin: '0 0 20px', fontSize: '20px', fontWeight: '800', color: '#101828', letterSpacing: '-0.01em' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#344054', marginBottom: '8px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid var(--card-border)', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: "'Segoe UI', sans-serif", boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)' },
  optionRow: { display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' },
  removeBtn: { background: '#FFEBEE', color: 'var(--danger)', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontWeight: '700' },
  addOptionBtn: { background: 'var(--muted)', color: 'var(--primary)', border: 'none', borderRadius: '999px', padding: '8px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginTop: '4px' },
  submitBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '999px', padding: '11px 28px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  pollsList: { display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' },
  pollCard: { width: '100%', minWidth: 0, background: 'linear-gradient(180deg, #FFFFFF, #F9FBFF)', borderRadius: '24px', padding: '40px 42px', border: '1px solid rgba(148, 163, 184, 0.22)', boxShadow: '0 22px 56px rgba(15, 23, 42, 0.10)', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' },
  pollHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '10px' },
  pollQuestion: { margin: 0, fontSize: '20px', fontWeight: '800', color: '#101828', flex: 1, lineHeight: 1.3, letterSpacing: '-0.01em' },
  totalVotes: { fontSize: '12px', background: 'var(--muted)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '999px', fontWeight: '700', whiteSpace: 'nowrap' },
  pollMeta: { margin: '0 0 20px', fontSize: '12px', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 },
  optionsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  optionItem: { borderRadius: '18px', padding: '18px 18px 16px', transition: 'all 0.25s ease', boxShadow: '0 10px 24px rgba(15,23,42,0.04)' },
  optionTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '12px' },
  optionText: { fontSize: '16px', fontWeight: '700', color: '#101828' },
  optionRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  optionPct: { fontSize: '14px', fontWeight: '800' },
  myVoteBadge: { fontSize: '11px', background: 'var(--primary)', color: '#fff', padding: '4px 10px', borderRadius: '999px', fontWeight: '700' },
  progressBar: { height: '12px', background: 'rgba(15,23,42,0.08)', borderRadius: '999px', marginBottom: '14px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '999px' },
  optionBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' },
  votersList: { display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1, minHeight: '34px', alignContent: 'flex-start' },
  voterTag: { fontSize: '11px', background: 'var(--muted)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '999px', fontWeight: '700' },
  moreVoters: { fontSize: '11px', color: 'var(--muted-text)', fontStyle: 'italic' },
  noVoters: { fontSize: '11px', color: 'var(--muted-text)', fontStyle: 'italic' },
  voteBtn: { border: 'none', borderRadius: '999px', padding: '9px 18px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 10px 18px rgba(15,23,42,0.08)' },
  emptyBox: { background: 'linear-gradient(180deg, #FFFFFF, #FBFDFF)', borderRadius: '20px', padding: '38px', border: '1px solid rgba(148, 163, 184, 0.22)', textAlign: 'center', boxShadow: '0 16px 40px rgba(15,23,42,0.05)' },
  emptyIcon: { margin: '0 0 10px', fontSize: '30px', color: 'var(--primary)' },
  emptyTitle: { margin: '0 0 8px', fontSize: '17px', fontWeight: '800', color: '#101828' },
  emptyText: { margin: 0, color: 'var(--muted-text)', fontSize: '14px' },
};

export default Polls;