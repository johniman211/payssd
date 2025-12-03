-- =============================================
-- FIX: Add INSERT Policy for Merchants Table
-- =============================================
-- This allows users to create their own merchant record
-- Run this in Supabase SQL Editor

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can create own merchant record" ON merchants;

-- Create INSERT policy for merchants
-- Users can only insert a merchant record where user_id matches their auth.uid()
CREATE POLICY "Users can create own merchant record" ON merchants
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Also allow admins to insert merchant records
DROP POLICY IF EXISTS "Admins can create merchants" ON merchants;

CREATE POLICY "Admins can create merchants" ON merchants
    FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Merchant INSERT policies created successfully!';
    RAISE NOTICE '📝 Users can now create their own merchant records';
END $$;

