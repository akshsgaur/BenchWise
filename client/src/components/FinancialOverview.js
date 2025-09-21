import React, { useState, useEffect } from 'react';
import { plaidAPI } from '../services/api';
import './FinancialOverview.css';

function FinancialOverview() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await plaidAPI.getAccounts();
      setAccounts(response.data.accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + (account.balance.current || 0), 0);
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

  return (
    <div className="financial-overview">
      <div className="overview-header">
        <h2>Financial Overview</h2>
        <p>Your complete financial picture at a glance</p>
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
              {formatCurrency(accounts.reduce((total, account) => 
                total + (account.balance.available || 0), 0))}
            </span>
          </div>
          <div className="balance-item">
            <span className="balance-label">Accounts</span>
            <span className="balance-value">{accounts.length}</span>
          </div>
        </div>
      </div>

      <div className="accounts-section">
        <h3>Your Accounts</h3>
        <div className="accounts-grid">
          {accounts.map((account) => (
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
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span>View Transactions</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📈</span>
            <span>Analyze Spending</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">🎯</span>
            <span>Set Goals</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📋</span>
            <span>Export Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinancialOverview;
