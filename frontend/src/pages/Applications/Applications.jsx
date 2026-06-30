import React, { useState, useEffect } from 'react';
import { applicationsAPI } from '../../services/api';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await applicationsAPI.getMy();
      setApplications(res.data.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader" />;

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>My Applications</h1>
      
      {applications.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h3>No applications yet</h3>
          <p style={{ color: '#666', marginTop: '8px' }}>Start applying to jobs to see your applications here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {applications.map(app => (
            <div key={app.id} className="card flex-between" style={{ padding: '20px 24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', color: '#0066cc', marginBottom: '4px' }}>
                  {app.job?.title || 'Job Title'}
                </h3>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  {app.job?.companyName || 'Company'} • Applied {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`badge badge-${
                app.status === 'shortlisted' ? 'success' : 
                app.status === 'rejected' ? 'danger' : 
                app.status === 'reviewed' ? 'primary' : 'warning'
              }`}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
