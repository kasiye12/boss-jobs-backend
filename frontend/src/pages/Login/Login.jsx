import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

const Login = () => {
  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(form);
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '60px auto' }}>
      <div className="card" style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💼</div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ color: '#666' }}>Login to your account</p>
        </div>

        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
              Email or Phone
            </label>
            <input
              type="text"
              className="input"
              placeholder="email@example.com"
              value={form.emailOrPhone}
              onChange={e => setForm({ ...form, emailOrPhone: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
              Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#666' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#0066cc', fontWeight: 600 }}>Register</Link>
        </p>

        {/* Test Accounts Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '13px',
          lineHeight: 1.8
        }}>
          <strong style={{ display: 'block', marginBottom: '8px' }}>📝 Test Accounts:</strong>
          <span style={{ color: '#666' }}>Admin:</span> admin@bossjobs.et / Admin123!@#<br/>
          <span style={{ color: '#666' }}>Employer:</span> hr@ethiotech.com / Employer123!@#<br/>
          <span style={{ color: '#666' }}>Seeker:</span> abebe@email.com / Seeker123!@#
        </div>
      </div>
    </div>
  );
};

export default Login;
