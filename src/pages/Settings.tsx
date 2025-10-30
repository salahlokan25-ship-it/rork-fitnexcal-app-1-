import React, { useState } from 'react';
import { User, Bell, CreditCard, Settings as SettingsIcon, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import StripeCheckout from '../components/StripeCheckout';
import { STRIPE_PRODUCTS, FREE_PLAN } from '../stripe-config';

const Settings: React.FC = () => {
  const { signOut } = useAuth();
  const { subscription, getCurrentPlan } = useSubscription();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    tradeAlerts: true,
    weeklyReports: true,
    marketUpdates: false,
    systemUpdates: true,
  });

  const [profile, setProfile] = useState({
    name: 'John Trader',
    email: 'john@example.com',
    experience: '1-3yrs',
    timezone: 'UTC-5',
    preferredMarkets: ['forex', 'crypto'],
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  const experienceOptions = [
    { value: '<1yr', label: 'Less than 1 year' },
    { value: '1-3yrs', label: '1-3 years' },
    { value: '3yrs+', label: '3+ years' },
  ];

  const marketOptions = [
    { value: 'forex', label: 'Forex' },
    { value: 'futures', label: 'Futures' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'stocks', label: 'Stocks' },
    { value: 'commodities', label: 'Commodities' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Profile Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Trading Experience</label>
                <select
                  value={profile.experience}
                  onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {experienceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="UTC-5">Eastern Time (UTC-5)</option>
                  <option value="UTC-6">Central Time (UTC-6)</option>
                  <option value="UTC-7">Mountain Time (UTC-7)</option>
                  <option value="UTC-8">Pacific Time (UTC-8)</option>
                  <option value="UTC+0">GMT (UTC+0)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preferred Markets</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {marketOptions.map(market => (
                  <label key={market.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.preferredMarkets.includes(market.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProfile(prev => ({
                            ...prev,
                            preferredMarkets: [...prev.preferredMarkets, market.value]
                          }));
                        } else {
                          setProfile(prev => ({
                            ...prev,
                            preferredMarkets: prev.preferredMarkets.filter(m => m !== market.value)
                          }));
                        }
                      }}
                      className="rounded border-gray-600 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">{market.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              type="button"
              onClick={() => alert('Profile settings saved successfully!')}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Notification Preferences</h3>
            
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {key === 'tradeAlerts' && 'Get notified when your trades are executed'}
                      {key === 'weeklyReports' && 'Receive weekly performance summaries'}
                      {key === 'marketUpdates' && 'Stay updated with market news and analysis'}
                      {key === 'systemUpdates' && 'Receive updates about new features and maintenance'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Billing & Subscription</h3>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{getCurrentPlan()} Plan</h4>
                  <p className="text-gray-400">
                    {subscription?.subscription_status === 'active' 
                      ? 'Active subscription' 
                      : '7 trades remaining'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {getCurrentPlan() === 'Free' ? '$0.00' : 
                     getCurrentPlan() === 'Start Monthly' ? '$2.99' : '$19.99'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {getCurrentPlan() === 'Free' ? 'forever' :
                     getCurrentPlan() === 'Start Monthly' ? 'per month' : 'per year'}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <h5 className="font-medium mb-2">Usage</h5>
                <div className="flex justify-between text-sm">
                  <span>Trades used</span>
                  <span>
                    {getCurrentPlan() === 'Free' ? '0 / 7' : 'Unlimited'}
                  </span>
                </div>
                {getCurrentPlan() === 'Free' && (
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                )}
              </div>
            </div>

            {getCurrentPlan() === 'Free' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {STRIPE_PRODUCTS.map((product) => (
                  <div key={product.id} className={`bg-gray-800 p-6 rounded-lg ${product.highlighted ? 'border border-green-600' : ''}`}>
                    <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                    <div className="text-2xl font-bold mb-2">{product.price}<span className="text-sm font-normal">/{product.period.replace('per ', '')}</span></div>
                    {product.savings && (
                      <div className="text-green-400 text-sm mb-2">{product.savings}</div>
                    )}
                    <ul className="space-y-2 text-sm text-gray-300 mb-4">
                      {product.features.slice(0, 4).map((feature, index) => (
                        <li key={index}>✓ {feature}</li>
                      ))}
                    </ul>
                    <StripeCheckout priceId={product.priceId} planName={product.name}>
                      <span className="w-full bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg transition-colors block text-center">
                        Upgrade to {product.name}
                      </span>
                    </StripeCheckout>
                  </div>
                ))}
              </div>
            )}

            {getCurrentPlan() !== 'Free' && (
              <div className="bg-green-900/20 border border-green-600 p-6 rounded-lg">
                <h4 className="text-green-400 font-semibold text-lg mb-2">Premium Active</h4>
                <p className="text-gray-300">You're currently on the {getCurrentPlan()} plan with unlimited access to all features.</p>
              </div>
            )}
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Help & Support</h3>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h4 className="font-semibold mb-2">Contact Support</h4>
              <p className="text-sm text-gray-400 mb-4">Get help from our support team</p>
              <button 
                type="button"
                onClick={() => {
                  const subject = encodeURIComponent('TradeTrackr Support Request');
                  const body = encodeURIComponent('Hello TradeTrackr Support Team,\n\nI need help with:\n\n[Please describe your issue here]\n\nBest regards');
                  window.location.href = `mailto:nwiri.nwiri25@gmail.com?subject=${subject}&body=${body}`;
                }}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-colors cursor-pointer"
              >
                Contact Support
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              ))}
              
              <button 
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors text-red-400 hover:text-red-300 hover:bg-gray-800 mt-8 cursor-pointer"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;