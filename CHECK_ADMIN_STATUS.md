# 🔍 Admin Login Not Working - Debug Guide

## 🐛 Problem: "Just loading then back to login page"

This means the admin record doesn't exist or there's a user_id mismatch.

---

## ✅ **SOLUTION - Step by Step:**

### **Step 1: Check if Admin Record Exists**

Go to **Supabase SQL Editor** and run:

```sql
SELECT * FROM public.admins WHERE email = 'johnnyafrica211@gmail.com';
```

**Expected Results:**
- ✅ **Shows 1 row** → Admin exists, continue to Step 3
- ❌ **Shows 0 rows** → Admin doesn't exist, continue to Step 2

---

### **Step 2: Create the Admin Record**

If Step 1 showed **0 rows**, run this:

```sql
INSERT INTO public.admins (user_id, email, name, role)
SELECT 
  user_id, 
  email, 
  CONCAT(first_name, ' ', last_name) as name,
  'super_admin'
FROM public.merchants 
WHERE email = 'johnnyafrica211@gmail.com';
```

**Expected Result:** `Success. 1 rows affected`

**Verify it worked:**
```sql
SELECT * FROM public.admins WHERE email = 'johnnyafrica211@gmail.com';
```

Now you should see your admin record!

---

### **Step 3: Verify User IDs Match**

Run this query to make sure the user_id is the same:

```sql
SELECT 
  m.user_id as merchant_user_id,
  a.user_id as admin_user_id,
  m.email,
  CASE 
    WHEN m.user_id = a.user_id THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as status
FROM public.merchants m
JOIN public.admins a ON m.email = a.email
WHERE m.email = 'johnnyafrica211@gmail.com';
```

**Expected Result:** Status should show `✅ MATCH`

If it shows `❌ MISMATCH`, the user_ids don't match. Delete and recreate:

```sql
DELETE FROM public.admins WHERE email = 'johnnyafrica211@gmail.com';

INSERT INTO public.admins (user_id, email, name, role)
SELECT user_id, email, CONCAT(first_name, ' ', last_name), 'super_admin'
FROM public.merchants 
WHERE email = 'johnnyafrica211@gmail.com';
```

---

### **Step 4: Try Admin Login Again**

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Open browser console** (F12)
3. **Go to:** http://localhost:5173/admin/login
4. **Enter credentials:**
   - Email: `johnnyafrica211@gmail.com`
   - Password: (your password)
5. **Click "Sign In as Admin"**
6. **Watch the console** - you'll see detailed logs:
   ```
   🔐 Step 1: Attempting to sign in...
   ✅ Step 2: Authentication successful!
   👤 User ID: fdee96d2-b3d4-4a60-b865-7f168bb9df07
   🔍 Step 3: Checking admin table...
   ✅ Step 4: Admin verified!
   👑 Admin profile: {...}
   ```

---

## 🎯 **Common Issues & Fixes:**

### **Issue 1: "No admin record found"**
**Fix:** Run the INSERT query from Step 2

### **Issue 2: "User IDs don't match"**
**Fix:** Delete and recreate admin with correct user_id (Step 3)

### **Issue 3: "Invalid credentials"**
**Fix:** Password is wrong - reset in Supabase Auth

### **Issue 4: Still redirects to login**
**Fix:** 
1. Check browser console for error messages
2. The new admin login page shows debug info
3. Look for red error box with details

---

## 🔍 **New Debug Features Added:**

The admin login page now shows:
- ✅ **Detailed error messages** with user_id
- ✅ **Debug info** in green box when successful
- ✅ **Troubleshooting dropdown** with steps
- ✅ **Console logs** with step-by-step progress
- ✅ **User ID in error message** so you can verify

---

## 🧪 **Test With Debug Info:**

1. Open browser console (F12)
2. Go to admin login: http://localhost:5173/admin/login
3. Try to login
4. You'll see one of these:

**Success:**
```
✅ Step 2: Authentication successful!
👤 User ID: fdee96d2-b3d4-4a60-b865-7f168bb9df07
✅ Step 4: Admin verified!
```

**Admin doesn't exist:**
```
❌ Not an admin
Access denied. User ID: fdee96d2-b3d4-4a60-b865-7f168bb9df07
```
→ Copy the User ID and create admin with that ID

---

## 📝 **Quick Fix Script:**

Run ALL of these in Supabase SQL Editor:

```sql
-- 1. Check current status
SELECT 
  m.user_id,
  m.email,
  m.first_name,
  m.last_name,
  EXISTS(SELECT 1 FROM admins WHERE user_id = m.user_id) as has_admin_record
FROM merchants m
WHERE m.email = 'johnnyafrica211@gmail.com';

-- 2. Delete any incorrect admin records
DELETE FROM admins WHERE email = 'johnnyafrica211@gmail.com';

-- 3. Create fresh admin record
INSERT INTO admins (user_id, email, name, role)
SELECT 
  user_id,
  email,
  CONCAT(first_name, ' ', last_name),
  'super_admin'
FROM merchants
WHERE email = 'johnnyafrica211@gmail.com';

-- 4. Verify it worked
SELECT * FROM admins WHERE email = 'johnnyafrica211@gmail.com';
```

**Expected final result:** 1 row showing your admin record

---

## ✅ **Final Checklist:**

- [ ] Admin record exists in database
- [ ] User IDs match between merchants and admins tables
- [ ] Browser console shows detailed logs
- [ ] Can login and see admin dashboard
- [ ] No redirect loop

---

**Try this and let me know what error message you see!** The new debug info will tell us exactly what's wrong! 🔍


