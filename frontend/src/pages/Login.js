import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.logo}>IX</div>
          <h1 style={styles.brandName}>InnovateX</h1>
          <p style={styles.brandTagline}>
            Unified Student Collaboration & Performance Platform
          </p>
        </div>
        <div style={styles.features}>
          {['Task Management', 'AP & RP Tracking', 'Team Leaderboard',
            'Real-time Chat', 'Project Tracking'].map(f => (
            <div key={f} style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span style={styles.featureText}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Sign In</h2>
          <p style={styles.subtitle}>Access your InnovateX account</p>
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="name@innovatex.ac.in"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder="Enter your phone number"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button
              style={loading ? styles.buttonDisabled : styles.button}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={styles.hint}>
            Use your InnovateX email and phone number as password
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex', minHeight: '100vh',
    fontFamily: "'Segoe UI', sans-serif"
  },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #1E88E5 100%)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', padding: '60px', color: '#fff'
  },
  brand: { marginBottom: '50px' },
  logo: {
    width: '64px', height: '64px',
    background: 'rgba(255,255,255,0.2)', borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', fontWeight: '700', color: '#fff',
    marginBottom: '20px', border: '2px solid rgba(255,255,255,0.3)'
  },
  brandName: {
    fontSize: '36px', fontWeight: '700',
    margin: '0 0 10px', color: '#fff'
  },
  brandTagline: {
    fontSize: '15px', color: 'rgba(255,255,255,0.8)',
    margin: 0, lineHeight: '1.6', maxWidth: '320px'
  },
  features: { display: 'flex', flexDirection: 'column', gap: '14px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px' },
  featureDot: {
    width: '8px', height: '8px',
    background: 'rgba(255,255,255,0.7)', borderRadius: '50%'
  },
  featureText: { fontSize: '15px', color: 'rgba(255,255,255,0.9)' },
  right: {
    width: '480px', background: '#F8FAFF',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '40px'
  },
  card: {
    background: '#fff', borderRadius: '16px',
    padding: '40px', width: '100%',
    boxShadow: '0 4px 24px rgba(21,101,192,0.08)',
    border: '1px solid #E3EAF6'
  },
  title: {
    fontSize: '26px', fontWeight: '700',
    color: '#1565C0', margin: '0 0 8px'
  },
  subtitle: { fontSize: '14px', color: '#666', margin: '0 0 28px' },
  field: { marginBottom: '20px' },
  label: {
    display: 'block', fontSize: '13px',
    fontWeight: '600', color: '#444', marginBottom: '8px'
  },
  input: {
    width: '100%', padding: '12px 16px',
    borderRadius: '8px', border: '1.5px solid #D0DCF0',
    fontSize: '14px', color: '#333', outline: 'none',
    boxSizing: 'border-box', background: '#FAFCFF'
  },
  button: {
    width: '100%', padding: '13px',
    background: '#1565C0', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', marginTop: '8px'
  },
  buttonDisabled: {
    width: '100%', padding: '13px',
    background: '#90A4AE', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontSize: '15px', fontWeight: '600',
    cursor: 'not-allowed', marginTop: '8px'
  },
  hint: {
    fontSize: '12px', color: '#999',
    textAlign: 'center', marginTop: '16px'
  }
};

export default Login;