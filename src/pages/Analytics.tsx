import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, BarChart3 } from 'lucide-react';
import { useTrades } from '../context/TradeContext';
import ProfitChart from '../components/ProfitChart';
import DayPerformanceChart from '../components/DayPerformanceChart';
import MarketPerformanceChart from '../components/MarketPerformanceChart';

const Analytics: React.FC = () => {
  const { trades } = useTrades();

  // Calculate statistics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.outcome === 'win').length;
  const losingTrades = trades.filter(t => t.outcome === 'loss').length;
  const breakEvenTrades = trades.filter(t => t.outcome === 'break-even').length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalProfit = trades.reduce((sum, trade) => sum + trade.profit_loss, 0);

  const stats = [
    {
      title: 'Total Trades',
      value: totalTrades.toString(),
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20'
    },
    {
      title: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20'
    },
    {
      title: 'Total P&L',
      value: `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}`,
      icon: DollarSign,
      color: totalProfit >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: totalProfit >= 0 ? 'bg-green-900/20' : 'bg-red-900/20'
    },
    {
      title: 'Average per Trade',
      value: `${totalTrades > 0 ? (totalProfit / totalTrades >= 0 ? '+' : '') : ''}$${totalTrades > 0 ? (totalProfit / totalTrades).toFixed(2) : '0.00'}`,
      icon: TrendingUp,
      color: totalTrades > 0 && (totalProfit / totalTrades) >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: totalTrades > 0 && (totalProfit / totalTrades) >= 0 ? 'bg-green-900/20' : 'bg-red-900/20'
    }
  ];

  if (totalTrades === 0) {
    return (
      <div className="min-h-screen bg-black px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No Analytics Available</h2>
            <p className="text-gray-500">Add some trades to your journal to see detailed analytics and insights.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Trading Analytics</h1>
          <p className="text-gray-400 text-lg">Analyze your performance and identify improvement opportunities</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} p-6 rounded-xl border border-gray-800`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          {/* Profit Chart */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-xl font-semibold mb-6">Profit & Loss Over Time</h3>
            <ProfitChart />
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h4 className="text-green-400 font-semibold mb-2">Analysis</h4>
              <p className="text-gray-300 text-sm">
                This chart shows your cumulative profit/loss progression. Look for consistent upward trends and identify periods of drawdown. 
                {totalProfit > 0 
                  ? " Your overall trajectory is positive, indicating profitable trading strategies."
                  : " Focus on risk management and strategy refinement to improve performance."
                }
              </p>
            </div>
          </div>

          {/* Day Performance Chart */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-xl font-semibold mb-6">Performance by Day of Week</h3>
            <DayPerformanceChart />
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h4 className="text-green-400 font-semibold mb-2">Analysis</h4>
              <p className="text-gray-300 text-sm">
                This distribution shows which days of the week you perform best. Use this insight to focus your trading activities 
                on your most profitable days and be more cautious on historically challenging days.
              </p>
            </div>
          </div>

          {/* Market Performance Chart */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-xl font-semibold mb-6">Performance by Market</h3>
            <MarketPerformanceChart />
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h4 className="text-green-400 font-semibold mb-2">Analysis</h4>
              <p className="text-gray-300 text-sm">
                This chart reveals your most and least profitable markets. Consider allocating more capital to markets 
                where you consistently perform well and reducing exposure to underperforming markets.
              </p>
            </div>
          </div>
        </div>

        {/* Trading Psychology Section */}
        <div className="mt-12 bg-gradient-to-r from-green-900/20 to-green-800/20 p-8 rounded-xl border border-green-800/50">
          <h3 className="text-2xl font-bold text-green-400 mb-6">Trading Psychology Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-green-300 mb-3">Risk Management</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  Never risk more than 1-2% of your account per trade
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  Set stop losses before entering any position
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  Maintain a risk-reward ratio of at least 1:2
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-green-300 mb-3">Emotional Control</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  Stick to your trading plan regardless of emotions
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  Take breaks after significant losses or wins
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  Review and learn from every trade, win or lose
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;