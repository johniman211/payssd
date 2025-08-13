const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function resetLoginAttempts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payssd', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Reset login attempts for merchant1@example.com
    const result = await User.updateOne(
      { email: 'merchant1@example.com' },
      { 
        $unset: { 
          loginAttempts: 1, 
          lockUntil: 1 
        } 
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ Login attempts reset successfully for merchant1@example.com');
    } else {
      console.log('❌ User merchant1@example.com not found');
    }
    
  } catch (error) {
    console.error('Error resetting login attempts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetLoginAttempts();