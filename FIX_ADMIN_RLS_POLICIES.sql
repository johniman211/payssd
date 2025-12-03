-- =============================================
-- FIX: Admin Dashboard RLS Policies
-- =============================================
-- This allows the admin dashboard (public access) to view all data
-- Run this in Supabase SQL Editor

-- Since admin dashboard is public (no authentication), we need to allow public read access
-- OR create a service role function. For now, we'll allow public read with proper checks.

-- =============================================
-- MERCHANTS TABLE - Allow Public Read for Admin Dashboard
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view merchants for admin" ON merchants;

-- Allow public to view merchants (for admin dashboard)
-- In production, you should restrict this to only allow from admin dashboard domain
CREATE POLICY "Public can view merchants for admin" ON merchants
    FOR SELECT 
    USING (true);  -- Allow all reads (admin dashboard is public)

-- =============================================
-- TRANSACTIONS TABLE - Allow Public Read for Admin Dashboard
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view transactions for admin" ON transactions;

-- Allow public to view transactions (for admin dashboard)
CREATE POLICY "Public can view transactions for admin" ON transactions
    FOR SELECT 
    USING (true);  -- Allow all reads

-- =============================================
-- PAYOUTS TABLE - Allow Public Read for Admin Dashboard
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view payouts for admin" ON payouts;

-- Allow public to view payouts (for admin dashboard)
CREATE POLICY "Public can view payouts for admin" ON payouts
    FOR SELECT 
    USING (true);  -- Allow all reads

-- =============================================
-- PAYMENT LINKS TABLE - Allow Public Read for Admin Dashboard
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view payment links for admin" ON payment_links;

-- Allow public to view payment links (for admin dashboard)
CREATE POLICY "Public can view payment links for admin" ON payment_links
    FOR SELECT 
    USING (true);  -- Allow all reads

-- =============================================
-- API KEYS TABLE - Allow Public Read for Admin Dashboard
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view api keys for admin" ON api_keys;

-- Allow public to view api keys (for admin dashboard)
CREATE POLICY "Public can view api keys for admin" ON api_keys
    FOR SELECT 
    USING (true);  -- Allow all reads

-- =============================================
-- NOTIFICATIONS TABLE - Allow Public Read for Admin Dashboard
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view notifications for admin" ON notifications;

-- Allow public to view notifications (for admin dashboard)
CREATE POLICY "Public can view notifications for admin" ON notifications
    FOR SELECT 
    USING (true);  -- Allow all reads

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Admin Dashboard RLS policies created successfully!';
    RAISE NOTICE '📝 Public read access enabled for admin dashboard';
    RAISE NOTICE '⚠️  NOTE: In production, restrict these policies to admin dashboard domain only';
END $$;

