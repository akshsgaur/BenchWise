const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Debug: Check if .env is loaded
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('PLAID_CLIENT_ID:', process.env.PLAID_CLIENT_ID ? 'Set' : 'Not set');
console.log('PLAID_SECRET:', process.env.PLAID_SECRET ? 'Set' : 'Not set');
console.log('PLAID_ENV:', process.env.PLAID_ENV);

const authRoutes = require('./Routes/authRoutes');
const plaidRoutes = require('./Routes/plaidRoutes');
const integrationRoutes = require('./Routes/integrationRoutes');
const transactionRoutes = require('./Routes/transactionRoutes');
const insightRoutes = require('./Routes/insightRoutes');
const aiAdvisorRoutes = require('./Routes/aiAdvisorRoutes');

// Import passport configuration
require('./Config/passport');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const defaultOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOrigins = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;

const corsOptions = {
  origin: corsOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
  
  // Start transaction sync cron job
  const transactionSyncService = require('./Services/transactionSyncService');
  transactionSyncService.startCronJob();
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plaid', plaidRoutes);
app.use('/api/integration', integrationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/v1/ai-advisor', aiAdvisorRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
