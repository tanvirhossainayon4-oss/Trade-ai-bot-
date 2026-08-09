import React, { useEffect, useState } from 'react';
import { API_URL, WS_URL } from "../config";
import { io, Socket } from 'socket.io-client';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Clock, Search } from 'lucide-react';
import { MarketData, Market, MinimalAnalysis } from '../types';

// Simulate some history data for charts
const generateChartData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: `${i}:00`,
    price: 40000 + Math.random() * 5000 + (i * 200)
  }));
};

export default function Dashboard() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string>('BTC/USD');
  const [chartData, setChartData] = useState(generateChartData());
  const [analysis, setAnalysis] = useState<MinimalAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [socketError, setSocketError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string>('Not Started');
  const [apiError, setApiError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    // Determine the websocket URL based on current origin since we're proxying
    // In production, we connect to the same host
    const socket = io(WS_URL || undefined, { 
      path: '/socket.io', 
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setSocketError(null);
      if (import.meta.env.DEV) {
        console.log('Socket connected');
      }
    });

    socket.on('disconnect', (reason, details) => {
      setIsConnected(false);
      setSocketError(`Disconnected: ${reason}`);
      if (reason !== 'io client disconnect') {
        console.error('WebSocket Disconnected:', {
          reason: reason,
          details: details,
          state: socket.connected ? 'connected' : 'disconnected'
        });
      }
    });

    socket.on('connect_error', (error) => {
      setSocketError(error.message);
      console.error('WebSocket Connection Error:', {
        message: error.message,
        state: socket.connected ? 'connected' : 'disconnected'
      });
    });

    socket.on('market_data', (data: MarketData[]) => {
      setMarketData(data);
      if (import.meta.env.DEV) {
        console.log(`Markets received: ${data.length}`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    setApiStatus('Pending');
    setApiError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/analysis/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: selectedMarket })
      });
      const data = await res.json();
      if (!res.ok) {
        setApiStatus(`Error: ${res.status}`);
        setApiError(data.error || 'API Request Failed');
        console.error('API Error:', {
          url: res.url,
          status: res.status,
          body: data,
          message: data.error || 'API Request Failed'
        });
        throw new Error(data.error || 'API Request Failed');
      }
      setApiStatus(`${res.status} OK`);
      setAnalysis(data);
    } catch (e: any) {
      setApiStatus('Failed');
      setApiError(e.message || 'Unknown network error');
      console.error(e);
      // Fallback: keep previous analysis if available
    } finally {
      setLoading(false);
    }
  };

  const selectedData = marketData.find(m => m.symbol === selectedMarket);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {marketData.slice(0,4).map((data) => (
          <div key={data.symbol} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 md:p-4 flex flex-col gap-1 md:gap-2 cursor-pointer hover:border-neutral-700 active:bg-neutral-800 transition-colors" onClick={() => setSelectedMarket(data.symbol)}>
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-neutral-400 font-medium">{data.symbol}</span>
              {parseFloat(data.change) >= 0 ? 
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" /> : 
                <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
              }
            </div>
            <div className="text-lg md:text-2xl font-semibold text-white">
              ${parseFloat(data.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-[10px] md:text-xs font-medium ${parseFloat(data.change) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {parseFloat(data.change) > 0 ? '+' : ''}{data.change}%
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-2 sm:gap-0">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base md:text-lg font-semibold text-white">{selectedMarket} Overview</h3>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isConnected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  {isConnected ? 'Live' : 'Disconnected'}
                </div>
              </div>
              <p className="text-xs md:text-sm text-neutral-400">Live price action and trends</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xl md:text-2xl font-bold text-white">
                ${selectedData ? parseFloat(selectedData.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '...'}
              </div>
            </div>
          </div>
          
          <div className="h-64 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedData?.chartData || chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e5e5' }}
                />
                <Area type="monotone" dataKey={selectedData?.chartData ? "close" : "price"} stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Analysis Panel */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 md:p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-white">AI Analysis Engine</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {analysis ? (
              <div className="space-y-6 flex flex-col items-center py-4">
                <div className={`text-5xl font-black tracking-tighter leading-none ${analysis.direction === 'UP' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {analysis.direction}
                </div>
                
                <div className="bg-neutral-950 border-2 border-neutral-800 rounded-full px-6 py-2 shadow-inner">
                  <span className="text-lg font-bold text-white tracking-widest">
                    {analysis.timing}
                  </span>
                </div>
                
                <div className="mt-2 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">Entry Time</span>
                  <span className="text-2xl font-bold text-indigo-400 font-mono tracking-tight">
                    {analysis.entryTime}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-neutral-500 space-y-4">
                <p>Run the AI analysis engine to generate insights and technical indicators.</p>
              </div>
            )}
          </div>

          <button 
            onClick={runAnalysis}
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
          >
            {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* Diagnostics Panel (Collapsible) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mt-6">
        <button 
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <Activity className="w-3.5 h-3.5" />
          {showDiagnostics ? 'Hide' : 'Show'} System Diagnostics
        </button>
        
        {showDiagnostics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-neutral-800 text-xs font-mono text-neutral-300">
            <div>
              <span className="text-neutral-500 block mb-1">Socket URL:</span>
              <span className="break-all">{WS_URL || '(Same Origin)'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-1">Socket Status:</span>
              <span className={isConnected ? 'text-emerald-500' : 'text-red-500'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {socketError && <span className="text-red-400 block mt-1">({socketError})</span>}
            </div>
            <div>
              <span className="text-neutral-500 block mb-1">Markets Count:</span>
              <span>{marketData.length} items</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-1">API URL:</span>
              <span className="break-all">{API_URL || '(Same Origin)'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-1">Last Analysis API Status:</span>
              <span className={apiStatus.includes('Error') || apiStatus === 'Failed' ? 'text-red-500' : 'text-indigo-400'}>
                {apiStatus}
              </span>
              {apiError && <span className="text-red-400 block mt-1">({apiError})</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
