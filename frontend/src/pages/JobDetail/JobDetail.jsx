import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../../services/api';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => { fetchJob(); }, [id]);

  const fetchJob = async () => {
    try {
      const res = await jobsAPI.getById(id);
      setJob(res.data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setApplying(true);
    try {
      await applicationsAPI.apply(id, { coverLetter });
      setMessage('✅ Application submitted successfully!');
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to apply'));
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loader" />;
  if (!job) return <div className="card text-center" style={{ padding: '60px' }}><h3>Job not found</h3></div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/jobs" style={{ color: '#0066cc', marginBottom: '20px', display: 'inline-block' }}>← Back to Jobs</Link>
      
      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{job.title}</h1>
            <p style={{ fontSize: '18px', color: '#555', fontWeight: 600 }}>{job.companyName}</p>
          </div>
          <button onClick={handleApply} disabled={applying} className="btn btn-primary btn-lg">
            {applying ? 'Applying...' : 'Apply Now'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2" style={{ marginBottom: '24px' }}>
          <span className="badge badge-primary">{job.jobType}</span>
          {job.salaryRange && <span className="badge badge-success">💰 {job.salaryRange}</span>}
          {job.city && <span className="badge badge-warning">📍 {job.city}</span>}
          <span className="badge">📅 {new Date(job.createdAt).toLocaleDateString()}</span>
        </div>

        <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Job Description</h3>
          <p style={{ color: '#444', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{job.description}</p>
        </div>

        {job.requiredSkills?.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Required Skills</h3>
            <div className="flex flex-wrap gap-1">
              {job.requiredSkills.map(skill => (
                <span key={skill} className="badge badge-primary" style={{ fontSize: '14px', padding: '6px 14px' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Application Form */}
      {token && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Quick Apply</h3>
          {message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: message.includes('✅') ? '#e8f5e9' : '#ffebee',
              color: message.includes('✅') ? '#2e7d32' : '#c62828'
            }}>
              {message}
            </div>
          )}
          <textarea
            className="textarea"
            placeholder="Write a brief cover letter..."
            value={coverLetter}
            onChange={e => setCoverLetter(e.target.value)}
          />
          <button onClick={handleApply} disabled={applying} className="btn btn-primary mt-2">
            {applying ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
