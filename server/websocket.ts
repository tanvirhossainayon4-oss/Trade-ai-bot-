import { Server, Socket } from 'socket.io';
import { db } from './db.js';

export function setupMarketWebSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);
    
    // Simulate live market data updates
    const interval = setInterval(() => {
      try {
        const markets = db.prepare('SELECT symbol FROM markets').all() as { symbol: string }[];
        const data = markets.map(m => {
          const priceStr = (Math.random() * 1000 + 10).toFixed(4);
          const price = parseFloat(priceStr);
          
          return {
            symbol: m.symbol,
            price: priceStr,
            change: (Math.random() * 2 - 1).toFixed(4),
            volume: Math.floor(Math.random() * 10000),
            candleStatus: {
              open: price - (Math.random() * 5),
              high: price + (Math.random() * 5),
              low: price - (Math.random() * 10),
              close: price,
              timeRemaining: '04:23',
              nextCandleStart: '14:30 UTC'
            },
            chartData: Array.from({length: 20}).map((_, i) => ({
              time: i,
              open: price - (Math.random() * 10),
              high: price + (Math.random() * 10),
              low: price - (Math.random() * 15),
              close: price + (Math.random() * 10 - 5),
            }))
          };
        });
        
        socket.emit('market_data', data);
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    }, 2000);

    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log('Client disconnected:', socket.id);
    });
  });
}
