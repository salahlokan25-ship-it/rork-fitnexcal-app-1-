import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTrades } from '../context/TradeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const DayPerformanceChart: React.FC = () => {
  const { trades } = useTrades();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayColors = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#EAB308', // Yellow
    '#22C55E', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ];

  const dayData = days.map(day => {
    const dayTrades = trades.filter(trade => trade.day === day);
    const winningTrades = dayTrades.filter(trade => trade.outcome === 'win').length;
    return {
      day,
      total: dayTrades.length,
      wins: winningTrades,
      winRate: dayTrades.length > 0 ? (winningTrades / dayTrades.length) * 100 : 0,
    };
  });

  const data = {
    labels: days,
    datasets: [
      {
        label: 'Trades by Day',
        data: dayData.map(day => day.total),
        backgroundColor: dayColors,
        borderColor: dayColors.map(color => color),
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#F9FAFB',
          font: {
            size: 12,
          },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const dayInfo = dayData[context.dataIndex];
            return [
              `Trades: ${dayInfo.total}`,
              `Wins: ${dayInfo.wins}`,
              `Win Rate: ${dayInfo.winRate.toFixed(1)}%`
            ];
          },
        },
      },
    },
    cutout: '50%',
  };

  return (
    <div className="h-80 flex items-center justify-center">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DayPerformanceChart;