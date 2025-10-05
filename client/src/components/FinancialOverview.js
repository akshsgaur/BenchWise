import React, { useState, useEffect } from 'react';
import { plaidAPI, transactionAPI } from '../services/api';
import PlaidIntegration from './PlaidIntegration';
import './FinancialOverview.css';

function FinancialOverview() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankConnections, setBankConnections] = useState([]);
  const [transactionsPeriod, setTransactionsPeriod] = useState('last-30-days');
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsOffset, setTransactionsOffset] = useState(0);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch transactions when component mounts
  useEffect(() => {
    fetchTransactions(transactionsPeriod);
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

  const fetchTransactions = async (period, offset = 0, append = false) => {
    try {
      setTransactionsLoading(true);
      
      // Calculate date range based on selected period
      const endDate = new Date().toISOString().split('T')[0];
      let startDate;
      
      switch (period) {
        case 'last-7-days':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'last-30-days':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'last-60-days':
          startDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      // Fetch 20 transactions at a time
      const limit = 20;

      // Use cached transactions API
      const response = await transactionAPI.getCachedTransactions({
        startDate,
        endDate,
        limit,
        skip: offset
      });

      if (response.data.success) {
        const data = response.data.data;
        const newTransactions = data.transactions || [];
        
        if (append) {
          // Append to existing transactions for "Load More"
          setTransactions(prev => [...prev, ...newTransactions]);
        } else {
          // Replace transactions for new period or initial load
          setTransactions(newTransactions);
        }
        
        // Check if there are more transactions available
        setHasMoreTransactions(newTransactions.length === limit);
        setTransactionsOffset(offset + newTransactions.length);
      } else {
        console.error('Failed to fetch cached transactions:', response.data.message);
        if (!append) {
          setTransactions([]);
          setHasMoreTransactions(false);
          setTransactionsOffset(0);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      if (!append) {
        setTransactions([]);
        setHasMoreTransactions(false);
        setTransactionsOffset(0);
      }
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleTransactionsPeriodChange = (value) => {
    setTransactionsPeriod(value);
    setTransactionsOffset(0); // Reset offset when changing period
    fetchTransactions(value, 0, false); // Start fresh for new period
  };

  const handleLoadMore = () => {
    fetchTransactions(transactionsPeriod, transactionsOffset, true); // Append more transactions
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
              </div>
              <div className="bank-status">
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
        <div className="accounts-table-container">
          <div className="accounts-table-scroll">
            <table className="accounts-table">
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Account Number</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Available</th>
              </tr>
            </thead>
            <tbody>
              {accounts && Array.isArray(accounts) ? accounts.map((account) => (
                <tr key={account.accountId} className="account-row">
                  <td className="account-name">{account.name}</td>
                  <td className="account-mask">•••• {account.mask}</td>
                  <td className="account-type">
                    {account.subtype.charAt(0).toUpperCase() + account.subtype.slice(1)}
                  </td>
                  <td className="account-balance">
                    {formatCurrency(account.balance.current || 0)}
                  </td>
                  <td className="account-available">
                    {formatCurrency(account.balance.available || 0)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="no-accounts">
                    No accounts found
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <h3>Transactions</h3>
        <div className="analytics-grid">
          
          {/* View Transactions Widget */}
          <div className="analytics-widget transactions-widget">
            <div className="widget-header">
              <div className="widget-info">
                <div className="widget-title">
                  <h4>View Transactions</h4>
                  <p>Review your recent financial activity</p>
                </div>
              </div>
              <div className="period-selector">
                <select 
                  value={transactionsPeriod} 
                  onChange={(e) => handleTransactionsPeriodChange(e.target.value)}
                  className="period-dropdown"
                >
                  <option value="last-7-days">Last 7 days</option>
                  <option value="last-30-days">Last 30 days</option>
                  <option value="last-60-days">Last 60 days</option>
                </select>
              </div>
            </div>
            <div className="widget-content">
              {transactionsLoading ? (
                <div className="transactions-loading">
                  <div className="loading-spinner"></div>
                  <span>Loading transactions...</span>
                </div>
              ) : transactions.length > 0 ? (
                <div className="transactions-table-container">
                  <div className="transactions-info">
                    <span>Showing {transactions.length} transactions</span>
                  </div>
                  <div className="transactions-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.transaction_id}>
                            <td className="transaction-date">
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                            <td className="transaction-description">
                              <div className="transaction-name">{transaction.name}</div>
                              {transaction.merchant_name && (
                                <div className="transaction-merchant">{transaction.merchant_name}</div>
                              )}
                            </td>
                            <td className="transaction-category">
                              {transaction.category && transaction.category.join(' > ')}
                            </td>
                            <td className={`transaction-amount ${transaction.amount < 0 ? 'expense' : 'income'}`}>
                              {transaction.amount < 0 ? '-' : ''}${Math.abs(transaction.amount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {hasMoreTransactions && (
                    <div className="load-more-container">
                      <button 
                        onClick={handleLoadMore}
                        disabled={transactionsLoading}
                        className="load-more-btn"
                      >
                        {transactionsLoading ? 'Loading...' : 'Load More'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-data-message">
                  No transactions found for this period
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="ai-analytics-section">
        <h3>AI Analytics and Insights</h3>
        <div className="ai-recommendations-widget">
          <div className="recommendations-content">
            <div className="no-data-message">
              <p>No financial data available for analysis. Connect your accounts to get personalized AI insights and recommendations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialOverview;
