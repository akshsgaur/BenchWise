import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © 2025 BenchWise. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#" className="footer-bottom-link">Privacy</a>
              <a href="#" className="footer-bottom-link">Terms</a>
              <a href="#" className="footer-bottom-link">Security</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
