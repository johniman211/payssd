const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function updatePassword() {
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
    
    // Update password to 'password123'
    const newPassword = 'password123';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the user's password directly
    await User.updateOne(
      { email: 'merchant1@example.com' },
      { 
        password: hashedPassword,
        $unset: { 
          loginAttempts: 1, 
          lockUntil: 1 
        }
      }
    );
    
    console.log('✅ Password updated successfully for merchant1@example.com');
    
    // Verify the new password
    const updatedUser = await User.findOne({ email: 'merchant1@example.com' });
    const isMatch = await updatedUser.comparePassword(newPassword);
    
    console.log(`🔐 Password verification for "${newPassword}":`, isMatch ? '✅ MATCH' : '❌ NO MATCH');
    
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

updatePassword();