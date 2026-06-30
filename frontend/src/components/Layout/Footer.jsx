import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{
    background: '#1a1a2e',
    color: '#ccc',
    padding: '60px 0 30px',
    marginTop: '80px'
  }}>
    <div className="container">
      <div className="grid grid-4">
        <div>
          <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '16px' }}>💼 Boss Jobs Ethiopia</h3>
          <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
            Connecting talented professionals with top employers across Ethiopia.
          </p>
        </div>
        <div>
          <h4 style={{ color: 'white', marginBottom: '16px' }}>For Job Seekers</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/jobs" style={{ color: '#ccc', fontSize: '14px' }}>Browse Jobs</Link></li>
            <li><Link to="/register" style={{ color: '#ccc', fontSize: '14px' }}>Create Account</Link></li>
            <li><Link to="/profile" style={{ color: '#ccc', fontSize: '14px' }}>Build Profile</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: 'white', marginBottom: '16px' }}>For Employers</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/post-job" style={{ color: '#ccc', fontSize: '14px' }}>Post a Job</Link></li>
            <li><Link to="/register" style={{ color: '#ccc', fontSize: '14px' }}>Employer Account</Link></li>
            <li><Link to="/dashboard" style={{ color: '#ccc', fontSize: '14px' }}>Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: 'white', marginBottom: '16px' }}>Contact</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <li>📧 support@bossjobs.et</li>
            <li>📱 +251 900 000 000</li>
            <li>📍 Addis Ababa, Ethiopia</li>
          </ul>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #333', marginTop: '40px', paddingTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        &copy; 2024 Boss Jobs Ethiopia. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
