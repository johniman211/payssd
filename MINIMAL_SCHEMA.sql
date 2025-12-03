-- =============================================
-- MINIMAL SCHEMA - Just what's needed for signup to work
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create account_type enum
DO $$ BEGIN
    CREATE TYPE account_type AS ENUM ('personal', 'business');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create verification_status enum
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create merchants table
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    account_type account_type NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    business_name VARCHAR(255),
    business_registration_number VARCHAR(100),
    business_address TEXT,
    business_type VARCHAR(100),
    bank_name VARCHAR(100),
    account_number VARCHAR(100),
    account_name VARCHAR(255),
    mobile_money_provider VARCHAR(50),
    mobile_money_number VARCHAR(50),
    verification_status verification_status DEFAULT 'pending',
    verification_notes TEXT,
    verified_at TIMESTAMP,
    documents JSONB DEFAULT '[]'::jsonb,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0.00,
    webhook_url VARCHAR(500),
    notification_preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

-- Create policy for merchants to view own data
CREATE POLICY "Merchants can view own data" ON public.merchants
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for merchants to insert own data
CREATE POLICY "Merchants can insert own data" ON public.merchants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for merchants to update own data
CREATE POLICY "Merchants can update own data" ON public.merchants
    FOR UPDATE USING (auth.uid() = user_id);

-- Success message
SELECT 'SUCCESS! Merchants table created!' as status;

-- Show the table
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'merchants';


