import React, { useState, useEffect } from 'react';
import { plaidAPI } from '../services/api';
import './PlaidIntegration.css';

function PlaidIntegration({ onIntegrationComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [linkToken, setLinkToken] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    createLinkToken();
  }, []);

  const createLinkToken = async () => {
    try {
      setIsLoading(true);
      setError('');
      // For now, simulate successful token creation
      // In production, this would call the actual Plaid API
      setLinkToken('mock-link-token');
    } catch (error) {
      console.error('Error creating link token:', error);
      setError('Failed to initialize bank connection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaidSuccess = async (publicToken) => {
    try {
      setIsLoading(true);
      setError('');
      
      // For now, simulate successful integration
      // In production, this would call the actual Plaid API
      const mockIntegration = {
        isIntegrated: true,
        hasPlaid: true,
        institutionName: 'Chase Bank',
        accountsCount: 2
      };
      
      onIntegrationComplete(mockIntegration);
    } catch (error) {
      console.error('Error exchanging public token:', error);
      setError('Failed to connect your bank account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaidExit = (err, metadata) => {
    if (err) {
      console.error('Plaid Link error:', err);
      setError('Bank connection was cancelled or failed. Please try again.');
    }
  };

  if (isLoading && !linkToken) {
    return (
      <div className="plaid-loading">
        <div className="plaid-loading-spinner"></div>
        <p>Initializing bank connection...</p>
      </div>
    );
  }

  return (
    <div className="plaid-integration">
      <div className="plaid-container">
        {/* Left Side - Benefits and Information */}
        <div className="plaid-left">
          <div className="plaid-header">
            <h1>Connect Your Banks</h1>
            <p>BenchWise uses Plaid to securely link your bank accounts and provide comprehensive financial insights</p>
          </div>

          <div className="plaid-benefits">
            <div className="plaid-benefit">
              <div className="plaid-benefit-icon">
                <div className="security-icon">🔒</div>
              </div>
              <div className="plaid-benefit-content">
                <h3>Bank-Level Security</h3>
                <p>Your data is encrypted and never stored on our servers. We use industry-standard security protocols to protect your financial information.</p>
              </div>
            </div>
            <div className="plaid-benefit">
              <div className="plaid-benefit-icon">
                <div className="data-icon">📊</div>
              </div>
              <div className="plaid-benefit-content">
                <h3>Real-Time Data</h3>
                <p>Get up-to-date account balances, transaction history, and financial data directly from your bank in real-time.</p>
              </div>
            </div>
            <div className="plaid-benefit">
              <div className="plaid-benefit-icon">
                <div className="insights-icon">🎯</div>
              </div>
              <div className="plaid-benefit-content">
                <h3>Smart Insights</h3>
                <p>AI-powered analysis of your spending patterns, investment tracking, and personalized financial recommendations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Connection Interface */}
        <div className="plaid-right">
          <div className="plaid-connect-card">
            <h2>Get Started</h2>
            <p>Connect your bank account to unlock powerful financial insights and tracking capabilities.</p>

            {error && (
              <div className="plaid-error">
                <p>{error}</p>
                <button onClick={createLinkToken} className="plaid-retry-btn">
                  Try Again
                </button>
              </div>
            )}

            <button
              className="plaid-connect-btn"
              onClick={() => {
                // This would normally open Plaid Link
                // For now, we'll simulate the success
                const mockPublicToken = 'mock-public-token-' + Date.now();
                handlePlaidSuccess(mockPublicToken);
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect Bank Account'}
            </button>

            <div className="plaid-features">
              <div className="plaid-feature">
                <span className="feature-check">✓</span>
                <span>Read-only access</span>
              </div>
              <div className="plaid-feature">
                <span className="feature-check">✓</span>
                <span>256-bit encryption</span>
              </div>
            </div>

            <p className="plaid-disclaimer">
              By connecting your account, you agree to our Terms of Service and Privacy Policy.
              Your bank credentials are never shared with BenchWise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaidIntegration;
