import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';

export interface Trade {
  id: string;
  user_id: string;
  pair: string;
  direction: 'long' | 'short';
  day: string;
  size: number;
  outcome: 'win' | 'loss' | 'break-even';
  profit_loss: number;
  strategy: string;
  notes?: string;
  image_url?: string;
  market: string;
  created_at: string;
}

interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  tradeCount: number;
  isFreePlan: boolean;
  loading: boolean;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  // For development purposes, we'll use mock data when there's no user
  const hasUser = !!user;

  // Load trades when user changes or on initial load for mock data
  useEffect(() => {
    if (hasUser && user) {
      loadTrades();
    } else {
      // Load mock data for development
      loadMockTrades();
    }
  }, [hasUser, user]);

  const loadMockTrades = () => {
    // Mock data for development
    const mockTrades: Trade[] = [
      {
        id: '1',
        user_id: 'mock-user',
        pair: 'EUR/USD',
        direction: 'long',
        day: 'Monday',
        size: 1.5,
        outcome: 'win',
        profit_loss: 120.5,
        strategy: 'Breakout',
        market: 'Forex',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        user_id: 'mock-user',
        pair: 'GBP/JPY',
        direction: 'short',
        day: 'Tuesday',
        size: 2.0,
        outcome: 'loss',
        profit_loss: -75.25,
        strategy: 'Reversal',
        market: 'Forex',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    
    setTrades(mockTrades);
    setLoading(false);
  };

  const loadTrades = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading trades:', error);
        // Fall back to mock data on error
        loadMockTrades();
        return;
      }

      setTrades(data || []);
    } catch (error) {
      console.error('Error loading trades:', error);
      // Fall back to mock data on error
      loadMockTrades();
    } finally {
      setLoading(false);
    }
  };

  const addTrade = async (tradeData: Omit<Trade, 'id' | 'user_id' | 'created_at'>) => {
    if (hasUser && user) {
      try {
        const { data, error } = await supabase
          .from('trades')
          .insert({
            user_id: user.id,
            pair: tradeData.pair,
            direction: tradeData.direction,
            day: tradeData.day,
            size: tradeData.size,
            outcome: tradeData.outcome,
            profit_loss: tradeData.profit_loss,
            strategy: tradeData.strategy,
            market: tradeData.market,
            image_url: tradeData.image_url,
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding trade:', error);
          throw error;
        }

        setTrades(prev => [data, ...prev]);
      } catch (error) {
        console.error('Error adding trade:', error);
        throw error;
      }
    } else {
      // Mock add for development
      const newTrade: Trade = {
        id: `${trades.length + 1}`,
        user_id: 'mock-user',
        pair: tradeData.pair,
        direction: tradeData.direction,
        day: tradeData.day,
        size: tradeData.size,
        outcome: tradeData.outcome,
        profit_loss: tradeData.profit_loss,
        strategy: tradeData.strategy,
        market: tradeData.market,
        image_url: tradeData.image_url,
        created_at: new Date().toISOString(),
      };
      
      setTrades(prev => [newTrade, ...prev]);
    }
  };

  const updateTrade = async (id: string, updatedData: Partial<Trade>) => {
    if (hasUser && user) {
      try {
        const { data, error } = await supabase
          .from('trades')
          .update({
            pair: updatedData.pair,
            direction: updatedData.direction,
            day: updatedData.day,
            size: updatedData.size,
            outcome: updatedData.outcome,
            profit_loss: updatedData.profit_loss,
            strategy: updatedData.strategy,
            market: updatedData.market,
            image_url: updatedData.image_url,
          })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating trade:', error);
          throw error;
        }

        setTrades(prev => prev.map(trade => 
          trade.id === id ? data : trade
        ));
      } catch (error) {
        console.error('Error updating trade:', error);
        throw error;
      }
    } else {
      // Mock update for development
      setTrades(prev => prev.map(trade => 
        trade.id === id ? { ...trade, ...updatedData } : trade
      ));
    }
  };

  const deleteTrade = async (id: string) => {
    if (hasUser && user) {
      try {
        const { error } = await supabase
          .from('trades')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting trade:', error);
          throw error;
        }

        setTrades(prev => prev.filter(trade => trade.id !== id));
      } catch (error) {
        console.error('Error deleting trade:', error);
        throw error;
      }
    } else {
      // Mock delete for development
      setTrades(prev => prev.filter(trade => trade.id !== id));
    }
  };

  return (
    <TradeContext.Provider value={{
      trades,
      addTrade,
      updateTrade,
      deleteTrade,
      tradeCount: trades.length,
      isFreePlan: !isPremium,
      loading
    }}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTrades = () => {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTrades must be used within a TradeProvider');
  }
  return context;
};