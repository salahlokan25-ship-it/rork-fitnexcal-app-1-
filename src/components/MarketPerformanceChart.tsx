import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTrades } from '../context/TradeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MarketPerformanceChart: React.FC = () => {
  const { trades } = useTrades();

  // Group trades by market and calculate performance
  const marketPerformance = trades.reduce((acc, trade) => {
    if (!acc[trade.market]) {
      acc[trade.market] = {
        totalProfit: 0,
        totalTrades: 0,
        wins: 0,
      };
    }
    
    acc[trade.market].totalProfit += trade.profit_loss;
    acc[trade.market].totalTrades += 1;
    if (trade.outcome === 'win') {
      acc[trade.market].wins += 1;
    }
    
    return acc;
  }, {} as Record<string, { totalProfit: number; totalTrades: number; wins: number }>);

  const marketData = Object.entries(marketPerformance).map(([market, data]) => ({
    market: market.charAt(0).toUpperCase() + market.slice(1),
    profit: data.totalProfit,
    winRate: (data.wins / data.totalTrades) * 100,
  }));

  const data = {
    labels: marketData.map(item => item.market),
    datasets: [
      {
        label: 'Total P&L ($)',
        data: marketData.map(item => item.profit),
        backgroundColor: marketData.map(item => 
          item.profit >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: marketData.map(item => 
          item.profit >= 0 ? '#10B981' : '#EF4444'
        ),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          afterLabel: function(context: any) {
            const marketInfo = marketData[context.dataIndex];
            return `Win Rate: ${marketInfo.winRate.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#374151',
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: '#374151',
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return `$${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={data} options={options} />
    </div>
  );
};

export default MarketPerformanceChart;