import React from 'react';
import './InvestmentTracking.css';

function InvestmentTracking() {
  return (
    <div className="investment-tracking">
      <div className="tracking-header">
        <h2>Investment Tracking</h2>
        <p>Monitor your portfolio performance and make informed decisions</p>
      </div>

      <div className="portfolio-summary">
        <div className="portfolio-value">
          <h3>Portfolio Value</h3>
          <div className="value-amount">$0.00</div>
          <div className="value-change positive">+0.00% (0.00%)</div>
        </div>
        <div className="portfolio-stats">
          <div className="stat-item">
            <span className="stat-label">Total Return</span>
            <span className="stat-value">$0.00</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Holdings</span>
            <span className="stat-value">0</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Diversification</span>
            <span className="stat-value">N/A</span>
          </div>
        </div>
      </div>

      <div className="holdings-section">
        <h3>Your Holdings</h3>
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <h4>No investments found</h4>
          <p>Connect your investment accounts to start tracking your portfolio</p>
          <button className="connect-btn">Connect Investment Account</button>
        </div>
      </div>

      <div className="market-insights">
        <h3>Market Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <h4>Market Analysis</h4>
            <p>AI-powered insights on market trends and opportunities</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <h4>Investment Recommendations</h4>
            <p>Personalized suggestions based on your risk profile</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">⚡</div>
            <h4>Real-time Alerts</h4>
            <p>Stay informed about significant market movements</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvestmentTracking;
