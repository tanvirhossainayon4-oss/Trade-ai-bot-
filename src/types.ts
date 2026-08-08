export interface Market {
  id: number;
  symbol: string;
  name: string;
  type: string;
}

export interface MarketData {
  symbol: string;
  price: string;
  change: string;
  volume: number;
  chartData?: any[];
  candleStatus?: {
    open: number;
    high: number;
    low: number;
    close: number;
    timeRemaining: string;
    nextCandleStart: string;
  };
}

export interface MinimalAnalysis {
  direction: "UP" | "DOWN";
  timing: "ON CANDLE" | "NEXT CANDLE";
  entryTime: string;
}

export interface Settings {
  theme: string;
  language: string;
  timezone: string;
}
