import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDashboardClick = () => {
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleProfileClick = () => {
    if (location.pathname !== '/profile') {
      navigate('/profile', { replace: true });
    }
  };

  const isDashboard = location.pathname === '/dashboard';
  const isProfile = location.pathname === '/profile';

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div 
            className="logo" 
            onClick={handleDashboardClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDashboardClick();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="logo-text">BenchWise</span>
            <span className="logo-tagline">Smart finance insights</span>
          </div>
        </div>

        <div className="header-right">
          {user && (
            <>
              <nav className="header-nav">
                <button 
                  className={`nav-link ${isDashboard ? 'active' : ''}`}
                  onClick={handleDashboardClick}
                  title="Dashboard"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
                <button 
                  className={`nav-link ${isProfile ? 'active' : ''}`}
                  onClick={handleProfileClick}
                  title="Profile"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
              </nav>

              <div className="user-menu">
                <div className="user-info">
                  <div className="user-avatar">
                    {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                  </div>
                  <span className="user-name">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username || user?.email?.split('@')[0]
                    }
                  </span>
                </div>
                
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
