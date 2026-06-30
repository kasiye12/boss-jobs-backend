import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header style={{
      background: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#0066cc'
        }}>
          <span style={{ fontSize: '30px' }}>💼</span>
          <span>Boss Jobs <span style={{ color: '#666', fontSize: '16px' }}>Ethiopia</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/jobs" style={{ color: '#333', fontWeight: 500, fontSize: '15px' }}>
            Find Jobs
          </Link>
          
          {token ? (
            <>
              {user.role === 'employer' && (
                <Link to="/post-job" className="btn btn-primary btn-sm">
                  + Post Job
                </Link>
              )}
              <Link to="/dashboard" style={{ color: '#333', fontWeight: 500, fontSize: '15px' }}>
                Dashboard
              </Link>
              <Link to="/applications" style={{ color: '#333', fontWeight: 500, fontSize: '15px' }}>
                Applications
              </Link>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#f0f2f5',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}
                >
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#0066cc',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {user.fullName?.charAt(0) || 'U'}
                  </span>
                  {user.fullName?.split(' ')[0]}
                </button>
                
                {menuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    minWidth: '200px',
                    overflow: 'hidden',
                    zIndex: 100
                  }}>
                    <Link to="/profile" style={{ display: 'block', padding: '12px 20px', color: '#333', borderBottom: '1px solid #f0f0f0' }}
                      onClick={() => setMenuOpen(false)}>
                      👤 My Profile
                    </Link>
                    <Link to="/dashboard" style={{ display: 'block', padding: '12px 20px', color: '#333', borderBottom: '1px solid #f0f0f0' }}
                      onClick={() => setMenuOpen(false)}>
                      📊 Dashboard
                    </Link>
                    <button onClick={handleLogout} style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 20px',
                      border: 'none',
                      background: 'none',
                      color: '#dc3545',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#333', fontWeight: 500, fontSize: '15px' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}
          className="mobile-menu-btn"
        >
          ☰
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          header nav { display: ${menuOpen ? 'flex' : 'none'} !important; 
            position: absolute; top: 70px; left: 0; right: 0;
            background: white; flex-direction: column; padding: 20px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
