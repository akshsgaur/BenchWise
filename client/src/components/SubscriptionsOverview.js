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
          <div className="empty-icon">💳</div>
          <h4>No subscriptions found</h4>
          <p>Connect your accounts to automatically detect and track your subscriptions</p>
          <button className="connect-btn">Connect Accounts</button>
        </div>
      </div>

      <div className="subscription-categories">
        <h3>Subscription Categories</h3>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon">🎵</div>
            <h4>Entertainment</h4>
            <p>Streaming services, music, gaming</p>
            <div className="category-amount">$0.00</div>
          </div>
          <div className="category-card">
            <div className="category-icon">💼</div>
            <h4>Productivity</h4>
            <p>Software, cloud storage, tools</p>
            <div className="category-amount">$0.00</div>
          </div>
          <div className="category-card">
            <div className="category-icon">🏠</div>
            <h4>Utilities</h4>
            <p>Internet, phone, utilities</p>
            <div className="category-amount">$0.00</div>
          </div>
          <div className="category-card">
            <div className="category-icon">💪</div>
            <h4>Health & Fitness</h4>
            <p>Gym memberships, health apps</p>
            <div className="category-amount">$0.00</div>
          </div>
        </div>
      </div>

      <div className="subscription-insights">
        <h3>Smart Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🔍</div>
            <h4>Subscription Audit</h4>
            <p>AI-powered analysis to identify unused or duplicate subscriptions</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">💰</div>
            <h4>Savings Opportunities</h4>
            <p>Find better deals and optimize your subscription spending</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">📅</div>
            <h4>Bill Reminders</h4>
            <p>Never miss a payment with smart notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionsOverview;
