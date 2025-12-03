# 🔐 How to Login as Admin

## ✅ Step 1: Make Sure You Created the Admin Record

First, ensure you ran this SQL in Supabase:

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

**Expected result:** `Success. 1 rows affected`

---

## 🚀 Step 2: Login (Same as Merchant!)

### **The login is AUTOMATIC!** 

Just login with your same credentials:

1. **Go to:** http://localhost:5173/login

2. **Enter your credentials:**
   - Email: `johnnyafrica211@gmail.com`
   - Password: (your password)

3. **Click "Sign In"**

4. **You'll be automatically redirected to:**
   - **Admin Dashboard** if the system detects you're an admin
   - URL: http://localhost:5173/admin/dashboard

---

## 🎯 How It Works

The app automatically detects if you're an admin or merchant:

- ✅ If you have a record in `admins` table → **Admin Dashboard**
- ✅ If you only have a record in `merchants` table → **Merchant Dashboard**
- ✅ If you have BOTH (like you do now) → **Admin Dashboard** (admin takes priority)

---

## 🔄 Switch Between Admin & Merchant

Since you have BOTH admin and merchant accounts, you can switch:

### **View as Admin:**
http://localhost:5173/admin/dashboard

### **View as Merchant:**
http://localhost:5173/dashboard

### **Or use the navigation:**
- In Admin Dashboard → Click "🔄 Switch to Merchant"
- In Merchant Dashboard → Go to `/admin/dashboard`

---

## 📊 Admin Dashboard Features

Once logged in as admin, you'll see:

### **1. Admin Dashboard** (`/admin/dashboard`)
- ✅ Total merchants count
- ✅ Active merchants
- ✅ Pending verifications
- ✅ Total revenue
- ✅ Platform fees
- ✅ Total transactions
- ✅ Quick action cards

### **2. Merchants Management** (`/admin/merchants`)
- ✅ View all merchants
- ✅ Search and filter
- ✅ Approve/Reject verifications
- ✅ See merchant balances
- ✅ Approve button for pending merchants
- ✅ Reject button with reason

### **3. Other Admin Pages** (coming soon)
- Transactions overview
- Payout approvals
- System monitoring

---

## 🎨 What You'll See

### **Purple Admin Sidebar:**
```
💳 Payssd
   Admin Panel

👤 Your Profile
   johnnyafrica211@gmail.com

📊 Dashboard        (you are here)
👥 Merchants
💳 Transactions
💰 Payouts
🔄 Switch to Merchant
🚪 Sign Out
```

### **Main Dashboard:**
- **6 Colorful Stat Cards**
- **Quick Action Cards**
- **Welcome Message**
- **Real-time Data from Supabase**

---

## ✅ Quick Test Checklist

1. ✅ Ran the SQL to create admin record
2. ✅ Logged in with same credentials
3. ✅ Automatically redirected to `/admin/dashboard`
4. ✅ See purple sidebar with admin navigation
5. ✅ See stats cards with real data
6. ✅ Can click "Merchants" to manage merchants
7. ✅ Can switch to merchant view

---

## 🐛 Troubleshooting

### **Problem: Still redirected to merchant dashboard**

**Solution:** Check if admin record exists:
```sql
SELECT * FROM public.admins WHERE email = 'johnnyafrica211@gmail.com';
```

If no results, run the INSERT query again.

### **Problem: "Invalid login credentials"**

**Solution:** This means the login credentials are wrong, not related to admin. Make sure:
- Email is correct: `johnnyafrica211@gmail.com`
- Password is correct
- Try resetting password in Supabase Auth if needed

### **Problem: Can't see admin pages**

**Solution:** 
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check URL: http://localhost:5173/admin/dashboard

---

## 🎉 Success!

Once logged in, you should see:

```
┌─────────────────────────────────────────┐
│  Purple Sidebar  │  Admin Dashboard     │
│                  │                      │
│  💳 Payssd      │  📊 Stats Cards:     │
│  Admin Panel    │  [Total Merchants]   │
│                  │  [Active Merchants]  │
│  👤 Profile     │  [Pending]           │
│                  │  [Total Revenue]     │
│  📊 Dashboard   │  [Platform Fees]     │
│  👥 Merchants   │  [Transactions]      │
│  💳 Transactions│                      │
│  💰 Payouts     │  🎯 Quick Actions    │
│  🔄 Switch      │  [Manage Merchants]  │
│  🚪 Sign Out    │  [View Transactions] │
│                  │  [Approve Payouts]   │
└─────────────────────────────────────────┘
```

---

## 📝 Summary

**To login as admin:**
1. ✅ Create admin record in database (already done)
2. ✅ Go to: http://localhost:5173/login
3. ✅ Login with: `johnnyafrica211@gmail.com`
4. ✅ Automatically redirected to admin dashboard!

**That's it!** 🎉

---

**The magic is in the AuthContext - it automatically detects if you're an admin and routes you accordingly!**


