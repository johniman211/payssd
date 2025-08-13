const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payssd', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Check if admin user already exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@payssd.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', adminEmail);
      
      // Update password and ensure required profile fields exist
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await User.findByIdAndUpdate(existingAdmin._id, {
        $set: {
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          isEmailVerified: true,
          // Ensure required profile fields exist to satisfy schema validation on login save()
          'profile.firstName': existingAdmin.profile?.firstName || 'Admin',
          'profile.lastName': existingAdmin.profile?.lastName || 'User',
          'profile.phoneNumber': existingAdmin.profile?.phoneNumber || '+211123456789',
          'profile.businessName': existingAdmin.profile?.businessName || 'PaySSD Admin',
          'profile.businessType': existingAdmin.profile?.businessType || 'company',
          'profile.address.street': existingAdmin.profile?.address?.street || 'Admin Street',
          'profile.address.city': existingAdmin.profile?.address?.city || 'Juba',
          'profile.address.state': existingAdmin.profile?.address?.state || 'Central Equatoria',
          'profile.address.country': existingAdmin.profile?.address?.country || 'South Sudan'
        }
      }, { new: true });
      
      console.log('Admin user updated successfully');
    } else {
      // Create new admin user
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      const adminUser = new User({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          phoneNumber: '+211123456789',
          businessName: 'PaySSD Admin',
          businessType: 'company',
          address: {
            street: 'Admin Street',
            city: 'Juba',
            state: 'Central Equatoria',
            country: 'South Sudan'
          }
        },
        kyc: {
          status: 'approved',
          submittedAt: new Date(),
          reviewedAt: new Date(),
          verificationLevel: 'enhanced'
        }
      });
      
      await adminUser.save();
      console.log('Admin user created successfully:', adminEmail);
    }
    
    console.log('\nAdmin Credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', process.env.ADMIN_PASSWORD || 'admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();