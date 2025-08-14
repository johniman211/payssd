const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const PaymentLink = require('../models/PaymentLink');
const Payout = require('../models/Payout');
require('dotenv').config();

async function createSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payssd', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Create sample merchants
    const merchants = [];
    for (let i = 1; i <= 5; i++) {
      const email = `merchant${i}@example.com`;
      
      // Check if merchant already exists
      let existingMerchant = await User.findOne({ email });
      if (existingMerchant) {
        merchants.push(existingMerchant);
        console.log(`Merchant already exists: ${email}`);
        continue;
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const merchant = new User({
        email,
        password: hashedPassword,
        role: 'merchant',
        isActive: true,
        isEmailVerified: true,
        profile: {
          firstName: `Merchant`,
          lastName: `${i}`,
          phoneNumber: `+21112345678${i}`,
          businessName: `Business ${i}`,
          businessType: i % 2 === 0 ? 'company' : 'individual',
          address: {
            street: `Street ${i}`,
            city: 'Juba',
            state: 'Central Equatoria',
            country: 'South Sudan'
          }
        },
        kyc: {
          status: i <= 3 ? 'approved' : (i === 4 ? 'pending' : 'rejected'),
          submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          reviewedAt: i <= 4 ? new Date() : null,
          verificationLevel: i <= 3 ? 'enhanced' : 'basic'
        },
        balance: {
          available: Math.floor(Math.random() * 10000),
          pending: Math.floor(Math.random() * 1000),
          currency: 'SSP'
        }
      });
      
      const savedMerchant = await merchant.save();
      merchants.push(savedMerchant);
      console.log(`Created merchant: ${merchant.email}`);
    }
    
    // Create sample payment links
    const paymentLinks = [];
    for (let i = 0; i < merchants.length; i++) {
      const merchant = merchants[i];
      for (let j = 1; j <= 2; j++) {
        const linkId = `link_${merchant._id}_${j}`;
        
        // Check if payment link already exists
        const existingLink = await PaymentLink.findOne({ linkId });
        if (existingLink) {
          console.log(`Payment link already exists: ${linkId}`);
          paymentLinks.push(existingLink);
          continue;
        }
        
        const paymentLink = new PaymentLink({
          linkId,
          merchant: merchant._id,
          title: `Payment Link ${j} for ${merchant.profile.businessName}`,
          description: `Sample payment link ${j}`,
          amount: Math.floor(Math.random() * 1000) + 100,
          currency: 'SSP',
          isActive: Math.random() > 0.3,
          isMultiUse: j === 1,
          maxUses: j === 1 ? 10 : 1,
          currentUses: Math.floor(Math.random() * 5),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          allowedPaymentMethods: ['mtn_momo', 'digicash']
        });
        
        const savedLink = await paymentLink.save();
        paymentLinks.push(savedLink);
        console.log(`Created payment link: ${paymentLink.linkId}`);
      }
    }
    
    // Create sample transactions
    const statuses = ['successful', 'failed', 'pending'];
    const paymentMethods = ['mtn_momo', 'digicash'];
    
    for (let i = 0; i < 20; i++) {
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const paymentLink = paymentLinks.find(link => link.merchant.toString() === merchant._id.toString());
      
      const transactionId = `txn_${Date.now()}_${i}`;
      const transaction = new Transaction({
        transactionId,
        reference: transactionId,
        merchant: merchant._id,
        paymentLink: paymentLink ? paymentLink._id : null,
        amount: Math.floor(Math.random() * 1000) + 50,
        currency: 'SSP',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        customer: {
          email: `customer${i}@example.com`,
          phoneNumber: `+21198765432${i % 10}`,
          name: `Customer ${i + 1}`
        },
        description: `Sample transaction ${i + 1}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        metadata: {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      await transaction.save();
      console.log(`Created transaction: ${transaction.transactionId}`);
    }
    
    // Create sample payouts
    for (let i = 0; i < 5; i++) {
      const merchant = merchants[i];
      
      const payout = new Payout({
        payoutId: `payout_${Date.now()}_${i}`,
        merchant: merchant._id,
        amount: Math.floor(Math.random() * 5000) + 1000,
        currency: 'SSP',
        payoutMethod: 'bank_transfer',
        status: i < 3 ? 'completed' : (i === 3 ? 'pending' : 'failed'),
        destination: {
          accountName: `${merchant.profile.firstName} ${merchant.profile.lastName}`,
          accountNumber: `123456789${i}`,
          bankName: 'Commercial Bank of South Sudan',
          swiftCode: 'CBSS'
        },
        requestedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
        processedAt: i < 4 ? new Date() : null
      });
      
      await payout.save();
      console.log(`Created payout: ${payout.payoutId}`);
    }
    
    console.log('\n✅ Sample data created successfully!');
    console.log('📊 Dashboard should now display data');
    console.log('\nSample Data Summary:');
    console.log(`- ${merchants.length} merchants created`);
    console.log(`- ${paymentLinks.length} payment links created`);
    console.log('- 20 transactions created');
    console.log('- 5 payouts created');
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSampleData();