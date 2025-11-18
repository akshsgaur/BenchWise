import React, { useState, useEffect, useRef } from 'react';
import './ServerWakeUp.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const MAX_ATTEMPTS = 60; // Keep trying for up to 5 minutes

function ServerWakeUp({ children }) {
  const [serverReady, setServerReady] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          setServerReady(true);
          return;
        }
      } catch (error) {
        // Server not ready yet, continue polling
      }
      
      // Increment attempts and retry after a delay
      attemptsRef.current += 1;
      setAttempts(attemptsRef.current);

      // Check if we've exceeded max attempts
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setError('Server is taking longer than expected to start. Please wait...');
      }
      
      // Retry after 2 seconds (exponential backoff up to 5 seconds)
      const delay = Math.min(2000 + attemptsRef.current * 500, 5000);
      timeoutRef.current = setTimeout(checkServerHealth, delay);
    };

    checkServerHealth();

    // Cleanup function to clear timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (serverReady) {
    return children;
  }

  return (
    <div className="server-wakeup">
      <div className="server-wakeup-content">
        {!error ? (
          <>
            <div className="server-wakeup-spinner">
              <div className="spinner"></div>
            </div>
            <h2>Waking up the server...</h2>
            <p>Please wait while we start the BenchWise server.</p>
            <p className="server-wakeup-attempts">
              {attempts > 0 && `Checking... (attempt ${attempts})`}
            </p>
          </>
        ) : (
          <>
            <div className="server-wakeup-error">⚠️</div>
            <h2>Server Connection Issue</h2>
            <p className="server-wakeup-error-message">{error}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default ServerWakeUp;

