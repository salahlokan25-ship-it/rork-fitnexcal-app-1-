import React, { useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

const TradingAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 500;
    canvas.height = 400;

    // Trading data points
    let dataPoints: { x: number; y: number; trend: 'up' | 'down' }[] = [];
    let animationTime = 0;

    // Generate initial data
    const generateDataPoints = () => {
      dataPoints = [];
      let baseY = canvas.height / 2;
      
      for (let i = 0; i < 50; i++) {
        const change = (Math.random() - 0.5) * 40;
        baseY += change;
        baseY = Math.max(50, Math.min(canvas.height - 50, baseY));
        
        dataPoints.push({
          x: (i * canvas.width) / 49,
          y: baseY,
          trend: change > 0 ? 'up' : 'down'
        });
      }
    };

    generateDataPoints();

    const drawChart = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background grid
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.lineWidth = 1;
      
      // Horizontal lines
      for (let i = 0; i <= 8; i++) {
        const y = (i * canvas.height) / 8;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Vertical lines
      for (let i = 0; i <= 10; i++) {
        const x = (i * canvas.width) / 10;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw price line
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      dataPoints.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      
      ctx.stroke();

      // Draw data points
      dataPoints.forEach((point, index) => {
        if (index % 5 === 0) { // Show every 5th point
          ctx.fillStyle = point.trend === 'up' ? '#10B981' : '#EF4444';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Draw animated price ticker
      const tickerY = 30;
      const tickerX = 20 + (animationTime * 2) % (canvas.width - 200);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(tickerX - 10, tickerY - 15, 180, 30);
      
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('EUR/USD 1.0845 ↗ +0.23%', tickerX, tickerY);
    };

    const animate = () => {
      animationTime += 1;
      
      // Update data points occasionally
      if (animationTime % 60 === 0) {
        // Shift data points and add new one
        dataPoints.shift();
        const lastPoint = dataPoints[dataPoints.length - 1];
        const change = (Math.random() - 0.5) * 40;
        let newY = lastPoint.y + change;
        newY = Math.max(50, Math.min(canvas.height - 50, newY));
        
        dataPoints.push({
          x: canvas.width,
          y: newY,
          trend: change > 0 ? 'up' : 'down'
        });
        
        // Recalculate x positions
        dataPoints.forEach((point, index) => {
          point.x = (index * canvas.width) / (dataPoints.length - 1);
        });
      }
      
      drawChart();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Trading Stats Overlay */}
      <div className="absolute top-4 left-4 space-y-2 z-10">
        <div className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-green-500/30">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-green-400 text-sm font-mono">+$2,847.50</span>
          </div>
        </div>
        <div className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-green-500/30">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-mono">Win Rate: 78%</span>
          </div>
        </div>
      </div>

      {/* Floating Trading Symbols */}
      <div className="absolute top-8 right-8 space-y-3 z-10">
        <div className="bg-green-900/20 border border-green-500/50 px-3 py-1 rounded-full animate-pulse">
          <span className="text-green-400 text-xs font-mono">BTC/USD ↗</span>
        </div>
        <div className="bg-blue-900/20 border border-blue-500/50 px-3 py-1 rounded-full animate-pulse delay-75">
          <span className="text-blue-400 text-xs font-mono">EUR/USD ↗</span>
        </div>
        <div className="bg-purple-900/20 border border-purple-500/50 px-3 py-1 rounded-full animate-pulse delay-150">
          <span className="text-purple-400 text-xs font-mono">GBP/USD ↘</span>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm"
        style={{ maxHeight: '400px' }}
      />

      {/* Bottom Stats */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-green-500/30">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-mono">Live Market</span>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingAnimation;