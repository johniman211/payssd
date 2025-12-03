-- =============================================
-- PAYSSD DATABASE SCHEMA FOR SUPABASE
-- Run this entire file in your Supabase SQL Editor
-- Project: https://hauyunoijcarxajtttxg.supabase.co
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUMS
-- =============================================

DO $$ BEGIN
    CREATE TYPE account_type AS ENUM ('personal', 'business');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('mobile_money', 'card', 'bank_transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payout_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE api_environment AS ENUM ('sandbox', 'live');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('payment', 'payout', 'verification', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- MERCHANTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS merchants (
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

-- =============================================
-- ADMINS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- API KEYS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    key_type api_environment NOT NULL,
    public_key VARCHAR(100) UNIQUE NOT NULL,
    secret_key VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    total_requests INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TRANSACTIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'SSP',
    payment_method payment_method NOT NULL,
    payment_details JSONB DEFAULT '{}'::jsonb,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    status transaction_status DEFAULT 'pending',
    environment api_environment NOT NULL,
    description TEXT,
    platform_fee DECIMAL(15, 2) DEFAULT 0.00,
    net_amount DECIMAL(15, 2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- =============================================
-- PAYMENT LINKS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'SSP',
    link_code VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    allowed_methods JSONB DEFAULT '["mobile_money", "card", "bank_transfer"]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- PAYOUTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'SSP',
    destination_type VARCHAR(50),
    destination_details JSONB DEFAULT '{}'::jsonb,
    status payout_status DEFAULT 'pending',
    approved_by UUID REFERENCES admins(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    processed_at TIMESTAMP,
    processing_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    related_id UUID,
    related_type VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- SYSTEM LOGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info',
    message TEXT NOT NULL,
    user_id UUID,
    merchant_id UUID,
    admin_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON merchants(user_id);
CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email);
CREATE INDEX IF NOT EXISTS idx_merchants_verification_status ON merchants(verification_status);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_merchant_id ON api_keys(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payouts_merchant_id ON payouts(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_notifications_merchant_id ON notifications(merchant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Merchants can view own data" ON merchants;
DROP POLICY IF EXISTS "Merchants can update own data" ON merchants;
DROP POLICY IF EXISTS "Admins can view all merchants" ON merchants;
DROP POLICY IF EXISTS "Admins can update all merchants" ON merchants;
DROP POLICY IF EXISTS "Merchants can view own API keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can view all API keys" ON api_keys;
DROP POLICY IF EXISTS "Merchants can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Merchants can manage own payment links" ON payment_links;
DROP POLICY IF EXISTS "Admins can view all payment links" ON payment_links;
DROP POLICY IF EXISTS "Merchants can view own payouts" ON payouts;
DROP POLICY IF EXISTS "Merchants can create own payouts" ON payouts;
DROP POLICY IF EXISTS "Admins can manage all payouts" ON payouts;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view system logs" ON system_logs;

-- Merchants policies
CREATE POLICY "Merchants can view own data" ON merchants
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Merchants can update own data" ON merchants
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all merchants" ON merchants
    FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));
CREATE POLICY "Admins can update all merchants" ON merchants
    FOR UPDATE USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- API Keys policies
CREATE POLICY "Merchants can view own API keys" ON api_keys
    FOR SELECT USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all API keys" ON api_keys
    FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Transactions policies
CREATE POLICY "Merchants can view own transactions" ON transactions
    FOR SELECT USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all transactions" ON transactions
    FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Payment Links policies
CREATE POLICY "Merchants can manage own payment links" ON payment_links
    FOR ALL USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all payment links" ON payment_links
    FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Payouts policies
CREATE POLICY "Merchants can view own payouts" ON payouts
    FOR SELECT USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));
CREATE POLICY "Merchants can create own payouts" ON payouts
    FOR INSERT WITH CHECK (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all payouts" ON payouts
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (
        (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()))
        OR (admin_id IN (SELECT id FROM admins WHERE user_id = auth.uid()))
    );
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (
        (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()))
        OR (admin_id IN (SELECT id FROM admins WHERE user_id = auth.uid()))
    );

-- System Logs policies
CREATE POLICY "Admins can view system logs" ON system_logs
    FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- =============================================
-- FUNCTIONS
-- =============================================

-- Generate API keys function
CREATE OR REPLACE FUNCTION generate_api_keys(p_merchant_id UUID, p_key_type api_environment)
RETURNS TABLE(public_key VARCHAR, secret_key VARCHAR) AS $$
DECLARE
    v_public_key VARCHAR;
    v_secret_key VARCHAR;
    v_prefix VARCHAR;
BEGIN
    IF p_key_type = 'sandbox' THEN
        v_prefix := 'pk_test_';
    ELSE
        v_prefix := 'pk_live_';
    END IF;
    
    v_public_key := v_prefix || encode(gen_random_bytes(24), 'hex');
    v_secret_key := REPLACE(v_prefix, 'pk_', 'sk_') || encode(gen_random_bytes(32), 'hex');
    
    INSERT INTO api_keys (merchant_id, key_type, public_key, secret_key)
    VALUES (p_merchant_id, p_key_type, v_public_key, v_secret_key);
    
    RETURN QUERY SELECT v_public_key, v_secret_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update merchant balance after transaction
