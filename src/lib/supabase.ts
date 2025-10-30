import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          experience: string | null;
          subscription: string | null;
          markets: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          experience?: string | null;
          subscription?: string | null;
          markets?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          experience?: string | null;
          subscription?: string | null;
          markets?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          pair: string;
          direction: string;
          day: string;
          size: number;
          outcome: string;
          profit_loss: number;
          strategy: string;
          market: string;
          image_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          pair: string;
          direction: string;
          day: string;
          size?: number;
          outcome: string;
          profit_loss?: number;
          strategy: string;
          market: string;
          image_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          pair?: string;
          direction?: string;
          day?: string;
          size?: number;
          outcome?: string;
          profit_loss?: number;
          strategy?: string;
          market?: string;
          image_url?: string | null;
          created_at?: string | null;
        };
      };
      stripe_customers: {
        Row: {
          id: number;
          user_id: string;
          customer_id: string;
          created_at: string | null;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          user_id: string;
          customer_id: string;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          user_id?: string;
          customer_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
      };
      stripe_subscriptions: {
        Row: {
          id: number;
          customer_id: string;
          subscription_id: string | null;
          price_id: string | null;
          current_period_start: number | null;
          current_period_end: number | null;
          cancel_at_period_end: boolean | null;
          payment_method_brand: string | null;
          payment_method_last4: string | null;
          status: string;
          created_at: string | null;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          customer_id: string;
          subscription_id?: string | null;
          price_id?: string | null;
          current_period_start?: number | null;
          current_period_end?: number | null;
          cancel_at_period_end?: boolean | null;
          payment_method_brand?: string | null;
          payment_method_last4?: string | null;
          status: string;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          customer_id?: string;
          subscription_id?: string | null;
          price_id?: string | null;
          current_period_start?: number | null;
          current_period_end?: number | null;
          cancel_at_period_end?: boolean | null;
          payment_method_brand?: string | null;
          payment_method_last4?: string | null;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
      };
    };
    Views: {
      stripe_user_subscriptions: {
        Row: {
          customer_id: string | null;
          subscription_id: string | null;
          subscription_status: string | null;
          price_id: string | null;
          current_period_start: number | null;
          current_period_end: number | null;
          cancel_at_period_end: boolean | null;
          payment_method_brand: string | null;
          payment_method_last4: string | null;
        };
      };
    };
  };
};