import React from 'react';
import { Star, TrendingUp, Award, Users } from 'lucide-react';
import StripeCheckout from '../components/StripeCheckout';
import { STRIPE_PRODUCTS, FREE_PLAN } from '../stripe-config';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const testimonials = [
  {
    name: "Marcus Thompson",
    role: "Day Trader",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    before: "-15%",
    after: "65%",
    quote: "TradeTrackr completely transformed my trading. The analytics helped me identify my worst performing days and markets. I went from losing money consistently to having a 65% win rate!",
    rating: 5,
    timeframe: "8 months"
  },
  {
    name: "Sarah Chen",
    role: "Forex Trader", 
    image: "https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    before: "-8%",
    after: "72%",
    quote: "The psychology insights and detailed analytics made all the difference. I learned to control my emotions and stick to my strategy. My account has grown 300% since using TradeTrackr.",
    rating: 5,
    timeframe: "6 months"
  },
  {
    name: "David Rodriguez",
    role: "Swing Trader",
    image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    before: "-22%",
    after: "58%",
    quote: "I was about to quit trading after losing 22% of my account yearly. TradeTrackr's journal and market analysis features helped me understand my mistakes and develop a winning strategy.",
    rating: 5,
    timeframe: "1 year"
  },
  {
    name: "Jennifer Walsh",
    role: "Crypto Trader",
    image: "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    before: "-12%",
    after: "68%",
    quote: "The trade screenshot feature and detailed notes helped me review my setups. I can now see patterns in my winning trades and replicate them consistently.",
    rating: 5,
    timeframe: "4 months"
  },
  {
    name: "Robert Kim",
    role: "Futures Trader",
    image: "https://images.pexels.com/photos/2182969/pexels-photo-2182969.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    before: "-18%",
    after: "61%",
    quote: "TradeTrackr's analytics showed me I was overtrading on certain days. By focusing on my best-performing days and markets, I turned my losses into consistent profits.",
    rating: 5,
    timeframe: "10 months"
  },
  {
    name: "Lisa Parker",
    role: "Stock Trader",
    image: "https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    before: "-25%",
    after: "55%",
    quote: "The risk management insights from my trading data helped me reduce my position sizes and improve my risk-reward ratios. Now I sleep well knowing my account is growing steadily.",
    rating: 5,
    timeframe: "7 months"
  }
];

const stats = [
  { label: "Active Traders", value: "50,000+", icon: Users },
  { label: "Average Win Rate", value: "80%", icon: TrendingUp },
  { label: "Total Profits Tracked", value: "$10M+", icon: Award },
  { label: "User Rating", value: "4.9★", icon: Star }
];

const Testimonials: React.FC = () => {
  const { user } = useAuth();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
        }`}
      />
    ));
  };

  const pricingPlans = [
    {
      ...FREE_PLAN,
      highlighted: false,
      buttonText: "Get Started",
      tradeLimit: `${FREE_PLAN.tradeLimit} trades`
    },
    ...STRIPE_PRODUCTS.map(product => ({
      name: product.name,
      price: product.price,
      period: product.period,
      description: product.description,
      features: product.features,
      highlighted: product.highlighted,
      buttonText: product.name,
      tradeLimit: "Unlimited trades",
      savings: product.savings,
      priceId: product.priceId
    }))
  ];

  return (
    <div className="min-h-screen bg-black px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Success Stories
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real traders, real results. See how TradeTrackr helped transform losing streaks into consistent profits.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-900 p-6 rounded-xl text-center border border-gray-800">
              <stat.icon className="h-8 w-8 text-green-400 mx-auto mb-4" />
              <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-green-500 transition-all duration-300">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
                <span className="ml-2 text-sm text-gray-400">({testimonial.timeframe})</span>
              </div>

              <div className="flex items-center justify-center mb-4 space-x-4">
                <div className="text-center">
                  <div className="text-red-400 font-bold text-lg">{testimonial.before}</div>
                  <div className="text-xs text-gray-500">Before</div>
                </div>
                <TrendingUp className="h-6 w-6 text-green-400" />
                <div className="text-center">
                  <div className="text-green-400 font-bold text-lg">{testimonial.after}</div>
                  <div className="text-xs text-gray-500">After</div>
                </div>
              </div>

              <blockquote className="text-gray-300 text-sm italic">
                "{testimonial.quote}"
              </blockquote>
            </div>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-gray-400 text-lg">Start your journey to profitable trading today</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-xl border ${
                  plan.highlighted
                    ? 'border-green-500 bg-green-900/10'
                    : 'border-gray-800 bg-gray-900'
                } ${plan.highlighted ? 'transform scale-105' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-black px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {plan.savings && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-medium">
                      {plan.savings}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-400 text-sm">/{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                  <div className="text-green-400 text-sm font-medium mt-2">
                    {plan.tradeLimit}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm">
                      <span className="text-green-400 mr-3">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`${
                    plan.highlighted
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  } w-full py-3 px-6 rounded-lg font-medium transition-all`}
                >
                  {plan.name === 'Free' ? (
                    user ? (
                      <Link to="/" className="block">
                        {plan.buttonText}
                      </Link>
                    ) : (
                      <Link to="/signup" className="block">
                        {plan.buttonText}
                      </Link>
                    )
                  ) : (
                    user ? (
                      <StripeCheckout 
                        priceId={plan.priceId!} 
                        planName={plan.name}
                      >
                        {plan.buttonText}
                      </StripeCheckout>
                    ) : (
                      <Link to="/signup" className="block">
                        Sign up to upgrade
                      </Link>
                    )
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Testimonials;