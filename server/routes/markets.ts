import express from 'express';
import { allAsync } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const markets = await allAsync('SELECT * FROM markets');
    res.json(markets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      res.json([]);
      return;
    }
    const markets = await allAsync('SELECT * FROM markets WHERE symbol LIKE ? OR name LIKE ?', [`%${q}%`, `%${q}%`]);
    res.json(markets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
