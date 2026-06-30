import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../../services/api';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await jobsAPI.getAll({ limit: 6 });
      const data = res.data?.data;
      setJobs(Array.isArray(data) ? data : data?.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('q', search);
    if (location) params.append('location', location);
    window.location.href = `/jobs?${params.toString()}`;
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0066cc 0%, #004499 50%, #002266 100%)',
        color: 'white',
        padding: '80px 0',
        borderRadius: '0 0 40px 40px',
        marginBottom: '60px'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', lineHeight: 1.2 }}>
            Find Your Dream Job<br/>in Ethiopia
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '40px' }}>
            Connect with top employers and discover opportunities across Ethiopia
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '8px',
            display: 'flex',
            gap: '8px',
            maxWidth: '700px',
            margin: '0 auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <span style={{ fontSize: '20px', marginRight: '8px' }}>🔍</span>
              <input
                type="text"
                placeholder="Job title or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  padding: '12px 0'
                }}
              />
            </div>
            <div style={{ width: '1px', background: '#e0e0e0' }} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <span style={{ fontSize: '20px', marginRight: '8px' }}>📍</span>
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  padding: '12px 0'
                }}
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '16px' }}>
              Search Jobs
            </button>
          </form>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginTop: '50px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>1,000+</div>
              <div style={{ opacity: 0.8, fontSize: '14px' }}>Active Jobs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>500+</div>
              <div style={{ opacity: 0.8, fontSize: '14px' }}>Companies</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>5,000+</div>
              <div style={{ opacity: 0.8, fontSize: '14px' }}>Job Seekers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container" style={{ marginBottom: '60px' }}>
        <div className="grid grid-3">
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Smart Search</h3>
            <p style={{ color: '#666' }}>Find jobs that match your skills and location with intelligent search.</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Top Companies</h3>
            <p style={{ color: '#666' }}>Connect with leading employers across Ethiopia looking for talent.</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Career Growth</h3>
            <p style={{ color: '#666' }}>Build your career with opportunities matching your aspirations.</p>
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="container">
        <div className="flex-between mb-3">
          <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Latest Opportunities</h2>
          <Link to="/jobs" className="btn btn-outline">View All Jobs →</Link>
        </div>

        {loading ? (
          <div className="loader" />
        ) : jobs.length === 0 ? (
          <div className="card text-center" style={{ padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3>No jobs available yet</h3>
            <p style={{ color: '#666', marginTop: '8px' }}>Check back soon for new opportunities!</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {jobs.map(job => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="card" style={{
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'; }}
              >
                <div className="flex-between mb-2">
                  <h3 style={{ fontSize: '18px', color: '#0066cc' }}>{job.title}</h3>
                  {job.isFeatured && <span className="badge badge-featured">Featured</span>}
                </div>
                <p style={{ color: '#666', marginBottom: '12px', fontWeight: 500 }}>{job.companyName}</p>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '12px', lineHeight: 1.5 }}>
                  {job.description?.substring(0, 120)}...
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="badge badge-primary">{job.jobType}</span>
                  {job.salaryRange && <span className="badge badge-success">{job.salaryRange}</span>}
                </div>
                {job.requiredSkills && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.requiredSkills.slice(0, 3).map(skill => (
                      <span key={skill} style={{
                        background: '#f0f4ff',
                        color: '#0066cc',
                        padding: '2px 10px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>{skill}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
