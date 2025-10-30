export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: string;
  period: string;
  mode: 'subscription' | 'payment';
  features: string[];
  highlighted?: boolean;
  savings?: string;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_SkcrsAwIgQuph7',
    priceId: 'price_1Rp7bI5zRnOqdXkPrTZmJ6MV',
    name: 'Start Monthly',
    description: 'For active traders',
    price: '$2.99',
    period: 'per month',
    mode: 'subscription',
    features: [
      'Unlimited trade entries',
      'Advanced analytics',
      'Custom market symbols',
      'Trade screenshots',
      'Psychology insights',
      'Priority support'
    ],
    highlighted: true
  },
  {
    id: 'prod_SkcrDqK18xT1NV',
    priceId: 'price_1Rp7bu5zRnOqdXkP9uspk8rj',
    name: 'Go Yearly',
    description: 'Best value for professionals',
    price: '$19.99',
    period: 'per year',
    mode: 'subscription',
    features: [
      'Everything in Monthly',
      'Export capabilities',
      'Advanced reporting',
      '1-on-1 strategy session',
      'Custom indicators',
      'White-label options'
    ],
    highlighted: false,
    savings: 'Save 44%'
  }
];

export const FREE_PLAN = {
  name: 'Free',
  price: '$0',
  period: 'forever',
  description: 'Perfect for beginners',
  features: [
    '7 trade journal entries',
    'Basic analytics',
    'Performance overview',
    'Community access'
  ],
  tradeLimit: 7
};