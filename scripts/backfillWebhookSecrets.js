/*
  Script: backfillWebhookSecrets.js
  Purpose: Backfill webhookSecret for existing users that have API keys but lack webhookSecret, enabling webhook signature verification.
  Usage:
    NODE_ENV=production node scripts/backfillWebhookSecrets.js
*/

require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');

const User = require(path.join(__dirname, '..', 'models', 'User'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/payssd';

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected.');

    const filter = {
      'apiKeys': { $exists: true, $ne: [] },
      $or: [
        { 'apiKeys.webhookSecret': { $exists: false } },
        { 'apiKeys.webhookSecret': null },
        { 'apiKeys.webhookSecret': '' }
      ]
    };

    const users = await User.find(filter);
    console.log(`Found ${users.length} user(s) missing webhookSecret.`);

    let updated = 0;
    for (const user of users) {
      const apiKeys = (user.apiKeys || []).map(k => ({
        ...k.toObject?.() || k,
        webhookSecret: k.webhookSecret && typeof k.webhookSecret === 'string' && k.webhookSecret.length >= 32
          ? k.webhookSecret
          : crypto.randomBytes(32).toString('hex')
      }));
      user.apiKeys = apiKeys;
      await user.save();
      updated++;
      console.log(`Updated user ${user._id} (${user.email || user.businessName || 'unknown'})`);
    }

    console.log(`Done. Updated ${updated} user(s).`);
  } catch (err) {
    console.error('Migration error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

run();