import React, { useEffect, useState, useRef } from 'react';
import { API_URL, WS_URL } from "../config";
import { useLocation } from 'react-router-dom';
import { Search, Activity, RefreshCw, Clock, BarChart2, ArrowLeft } from 'lucide-react';
import { Market, MarketData, MinimalAnalysis as AnalysisType } from '../types';
import { io } from 'socket.io-client';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

// Custom Candlestick shape for Recharts
const Candlestick = (props: any) => {
  const { x, y, width, height, open, close } = props;
  const isGrowing = close > open;
  const color = isGrowing ? '#10b981' : '#ef4444'; // emerald-500 or red-500
  
  const bottom = Math.max(y, y + height);
  const top = Math.min(y, y + height);
  
  return (
    <g stroke={color} fill={color}>
      <path d={`M${x + width / 2},${top} L${x + width / 2},${top - 10}`} />
      <path d={`M${x + width / 2},${bottom} L${x + width / 2},${bottom + 10}`} />
      <rect x={x} y={top} width={width} height={Math.max(bottom - top, 1)} />
    </g>
  );
};

export default function AnalysisPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisType | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [timeframe, setTimeframe] = useState('15m');
  
  const location = useLocation();
  const analysisContainerRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Forex', 'Forex OTC', 'Crypto', 'Crypto OTC', 'Commodities', 'Indices'];

  useEffect(() => {
    fetchMarkets();
    const socket = io(WS_URL || undefined, { path: '/socket.io' });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('market_data', (data: MarketData[]) => {
      const dataMap: Record<string, MarketData> = {};
      data.forEach(d => {
        dataMap[d.symbol] = d;
      });
      setMarketData(dataMap);
      setLastUpdate(new Date());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedMarket) {
      runAnalysis(selectedMarket.symbol, timeframe);
    }
  }, [selectedMarket, timeframe]);

  useEffect(() => {
    if (analysis && analysisContainerRef.current) {
      analysisContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [analysis]);

  const fetchMarkets = async () => {
    const res = await fetch(`${API_URL}/api/v1/markets`);
    const data = await res.json();
    setMarkets(data);
    
    // Check if a symbol was passed via navigation state
    const initialSymbol = location.state?.selectedSymbol;
    if (initialSymbol) {
      const initialMarket = data.find((m: Market) => m.symbol === initialSymbol);
      if (initialMarket) {
        setSelectedMarket(initialMarket);
        setSelectedCategory(initialMarket.type);
      }
    }
  };

  const runAnalysis = async (symbol: string, tf: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/analysis/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbol, timeframe: tf })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data);
    } catch (e) {
      console.error(e);
      // Keep previous analysis on error
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkets = markets.filter(m => {
    const matchesSearch = m.symbol.toLowerCase().includes(search.toLowerCase()) || m.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {!selectedMarket ? (
        <div className="w-full max-w-5xl mx-auto bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col overflow-hidden h-full">
          <div className="p-6 border-b border-neutral-800 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Select a Market to Analyze</h2>
              <p className="text-neutral-400 mt-1">Choose from our supported trading pairs and commodities</p>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search markets..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
            {filteredMarkets.map(market => {
              const mData = marketData[market.symbol];
              const price = mData ? parseFloat(mData.price).toFixed(4) : '...';
              const change = mData ? parseFloat(mData.change) : 0;
              return (
                <button
                  key={market.id}
                  onClick={() => setSelectedMarket(market)}
                  className="w-full text-left p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-indigo-500/50 hover:bg-neutral-800 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">{market.symbol}</div>
                    <div className="text-sm text-neutral-500 mt-1">{market.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-medium text-white">${price}</div>
                    <div className={`text-sm font-medium mt-1 ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {change > 0 ? '+' : ''}{change.toFixed(2)}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto scrollbar-hide" ref={analysisContainerRef}>
          {/* Header */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 shrink-0">
            <div className="flex items-start gap-4">
              <button 
                onClick={() => {
                  setSelectedMarket(null);
                  setAnalysis(null);
                }}
                className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors mt-0.5"
                title="Back to Markets"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white">{selectedMarket.symbol}</h2>
                  <span className="px-2.5 py-1 bg-neutral-800 text-neutral-300 rounded text-xs font-medium">
                    {selectedMarket.type}
                  </span>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isConnected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    {isConnected ? 'Live' : 'Disconnected'}
                  </div>
                </div>
                <p className="text-neutral-400 text-sm">{selectedMarket.name}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 xl:gap-8 ml-12 xl:ml-0">
              {/* Timeframe Selector */}
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                {['1m', '5m', '15m'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      timeframe === tf 
                        ? 'bg-indigo-500 text-white' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-xl min-h-[400px]">
              <RefreshCw className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
              <p>Generating technical analysis...</p>
            </div>
          ) : analysis ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6 pb-6"
            >
              {/* 1. Analysis Result Card (Top) */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 flex flex-col items-center justify-center text-center py-12 shadow-lg">
                <h3 className="text-sm font-bold text-neutral-500 mb-8 tracking-[0.2em] uppercase">
                  Analysis Result
                </h3>
                
                <div className="space-y-8 flex flex-col items-center">
                  {/* Direction */}
                  <div className={`text-7xl md:text-9xl font-black tracking-tighter leading-none ${analysis.direction === 'UP' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {analysis.direction}
                  </div>
                  
                  {/* Timing */}
                  <div className="bg-neutral-950 border-2 border-neutral-800 rounded-full px-8 py-3 shadow-inner">
                    <span className="text-xl md:text-2xl font-bold text-white tracking-widest">
                      {analysis.timing}
                    </span>
                  </div>
                  
                  {/* Time */}
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Entry Time</span>
                    <span className="text-4xl font-bold text-indigo-400 font-mono tracking-tight">
                      {analysis.entryTime}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 2. Live Chart Section */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-indigo-500" />
                    Live Chart Overview
                  </h3>
                  
                  {marketData[selectedMarket.symbol]?.candleStatus && (
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium bg-neutral-950 py-2 px-4 rounded-lg border border-neutral-800">
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <Clock className="w-4 h-4" />
                        Time Remaining: <span className="text-indigo-400">{marketData[selectedMarket.symbol].candleStatus!.timeRemaining}</span>
                      </div>
                      <div className="w-px h-4 bg-neutral-800 hidden sm:block"></div>
                      <div className="text-neutral-500 hidden sm:block">
                        Next Candle: {marketData[selectedMarket.symbol].candleStatus!.nextCandleStart}
                      </div>
                    </div>
                  )}
                </div>
                
                {marketData[selectedMarket.symbol]?.candleStatus && (
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 flex flex-col">
                      <span className="text-xs text-neutral-500 mb-1">Open</span>
                      <span className="text-sm text-white font-medium">{marketData[selectedMarket.symbol].candleStatus!.open.toFixed(4)}</span>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 flex flex-col">
                      <span className="text-xs text-neutral-500 mb-1">High</span>
                      <span className="text-sm text-emerald-500 font-medium">{marketData[selectedMarket.symbol].candleStatus!.high.toFixed(4)}</span>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 flex flex-col">
                      <span className="text-xs text-neutral-500 mb-1">Low</span>
                      <span className="text-sm text-red-500 font-medium">{marketData[selectedMarket.symbol].candleStatus!.low.toFixed(4)}</span>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 flex flex-col">
                      <span className="text-xs text-neutral-500 mb-1">Close</span>
                      <span className={`text-sm font-medium ${marketData[selectedMarket.symbol].candleStatus!.close > marketData[selectedMarket.symbol].candleStatus!.open ? 'text-emerald-500' : 'text-red-500'}`}>{marketData[selectedMarket.symbol].candleStatus!.close.toFixed(4)}</span>
                    </div>
                  </div>
                )}

                <div className="h-[400px] w-full">
                  {marketData[selectedMarket.symbol]?.chartData && marketData[selectedMarket.symbol].chartData!.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={marketData[selectedMarket.symbol].chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                        <XAxis dataKey="time" stroke="#525252" fontSize={12} tickLine={false} />
                        <YAxis domain={['dataMin', 'dataMax']} stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.toFixed(4)} width={80} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
                          itemStyle={{ color: '#e5e5e5' }}
                          formatter={(value: number) => value.toFixed(4)}
                        />
                        <Bar dataKey="close" shape={<Candlestick />} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500">
                      Chart data not available
                    </div>
                  )}
                </div>
              </div>


            </motion.div>
          ) : null}
        </div>
      )}
    </div>
  );
}
