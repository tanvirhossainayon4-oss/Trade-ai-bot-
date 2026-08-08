import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
export const db = new Database(dbPath);

export const runAsync = async (sql: string, params: any[] = []) => {
  return db.prepare(sql).run(...params);
};

export const getAsync = async (sql: string, params: any[] = []) => {
  return db.prepare(sql).get(...params);
};

export const allAsync = async (sql: string, params: any[] = []) => {
  return db.prepare(sql).all(...params);
};

export async function setupDatabase() {
  await runAsync(`
    CREATE TABLE IF NOT EXISTS markets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `);

  // Seed initial markets if empty
  const markets = await allAsync("SELECT * FROM markets LIMIT 1");
  if ((markets as any[]).length === 0) {
    const defaultMarkets = [
      { symbol: 'BTC/USD', name: 'Bitcoin', type: 'Crypto' },
      { symbol: 'ETH/USD', name: 'Ethereum', type: 'Crypto' },
      { symbol: 'BTC/USD (OTC)', name: 'Bitcoin OTC', type: 'Crypto OTC' },
      { symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'Forex' },
      { symbol: 'GBP/USD', name: 'British Pound / US Dollar', type: 'Forex' },
      { symbol: 'NZD/CHF (OTC)', name: 'NZD/CHF (OTC)', type: 'Forex OTC' },
      { symbol: 'USD/PKR (OTC)', name: 'USD/PKR (OTC)', type: 'Forex OTC' },
      { symbol: 'EUR/NZD (OTC)', name: 'EUR/NZD (OTC)', type: 'Forex OTC' },
      { symbol: 'GBP/NZD (OTC)', name: 'GBP/NZD (OTC)', type: 'Forex OTC' },
      { symbol: 'USD/IDR (OTC)', name: 'USD/IDR (OTC)', type: 'Forex OTC' },
      { symbol: 'AUD/JPY', name: 'AUD/JPY', type: 'Forex' },
      { symbol: 'EUR/JPY', name: 'EUR/JPY', type: 'Forex' },
      { symbol: 'USD/DZD (OTC)', name: 'USD/DZD (OTC)', type: 'Forex OTC' },
      { symbol: 'EUR/GBP', name: 'EUR/GBP', type: 'Forex' },
      { symbol: 'AUD/USD', name: 'AUD/USD', type: 'Forex' },
      { symbol: 'EUR/AUD', name: 'EUR/AUD', type: 'Forex' },
      { symbol: 'GBP/JPY', name: 'GBP/JPY', type: 'Forex' },
      { symbol: 'USD/CAD', name: 'USD/CAD', type: 'Forex' },
      { symbol: 'USD/JPY', name: 'USD/JPY', type: 'Forex' },
      { symbol: 'USD/BRL (OTC)', name: 'USD/BRL (OTC)', type: 'Forex OTC' },
      { symbol: 'CAD/JPY', name: 'CAD/JPY', type: 'Forex' },
      { symbol: 'EUR/CAD', name: 'EUR/CAD', type: 'Forex' },
      { symbol: 'GBP/AUD', name: 'GBP/AUD', type: 'Forex' },
      { symbol: 'NZD/USD (OTC)', name: 'NZD/USD (OTC)', type: 'Forex OTC' },
      { symbol: 'AUD/NZD (OTC)', name: 'AUD/NZD (OTC)', type: 'Forex OTC' },
      { symbol: 'USD/INR (OTC)', name: 'USD/INR (OTC)', type: 'Forex OTC' },
      { symbol: 'USD/PHP (OTC)', name: 'USD/PHP (OTC)', type: 'Forex OTC' },
      { symbol: 'USD/CHF', name: 'USD/CHF', type: 'Forex' },
      { symbol: 'AUD/CAD', name: 'AUD/CAD', type: 'Forex' },
      { symbol: 'GBP/CAD', name: 'GBP/CAD', type: 'Forex' },
      { symbol: 'AUD/CHF', name: 'AUD/CHF', type: 'Forex' },
      { symbol: 'CAD/CHF (OTC)', name: 'CAD/CHF (OTC)', type: 'Forex OTC' },
      { symbol: 'NZD/CAD (OTC)', name: 'NZD/CAD (OTC)', type: 'Forex OTC' },
      { symbol: 'NZD/JPY (OTC)', name: 'NZD/JPY (OTC)', type: 'Forex OTC' },
      { symbol: 'USD/ARS (OTC)', name: 'USD/ARS (OTC)', type: 'Forex OTC' },
      { symbol: 'USD/BDT (OTC)', name: 'USD/BDT (OTC)', type: 'Forex OTC' },
      { symbol: 'USD/EGP (OTC)', name: 'USD/EGP (OTC)', type: 'Forex OTC' },
      { symbol: 'USD/MXN (OTC)', name: 'USD/MXN (OTC)', type: 'Forex OTC' },
      { symbol: 'USD/NGN (OTC)', name: 'USD/NGN (OTC)', type: 'Forex OTC' },
      { symbol: 'CHF/JPY', name: 'CHF/JPY', type: 'Forex' },
      { symbol: 'USD/COP (OTC)', name: 'USD/COP (OTC)', type: 'Forex OTC' },
      { symbol: 'EUR/CHF', name: 'EUR/CHF', type: 'Forex' },
      { symbol: 'GBP/CHF', name: 'GBP/CHF', type: 'Forex' },
      { symbol: 'USD/ZAR (OTC)', name: 'USD/ZAR (OTC)', type: 'Forex OTC' },
      { symbol: 'GOLD', name: 'Gold', type: 'Commodities' },
      { symbol: 'US30', name: 'Wall Street 30', type: 'Indices' }
    ];
    
    for (const m of defaultMarkets) {
      await runAsync("INSERT INTO markets (symbol, name, type) VALUES (?, ?, ?)", [m.symbol, m.name, m.type]);
    }
  }
}
