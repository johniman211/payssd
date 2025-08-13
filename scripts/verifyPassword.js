const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function verifyPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payssd', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find merchant1@example.com
    const user = await User.findOne({ email: 'merchant1@example.com' });
    
    if (!user) {
      console.log('❌ User merchant1@example.com not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('User role:', user.role);
    console.log('User active:', user.isActive);
    console.log('User email verified:', user.isEmailVerified);
    console.log('User locked:', user.isLocked);
    
    // Test password
    const testPassword = 'password123';
    const isMatch = await user.comparePassword(testPassword);
    
    console.log(`\n🔐 Password verification for "${testPassword}":`, isMatch ? '✅ MATCH' : '❌ NO MATCH');
    
    // Also test with some other common passwords
    const testPasswords = ['password', '123456', 'admin', 'merchant1'];
    
    console.log('\n🔍 Testing other common passwords:');
    for (const pwd of testPasswords) {
      const match = await user.comparePassword(pwd);
      console.log(`  "${pwd}": ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
    
  } catch (error) {
    console.error('Error verifying password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

verifyPassword();