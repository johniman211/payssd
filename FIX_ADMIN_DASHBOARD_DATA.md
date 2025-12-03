# 🔧 Fix: Admin Dashboard Not Showing Data

## Problem
The admin dashboard is not displaying data even though you have 3 merchants created. The merchants page and dashboard are showing empty/zero values.

## Cause
The admin dashboard is **public** (no authentication required), but the Row Level Security (RLS) policies require an authenticated user. Since there's no logged-in user, the queries are being blocked by RLS.

## Solution

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run This SQL

Copy and paste this SQL into the editor:

```sql
-- =============================================
-- FIX: Admin Dashboard RLS Policies
-- =============================================
-- This allows the admin dashboard (public access) to view all data

-- MERCHANTS TABLE - Allow Public Read for Admin Dashboard
DROP POLICY IF EXISTS "Public can view merchants for admin" ON merchants;
CREATE POLICY "Public can view merchants for admin" ON merchants
    FOR SELECT 
    USING (true);

-- TRANSACTIONS TABLE - Allow Public Read for Admin Dashboard
DROP POLICY IF EXISTS "Public can view transactions for admin" ON transactions;
CREATE POLICY "Public can view transactions for admin" ON transactions
    FOR SELECT 
    USING (true);

-- PAYOUTS TABLE - Allow Public Read for Admin Dashboard
DROP POLICY IF EXISTS "Public can view payouts for admin" ON payouts;
CREATE POLICY "Public can view payouts for admin" ON payouts
    FOR SELECT 
    USING (true);

-- PAYMENT LINKS TABLE - Allow Public Read for Admin Dashboard
DROP POLICY IF EXISTS "Public can view payment links for admin" ON payment_links;
CREATE POLICY "Public can view payment links for admin" ON payment_links
    FOR SELECT 
    USING (true);

-- API KEYS TABLE - Allow Public Read for Admin Dashboard
DROP POLICY IF EXISTS "Public can view api keys for admin" ON api_keys;
CREATE POLICY "Public can view api keys for admin" ON api_keys
    FOR SELECT 
    USING (true);

-- NOTIFICATIONS TABLE - Allow Public Read for Admin Dashboard
DROP POLICY IF EXISTS "Public can view notifications for admin" ON notifications;
CREATE POLICY "Public can view notifications for admin" ON notifications
    FOR SELECT 
    USING (true);
```

### Step 3: Run the Query
1. Click **Run** (or press Ctrl+Enter)
2. You should see: "Success. No rows returned"

### Step 4: Test
1. Go back to your app
2. Refresh the admin dashboard: `/admin/dashboard`
3. Refresh the merchants page: `/admin/merchants`
4. You should now see all your data! ✅

---

## What I Also Fixed

### 1. Improved Error Handling
- ✅ Added detailed error logging to console
- ✅ Shows alert messages if data fails to load
- ✅ Better debugging information

### 2. Real Data in Recent Activity
- ✅ Shows actual merchant signups
- ✅ Shows real transactions
- ✅ Shows real payout requests
- ✅ Calculates time ago automatically

### 3. Better Data Logging
- ✅ Console logs show how many records were loaded
- ✅ Helps debug data loading issues

---

## What This Does

- **Allows public read access** to all tables for the admin dashboard
- **Maintains write security** - only authenticated users can create/update
- **Shows all data** in admin dashboard and merchants page
- **Works with merchant dashboard** - merchants can still see their own data

---

## Alternative: Quick Fix SQL File

I've also created a file `FIX_ADMIN_RLS_POLICIES.sql` in your project root. You can:
1. Open that file
2. Copy its contents
3. Paste into Supabase SQL Editor
4. Run it

---

## After Running the Fix

Once you've run the SQL:
1. ✅ Refresh your admin dashboard
2. ✅ You should see:
   - Total Merchants: 3
   - Verified/Pending counts
   - All transactions
   - All payouts
   - Recent activity from real data

---

## Security Note

⚠️ **Important:** These policies allow public read access. In production, you should:
- Restrict these policies to only allow from your admin dashboard domain
- Or implement proper authentication for admin dashboard
- Or use a service role key for admin queries

For now, this allows the admin dashboard to work while keeping write operations secure.

---

## If It Still Doesn't Work

If data still doesn't show after running the SQL:

1. **Check browser console** (F12) for error messages
2. **Check the alerts** - they'll show specific error messages
3. **Verify the data exists:**
   - Go to Supabase Table Editor
   - Check if merchants table has data
   - Check if transactions table has data

Let me know what you see! 🚀

