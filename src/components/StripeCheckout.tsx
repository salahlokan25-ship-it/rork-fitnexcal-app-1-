import React, { useState } from 'react';
import { createCheckoutSession } from '../lib/stripe';

interface StripeCheckoutProps {
  priceId: string;
  planName: string;
  children: React.ReactNode;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ priceId, planName, children }) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const url = await createCheckoutSession(priceId);
      if (url.url) {
        window.location.href = url.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Show user-friendly error message
      alert(`Failed to start checkout for ${planName}. Please check your Stripe configuration and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full py-3 px-6 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-500 text-white"
    >
      {loading ? 'Processing...' : children}
    </button>
  );
};

export default StripeCheckout;