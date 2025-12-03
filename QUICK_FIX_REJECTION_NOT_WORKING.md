# 🚨 QUICK FIX: Rejection/Approval Not Updating Status

## The Problem
When you approve or reject merchants in the admin dashboard, the status doesn't change because the database is blocking the update.

## ✅ The Solution (2 Steps)

### Step 1: Run This SQL in Supabase

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click **SQL Editor** (left sidebar)
   - Click **New Query**

2. **Copy and Paste This SQL:**

```sql
-- Allow admin dashboard to update merchants
DROP POLICY IF EXISTS "Public can update merchants for admin" ON merchants;

CREATE POLICY "Public can update merchants for admin" ON merchants
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);
```

3. **Click "Run"** (or press Ctrl+Enter)

4. **You should see:** ✅ Success message

---

### Step 2: Test It

1. Go to `/admin/merchants`
2. Find a merchant with "pending" status
3. Click **Reject** → Enter reason → Click **Reject Merchant**
4. **Check the browser console (F12)** - You should see:
   - ✅ `Update successful, returned data: [...]`
   - ✅ `Verification successful! Updated merchant: {...}`
5. **Refresh the page** - Status should now show "rejected"
6. **Go to merchant dashboard** - Status should also be updated there

---

## 🔍 If It Still Doesn't Work

### Check Browser Console (F12)
Look for errors like:
- ❌ `new row violates row-level security policy`
- ❌ `permission denied for table merchants`

If you see these, the SQL policy wasn't applied. Try running it again.

### Verify the Policy Exists
1. Go to Supabase → **Table Editor** → `merchants`
2. Click **Policies** tab
3. Look for: `"Public can update merchants for admin"`
4. If missing, run the SQL again

---

## 📝 What This Does

This SQL creates a policy that allows **anyone** (including the public admin dashboard) to update merchant records. 

**Security Note:** In production, you should:
- Add authentication to admin dashboard, OR
- Restrict this policy to specific IPs/domains

For now, this allows the admin dashboard to work properly.

---

## ✅ After Fix

- ✅ Approve button works
- ✅ Reject button works
- ✅ Status updates in admin dashboard
- ✅ Status updates in merchant dashboard
- ✅ Notifications are created
- ✅ Live API keys generated on approval

---

**That's it!** The status should update immediately after running the SQL. 🎉

