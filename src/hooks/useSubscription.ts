import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { STRIPE_PRODUCTS } from '../stripe-config';

interface SubscriptionData {
  customer_id: string | null;
  subscription_id: string | null;
  subscription_status: string | null;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const isActive = subscription?.subscription_status === 'active';
  const isPremium = isActive && subscription?.price_id;

  const getCurrentPlan = () => {
    if (!isPremium) return 'Free';
    
    const product = STRIPE_PRODUCTS.find(p => p.priceId === subscription?.price_id);
    return product?.name || 'Premium';
  };

  const createCheckoutSession = async (priceId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/testimonials`,
          mode: 'subscription',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Checkout response error:', errorText);
        throw new Error('Failed to create checkout session');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  };

  return {
    subscription,
    loading,
    isActive,
    isPremium,
    getCurrentPlan,
    createCheckoutSession,
    refetch: fetchSubscription,
  };
};