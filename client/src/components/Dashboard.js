import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { plaidAPI } from '../services/api';
import PlaidIntegration from './PlaidIntegration';
import FinancialOverview from './FinancialOverview';
import SubscriptionsOverview from './SubscriptionsOverview';
import AIAdvisor from './AIAdvisor';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  // Prevent going back to login page
  useEffect(() => {
    const handlePopState = (event) => {
      // If user tries to go back and we're on dashboard, stay on dashboard
      if (window.location.pathname === '/dashboard') {
        navigate('/dashboard', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

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
        </div>

        {!integrationStatus?.isIntegrated ? (
          <PlaidIntegration onIntegrationComplete={handleIntegrationComplete} />
        ) : (
          <div className="integrated-dashboard">

            <div className="dashboard-tabs">
              <button
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Financial Overview
              </button>
              <button
                className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
                onClick={() => setActiveTab('subscriptions')}
              >
                Subscriptions Overview
              </button>
              <button
                className={`tab-btn ${activeTab === 'ai-advisor' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai-advisor')}
              >
                AI Advisor
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'overview' && <FinancialOverview />}
              {activeTab === 'subscriptions' && <SubscriptionsOverview />}
              {activeTab === 'ai-advisor' && <AIAdvisor />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
