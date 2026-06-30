import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      let res;
      if (user.role === 'admin') res = await dashboardAPI.getAdmin();
      else if (user.role === 'employer') res = await dashboardAPI.getEmployer();
      else res = await dashboardAPI.get();
      setData(res.data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader" />;

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>
        Welcome, {user.fullName?.split(' ')[0]}!
      </h1>

      <div className="grid grid-4" style={{ marginBottom: '40px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>💼</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0066cc' }}>
            {data?.statistics?.activeJobs || data?.statistics?.totalJobs || 0}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Active Jobs</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>📄</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
            {data?.statistics?.totalApplications || 0}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Applications</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>👥</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6f42c1' }}>
            {data?.statistics?.totalUsers || 0}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Users</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>⭐</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff8f00' }}>
            {data?.statistics?.shortlistedCandidates || data?.statistics?.shortlistedApplications || 0}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Shortlisted</div>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
        <h3>More dashboard features coming soon!</h3>
        <p style={{ color: '#666', marginTop: '8px' }}>Detailed analytics and charts will be available in the next update.</p>
      </div>
    </div>
  );
};

export default Dashboard;
