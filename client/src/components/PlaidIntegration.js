import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import PropTypes from 'prop-types';
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
      console.log('Creating link token...');
      const response = await plaidAPI.createLinkToken();
      console.log('Link token response:', response.data);
      setLinkToken(response.data.link_token);
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
      
      const response = await plaidAPI.exchangePublicToken(publicToken);
      onIntegrationComplete(response.data.integration);
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

  // Configure Plaid Link
  const config = {
    token: linkToken,
    onSuccess: handlePlaidSuccess,
    onExit: handlePlaidExit,
  };

  const { open, ready } = usePlaidLink(config);

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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div className="plaid-benefit-content">
                <h3>Bank-Level Security</h3>
                <p>Your data is encrypted and never stored on our servers. We use industry-standard security protocols to protect your financial information.</p>
              </div>
            </div>
            <div className="plaid-benefit">
              <div className="plaid-benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="plaid-benefit-content">
                <h3>Real-Time Data</h3>
                <p>Get up-to-date account balances, transaction history, and financial data directly from your bank in real-time.</p>
              </div>
            </div>
            <div className="plaid-benefit">
              <div className="plaid-benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
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
            <h2>Secure Bank Connection</h2>
            <p>Link your bank account to access comprehensive financial tracking, spending analysis, and personalized insights.</p>

            {error && (
              <div className="plaid-error">
                <p>{error}</p>
                <button onClick={createLinkToken} className="plaid-retry-btn">
                  Try Again
                </button>
              </div>
            )}

            {linkToken && (
              <button
                className="plaid-connect-btn"
                onClick={() => open()}
                disabled={!ready || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="plaid-btn-spinner"></span>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="12" y1="21" x2="12" y2="7"></line>
                      <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Connect Bank Account
                  </>
                )}
              </button>
            )}

            <div className="plaid-features">
              <div className="plaid-feature">
                <div className="plaid-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>Read-only access</span>
              </div>
              <div className="plaid-feature">
                <div className="plaid-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>256-bit encryption</span>
              </div>
              <div className="plaid-feature">
                <div className="plaid-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>FDIC insured institutions</span>
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

PlaidIntegration.propTypes = {
  onIntegrationComplete: PropTypes.func.isRequired,
};
