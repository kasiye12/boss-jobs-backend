import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

const Register = () => {
  const [form, setForm] = useState({
    fullName: '', email: '', phoneNumber: '', password: '', role: 'job_seeker'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.register(form);
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto' }}>
      <div className="card" style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Create Account</h1>
          <p style={{ color: '#666' }}>Join Boss Jobs Ethiopia</p>
        </div>

        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Full Name</label>
            <input type="text" className="input" placeholder="John Doe" value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Email</label>
            <input type="email" className="input" placeholder="email@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Phone Number</label>
            <input type="tel" className="input" placeholder="+2519XXXXXXXX" value={form.phoneNumber}
              onChange={e => setForm({ ...form, phoneNumber: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Password</label>
            <input type="password" className="input" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>I am a</label>
            <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="job_seeker">Job Seeker</option>
              <option value="employer">Employer</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#666' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0066cc', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
