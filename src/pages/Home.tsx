import React, { useState } from 'react';
import { Plus, User, BarChart3, DollarSign } from 'lucide-react';
import CandlestickChart from '../components/CandlestickChart';
import ForexPanel from '../components/ForexPanel';
import TradeForm from '../components/TradeForm';
import JournalTable from '../components/JournalTable';
import { useTrades } from '../context/TradeContext';

const Home: React.FC = () => {
  const [showTradeForm, setShowTradeForm] = useState(false);
  const { tradeCount, isFreePlan, loading } = useTrades();

  const canAddTrade = !isFreePlan || tradeCount < 7;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your trading journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                <span className="text-green-500">Master Your</span>
                <br />
                <span className="text-white">Trading Journey</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Track your trades, analyze performance, and transform your trading with professional-grade analytics and insights.
              </p>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start mb-8">
                <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">80% Win Rate</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">$10M+ Profits</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
                  <User className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">4.9★ Reviews</span>
                </div>
              </div>

              <button
                onClick={() => canAddTrade && setShowTradeForm(true)}
                disabled={!canAddTrade}
                className={`inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg transition-all transform hover:scale-105 ${
                  canAddTrade
                    ? 'bg-white text-black hover:bg-gray-100 shadow-lg'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Trade
                {isFreePlan && (
                  <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded">
                    {7 - tradeCount} free left
                  </span>
                )}
              </button>
            </div>

            {/* Right Chart */}
            <div className="relative">
              <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
                <h3 className="text-lg font-semibold mb-4 text-center text-gray-300">Live Market Analysis</h3>
                <CandlestickChart />
              </div>
              
              {/* Analytics Image */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg opacity-80">
                <BarChart3 className="h-12 w-12 text-black" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forex Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ForexPanel />
      </div>

      {/* Journal Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Trading Journal</h2>
          <p className="text-gray-400">Track and analyze your trading performance</p>
        </div>

        <JournalTable />
      </div>

      {/* Trade Form Modal */}
      {showTradeForm && (
        <TradeForm onClose={() => setShowTradeForm(false)} />
      )}
    </div>
  );
};

export default Home;