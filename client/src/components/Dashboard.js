import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <div className="user-info">
            <div className="user-avatar">
              {user?.firstName?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div>
              <div className="user-name">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username || user?.email
                }
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {user?.email}
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="welcome-section">
          <h2>Welcome to BenchWise!</h2>
          <p>Your financial management platform is ready to use.</p>
          
          <div className="feature-cards">
            <div className="feature-card">
              <h3>Financial Overview</h3>
              <p>Track your income, expenses, and savings in one place.</p>
            </div>
            
            <div className="feature-card">
              <h3>Investment Tracking</h3>
              <p>Monitor your portfolio performance and make informed decisions.</p>
            </div>
            
            <div className="feature-card">
              <h3>AI Insights</h3>
              <p>Get personalized financial advice powered by AI.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
