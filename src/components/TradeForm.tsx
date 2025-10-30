import React, { useState } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import { useTrades } from '../context/TradeContext';

interface TradeFormProps {
  onClose: () => void;
  trade?: any;
  isEditing?: boolean;
}

const MARKETS = {
  forex: [
    { symbol: 'EUR/USD', color: 'text-blue-400' },
    { symbol: 'GBP/USD', color: 'text-blue-400' },
    { symbol: 'USD/JPY', color: 'text-blue-400' },
    { symbol: 'AUD/USD', color: 'text-blue-400' },
    { symbol: 'USD/CAD', color: 'text-blue-400' },
    { symbol: 'USD/CHF', color: 'text-blue-400' },
    { symbol: 'NZD/USD', color: 'text-blue-400' }
  ],
  futures: [
    { symbol: 'NQ', name: 'NASDAQ', color: 'text-blue-500' },
    { symbol: 'ES', name: 'S&P 500', color: 'text-red-500' },
    { symbol: 'GC', name: 'Gold', color: 'text-yellow-500' },
    { symbol: 'CL', name: 'Crude Oil', color: 'text-gray-400' },
    { symbol: 'NG', name: 'Natural Gas', color: 'text-cyan-400' },
    { symbol: 'YM', name: 'Dow Jones', color: 'text-blue-600' },
    { symbol: 'SI', name: 'Silver', color: 'text-gray-300' },
    { symbol: 'HG', name: 'Copper', color: 'text-orange-400' }
  ],
  crypto: [
    { symbol: 'BTC/USD', name: 'Bitcoin', color: 'text-orange-500' },
    { symbol: 'ETH/USD', name: 'Ethereum', color: 'text-purple-500' },
    { symbol: 'ADA/USD', name: 'Cardano', color: 'text-blue-400' },
    { symbol: 'SOL/USD', name: 'Solana', color: 'text-purple-400' },
    { symbol: 'DOGE/USD', name: 'Dogecoin', color: 'text-yellow-400' },
    { symbol: 'LTC/USD', name: 'Litecoin', color: 'text-gray-400' }
  ],
  stocks: [
    { symbol: 'AAPL', name: 'Apple', color: 'text-gray-300' },
    { symbol: 'META', name: 'Meta', color: 'text-blue-500' },
    { symbol: 'TSLA', name: 'Tesla', color: 'text-red-500' },
    { symbol: 'GOOGL', name: 'Google', color: 'text-yellow-500' },
    { symbol: 'MSFT', name: 'Microsoft', color: 'text-blue-400' },
    { symbol: 'AMZN', name: 'Amazon', color: 'text-orange-500' },
    { symbol: 'NVDA', name: 'NVIDIA', color: 'text-green-400' }
  ],
  commodities: [
    { symbol: 'XAUUSD', name: 'Gold', color: 'text-yellow-500' },
    { symbol: 'XAGUSD', name: 'Silver', color: 'text-gray-300' },
    { symbol: 'WTIUSD', name: 'Crude Oil WTI', color: 'text-gray-600' },
    { symbol: 'BRENTUSD', name: 'Brent Oil', color: 'text-gray-500' },
    { symbol: 'NATGASUSD', name: 'Natural Gas', color: 'text-cyan-400' },
    { symbol: 'COPPER', name: 'Copper', color: 'text-orange-400' },
    { symbol: 'PLATINUM', name: 'Platinum', color: 'text-gray-200' },
    { symbol: 'PALLADIUM', name: 'Palladium', color: 'text-gray-400' },
    { symbol: 'WHEAT', name: 'Wheat', color: 'text-yellow-600' },
    { symbol: 'CORN', name: 'Corn', color: 'text-yellow-500' },
    { symbol: 'SOYBEANS', name: 'Soybeans', color: 'text-green-600' }
  ]
};

