import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
// Supporting both REACT_APP_ and VITE_ prefixes for compatibility
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hauyunoijcarxajtttxg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhdXl1bm9pamNhcnhhanR0dHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTU1MjQsImV4cCI6MjA3OTk5MTUyNH0.2TnfGV_RtFp4Br3jXGuwprtAufwMF6iNgSo6HYSAOT4';

// Create Supabase client with your credentials
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  functions: {
    url: `${supabaseUrl}/functions/v1`
  }
});

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to check if user is admin
export const isAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  return !error && data !== null;
};

// Helper function to get merchant profile
export const getMerchantProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) throw error;
  return data;
};

// Helper function to get admin profile
export const getAdminProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) throw error;
  return data;
};

// Test connection on load



