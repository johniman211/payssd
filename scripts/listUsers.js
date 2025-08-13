const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function listUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payssd', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Get all users
    const users = await User.find({}, 'email role isActive isEmailVerified loginAttempts lockUntil').lean();
    
    console.log('\n📋 Users in database:');
    console.log('========================');
    
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Email Verified: ${user.isEmailVerified}`);
        console.log(`   Login Attempts: ${user.loginAttempts || 0}`);
        console.log(`   Locked Until: ${user.lockUntil ? new Date(user.lockUntil) : 'Not locked'}`);
        console.log('   ---');
      });
    }
    
    console.log(`\nTotal users: ${users.length}`);
    
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

listUsers();