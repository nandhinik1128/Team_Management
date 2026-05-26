import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Icon from '../components/Icon';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
  });

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      await API.post('/auth/register', form);
      toast.success('Registered successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brandCard}>
          <div style={styles.logo}>IX</div>
          <div style={styles.kicker}>InnovateX</div>
          <h1 style={styles.leftTitle}>Join the workspace</h1>
          <p style={styles.leftText}>
            Create your account and start collaborating with your team.
          </p>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h1 style={styles.title}><Icon title="trophy" /> USCPP</h1>
          <h2 style={styles.subtitle}>Register</h2>

          <form onSubmit={handleSubmit}>
            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <select
              style={styles.input}
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="member">Member</option>
              <option value="co_admin">Co-Admin</option>
              <option value="admin">Admin</option>
            </select>

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p style={styles.text}>
            Already have an account? <Link to="/" style={styles.link}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f5f7fb',
  },
  left: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    background: 'linear-gradient(135deg, #0f172a 0%, #123a63 45%, #1565c0 100%)',
  },
  brandCard: {
    maxWidth: '560px',
    color: '#fff',
  },
  logo: {
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.16)',
    border: '1px solid rgba(255,255,255,0.2)',
    marginBottom: '18px',
    fontWeight: '800',
  },
  kicker: {
    display: 'inline-block',
    marginBottom: '10px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
  },
  leftTitle: {
    margin: '0 0 12px',
    fontSize: '42px',
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
  },
  leftText: {
    margin: 0,
    maxWidth: '460px',
    fontSize: '16px',
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.82)',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background: 'linear-gradient(180deg, var(--muted-2) 0%, #EEF4FF 100%)',
  },
  card: {
    background: 'rgba(255,255,255,0.92)',
    padding: '36px',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 24px 60px rgba(16,24,40,0.12)',
    border: '1px solid rgba(255,255,255,0.8)',
    backdropFilter: 'blur(16px)',
  },
  title: {
    color: '#e94560',
    textAlign: 'center',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#101828',
    textAlign: 'center',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    marginBottom: '14px',
    borderRadius: '14px',
    border: '1.5px solid var(--card-border)',
    backgroundColor: 'var(--muted-2)',
    color: '#101828',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '800',
    boxShadow: '0 12px 24px rgba(21,101,192,0.18)',
    transition: 'transform 0.15s ease, opacity 0.15s ease',
    opacity: 1,
  },
  text: {
    color: '#667085',
    textAlign: 'center',
    marginTop: '15px',
  },
  link: {
    color: 'var(--primary)',
    fontWeight: '700',
    textDecoration: 'none',
  },
};

export default Register;