const TradeForm: React.FC<TradeFormProps> = ({ onClose, trade, isEditing = false }) => {
  const { addTrade, updateTrade } = useTrades();
  const [formData, setFormData] = useState({
    pair: trade?.pair || '',
    direction: trade?.direction || 'long',
    day: trade?.day || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    size: trade?.size || '',
    outcome: trade?.outcome || 'win',
    profitLoss: trade?.profitLoss || '',
    strategy: trade?.strategy || '',
    notes: trade?.notes || '',
    market: trade?.market || 'forex',
    imageUrl: trade?.image_url || '',
    customPair: ''
  });

  const [showCustomPair, setShowCustomPair] = useState(false);
  const [imagePreview, setImagePreview] = useState(trade?.image_url || '');

  const getSizeLabel = () => {
    return formData.market === 'futures' ? 'Contracts' : 'Lot Size';
  };

  const getSizeStep = () => {
    return formData.market === 'futures' ? '1' : '0.01';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalPair = showCustomPair ? formData.customPair : formData.pair;
    if (!finalPair) return;

    const tradeData = {
      ...formData,
      pair: finalPair,
      size: parseFloat(formData.size.toString()),
      profit_loss: parseFloat(formData.profitLoss.toString()),
      image_url: formData.imageUrl
    };

    if (isEditing && trade) {
      updateTrade(trade.id, tradeData);
    } else {
      addTrade(tradeData);
    }
    
    onClose();
  };

  const currentMarketPairs = MARKETS[formData.market as keyof typeof MARKETS] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {isEditing ? 'Edit Trade' : 'Add New Trade'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Market Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Market</label>
              <select
                value={formData.market}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  market: e.target.value,
                  pair: '' // Reset pair when market changes
                }))}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="forex">Forex</option>
                <option value="futures">Futures</option>
                <option value="crypto">Crypto</option>
                <option value="stocks">Stocks</option>
                <option value="commodities">Commodities</option>
              </select>
            </div>

            {/* Symbol Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Symbol</label>
                <button
                  type="button"
                  onClick={() => setShowCustomPair(!showCustomPair)}
                  className="text-sm text-green-500 hover:text-green-400 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Custom
                </button>
              </div>
              
              {showCustomPair ? (
                <input
                  type="text"
                  value={formData.customPair}
                  onChange={(e) => setFormData(prev => ({ ...prev, customPair: e.target.value }))}
                  placeholder="Enter custom symbol (e.g., CUSTOM/USD)"
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ) : (
                <select
                  value={formData.pair}
                  onChange={(e) => setFormData(prev => ({ ...prev, pair: e.target.value }))}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Symbol</option>
                  {currentMarketPairs.map((item) => (
                    <option key={item.symbol} value={item.symbol}>
                      {item.symbol} {item.name ? `- ${item.name}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Direction and Day */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Direction</label>
                <select
                  value={formData.direction}
                  onChange={(e) => setFormData(prev => ({ ...prev, direction: e.target.value as 'long' | 'short' }))}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Day</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
            </div>

            {/* Size and Outcome */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{getSizeLabel()}</label>
                <input
                  type="number"
                  step={getSizeStep()}
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Outcome</label>
                <select
                  value={formData.outcome}
                  onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value as 'win' | 'loss' | 'break-even' }))}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="break-even">Break Even</option>
                </select>
              </div>
            </div>

            {/* Profit/Loss */}
            <div>
              <label className="block text-sm font-medium mb-2">Profit/Loss ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.profitLoss}
                onChange={(e) => setFormData(prev => ({ ...prev, profitLoss: e.target.value }))}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Strategy */}
            <div>
              <label className="block text-sm font-medium mb-2">Strategy</label>
              <input
                type="text"
                value={formData.strategy}
                onChange={(e) => setFormData(prev => ({ ...prev, strategy: e.target.value }))}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Breakout, Support/Resistance..."
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Trade Screenshot</label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center w-full p-4 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                    <Upload className="h-5 w-5 mr-2" />
                    <span>Upload Screenshot</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Trade preview"
                    className="max-w-full h-32 object-cover rounded-lg border border-gray-700"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
              >
                {isEditing ? 'Update Trade' : 'Add Trade'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TradeForm;