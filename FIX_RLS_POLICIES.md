# 🔧 Fix: Row Level Security Policy Error

## Problem
You're getting this error when trying to create a merchant record:
```
Error creating merchant: new row violates row-level security policy for table "merchants"
```

## Cause
The `merchants` table has RLS enabled, but there's no INSERT policy that allows users to create their own merchant record.

## Solution

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run This SQL

Copy and paste this SQL into the editor:

```sql
-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can create own merchant record" ON merchants;

-- Create INSERT policy for merchants
-- Users can only insert a merchant record where user_id matches their auth.uid()
CREATE POLICY "Users can create own merchant record" ON merchants
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Also allow admins to insert merchant records
DROP POLICY IF EXISTS "Admins can create merchants" ON merchants;

CREATE POLICY "Admins can create merchants" ON merchants
    FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));
```

### Step 3: Run the Query
1. Click **Run** (or press Ctrl+Enter)
2. You should see: "Success. No rows returned"

### Step 4: Test
1. Go back to your app
2. Refresh the Payment Links page
3. Click "🔧 Create Merchant Profile Now"
4. It should work now! ✅

---

## What This Does

- **Allows users to create their own merchant record** when `user_id` matches their authenticated user ID
- **Allows admins to create merchant records** for any user
- **Maintains security** - users can only create records for themselves

---

## Alternative: Quick Fix SQL File

I've also created a file `FIX_MERCHANT_INSERT_POLICY.sql` in your project root. You can:
1. Open that file
2. Copy its contents
3. Paste into Supabase SQL Editor
4. Run it

---

## After Running the Fix

Once you've run the SQL:
1. ✅ Refresh your app
2. ✅ Try creating the merchant profile again
3. ✅ You should be able to create payment links!

Let me know if you need help! 🚀

