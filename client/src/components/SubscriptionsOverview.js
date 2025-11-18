import React, { useState, useEffect } from 'react';
import { subscriptionAPI } from '../services/api';
import './SubscriptionsOverview.css';

function SubscriptionsOverview() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [analyzeSuccess, setAnalyzeSuccess] = useState(false);

  // Fetch existing analysis on component mount
  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionAPI.getSubscriptionAnalysis();
      if (response.data.success && response.data.data.analysis) {
        setAnalysis(response.data.data.analysis);
      } else {
        setAnalysis(null);
      }
    } catch (err) {
      console.error('Error fetching subscription analysis:', err);
      setError(err.response?.data?.message || 'Failed to fetch subscription analysis');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      const response = await subscriptionAPI.analyzeSubscriptions();
      if (response.data.success) {
        setAnalysis(response.data.data.analysis);
        // Show success popup
        setAnalyzeSuccess(true);
        setTimeout(() => {
          setAnalyzeSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Error analyzing subscriptions:', err);
      const errorMessage = err.response?.data?.message || 'Failed to analyze subscriptions';
      setError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const formatGeneratedTime = (timestamp) => {
    if (!timestamp) return null;
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Entertainment': (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
      ),
      'Productivity': (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
      'Utilities': (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      ),
      'Health & Fitness': (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6.5 6.5h11v11h-11z"/>
          <path d="M6.5 6.5L12 12l5.5-5.5"/>
          <path d="M6.5 17.5L12 12l5.5 5.5"/>
          <path d="M17.5 6.5L12 12l5.5 5.5"/>
          <path d="M17.5 17.5L12 12l-5.5 5.5"/>
        </svg>
      )
    };
    return icons[category] || icons['Entertainment'];
  };

  return (
    <div className="subscriptions-overview">
      <div className="overview-header">
        <h2>Subscriptions Overview</h2>
        <p>Track and manage your recurring subscriptions and bills</p>
        <div className="header-actions">
          <div className="header-actions-group">
            <button 
              className="analyze-subscriptions-btn" 
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <span className="btn-spinner"></span>
                  Analyzing...
                </>
              ) : (
                'Analyze Subscriptions'
              )}
            </button>
            {analysis?.generatedAt && (
              <span className="subscriptions-status-inline">Last analyzed {formatGeneratedTime(analysis.generatedAt)}</span>
            )}
          </div>
        </div>
      </div>

      {(analyzing || analyzeSuccess) && (
        <div className="popup-container">
          {analyzing && (
            <div className="sync-loading-popup">
              <div className="sync-popup-content">
                <div className="popup-spinner"></div>
                <div className="popup-text">
                  <h4>Analyzing Subscriptions</h4>
                  <p>Detecting recurring subscriptions from your transactions...</p>
                </div>
              </div>
            </div>
          )}

          {analyzeSuccess && (
            <div className="sync-success-popup">
              <div className="sync-popup-content success">
                <div className="popup-success-icon">✓</div>
                <div className="popup-text">
                  <h4>Analysis Complete</h4>
                  <p>Subscription analysis completed successfully!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message" style={{ 
          padding: '12px', 
          margin: '16px 0', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c33'
        }}>
          {error}
        </div>
      )}

      {loading && !analysis && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading subscription data...</p>
        </div>
      )}

      {analysis ? (
        <>
          <div className="subscriptions-summary">
            <div className="total-spending">
              <h3>Monthly Spending</h3>
              <div className="spending-amount">
                {formatCurrency(analysis.summary?.totalMonthlySpending)}
              </div>
              <div className="spending-change">
                {analysis.summary?.activeSubscriptions || 0} active subscriptions
              </div>
            </div>
            <div className="subscription-stats">
              <div className="stat-item">
                <span className="stat-label">Active Subscriptions</span>
                <span className="stat-value">{analysis.summary?.activeSubscriptions || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Yearly Spending</span>
                <span className="stat-value">{formatCurrency(analysis.summary?.totalYearlySpending)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Savings Potential</span>
                <span className="stat-value">{formatCurrency(analysis.summary?.savingsPotential)}</span>
              </div>
            </div>
          </div>

          <div className="subscriptions-section">
            <h3>Your Subscriptions</h3>
            {analysis.subscriptions && analysis.subscriptions.length > 0 ? (
              <div className="subscriptions-table-container">
                <table className="subscriptions-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Merchant</th>
                      <th>Category</th>
                      <th>Frequency</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.subscriptions.map((sub, index) => (
                      <tr key={index}>
                        <td className="subscription-name">{sub.name}</td>
                        <td className="subscription-merchant">{sub.merchant || sub.name}</td>
                        <td className="subscription-category">
                          {sub.category || 'Other'}
                        </td>
                        <td className="subscription-frequency">
                          <span className="frequency-badge">{sub.frequency || 'monthly'}</span>
                        </td>
                        <td className="subscription-amount">{formatCurrency(sub.amount)}</td>
                        <td className="subscription-status">
                          <span className={`status-badge ${sub.isActive !== false ? 'active' : 'inactive'}`}>
                            {sub.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No subscriptions detected in your transactions.</p>
              </div>
            )}
          </div>

          {analysis.categories && analysis.categories.length > 0 && (
            <div className="subscription-categories">
              <h3>Subscription Categories</h3>
              <div className="categories-grid">
                {analysis.categories.map((cat, index) => (
                  <div key={index} className="category-card">
                    <div className="category-icon">
                      {getCategoryIcon(cat.category)}
                    </div>
                    <h4>{cat.category}</h4>
                    <p>{cat.subscriptionCount} subscription{cat.subscriptionCount !== 1 ? 's' : ''}</p>
                    <div className="category-amount">
                      {formatCurrency(cat.totalAmount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.insights && (
            <div className="subscription-insights">
              <h3>Smart AI Insights</h3>
              <div className="insights-grid">
                {analysis.insights.recommendations && analysis.insights.recommendations.length > 0 && (
                  <div className="insight-card insight-card-recommendations">
                    <div className="insight-header">
                      <div className="insight-icon recommendations-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <h4>Recommendations</h4>
                    </div>
                    <ul className="insight-list">
                      {analysis.insights.recommendations.map((rec, index) => (
                        <li key={index} className="insight-item">
                          <span className="insight-bullet"></span>
                          <span className="insight-text">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.insights.warnings && analysis.insights.warnings.length > 0 && (
                  <div className="insight-card insight-card-warnings">
                    <div className="insight-header">
                      <div className="insight-icon warnings-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </div>
                      <h4>Warnings</h4>
                    </div>
                    <ul className="insight-list">
                      {analysis.insights.warnings.map((warning, index) => (
                        <li key={index} className="insight-item">
                          <span className="insight-bullet"></span>
                          <span className="insight-text">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.insights.opportunities && analysis.insights.opportunities.length > 0 && (
                  <div className="insight-card insight-card-opportunities">
                    <div className="insight-header">
                      <div className="insight-icon opportunities-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </div>
                      <h4>Opportunities</h4>
                    </div>
                    <ul className="insight-list">
                      {analysis.insights.opportunities.map((opp, index) => (
                        <li key={index} className="insight-item">
                          <span className="insight-bullet"></span>
                          <span className="insight-text">{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : !loading && (
        <div className="subscriptions-summary">
          <div className="total-spending">
            <h3>Monthly Spending</h3>
            <div className="spending-amount">$0.00</div>
            <div className="spending-change">No subscriptions found</div>
          </div>
          <div className="subscription-stats">
            <div className="stat-item">
              <span className="stat-label">Active Subscriptions</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Upcoming Bills</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Savings Potential</span>
              <span className="stat-value">$0.00</span>
            </div>
          </div>
        </div>
      )}

      {!analysis && !loading && (
        <div className="subscriptions-section">
          <h3>Your Subscriptions</h3>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <h4>No subscriptions found</h4>
            <p>Click "Analyze Subscriptions" to detect recurring subscriptions from your transaction history</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionsOverview;
