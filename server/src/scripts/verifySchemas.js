/**
 * Script to verify MongoDB schemas and collections
 * Run with: node src/scripts/verifySchemas.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models to register them
const User = require('../Models/User');
const Integration = require('../Models/Integration');
const Analysis = require('../Models/Analysis');
const Advice = require('../Models/Advice');

async function verifySchemas() {
  try {
    console.log('\n🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully\n');

    // Get database
    const db = mongoose.connection.db;

    // List all collections
    console.log('📋 Existing Collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.name}`);
    });

    console.log('\n📊 Registered Models:');
    const modelNames = mongoose.modelNames();
    modelNames.forEach((modelName, index) => {
      const model = mongoose.model(modelName);
      console.log(`   ${index + 1}. ${modelName} -> Collection: ${model.collection.name}`);
    });

    // Check indexes for each model
    console.log('\n🔑 Indexes:');

    for (const modelName of modelNames) {
      const model = mongoose.model(modelName);
      const indexes = await model.collection.listIndexes().toArray();
      console.log(`\n   ${modelName}:`);
      indexes.forEach(index => {
        const indexFields = Object.keys(index.key).join(', ');
        console.log(`      - ${index.name}: {${indexFields}}`);
      });
    }

    // Count documents in each collection
    console.log('\n📈 Document Counts:');
    for (const modelName of modelNames) {
      const model = mongoose.model(modelName);
      const count = await model.countDocuments();
      console.log(`   ${modelName}: ${count} document(s)`);
    }

    console.log('\n✅ Schema verification complete!\n');

    // Display new schemas specifically
    console.log('🆕 New AI Analysis Schemas:');
    console.log('   1. Analysis Collection - Stores AI-powered transaction analyses');
    console.log('      - Auto-expires after 90 days');
    console.log('      - Indexed on: userId, analysisDate, createdAt');
    console.log('   2. Advice Collection - Stores personalized financial advice');
    console.log('      - Auto-expires based on expiresAt field');
    console.log('      - Indexed on: userId, expiresAt');

    console.log('\n💡 Next Steps:');
    console.log('   1. Connect a Plaid account via /api/plaid endpoints');
    console.log('   2. Call /api/v1/analysis/monthly to generate analysis');
    console.log('   3. Call /api/v1/analysis/advice to get personalized advice');
    console.log('   4. View the data in MongoDB or via /api/v1/analysis/history\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed\n');
  }
}

// Run the verification
verifySchemas();
