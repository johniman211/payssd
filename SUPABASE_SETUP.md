# 🚀 Supabase Setup Guide - Payssd

Your Supabase credentials have been configured! Now follow these steps to get everything working with real data.

## ✅ Step 1: Database Schema Setup

### Go to your Supabase project and run the database schema:

1. Open your Supabase project: https://hauyunoijcarxajtttxg.supabase.co
2. Go to **SQL Editor** in the left sidebar
3. Click **"New query"**
4. Copy **ALL** the SQL code from `src/supabase/schema.sql`
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)

This will create:
- ✅ All database tables (merchants, admins, transactions, etc.)
- ✅ Row Level Security policies
- ✅ Database functions
- ✅ Triggers and indexes

## ✅ Step 2: Create Admin User

After running the schema, create an admin account:

### Option A: Through Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Enter:
   - **Email**: `admin@payssd.com`
   - **Password**: `admin123` (or your preferred password)
   - ✅ Check "Auto Confirm User"
4. Click **"Create user"**
5. Copy the User ID (UUID)

### Option B: Run this SQL in SQL Editor

```sql
-- Create admin user in auth.users
-- Note: Replace with your own secure password
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@payssd.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create admin record
INSERT INTO admins (user_id, email, name, role)
SELECT 
  id,
  'admin@payssd.com',
  'System Admin',
  'super_admin'
FROM auth.users 
WHERE email = 'admin@payssd.com';
```

## ✅ Step 3: Verify Database Tables

Check that all tables were created:

1. Go to **Table Editor**
2. You should see these tables:
   - ✅ merchants
   - ✅ admins
   - ✅ api_keys
   - ✅ transactions
   - ✅ payment_links
   - ✅ payouts
   - ✅ notifications
   - ✅ system_logs

## ✅ Step 4: Run the Application

Now you're ready to run the app with real data:

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

Visit: **http://localhost:5173**

## 🧪 Testing the Application

### 1. Login as Admin
- Go to: http://localhost:5173/login
- Email: `admin@payssd.com`
- Password: `admin123` (or what you set)
- You'll be redirected to: `/admin/dashboard`

### 2. Create a Merchant Account
- Go to: http://localhost:5173/signup
- Choose "Personal Account" or "Business Account"
- Complete the signup form
- Complete the onboarding wizard
- You'll see the merchant dashboard

### 3. Test Merchant Features
- ✅ View dashboard with real-time stats
- ✅ Create payment links
- ✅ View API keys (sandbox available immediately)
- ✅ Submit verification (needs admin approval)
- ✅ View transactions
- ✅ Request payouts

### 4. Test Admin Features
- ✅ View all merchants
- ✅ Approve/reject merchant verifications
- ✅ Approve/reject payouts
- ✅ View system statistics
- ✅ Monitor transactions

### 5. Test Payment Flow
1. Login as merchant
2. Go to "Payment Links"
3. Create a new payment link
4. Copy the payment link
5. Open in new tab/incognito
6. Complete the payment (sandbox mode)
7. View transaction in merchant dashboard

## 🔧 Troubleshooting

### Issue: "Failed to fetch" errors
**Solution:** Make sure you ran the SQL schema in Supabase

### Issue: Cannot login
**Solution:** 
- Check if admin user was created in Supabase Authentication
- Verify email is confirmed
- Try resetting password in Supabase dashboard

### Issue: Tables not found
**Solution:** Go to SQL Editor and run the entire schema.sql file again

### Issue: RLS policy errors
**Solution:** Make sure all RLS policies were created when running the schema

### Issue: API keys not generating
**Solution:** Verify the `generate_api_keys` function was created in the database

## 📊 Verify Everything is Working

### Check Database Functions
Run this in SQL Editor:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
AND routine_schema = 'public';
```

You should see:
- generate_api_keys
- update_merchant_balance
- process_payout
- update_merchant_verification
- create_transaction

### Check RLS Policies
Run this in SQL Editor:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

You should see multiple policies for each table.

## 🎉 You're All Set!

Your Payssd application is now connected to your Supabase instance with:
- ✅ Real database
- ✅ Real authentication
- ✅ Real-time updates
- ✅ Secure data access

Start by creating merchant accounts and testing all the features!

## 📞 Quick Reference

**Supabase Project URL:** https://hauyunoijcarxajtttxg.supabase.co
**Dashboard:** https://app.supabase.com/project/hauyunoijcarxajtttxg

**Default Admin:**
- Email: admin@payssd.com
- Password: admin123

**Test in Sandbox Mode:**
- All transactions work immediately
- No real money involved
- Perfect for testing

**Go Live:**
- Complete merchant verification
- Get live API keys
- Start accepting real payments


