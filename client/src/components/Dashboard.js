import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { plaidAPI } from '../services/api';
import PlaidIntegration from './PlaidIntegration';
import FinancialOverview from './FinancialOverview';
import SubscriptionsOverview from './SubscriptionsOverview';
import AIAdvisor from './AIAdvisor';
import Profile from './Profile';

// Icon components
const FinancialIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const SubscriptionIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2"></rect>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const AIIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const AccountIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
  </svg>
);

const ConnectBankIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="12" y1="21" x2="12" y2="7"></line>
    <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path>
    <line x1="7" y1="12" x2="17" y2="12"></line>
  </svg>
);

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [integrationRefreshKey, setIntegrationRefreshKey] = useState(Date.now());
  const [showAddBank, setShowAddBank] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [tabTransition, setTabTransition] = useState(false);

  // Get active tab from URL or default to 'overview'
  const activeTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  useEffect(() => {
    if (!loading && integrationStatus?.isIntegrated) {
      // Trigger sidebar animation after a brief delay
      setTimeout(() => setIsMounted(true), 100);
    }
  }, [loading, integrationStatus]);

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
    // Smooth tab transition
    setTabTransition(true);
    setTimeout(() => {
      setSearchParams({ tab });
      setTimeout(() => setTabTransition(false), 300);
    }, 150);
  };

  const handleConnectBank = () => {
    setTabTransition(true);
    setTimeout(() => {
      setSearchParams({ tab: 'connect-bank' });
      setTimeout(() => setTabTransition(false), 300);
    }, 150);
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
        <div className={`integrated-dashboard ${isMounted ? 'mounted' : ''}`}>
          <div className={`dashboard-sidebar ${isMounted ? 'mounted' : ''}`}>
            <div className="dashboard-tabs">
              <button
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => handleTabChange('overview')}
                style={{ animationDelay: isMounted ? '0.1s' : '0s' }}
              >
                <FinancialIcon />
                Financial Overview
              </button>
              <button
                className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
                onClick={() => handleTabChange('subscriptions')}
                style={{ animationDelay: isMounted ? '0.15s' : '0s' }}
              >
                <SubscriptionIcon />
                Subscription Overview
              </button>
              <button
                className={`tab-btn ${activeTab === 'ai-advisor' ? 'active' : ''}`}
                onClick={() => handleTabChange('ai-advisor')}
                style={{ animationDelay: isMounted ? '0.2s' : '0s' }}
              >
                <AIIcon />
                AI Financial Advisor
              </button>
              <button
                className={`tab-btn connect-bank-btn ${showAddBank ? 'active' : ''}`}
                onClick={handleConnectBank}
                style={{ animationDelay: isMounted ? '0.25s' : '0s' }}
              >
                <ConnectBankIcon />
                Connect Another Bank
              </button>
              <button
                className={`tab-btn connect-bank-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => handleTabChange('profile')}
                style={{ animationDelay: isMounted ? '0.3s' : '0s' }}
              >
                <ProfileIcon />
                Profile Management
              </button>
              <button
                className={`tab-btn connect-bank-btn ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => handleTabChange('account')}
                style={{ animationDelay: isMounted ? '0.35s' : '0s' }}
              >
                <AccountIcon />
                Account Management
              </button>
            </div>
          </div>

          <div className={`tab-content-wrapper ${isMounted ? 'mounted' : ''}`}>
            {showAddBank ? (
              <div className="add-bank-modal">
                <PlaidIntegration 
                  onIntegrationComplete={handleBankConnectionComplete} 
                />
              </div>
            ) : (
              <div className={`tab-content ${tabTransition ? 'transitioning' : ''}`}>
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
