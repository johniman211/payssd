# 🚀 Quick Start - Payssd with Your Supabase

Your Supabase credentials are already configured! Follow these 3 simple steps:

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Setup Database

1. Go to: https://app.supabase.com/project/hauyunoijcarxajtttxg
2. Click **SQL Editor** → **New query**
3. Copy ALL the SQL from `src/supabase/schema.sql`
4. Paste and click **Run**

## Step 3: Create Admin User

In Supabase SQL Editor, run:

```sql
-- This creates admin@payssd.com with password: admin123
INSERT INTO admins (user_id, email, name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@payssd.com',
  'System Admin',
  'super_admin'
);
```

Then in **Authentication** → **Users** → **Add user**:
- Email: `admin@payssd.com`
- Password: `admin123`
- ✓ Auto Confirm User

## Step 4: Run the App
```bash
npm run dev
```

Visit: **http://localhost:5173**

## 🎯 Test Login

**Admin:** admin@payssd.com / admin123
**Merchant:** Create new account at `/signup`

## ✅ Your Credentials (Already Configured)

- URL: `https://hauyunoijcarxajtttxg.supabase.co`
- Key: Configured in `src/supabase/supabaseClient.js`

Everything is ready to work with REAL DATA from your Supabase! 🎉


