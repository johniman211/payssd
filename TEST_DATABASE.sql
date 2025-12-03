-- =============================================
-- MINIMAL TEST - Run this FIRST to test connection
-- =============================================

-- Test 1: Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Test 2: Create a simple test table
CREATE TABLE IF NOT EXISTS test_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Test 3: Insert test data
INSERT INTO test_table (name) VALUES ('Connection Test');

-- Test 4: Show success
SELECT 'SUCCESS! Supabase connection working!' as status, * FROM test_table;


