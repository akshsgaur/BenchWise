import React from 'react';
import './SubscriptionsOverview.css';

function SubscriptionsOverview() {
  return (
    <div className="subscriptions-overview">
      <div className="overview-header">
        <h2>Subscriptions Overview</h2>
        <p>Track and manage your recurring subscriptions and bills</p>
      </div>

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
          <p>Connect your accounts to automatically detect and track your subscriptions</p>
          <button className="connect-btn">Connect Accounts</button>
        </div>
      </div>

      <div className="subscription-categories">
        <h3>Subscription Categories</h3>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <h4>Entertainment</h4>
            <p>Streaming services, music, gaming</p>
            <div className="category-amount">$0.00</div>
          </div>
          <div className="category-card">
            <div className="category-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h4>Productivity</h4>
            <p>Software, cloud storage, tools</p>
            <div className="category-amount">$0.00</div>
          </div>
          <div className="category-card">
            <div className="category-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </div>
            <h4>Utilities</h4>
            <p>Internet, phone, utilities</p>
            <div className="category-amount">$0.00</div>
          </div>
          <div className="category-card">
            <div className="category-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6.5 6.5h11v11h-11z"/>
                <path d="M6.5 6.5L12 12l5.5-5.5"/>
                <path d="M6.5 17.5L12 12l5.5 5.5"/>
                <path d="M17.5 6.5L12 12l5.5 5.5"/>
                <path d="M17.5 17.5L12 12l-5.5 5.5"/>
              </svg>
            </div>
            <h4>Health & Fitness</h4>
            <p>Gym memberships, health apps</p>
            <div className="category-amount">$0.00</div>
          </div>
        </div>
      </div>

      <div className="subscription-insights">
        <h3>Smart AI Insights</h3>
        <div className="ai-recommendations-widget">
          <div className="recommendations-content">
            <div className="recommendation-item">
              <h5>Subscription Audit</h5>
              <p>Based on your spending patterns, we recommend reviewing your entertainment subscriptions. You currently have multiple streaming services that may have overlapping content. Consider consolidating to 1-2 services to save approximately $15-25 per month.</p>
            </div>
            <div className="recommendation-item">
              <h5>Savings Opportunities</h5>
              <p>Your productivity software subscriptions show potential for optimization. Several tools offer similar functionality, and switching to annual billing could save you 15-20% on most subscriptions. Estimated monthly savings: $8-12.</p>
            </div>
            <div className="recommendation-item">
              <h5>Usage Analysis</h5>
              <p>Our AI detected that you have a gym membership but haven't used it in the past 3 months. Consider pausing or canceling this subscription temporarily. You could save $40-60 per month and reactivate when you're ready to use it regularly.</p>
            </div>
            <div className="recommendation-item">
              <h5>Bill Optimization</h5>
              <p>Set up automatic payments for your essential utilities to avoid late fees. We also recommend reviewing your internet and phone plans - there may be better deals available that could reduce your monthly bills by $10-20.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionsOverview;
