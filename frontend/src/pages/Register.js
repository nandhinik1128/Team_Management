import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';

const Register = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    role: 'member'
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', form);
      toast.success('Registered successfully! Please login ✅');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed!');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏆 USCPP</h1>
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
          <button style={styles.button} type="submit">Register</button>
        </form>
        <p style={styles.text}>
          Already have an account? <Link to="/" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#1a1a2e'
  },
  card: {
    backgroundColor: '#16213e',
    padding: '40px',
    borderRadius: '10px',
    width: '400px',
    boxShadow: '0 0 20px rgba(233, 69, 96, 0.3)'
  },
  title: {
    color: '#e94560',
    textAlign: 'center',
    marginBottom: '10px'
  },
  subtitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #e94560',
    backgroundColor: '#1a1a2e',
    color: 'white',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  text: {
    color: 'white',
    textAlign: 'center',
    marginTop: '15px'
  },
  link: {
    color: '#e94560'
  }
};

export default Register;