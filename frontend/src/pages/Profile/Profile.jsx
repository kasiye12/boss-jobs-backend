import React, { useState, useEffect } from 'react';
import { profileAPI } from '../../services/api';

const Profile = () => {
  const [profile, setProfile] = useState({
    title: '', bio: '', skills: [], latitude: '', longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileAPI.get();
      if (res.data.data) setProfile(res.data.data);
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await profileAPI.create(profile);
      setMessage('✅ Profile updated successfully!');
    } catch (err) {
      setMessage('❌ Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>My Profile</h1>
      
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
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Professional Title</label>
            <input type="text" className="input" placeholder="e.g., Senior Software Developer"
              value={profile.title} onChange={e => setProfile({...profile, title: e.target.value})} />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Bio</label>
            <textarea className="textarea" placeholder="Tell employers about yourself..."
              value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Skills (comma-separated)</label>
            <input type="text" className="input" placeholder="JavaScript, React, Node.js"
              value={profile.skills?.join(', ')} onChange={e => setProfile({...profile, skills: e.target.value.split(',').map(s => s.trim())})} />
          </div>
          <div className="grid grid-2">
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Latitude</label>
              <input type="number" step="any" className="input" placeholder="9.0320"
                value={profile.latitude} onChange={e => setProfile({...profile, latitude: e.target.value})} />
            </div>
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Longitude</label>
              <input type="number" step="any" className="input" placeholder="38.7469"
                value={profile.longitude} onChange={e => setProfile({...profile, longitude: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ justifyContent: 'center', marginTop: '8px' }}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
