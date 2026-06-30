import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get('q') || '');
    fetchJobs(params.get('q') || '');
  }, []);

  const fetchJobs = async (query) => {
    setLoading(true);
    try {
      const res = query 
        ? await jobsAPI.search({ q: query })
        : await jobsAPI.getAll({ limit: 50 });
      setJobs(res.data?.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobType ? jobs.filter(j => j.jobType === jobType) : jobs;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>Find Jobs in Ethiopia</h1>
        
        {/* Search and Filter */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              className="input"
              placeholder="Search jobs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && fetchJobs(search)}
              style={{ flex: 2, minWidth: '200px' }}
            />
            <select className="input" value={jobType} onChange={e => setJobType(e.target.value)}
              style={{ flex: 1, minWidth: '150px' }}>
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
              <option value="Freelance">Freelance</option>
            </select>
            <button onClick={() => fetchJobs(search)} className="btn btn-primary">
              🔍 Search
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loader" />
      ) : (
        <>
          <p style={{ color: '#666', marginBottom: '20px' }}>{filteredJobs.length} jobs found</p>
          
          <div className="grid grid-2">
            {filteredJobs.map(job => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="card" style={{
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', color: '#0066cc' }}>{job.title}</h3>
                  {job.isFeatured && <span className="badge badge-featured">Featured</span>}
                </div>
                <p style={{ fontWeight: 600, color: '#555', marginBottom: '8px' }}>{job.companyName}</p>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '12px' }}>
                  {job.description?.substring(0, 150)}...
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="badge badge-primary">{job.jobType}</span>
                  {job.salaryRange && <span className="badge badge-success">{job.salaryRange}</span>}
                  {job.city && <span className="badge badge-warning">📍 {job.city}</span>}
                </div>
              </Link>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="card text-center" style={{ padding: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3>No jobs found</h3>
              <p style={{ color: '#666', marginTop: '8px' }}>Try different search terms or filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Jobs;
