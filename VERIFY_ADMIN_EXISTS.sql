-- ============================================
-- VERIFY ADMIN EXISTS
-- ============================================
-- Run these queries to check if your admin account exists

-- Step 1: Check if admin record exists
SELECT * FROM public.admins WHERE email = 'johnnyafrica211@gmail.com';

-- Expected result: Should show 1 row with your admin info
-- If NO ROWS: You need to create the admin record (see below)

-- ============================================
-- CREATE ADMIN IF IT DOESN'T EXIST
-- ============================================

-- Option 1: Create admin from existing merchant
INSERT INTO public.admins (user_id, email, name, role)
SELECT 
  user_id, 
  email, 
  CONCAT(first_name, ' ', last_name) as name,
  'super_admin'
FROM public.merchants 
WHERE email = 'johnnyafrica211@gmail.com'
ON CONFLICT (email) DO NOTHING;

-- Option 2: If you need to see the user_id first
SELECT user_id, email, first_name, last_name 
FROM public.merchants 
WHERE email = 'johnnyafrica211@gmail.com';

-- Then manually insert (replace USER_ID_HERE with actual user_id from above):
INSERT INTO public.admins (user_id, email, name, role)
VALUES (
  'USER_ID_HERE',
  'johnnyafrica211@gmail.com',
  'John Africa',
  'super_admin'
);

-- ============================================
-- VERIFY AGAIN
-- ============================================
SELECT * FROM public.admins;

-- Should see your admin record!

-- ============================================
-- CHECK USER ID MATCHES
-- ============================================
-- Make sure the user_id in admins matches the user_id in merchants
SELECT 
  m.user_id as merchant_user_id,
  m.email as merchant_email,
  a.user_id as admin_user_id,
  a.email as admin_email,
  a.name as admin_name,
  CASE 
    WHEN m.user_id = a.user_id THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as status
FROM public.merchants m
FULL OUTER JOIN public.admins a ON m.email = a.email
WHERE m.email = 'johnnyafrica211@gmail.com' OR a.email = 'johnnyafrica211@gmail.com';


