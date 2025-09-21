import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './UserSettings.css';

function UserSettings({ onClose, onLogout }) {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    username: user?.username || ''
  });

  // Account deletion state
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // Reset form when user data changes
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      username: user?.username || ''
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data.user);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setError('Please type "DELETE" to confirm account deletion');
      return;
    }

    setDeleteLoading(true);
    setError('');

    try {
      await api.delete('/auth/account');
      onLogout();
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(error.response?.data?.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="user-settings-overlay" onClick={onClose}>
      <div className="user-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-settings-header">
          <h2>User Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="user-settings-content">
          <div className="settings-tabs">
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button 
              className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="settings-panel">
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profileData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    disabled
                  />
                  <small className="form-help">Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="form-actions">
                  <button type="button" onClick={onClose} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-panel">
              <div className="account-section">
                <h3>Account Information</h3>
                <div className="account-info">
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{user?.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Username:</span>
                    <span className="info-value">{user?.username}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Member since:</span>
                    <span className="info-value">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="danger-section">
                <h3>Danger Zone</h3>
                <div className="danger-content">
                  <div className="danger-warning">
                    <h4>Delete Account</h4>
                    <p>Once you delete your account, there is no going back. This action cannot be undone.</p>
                    <p>All your data, including financial information and settings, will be permanently removed.</p>
                  </div>

                  <div className="delete-form">
                    <label htmlFor="deleteConfirm">
                      Type <strong>DELETE</strong> to confirm:
                    </label>
                    <input
                      type="text"
                      id="deleteConfirm"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="delete-input"
                    />
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                      className="btn-danger"
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button onClick={onClose} className="btn-secondary">
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserSettings;
