import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { plaidAPI } from '../services/api';
import PlaidIntegration from './PlaidIntegration';
import FinancialOverview from './FinancialOverview';
import InvestmentTracking from './InvestmentTracking';
import SubscriptionsOverview from './SubscriptionsOverview';

function Dashboard() {
  const { user, logout } = useAuth();
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  const checkIntegrationStatus = async () => {
    try {
      setLoading(true);
      const response = await plaidAPI.getIntegrationStatus();
      console.log('Integration status response:', response.data);
      setIntegrationStatus(response.data);
    } catch (error) {
      console.error('Error checking integration status:', error);
      // If there's an error (like 404 for no integration), treat as not integrated
      setIntegrationStatus({ isIntegrated: false, hasPlaid: false });
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationComplete = (integration) => {
    setIntegrationStatus({
      isIntegrated: true,
      hasPlaid: true,
      ...integration
    });
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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

        {!integrationStatus?.isIntegrated ? (
          <PlaidIntegration onIntegrationComplete={handleIntegrationComplete} />
        ) : (
          <div className="integrated-dashboard">
            <div className="integration-status">
              <div className="status-badge">
                <span className="status-icon">✅</span>
                <span>Bank Account Connected</span>
              </div>
              <p>Connected to {integrationStatus.institutionName} • {integrationStatus.accountsCount} accounts</p>
            </div>

            <div className="dashboard-tabs">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Financial Overview
              </button>
              <button 
                className={`tab-btn ${activeTab === 'investments' ? 'active' : ''}`}
                onClick={() => setActiveTab('investments')}
              >
                Investment Tracking
              </button>
              <button 
                className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
                onClick={() => setActiveTab('subscriptions')}
              >
                Subscriptions Overview
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'overview' && <FinancialOverview />}
              {activeTab === 'investments' && <InvestmentTracking />}
              {activeTab === 'subscriptions' && <SubscriptionsOverview />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
