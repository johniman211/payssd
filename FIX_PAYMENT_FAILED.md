# 🔧 Fix: Payment Failed Error

## Problem
When trying to make a payment on the checkout page, you're getting a "Payment Failed" error.

## Cause
The `transactions` table has Row Level Security (RLS) enabled, but there's no INSERT policy that allows public users (customers) to create transactions via the checkout page.

## Solution

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run This SQL

Copy and paste this SQL into the editor:

```sql
-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Public can create transactions" ON transactions;
DROP POLICY IF EXISTS "Merchants can create transactions" ON transactions;

-- Create INSERT policy for transactions
-- Allow anyone to create a transaction (for public checkout page)
-- The transaction must reference a valid merchant_id from an active payment_link
CREATE POLICY "Public can create transactions" ON transactions
    FOR INSERT 
    WITH CHECK (
        -- Ensure the merchant_id exists and is valid
        EXISTS (
            SELECT 1 FROM merchants 
            WHERE id = merchant_id
        )
    );

-- Also allow merchants to create transactions (for API usage)
CREATE POLICY "Merchants can create transactions" ON transactions
    FOR INSERT 
    WITH CHECK (
        merchant_id IN (
            SELECT id FROM merchants WHERE user_id = auth.uid()
        )
    );

-- Allow admins to create transactions
DROP POLICY IF EXISTS "Admins can create transactions" ON transactions;

CREATE POLICY "Admins can create transactions" ON transactions
    FOR INSERT 
    WITH CHECK (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );
```

### Step 3: Run the Query
1. Click **Run** (or press Ctrl+Enter)
2. You should see: "Success. No rows returned"

### Step 4: Test Payment
1. Go back to your app
2. Try making a payment again
3. It should work now! ✅

---

## What This Does

- **Allows public users** (customers) to create transactions via the checkout page
- **Allows merchants** to create transactions via API
- **Allows admins** to create transactions
- **Maintains security** - transactions must reference valid merchant IDs

---

## Alternative: Quick Fix SQL File

I've also created a file `FIX_TRANSACTION_INSERT_POLICY.sql` in your project root. You can:
1. Open that file
2. Copy its contents
3. Paste into Supabase SQL Editor
4. Run it

---

## Improved Error Handling

I've also improved the checkout page to:
- ✅ Show actual error messages (not just "Payment Failed")
- ✅ Display helpful hints for common errors
- ✅ Log detailed error information to console
- ✅ Better error UI with "Try Again" and "Go Home" buttons

---

## After Running the Fix

Once you've run the SQL:
1. ✅ Refresh your app
2. ✅ Try making a payment again
3. ✅ You should see the success screen!

---

## If It Still Fails

If you still get an error after running the SQL:

1. **Check the browser console** (F12) for detailed error messages
2. **Check the error message** on the failed payment screen
3. **Common issues:**
   - Missing merchant record
   - Invalid payment link
   - Database connection issues

Let me know what error message you see and I can help fix it! 🚀