CREATE OR REPLACE FUNCTION update_merchant_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE merchants
        SET 
            balance = balance + NEW.net_amount,
            total_transactions = total_transactions + 1,
            total_revenue = total_revenue + NEW.amount
        WHERE id = NEW.merchant_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_merchant_balance ON transactions;
CREATE TRIGGER trigger_update_merchant_balance
    AFTER UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_merchant_balance();

-- Process payout function
CREATE OR REPLACE FUNCTION process_payout(p_payout_id UUID, p_admin_id UUID, p_action VARCHAR, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    v_payout RECORD;
    v_merchant_balance DECIMAL;
BEGIN
    SELECT * INTO v_payout FROM payouts WHERE id = p_payout_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payout not found';
    END IF;
    
    IF p_action = 'approve' THEN
        SELECT balance INTO v_merchant_balance FROM merchants WHERE id = v_payout.merchant_id;
        
        IF v_merchant_balance < v_payout.amount THEN
            RAISE EXCEPTION 'Insufficient balance';
        END IF;
        
        UPDATE payouts
        SET 
            status = 'approved',
            approved_by = p_admin_id,
            approved_at = NOW()
        WHERE id = p_payout_id;
        
        UPDATE merchants
        SET balance = balance - v_payout.amount
        WHERE id = v_payout.merchant_id;
        
        INSERT INTO notifications (merchant_id, type, title, message, related_id, related_type)
        VALUES (
            v_payout.merchant_id,
            'payout',
            'Payout Approved',
            'Your payout of ' || v_payout.amount || ' ' || v_payout.currency || ' has been approved.',
            p_payout_id,
            'payout'
        );
        
    ELSIF p_action = 'reject' THEN
        UPDATE payouts
        SET 
            status = 'rejected',
            approved_by = p_admin_id,
            approved_at = NOW(),
            rejection_reason = p_reason
        WHERE id = p_payout_id;
        
        INSERT INTO notifications (merchant_id, type, title, message, related_id, related_type)
        VALUES (
            v_payout.merchant_id,
            'payout',
            'Payout Rejected',
            'Your payout request has been rejected. Reason: ' || COALESCE(p_reason, 'Not specified'),
            p_payout_id,
            'payout'
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update merchant verification
CREATE OR REPLACE FUNCTION update_merchant_verification(
    p_merchant_id UUID,
    p_status verification_status,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE merchants
    SET 
        verification_status = p_status,
        verification_notes = p_notes,
        verified_at = CASE WHEN p_status = 'approved' THEN NOW() ELSE NULL END
    WHERE id = p_merchant_id;
    
    IF p_status = 'approved' THEN
        IF NOT EXISTS (SELECT 1 FROM api_keys WHERE merchant_id = p_merchant_id AND key_type = 'live') THEN
            PERFORM generate_api_keys(p_merchant_id, 'live');
        END IF;
        
        INSERT INTO notifications (merchant_id, type, title, message)
        VALUES (
            p_merchant_id,
            'verification',
            'Account Verified',
            'Congratulations! Your account has been verified. You can now use live API keys.'
        );
    ELSIF p_status = 'rejected' THEN
        INSERT INTO notifications (merchant_id, type, title, message)
        VALUES (
            p_merchant_id,
            'verification',
            'Verification Rejected',
            'Your account verification has been rejected. Reason: ' || COALESCE(p_notes, 'Not specified')
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create transaction
CREATE OR REPLACE FUNCTION create_transaction(
    p_merchant_id UUID,
    p_amount DECIMAL,
    p_payment_method payment_method,
    p_environment api_environment,
    p_customer_name VARCHAR DEFAULT NULL,
    p_customer_email VARCHAR DEFAULT NULL,
    p_customer_phone VARCHAR DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_reference VARCHAR;
    v_platform_fee DECIMAL;
    v_net_amount DECIMAL;
BEGIN
    v_reference := 'TXN' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(floor(random() * 1000000)::TEXT, 6, '0');
    v_platform_fee := p_amount * 0.025;
    v_net_amount := p_amount - v_platform_fee;
    
    INSERT INTO transactions (
        merchant_id,
        transaction_reference,
        amount,
        payment_method,
        environment,
        customer_name,
        customer_email,
        customer_phone,
        description,
        platform_fee,
        net_amount,
        status
    ) VALUES (
        p_merchant_id,
        v_reference,
        p_amount,
        p_payment_method,
        p_environment,
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        p_description,
        v_platform_fee,
        v_net_amount,
        'pending'
    ) RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Payssd database schema created successfully!';
    RAISE NOTICE '📊 All tables, functions, and policies are ready';
    RAISE NOTICE '🔐 Next: Create admin user in Authentication → Users';
END $$;


