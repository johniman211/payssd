# 📊 INSTALL DATABASE - Run This First!

## Step 1: Open Supabase SQL Editor

Click here: https://app.supabase.com/project/hauyunoijcarxajtttxg/sql/new

## Step 2: Copy the Schema

Open the file: `src/supabase/schema.sql`

**OR copy from the box below** ⬇️

## Step 3: Paste and Run

1. Select ALL the SQL code
2. Paste into Supabase SQL Editor
3. Click the **"Run"** button
4. Wait for "Success" message

## Step 4: Verify Tables Created

Go to **Table Editor** and check you have:
- ✅ merchants
- ✅ admins  
- ✅ api_keys
- ✅ transactions
- ✅ payment_links
- ✅ payouts
- ✅ notifications
- ✅ system_logs

## Step 5: Create Admin User

**In Supabase:**
1. Go to Authentication → Users
2. Click "Add user"
3. Email: `admin@payssd.com`
4. Password: `admin123`
5. ✓ Check "Auto Confirm User"

**Then run this SQL:**

```sql
INSERT INTO admins (user_id, email, name, role)
SELECT id, 'admin@payssd.com', 'System Admin', 'super_admin'
FROM auth.users WHERE email = 'admin@payssd.com';
```

## ✅ Done!

Now refresh your app at http://localhost:5173/

All features will be unlocked! 🎉


