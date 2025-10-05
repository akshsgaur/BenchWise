const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import all models to register them
require('./src/Models/User');
require('./src/Models/Integration');
require('./src/Models/Transaction');

async function checkTransactions() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
    
    // Get Transaction model
    const Transaction = mongoose.model('Transaction');
    
    // Count total transactions
    const totalCount = await Transaction.countDocuments();
    console.log(`\n📊 Total transactions in database: ${totalCount}`);
    
    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(10)
      .lean();
    
    console.log('\n📋 Recent transactions:');
    recentTransactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.name} - $${tx.amount} - ${tx.date} (${tx.institutionId})`);
    });
    
    // Get transactions by institution
    const byInstitution = await Transaction.aggregate([
      {
        $group: {
          _id: '$institutionId',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    console.log('\n🏦 Transactions by institution:');
    byInstitution.forEach(inst => {
      console.log(`${inst._id}: ${inst.count} transactions, $${inst.totalAmount.toFixed(2)} total`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    process.exit(0);
  }
}

checkTransactions();

