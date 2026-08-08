import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ActivitySquare } from 'lucide-react';
import { Market } from '../types';
import { API_URL } from '../config';

export default function Markets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const navigate = useNavigate();

  const categories = ['All', 'Forex', 'Forex OTC', 'Crypto', 'Crypto OTC', 'Commodities', 'Indices'];

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    const res = await fetch(`${API_URL}/api/v1/markets`);
    const data = await res.json();
    setMarkets(data);
  };

  const navigateToAnalysis = (symbol: string) => {
    navigate('/analysis', { state: { selectedSymbol: symbol } });
  };

  const filteredMarkets = markets.filter(m => {
    const matchesSearch = m.symbol.toLowerCase().includes(search.toLowerCase()) || m.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Markets</h2>
          <p className="text-neutral-400">Browse and manage your market watchlist</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-5 h-5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search markets..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === cat 
                ? 'bg-indigo-500 text-white' 
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-950/50 text-neutral-400 text-sm">
              <th className="p-4 font-medium">Symbol</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {filteredMarkets.map(market => (
              <tr 
                key={market.id} 
                className="hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                onClick={() => navigateToAnalysis(market.symbol)}
              >
                <td className="p-4 font-semibold text-white group-hover:text-indigo-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <ActivitySquare className="w-4 h-4 text-indigo-500/0 group-hover:text-indigo-500 transition-colors" />
                    {market.symbol}
                  </div>
                </td>
                <td className="p-4 text-neutral-300">{market.name}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-neutral-800 text-neutral-300 rounded text-xs font-medium">
                    {market.type}
                  </span>
                </td>
              </tr>
            ))}
            {filteredMarkets.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-neutral-500">
                  No markets found matching "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
