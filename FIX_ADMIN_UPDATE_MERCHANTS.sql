-- =============================================
-- FIX: Admin Dashboard Update Merchants Policy
-- =============================================
-- This allows the admin dashboard (public access) to update merchants
-- Run this in Supabase SQL Editor

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Public can update merchants for admin" ON merchants;

-- Allow public to update merchants (for admin dashboard)
-- In production, you should restrict this to only allow from admin dashboard domain
CREATE POLICY "Public can update merchants for admin" ON merchants
    FOR UPDATE 
    USING (true)  -- Allow all updates (admin dashboard is public)
    WITH CHECK (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Admin Dashboard UPDATE policy created successfully!';
    RAISE NOTICE '📝 Public update access enabled for admin dashboard';
    RAISE NOTICE '⚠️  NOTE: In production, restrict this policy to admin dashboard domain only';
END $$;

