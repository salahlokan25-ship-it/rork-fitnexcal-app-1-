import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Success: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');
    setSessionId(sessionIdParam);
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-300 mb-6">
            Welcome to TradeTrackr Premium! Your subscription is now active and you have unlimited access to all features.
          </p>
          
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-green-400 font-semibold mb-2">What's Next?</h3>
              <ul className="text-sm text-gray-300 space-y-1 text-left">
                <li>• Start logging unlimited trades</li>
                <li>• Access advanced analytics</li>
                <li>• Upload trade screenshots</li>
                <li>• Get priority support</li>
              </ul>
            </div>
            
            <Link
              to="/"
              className="inline-flex items-center bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Start Trading Journal
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
          
          {sessionId && (
            <p className="text-xs text-gray-500 mt-4">
              Session ID: {sessionId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Success;