const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import all models to register them
require('./src/Models/User');
require('./src/Models/Integration');
require('./src/Models/Transaction');

const transactionSyncService = require('./src/Services/transactionSyncService');

async function testTransactionSync() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
    
    // Trigger manual sync
    console.log('Triggering manual transaction sync...');
    await transactionSyncService.manualSync();
    
    console.log('Manual sync completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

testTransactionSync();
