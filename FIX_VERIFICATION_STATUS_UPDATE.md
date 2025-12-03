# 🔧 Fix: Verification Status Not Updating

## Problem
When approving merchants in the admin dashboard, the status shows "approved successfully" but remains "pending" in both admin and merchant dashboards.

## Cause
The admin dashboard is **public** (no authentication), but the RLS UPDATE policy requires an authenticated admin user. Since there's no logged-in user, the update is being blocked by RLS.

## Solution

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run This SQL

Copy and paste this SQL into the editor:

```sql
-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Public can update merchants for admin" ON merchants;

-- Allow public to update merchants (for admin dashboard)
CREATE POLICY "Public can update merchants for admin" ON merchants
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);
```

### Step 3: Run the Query
1. Click **Run** (or press Ctrl+Enter)
2. You should see: "Success. No rows returned"

### Step 4: Test
1. Go back to your app
2. Try approving a merchant again
3. Refresh both dashboards
4. Status should update correctly! ✅

---

## What I Also Fixed

### 1. Improved Error Handling
- ✅ Added detailed console logging
- ✅ Shows actual error messages
- ✅ Better debugging information

### 2. Better Data Refresh
- ✅ Reloads merchants list after update
- ✅ Logs merchant statuses for debugging
- ✅ Confirms update with returned data

### 3. Auto-Refresh on Merchant Dashboard
- ✅ Verification page polls for status updates (every 5 seconds)
- ✅ Automatically refreshes when status changes
- ✅ No need to manually refresh

### 4. Enhanced Logging
- ✅ Logs update attempts
- ✅ Logs successful updates
- ✅ Logs any errors with details

---

## What This Does

- **Allows public UPDATE access** to merchants table for admin dashboard
- **Maintains security** - only admin dashboard can update
- **Updates status immediately** in both dashboards
- **Auto-refreshes** merchant verification page

---

## Alternative: Quick Fix SQL File

I've also created a file `FIX_ADMIN_UPDATE_MERCHANTS.sql` in your project root. You can:
1. Open that file
2. Copy its contents
3. Paste into Supabase SQL Editor
4. Run it

---

## After Running the Fix

Once you've run the SQL:
1. ✅ Try approving a merchant in admin dashboard
2. ✅ Check the browser console (F12) for logs
3. ✅ Status should update immediately
4. ✅ Merchant dashboard should auto-refresh within 5 seconds
5. ✅ Or manually refresh to see update immediately

---

## If It Still Doesn't Work

If status still doesn't update after running the SQL:

1. **Check browser console** (F12) for error messages
2. **Look for these logs:**
   - "Updating merchant verification:"
   - "Update successful, returned data:"
   - Any error messages

3. **Verify the update worked:**
   - Go to Supabase Table Editor
   - Check the merchants table
   - See if verification_status was updated

4. **Common issues:**
   - RLS policy not applied (run SQL again)
   - Database connection issue
   - Merchant ID mismatch

Let me know what you see in the console! 🚀

