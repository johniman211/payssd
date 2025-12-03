-- ============================================
-- CREATE ADMIN USER - CORRECT VERSION
-- ============================================
-- The admins table uses 'name' not 'first_name' and 'last_name'

-- EASIEST OPTION: Make your current account an admin
-- Just run this single query:

INSERT INTO public.admins (user_id, email, name, role)
SELECT 
  user_id, 
  email, 
  CONCAT(first_name, ' ', last_name) as name,
  'super_admin'
FROM public.merchants 
WHERE email = 'johnnyafrica211@gmail.com';

-- That's it! Now login with the same credentials.

-- ============================================
-- Verify it worked:
-- ============================================
SELECT * FROM public.admins;

-- ============================================
-- ALTERNATIVE: Create a separate admin account
-- ============================================
-- Step 1: Go to Supabase Dashboard → Authentication → Users
-- Step 2: Click "Add user" and create:
--         Email: admin@payssd.com
--         Password: (your password)
-- Step 3: Copy the User ID from the users list
-- Step 4: Run this (replace YOUR_USER_ID):

INSERT INTO public.admins (
  user_id,
  email,
  name,
  role
) VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with actual user ID
  'admin@payssd.com',
  'Admin User',
  'super_admin'
);

-- ============================================
-- Quick check - see all admins:
-- ============================================
SELECT id, email, name, role, created_at FROM public.admins;


