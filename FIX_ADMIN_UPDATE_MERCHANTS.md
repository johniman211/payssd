# 🔧 Fix: Admin Dashboard Cannot Update Merchant Status

## Problem
When approving or rejecting merchants in the admin dashboard, the status doesn't update because Row Level Security (RLS) policies are blocking the UPDATE operation.

## Root Cause
The admin dashboard is public (no authentication), so when it tries to update merchants, the existing RLS policy `"Admins can update all merchants"` checks for `auth.uid()`, which is `null` for unauthenticated users.

## Solution
Run the SQL script below in your Supabase SQL Editor to allow public updates for the admin dashboard.

---

## 📋 Step-by-Step Fix

### 1. Open Supabase SQL Editor
- Go to your Supabase Dashboard
- Navigate to **SQL Editor**
- Click **New Query**

### 2. Copy and Run This SQL

```sql
-- =============================================
-- FIX: Admin Dashboard Update Merchants Policy
-- =============================================
-- This allows the admin dashboard (public access) to update merchants

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Public can update merchants for admin" ON merchants;

-- Allow public to update merchants (for admin dashboard)
-- In production, you should restrict this to only allow from admin dashboard domain
CREATE POLICY "Public can update merchants for admin" ON merchants
    FOR UPDATE 
    USING (true)  -- Allow all updates (admin dashboard is public)
    WITH CHECK (true);
```

### 3. Verify the Policy
After running, you should see:
- ✅ Success message
- The policy appears in your RLS policies list

### 4. Test the Fix
1. Go to `/admin/merchants`
2. Find a merchant with "pending" status
3. Click **Reject** or **Approve**
4. Enter rejection reason (if rejecting)
5. Check that status updates immediately in both dashboards

---

## 🔍 How to Verify It's Working

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try approving/rejecting a merchant
4. Look for:
   - ✅ `Update successful, returned data: [...]`
   - ✅ `Loaded merchants: X`
   - ❌ If you see errors, check the error message

### Check Database
1. Go to Supabase Table Editor
2. Open `merchants` table
3. Find the merchant you updated
4. Check `verification_status` column
5. Should show: `approved` or `rejected` (not `pending`)

---

## 🚨 If Still Not Working

### Check RLS Policies
1. Go to Supabase Dashboard → Table Editor → `merchants`
2. Click **Policies** tab
3. Look for `"Public can update merchants for admin"`
4. If missing, run the SQL again

### Check Browser Console Errors
Common errors:
- `new row violates row-level security policy` → Policy not applied
- `permission denied for table merchants` → Policy missing
- `column "verification_status" does not exist` → Schema issue

### Manual Test
Run this in Supabase SQL Editor to test:
```sql
-- Test update (replace with actual merchant ID)
UPDATE merchants 
SET verification_status = 'approved', 
    verified_at = NOW()
WHERE id = 'YOUR_MERCHANT_ID_HERE'
RETURNING id, email, verification_status;
```

---

## 📝 Notes

- **Security**: This policy allows public updates. In production, consider:
  - Adding authentication to admin dashboard
  - Restricting updates to specific IPs/domains
  - Using service role key for admin operations

- **Alternative**: If you add authentication to admin dashboard later, you can remove this policy and use the existing `"Admins can update all merchants"` policy.

---

## ✅ After Fix

Once the policy is applied:
- ✅ Approve/Reject buttons will work
- ✅ Status updates immediately in admin dashboard
- ✅ Status updates in merchant dashboard (with auto-refresh)
- ✅ Notifications are created
- ✅ Live API keys generated on approval

---

**Need help?** Check the browser console for detailed error messages!

