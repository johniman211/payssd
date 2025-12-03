-- ============================================
-- CREATE ADMIN USER
-- ============================================
-- This script creates an admin user in your Payssd system
-- Follow these steps carefully!

-- Step 1: First, create a user in Supabase Auth
-- Go to: Supabase Dashboard → Authentication → Users
-- Click "Add user" and create with:
-- Email: admin@payssd.com (or your preferred email)
-- Password: (choose a strong password)
-- After creating, COPY THE USER ID from the user list

-- Step 2: Insert the admin record
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from Step 1
INSERT INTO public.admins (
  user_id,
  email,
  first_name,
  last_name,
  role
) VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with the user ID from Supabase Auth
  'admin@payssd.com',   -- Use the same email as Step 1
  'Admin',              -- First name
  'User',               -- Last name
  'super_admin'         -- Role
);

-- Step 3: Verify the admin was created
SELECT * FROM public.admins;

-- ============================================
-- ALTERNATIVE: Create admin from existing user
-- ============================================
-- If you want to make your current merchant account (johnnyafrica211@gmail.com) 
-- an admin as well, run this:

-- First, get your user_id:
SELECT user_id, email FROM public.merchants WHERE email = 'johnnyafrica211@gmail.com';

-- Then insert into admins (replace with your actual user_id):
INSERT INTO public.admins (
  user_id,
  email,
  first_name,
  last_name,
  role
) VALUES (
  'fdee96d2-b3d4-4a60-b865-7f168bb9df07',  -- Your user_id from above query
  'johnnyafrica211@gmail.com',
  'John',
  'Africa',
  'super_admin'
);

-- ============================================
-- QUICK OPTION: Just make yourself admin!
-- ============================================
-- This is the easiest option - just run this:
INSERT INTO public.admins (user_id, email, first_name, last_name, role)
SELECT user_id, email, first_name, last_name, 'super_admin'
FROM public.merchants 
WHERE email = 'johnnyafrica211@gmail.com';

-- Then you can login with the same credentials on the admin pages!


