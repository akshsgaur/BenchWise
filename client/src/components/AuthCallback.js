import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=oauth_failed');
      return;
    }

    if (token) {
      handleOAuthCallback(token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [searchParams, handleOAuthCallback, navigate]);

  return (
    <div className="loading">
      Completing authentication...
    </div>
  );
}

export default AuthCallback;
