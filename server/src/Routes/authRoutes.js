const express = require('express');
const passport = require('passport');
const authController = require('../Controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Local authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.googleCallback
);


// Protected route to get current user
router.get('/me', authenticateToken, authController.getCurrentUser);

// Profile management routes
router.put('/profile', authenticateToken, authController.updateProfile);
router.delete('/account', authenticateToken, authController.deleteAccount);

module.exports = router;
