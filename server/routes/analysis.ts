import express from 'express';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { symbol, timeframe = '15m' } = req.body;
    
    const isUp = Math.random() > 0.5;
    const direction = isUp ? 'UP' : 'DOWN';
    const isOnCandle = Math.random() > 0.5;
    const timing = isOnCandle ? 'ON CANDLE' : 'NEXT CANDLE';
    
    const now = new Date();
    
    let minutesToAdd = 15;
    if (timeframe === '1m') minutesToAdd = 1;
    if (timeframe === '5m') minutesToAdd = 5;
    
    if (!isOnCandle) {
        now.setMinutes(now.getMinutes() + minutesToAdd);
    }
    
    const entryTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const analysis = {
      direction,
      timing,
      entryTime
    };
    
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
