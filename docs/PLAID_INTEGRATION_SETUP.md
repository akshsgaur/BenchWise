# Plaid Integration Setup Instructions

## Step 1: Create .env file

Create a `.env` file in the `BenchWise/server` directory with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/benchwise

# Server Configuration
NODE_ENV=development
PORT=5000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-benchwise-2024
JWT_EXPIRES_IN=7d

# Plaid Configuration (REQUIRED)
# Get these from your Plaid Dashboard: https://dashboard.plaid.com/
PLAID_CLIENT_ID=your-plaid-client-id-here
PLAID_SECRET=your-plaid-secret-here
PLAID_ENV=sandbox

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Step 2: Get Plaid Credentials

1. Go to [Plaid Dashboard](https://dashboard.plaid.com/)
2. Create a free account
3. Get your `PLAID_CLIENT_ID` and `PLAID_SECRET` from the dashboard
4. Replace the placeholder values in your `.env` file

## Step 3: Test the Integration

1. Start the server:
   ```bash
   cd BenchWise/server
   npm run dev
   ```

2. Start the client:
   ```bash
   cd BenchWise/client
   npm start
   ```

3. Navigate to `http://localhost:3000/dashboard`
4. Click "Connect Bank Account"
5. Use sandbox credentials:
   - Username: `user_good`
   - Password: `pass_good`

## What's Been Implemented

✅ **Real Plaid Link Integration**: The "Connect Bank Account" button now opens the actual Plaid Link widget
✅ **Server-side API**: Complete Plaid API integration with link token creation and public token exchange
✅ **Database Integration**: Bank account data is stored in MongoDB
✅ **Error Handling**: Comprehensive error handling and user feedback
✅ **Security**: Bank-level security with read-only access

## Features

- **Secure Bank Connection**: Uses Plaid's secure authentication flow
- **Real-time Data**: Fetches actual account balances and transaction data
- **Sandbox Testing**: Test with sandbox data before going to production
- **Error Recovery**: Handles connection failures gracefully
- **User Feedback**: Loading states and clear error messages

The integration is now complete and ready for testing!

