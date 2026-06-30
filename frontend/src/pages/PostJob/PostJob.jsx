import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../services/api';

const PostJob = () => {
  const [form, setForm] = useState({
    title: '', description: '', companyName: '', jobType: 'Full-time',
    salaryRange: '', latitude: '', longitude: '', requiredSkills: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jobsAPI.create({
        ...form,
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      });
      setMessage('✅ Job posted successfully!');
      setTimeout(() => navigate('/jobs'), 1500);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to post job'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>Post a New Job</h1>
      
      <div className="card" style={{ padding: '32px' }}>
        {message && (
          <div style={{
            padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
            background: message.includes('✅') ? '#e8f5e9' : '#ffebee',
            color: message.includes('✅') ? '#2e7d32' : '#c62828'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Job Title *</label>
            <input type="text" className="input" placeholder="e.g., Senior React Developer" value={form.title}
              onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Company Name *</label>
            <input type="text" className="input" placeholder="e.g., EthioTech Solutions" value={form.companyName}
              onChange={e => setForm({...form, companyName: e.target.value})} required />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Description *</label>
            <textarea className="textarea" placeholder="Describe the role, responsibilities, and requirements..."
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          </div>
          <div className="grid grid-2">
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Job Type</label>
              <select className="input" value={form.jobType} onChange={e => setForm({...form, jobType: e.target.value})}>
                <option>Full-time</option><option>Part-time</option><option>Contract</option>
                <option>Remote</option><option>Freelance</option><option>Internship</option>
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Salary Range</label>
              <input type="text" className="input" placeholder="e.g., 30,000 - 45,000 ETB" value={form.salaryRange}
                onChange={e => setForm({...form, salaryRange: e.target.value})} />
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Required Skills (comma-separated)</label>
            <input type="text" className="input" placeholder="React, JavaScript, Node.js" value={form.requiredSkills}
              onChange={e => setForm({...form, requiredSkills: e.target.value})} />
          </div>
          <div className="grid grid-2">
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Latitude</label>
              <input type="number" step="any" className="input" placeholder="9.0320" value={form.latitude}
                onChange={e => setForm({...form, latitude: e.target.value})} />
            </div>
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Longitude</label>
              <input type="number" step="any" className="input" placeholder="38.7469" value={form.longitude}
                onChange={e => setForm({...form, longitude: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ justifyContent: 'center', marginTop: '8px' }}>
            {loading ? 'Posting...' : '📝 Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
