import React, { useEffect, useRef } from 'react';

const CandlestickChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 250;

    // Generate candlestick data
    const generateCandles = () => {
      const candles = [];
      let basePrice = 100;
      
      for (let i = 0; i < 20; i++) {
        const change = (Math.random() - 0.5) * 4;
        const open = basePrice;
        const close = basePrice + change;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        
        candles.push({ open, close, high, low });
        basePrice = close;
      }
      
      return candles;
    };

    let candles = generateCandles();
    let animationOffset = 0;

    const drawCandle = (x: number, candle: any, width: number) => {
      const { open, close, high, low } = candle;
      const isGreen = close > open;
      
      // Scale prices to fit canvas
      const scale = 150 / 20; // Adjust scale as needed
      const baseline = 200;
      
      const openY = baseline - (open - 90) * scale;
      const closeY = baseline - (close - 90) * scale;
      const highY = baseline - (high - 90) * scale;
      const lowY = baseline - (low - 90) * scale;

      // Draw wick
      ctx.strokeStyle = isGreen ? '#10B981' : '#EF4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + width / 2, highY);
      ctx.lineTo(x + width / 2, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = isGreen ? '#10B981' : '#EF4444';
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      
      if (bodyHeight < 2) {
        // Doji - draw a line
        ctx.strokeStyle = isGreen ? '#10B981' : '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, openY);
        ctx.lineTo(x + width, openY);
        ctx.stroke();
      } else {
        ctx.fillRect(x, bodyY, width, bodyHeight);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background grid
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 0.5;
      
      // Horizontal lines
      for (let i = 0; i <= 5; i++) {
        const y = (i * canvas.height) / 5;
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

      // Draw candles
      const candleWidth = canvas.width / candles.length - 2;
      candles.forEach((candle, index) => {
        const x = (index * (canvas.width / candles.length)) + 1;
        drawCandle(x, candle, candleWidth);
      });

      // Update animation
      animationOffset += 0.01;
      if (animationOffset > 1) {
        animationOffset = 0;
        // Add new candle and remove first one
        const lastPrice = candles[candles.length - 1].close;
        const change = (Math.random() - 0.5) * 4;
        const open = lastPrice;
        const close = lastPrice + change;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        
        candles.push({ open, close, high, low });
        candles.shift();
      }

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
      <canvas
        ref={canvasRef}
        className="w-full h-auto max-w-full rounded-lg"
        style={{ maxHeight: '250px' }}
      />
      <div className="absolute top-2 left-2 text-xs text-gray-400">
        EUR/USD • Live
      </div>
      <div className="absolute top-2 right-2 text-xs text-green-500 font-mono">
        1.0845 ↗
      </div>
    </div>
  );
};

export default CandlestickChart;