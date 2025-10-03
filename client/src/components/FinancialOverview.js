import React, { useState, useEffect } from 'react';
import { plaidAPI } from '../services/api';
import PlaidIntegration from './PlaidIntegration';
import './FinancialOverview.css';

function FinancialOverview() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankConnections, setBankConnections] = useState([]);
  const [transactionsPeriod, setTransactionsPeriod] = useState('last-30-days');
  const [spendingPeriod, setSpendingPeriod] = useState('last-30-days');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await plaidAPI.getAccounts();
      setAccounts(response.data.accounts);
      setBankConnections(response.data.bankConnections || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const handleBankConnectionComplete = () => {
    setShowAddBank(false);
    fetchAccounts(); // Refresh the accounts list
  };

  const getTotalBalance = () => {
    if (!accounts || !Array.isArray(accounts)) return 0;
    return accounts.reduce((total, account) => total + (account.balance?.current || 0), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'depository':
        return '🏦';
      case 'credit':
        return '💳';
      case 'investment':
        return '📈';
      case 'loan':
        return '🏠';
      default:
        return '💰';
    }
  };

  if (loading) {
    return (
      <div className="financial-overview">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your financial overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="financial-overview">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchAccounts} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showAddBank) {
    return (
      <div className="financial-overview">
        <div className="add-bank-header">
          <h2>Connect Another Bank Account</h2>
          <button 
            className="back-btn" 
            onClick={() => setShowAddBank(false)}
          >
            ← Back to Overview
          </button>
        </div>
        <PlaidIntegration onIntegrationComplete={handleBankConnectionComplete} />
      </div>
    );
  }

  return (
    <div className="financial-overview">
      <div className="overview-header">
        <h2>Financial Overview</h2>
        <p>Your complete financial picture at a glance</p>
      </div>

      {/* Connected Banks Section */}
      <div className="connected-banks-section">
        <div className="connected-banks-header">
          <h3>Connected Banks</h3>
          <button 
            className="connect-btn"
            onClick={() => setShowAddBank(true)}
          >
            + Connect Another Bank
          </button>
        </div>
        <div className="connected-banks-list">
          {bankConnections.map((bank, index) => (
            <div key={index} className="bank-card">
              <div className="bank-info">
                <h4>{bank.institutionName}</h4>
                <p>{bank.accountsCount} account(s)</p>
              </div>
              <div className="bank-status">
                <span className="status-indicator">✅</span>
                <span>Connected</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="balance-summary">
        <div className="total-balance">
          <h3>Total Balance</h3>
          <div className="balance-amount">
            {formatCurrency(getTotalBalance())}
          </div>
        </div>
        <div className="balance-breakdown">
          <div className="balance-item">
            <span className="balance-label">Available</span>
            <span className="balance-value">
              {formatCurrency(accounts && Array.isArray(accounts) ? accounts.reduce((total, account) => 
                total + (account.balance?.available || 0), 0) : 0)}
            </span>
          </div>
          <div className="balance-item">
            <span className="balance-label">Accounts</span>
            <span className="balance-value">{accounts ? accounts.length : 0}</span>
          </div>
        </div>
      </div>

      <div className="accounts-section">
        <h3>Your Accounts</h3>
        <div className="accounts-grid">
          {accounts && Array.isArray(accounts) ? accounts.map((account) => (
            <div key={account.accountId} className="account-card">
              <div className="account-header">
                <div className="account-icon">
                  {getAccountTypeIcon(account.type)}
                </div>
                <div className="account-info">
                  <h4>{account.name}</h4>
                  <p className="account-mask">•••• {account.mask}</p>
                </div>
              </div>
              <div className="account-balance">
                <div className="balance-amount">
                  {formatCurrency(account.balance.current || 0)}
                </div>
                <div className="balance-type">
                  {account.subtype.charAt(0).toUpperCase() + account.subtype.slice(1)}
                </div>
              </div>
            </div>
          )) : null}
        </div>
      </div>

      <div className="quick-actions">
        <h3>Analytics & Insights</h3>
        <div className="analytics-grid">
          
          {/* View Transactions Widget */}
          <div className="analytics-widget transactions-widget">
            <div className="widget-header">
              <div className="widget-info">
                <span className="widget-icon">📊</span>
                <div className="widget-title">
                  <h4>View Transactions</h4>
                  <p>Review your recent financial activity</p>
                </div>
              </div>
              <div className="period-selector">
                <select 
                  value={transactionsPeriod} 
                  onChange={(e) => setTransactionsPeriod(e.target.value)}
                  className="period-dropdown"
                >
                  <option value="last-7-days">Last 7 days</option>
                  <option value="last-30-days">Last 30 days</option>
                  <option value="last-60-days">Last 60 days</option>
                </select>
              </div>
            </div>
            <div className="widget-content">
              <div className="no-data-message">
                No data available
              </div>
            </div>
          </div>

          {/* Analyze Spending Widget */}
          <div className="analytics-widget spending-widget">
            <div className="widget-header">
              <div className="widget-info">
                <span className="widget-icon">📈</span>
                <div className="widget-title">
                  <h4>Analyze Spending</h4>
                  <p>Track your spending patterns and trends</p>
                </div>
              </div>
              <div className="period-selector">
                <select 
                  value={spendingPeriod} 
                  onChange={(e) => setSpendingPeriod(e.target.value)}
                  className="period-dropdown"
                >
                  <option value="last-7-days">Last 7 days</option>
                  <option value="last-30-days">Last 30 days</option>
                  <option value="last-60-days">Last 60 days</option>
                </select>
              </div>
            </div>
            <div className="widget-content">
              <div className="no-data-message">
                No data available
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FinancialOverview;
