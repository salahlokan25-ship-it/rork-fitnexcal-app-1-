import React, { useEffect, useState } from 'react';

const ForexPanel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const forexPairs = [
    { symbol: 'EUR/USD', flag1: '🇪🇺', flag2: '🇺🇸', name: 'Euro / US Dollar' },
    { symbol: 'GBP/USD', flag1: '🇬🇧', flag2: '🇺🇸', name: 'British Pound / US Dollar' },
    { symbol: 'USD/JPY', flag1: '🇺🇸', flag2: '🇯🇵', name: 'US Dollar / Japanese Yen' },
    { symbol: 'AUD/USD', flag1: '🇦🇺', flag2: '🇺🇸', name: 'Australian Dollar / US Dollar' },
    { symbol: 'USD/CAD', flag1: '🇺🇸', flag2: '🇨🇦', name: 'US Dollar / Canadian Dollar' },
    { symbol: 'USD/CHF', flag1: '🇺🇸', flag2: '🇨🇭', name: 'US Dollar / Swiss Franc' },
    { symbol: 'NZD/USD', flag1: '🇳🇿', flag2: '🇺🇸', name: 'New Zealand Dollar / US Dollar' },
    { symbol: 'EUR/GBP', flag1: '🇪🇺', flag2: '🇬🇧', name: 'Euro / British Pound' },
    { symbol: 'EUR/JPY', flag1: '🇪🇺', flag2: '🇯🇵', name: 'Euro / Japanese Yen' },
    { symbol: 'GBP/JPY', flag1: '🇬🇧', flag2: '🇯🇵', name: 'British Pound / Japanese Yen' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % forexPairs.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5"></div>
      
      <div className="relative">
        <h3 className="text-lg font-semibold text-green-400 mb-4 text-center">
          Live Forex Markets
        </h3>
        
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="overflow-hidden rounded-lg">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {forexPairs.map((pair, index) => (
                  <div
                    key={pair.symbol}
                    className="w-full flex-shrink-0 bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-2xl">{pair.flag1}</span>
                        <span className="text-xl text-gray-400">/</span>
                        <span className="text-2xl">{pair.flag2}</span>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{pair.symbol}</div>
                        <div className="text-xs text-gray-400">{pair.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Indicators */}
            <div className="flex justify-center mt-4 space-x-2">
              {forexPairs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-900/20 px-3 py-1 rounded-full border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Live Market Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForexPanel;