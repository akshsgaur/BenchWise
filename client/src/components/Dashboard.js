import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { plaidAPI } from '../services/api';
import PlaidIntegration from './PlaidIntegration';
import FinancialOverview from './FinancialOverview';
import SubscriptionsOverview from './SubscriptionsOverview';
import AIAdvisor from './AIAdvisor';
import Profile from './Profile';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [integrationRefreshKey, setIntegrationRefreshKey] = useState(Date.now());
  const [showAddBank, setShowAddBank] = useState(false);

  // Get active tab from URL or default to 'overview'
  const activeTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  // Set default tab in URL if none exists (only on initial load)
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (!currentTab && location.pathname === '/dashboard') {
      setSearchParams({ tab: 'overview' }, { replace: true });
    }
  }, [location.pathname, searchParams, setSearchParams]);

  // Update showAddBank when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    setShowAddBank(tab === 'connect-bank');
  }, [searchParams]);

  const checkIntegrationStatus = async () => {
    try {
      setLoading(true);
      const response = await plaidAPI.getIntegrationStatus();
      console.log('Integration status response:', response.data);
      setIntegrationStatus(response.data);
      if (response.data?.isIntegrated) {
        setIntegrationRefreshKey(Date.now());
      }
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
    setIntegrationRefreshKey(Date.now());
  };

  const handleBankConnectionComplete = () => {
    setSearchParams({ tab: 'overview' });
  };

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleConnectBank = () => {
    setSearchParams({ tab: 'connect-bank' });
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
      {!integrationStatus?.isIntegrated ? (
        <div className="container">
          <PlaidIntegration onIntegrationComplete={handleIntegrationComplete} />
        </div>
      ) : (
        <div className="integrated-dashboard">
          <div className="dashboard-sidebar">
            <div className="dashboard-tabs">
              <button
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => handleTabChange('overview')}
              >
                Financial Overview
              </button>
              <button
                className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
                onClick={() => handleTabChange('subscriptions')}
              >
                Subscription Overview
              </button>
              <button
                className={`tab-btn ${activeTab === 'ai-advisor' ? 'active' : ''}`}
                onClick={() => handleTabChange('ai-advisor')}
              >
                AI Financial Advisor
              </button>
              <button
                className={`tab-btn connect-bank-btn ${showAddBank ? 'active' : ''}`}
                onClick={handleConnectBank}
              >
                Connect Another Bank
              </button>
              <button
                className={`tab-btn connect-bank-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => handleTabChange('profile')}
              >
                Profile Management
              </button>
              <button
                className={`tab-btn connect-bank-btn ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => handleTabChange('account')}
              >
                Account Management
              </button>
            </div>
          </div>

          <div className="tab-content-wrapper">
            {showAddBank ? (
              <div className="add-bank-modal">
                <PlaidIntegration 
                  onIntegrationComplete={handleBankConnectionComplete} 
                />
              </div>
            ) : (
              <div className="tab-content">
                {activeTab === 'overview' && <FinancialOverview refreshKey={integrationRefreshKey} />}
                {activeTab === 'subscriptions' && <SubscriptionsOverview />}
                {activeTab === 'ai-advisor' && <AIAdvisor />}
                {(activeTab === 'profile' || activeTab === 'account') && (
                  <Profile initialTab={activeTab} embedded={true} />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
