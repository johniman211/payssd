-- =============================================
-- FIX: Add INSERT Policy for Transactions Table
-- =============================================
-- This allows public users (customers) to create transactions via checkout page
-- Run this in Supabase SQL Editor

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Public can create transactions" ON transactions;
DROP POLICY IF EXISTS "Merchants can create transactions" ON transactions;

-- Create INSERT policy for transactions
-- Allow anyone to create a transaction (for public checkout page)
-- The transaction must reference a valid merchant_id from an active payment_link
CREATE POLICY "Public can create transactions" ON transactions
    FOR INSERT 
    WITH CHECK (
        -- Ensure the merchant_id exists and is valid
        EXISTS (
            SELECT 1 FROM merchants 
            WHERE id = merchant_id
        )
    );

-- Also allow merchants to create transactions (for API usage)
CREATE POLICY "Merchants can create transactions" ON transactions
    FOR INSERT 
    WITH CHECK (
        merchant_id IN (
            SELECT id FROM merchants WHERE user_id = auth.uid()
        )
    );

-- Allow admins to create transactions
DROP POLICY IF EXISTS "Admins can create transactions" ON transactions;

CREATE POLICY "Admins can create transactions" ON transactions
    FOR INSERT 
    WITH CHECK (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Transaction INSERT policies created successfully!';
    RAISE NOTICE '📝 Public users can now create transactions via checkout page';
END $$;

