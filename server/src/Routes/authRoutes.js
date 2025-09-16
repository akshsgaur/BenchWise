const express = require('express');
const passport = require('passport');
const authController = require('../Controllers/authController');

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

// Microsoft OAuth routes
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));
router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/login' }),
  authController.microsoftCallback
);

// Protected route to get current user
router.get('/me', authController.getCurrentUser);

module.exports = router;
