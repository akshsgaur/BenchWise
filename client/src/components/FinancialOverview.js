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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

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

  const fetchTransactions = async (period, page = 1) => {
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

      // Fetch 20 transactions per page
      const limit = 20;
      const skip = (page - 1) * limit;

      // Use cached transactions API
      const response = await transactionAPI.getCachedTransactions({
        startDate,
        endDate,
        limit,
        skip
      });

      if (response.data.success) {
        const data = response.data.data;
        setTransactions(data.transactions || []);
        setTotalTransactions(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
      } else {
        console.error('Failed to fetch cached transactions:', response.data.message);
        setTransactions([]);
        setTotalTransactions(0);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      setTotalTransactions(0);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleTransactionsPeriodChange = (value) => {
    setTransactionsPeriod(value);
    setCurrentPage(1); // Reset to page 1 when changing period
    fetchTransactions(value, 1);
  };

  const handlePageChange = (newPage) => {
    fetchTransactions(transactionsPeriod, newPage);
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
          <div className={`balance-amount ${getTotalBalance() > 0 ? 'positive' : getTotalBalance() < 0 ? 'negative' : 'zero'}`}>
            {getTotalBalance() > 0 ? '+' : getTotalBalance() < 0 ? '' : ''}{formatCurrency(getTotalBalance())}
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
        <div className="analytics-grid">
          {/* View Accounts Widget */}
          <div className="analytics-widget accounts-widget">
            <div className="widget-header">
              <div className="widget-info">
                <div className="widget-title">
                  <h4>Accounts</h4>
                  <p>Review your connected accounts</p>
                </div>
              </div>
            </div>
            <div className="widget-content">
              {loading ? (
                <div className="transactions-loading">
                  <div className="loading-spinner"></div>
                  <span>Loading accounts...</span>
                </div>
              ) : accounts && accounts.length > 0 ? (
                <div className="transactions-table-container">
                  <div className="transactions-info">
                    <span>Showing {accounts.length} accounts</span>
                  </div>
                  <div className="transactions-table">
                    <table>
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
                        {accounts.map((account) => (
                          <tr key={account.accountId}>
                            <td className="transaction-date">{account.name}</td>
                            <td className="transaction-description">•••• {account.mask}</td>
                            <td className="transaction-category">
                              {account.subtype.charAt(0).toUpperCase() + account.subtype.slice(1)}
                            </td>
                            <td className={`transaction-amount ${account.balance.current >= 0 ? 'income' : 'expense'}`}>
                              {formatCurrency(account.balance.current || 0)}
                            </td>
                            <td className={`transaction-amount ${account.balance.available >= 0 ? 'income' : 'expense'}`}>
                              {formatCurrency(account.balance.available || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="no-data-message">
                  No accounts found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <div className="analytics-grid">
          
          {/* View Transactions Widget */}
          <div className="analytics-widget transactions-widget">
            <div className="widget-header">
              <div className="widget-info">
                <div className="widget-title">
                  <h4>Transactions</h4>
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
                    <span>Showing {transactions.length} transactions out of {totalTransactions} transactions</span>
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
                            <td className={`transaction-amount ${transaction.amount > 0 ? 'expense' : 'income'}`}>
                              {transaction.amount > 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="transactions-pagination">
                      <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || transactionsLoading}
                        className="pagination-btn"
                      >
                        Previous
                      </button>
                      <span className="pagination-info">
                        {currentPage}/{totalPages}
                      </span>
                      <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || transactionsLoading}
                        className="pagination-btn"
                      >
                        Next
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
