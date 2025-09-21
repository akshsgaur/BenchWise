import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import UserSettings from './UserSettings';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserSettings, setShowUserSettings] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDashboardClick = () => {
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard', { replace: true });
    }
  };

  const isDashboard = location.pathname === '/dashboard';

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo" onClick={handleDashboardClick}>
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
                  >
                    Dashboard
                  </button>
                </nav>

                <div className="user-menu">
                  <button 
                    className="user-avatar-btn"
                    onClick={() => setShowUserSettings(true)}
                    title="User Settings"
                  >
                    <div className="user-avatar">
                      {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                    </div>
                    <span className="user-name">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.username || user?.email?.split('@')[0]
                      }
                    </span>
                    <svg className="dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <button 
                    className="logout-btn"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6M10.6667 11.3333L14 8M14 8L10.6667 4.66667M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="logout-text">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {showUserSettings && (
        <UserSettings 
          onClose={() => setShowUserSettings(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default Header;
