/**
 * Simple test script to validate the backend system
 * Run this to test if everything is working
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Test database connection
async function testDatabaseConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartstock_ai');
    console.log('✅ Database connection successful');
    
    // Test if we can create a simple document
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
    const testDoc = new TestModel({ name: 'test' });
    await testDoc.save();
    await TestModel.deleteOne({ name: 'test' });
    
    console.log('✅ Database operations successful');
    await mongoose.disconnect();
    console.log('✅ Database disconnected successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

// Test if all required modules can be imported
async function testImports() {
  try {
    console.log('🔄 Testing module imports...');
    
    // Test core modules
    const { AIForecastingService } = await import('./utils/aiForecasting.js');
    console.log('✅ AI Forecasting Service imported');
    
    const { checkThreshold } = await import('./utils/checkThreshold.js');
    console.log('✅ Check Threshold utility imported');
    
    const { NotificationService } = await import('./utils/notificationService.js');
    console.log('✅ Notification Service imported');
    
    // Test models
    const Product = await import('./models/Product.js');
    console.log('✅ Product model imported');
    
    const StockMovement = await import('./models/StockMovement.js');
    console.log('✅ StockMovement model imported');
    
    console.log('✅ All modules imported successfully');
    
  } catch (error) {
    console.error('❌ Import test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting SmartStock AI Backend Tests...\n');
  
  await testImports();
  console.log('');
  await testDatabaseConnection();
  
  console.log('\n🎉 All tests completed!');
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
