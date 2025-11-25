import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../../supabase/config.js';

const supabaseUrl = supabaseConfig.url;
const supabaseAnonKey = supabaseConfig.anonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string | null;
          full_name: string;
          role: 'user' | 'admin';
          social_logins: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash?: string | null;
          full_name: string;
          role?: 'user' | 'admin';
          social_logins?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string | null;
          full_name?: string;
          role?: 'user' | 'admin';
          social_logins?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          flutterwave_id: string | null;
          amount: number;
          currency: string;
          status: 'pending' | 'successful' | 'failed' | 'refunded';
          payment_method: string;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          flutterwave_id?: string | null;
          amount: number;
          currency?: string;
          status: 'pending' | 'successful' | 'failed' | 'refunded';
          payment_method: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          flutterwave_id?: string | null;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'successful' | 'failed' | 'refunded';
          payment_method?: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_name: string;
          status: 'active' | 'cancelled' | 'expired' | 'pending';
          monthly_amount: number;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_name: string;
          status: 'active' | 'cancelled' | 'expired' | 'pending';
          monthly_amount: number;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_name?: string;
          status?: 'active' | 'cancelled' | 'expired' | 'pending';
          monthly_amount?: number;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
        };
      };
      webhook_events: {
        Row: {
          id: string;
          event_type: string;
          transaction_id: string | null;
          payload: Record<string, any>;
          processed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          transaction_id?: string | null;
          payload: Record<string, any>;
          processed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          transaction_id?: string | null;
          payload?: Record<string, any>;
          processed?: boolean;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          read?: boolean;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          changes: Record<string, any>;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          changes?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          changes?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
  };
};

export type Tables = Database['public']['Tables'];