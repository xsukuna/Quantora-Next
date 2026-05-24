import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainChart } from './MainChart';
import { getInitialData, generateMockPrice } from '../services/marketData';
import { 
  Activity, Database, Grid3X3, BrainCircuit, Search, 
  ChevronUp, Cpu 
} from 'lucide-react';

const SCREENER_DATA = [
  { symbol: 'RELIANCE', price: 2942.50, change: '+1.24%', pe: '24.2', mcap: '19.4T', div: '0.34%', rsi: '58.2' },
  { symbol: 'HDFCBANK', price: 1452.10, change: '-0.45%', pe: '18.1', mcap: '11.2T', div: '1.20%', rsi: '42.1' },
  { symbol: 'TCS', price: 3842.00, change: '+0.85%', pe: '28.4', mcap: '14.1T', div: '1.05%', rsi: '64.5' },
  { symbol: 'INFY', price: 1542.40, change: '+2.10%', pe: '22.1', mcap: '6.4T', div: '1.45%', rsi: '72.1' },
  { symbol: 'SBIN', price: 782.30, change: '+0.15%', pe: '10.2', mcap: '7.1T', div: '1.80%', rsi: '51.4' },
  { symbol: 'ICICIBANK', price: 1084.20, change: '+1.45%', pe: '17.4', mcap: '7.8T', div: '0.80%', rsi: '55.2' },
  { symbol: 'WIPRO', price: 482.10, change: '-2.10%', pe: '19.2', mcap: '2.5T', div: '0.50%', rsi: '38.4' },
];

const HEATMAP_SECTORS = [
  { name: 'Banks', change: '+1.4%', items: ['HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK'], color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { name: 'IT Services', change: '+2.8%', items: ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'LTIM'], color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { name: 'Energy', change: '-1.1%', items: ['RELIANCE', 'ONGC', 'BPCL', 'IOC'], color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { name: 'Auto', change: '+0.5%', items: ['TATA', 'M&M', 'MARUTI', 'BAJAJ'], color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { name: 'Pharma', change: '+1.2%', items: ['SUN', 'CIPLA', 'DRREDDY', 'DIVIS'], color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
];

export const LiveTerminal: React.FC = () => {
  const [data, setData] = useState(getInitialData());
  const [activeSubTab, setActiveSubTab] = useState<'CHART' | 'SCREENER' | 'HEATMAP' | 'LAB'>('CHART');
  const [watchlist, setWatchlist] = useState(SCREENER_DATA);
  const [niftyPrice, setNiftyPrice] = useState(25124.50);
  const [niftyChange, setNiftyChange] = useState(0.56);

  // Real-time market tick updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1];
        const newClose = generateMockPrice(last.close);
        return [...prev.slice(1), { ...last, time: Math.floor(Date.now() / 1000), close: newClose }];
      });

      // Update Nifty indexes mock
      const tick = (Math.random() - 0.5) * 12;
      setNiftyPrice(prev => Number((prev + tick).toFixed(2)));
      setNiftyChange(prev => Number((prev + (tick > 0 ? 0.01 : -0.01)).toFixed(2)));

      // Update screener watch prices mock
      setWatchlist(prev => prev.map(item => {
        const move = (Math.random() - 0.5) * 4;
        const newPrice = Number((item.price + move).toFixed(2));
        const isUp = move > 0;
        const oldChange = parseFloat(item.change);
        const newChange = (oldChange + (isUp ? 0.05 : -0.05)).toFixed(2);
        return {
          ...item,
          price: newPrice,
          change: `${isUp ? '+' : ''}${newChange}%`
        };
      }));

    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#020202]">
      
      {/* 1. SIDE SUBNAV FOR WORKSTATION */}
      <aside className="w-64 border-r border-white/5 bg-[#050505] p-6 hidden md:flex flex-col gap-6 select-none shrink-0">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Fintech Terminal</span>
          <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Market Terminal</span>
          </h3>
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setActiveSubTab('CHART')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
              activeSubTab === 'CHART' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <span>Live Equity Chart</span>
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </button>
          
          <button
            onClick={() => setActiveSubTab('SCREENER')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
              activeSubTab === 'SCREENER' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <span>Global Screener</span>
            <Database className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={() => setActiveSubTab('HEATMAP')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
              activeSubTab === 'HEATMAP' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <span>Macro Sectors</span>
            <Grid3X3 className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <button
            onClick={() => setActiveSubTab('LAB')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
              activeSubTab === 'LAB' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <span>Neural R&D Lab</span>
            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>
      </aside>

      {/* 2. SUBTAB AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header with live ticker indexes */}
        <div className="p-6 border-b border-white/5 bg-[#050505]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-20 shrink-0">
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest text-white">
              {activeSubTab === 'CHART' && 'Quantitative Execution Workspace'}
              {activeSubTab === 'SCREENER' && 'Macro Equity Screener Grid'}
              {activeSubTab === 'HEATMAP' && 'Macro Sector Heatmap Indexes'}
              {activeSubTab === 'LAB' && 'Neural Quant Network Predictions'}
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">
              Secure clearing stream: NY-HQ-VIRTUAL-NODE | Latency: 1.2ms [Clearance: OK]
            </p>
          </div>

          <div className="flex gap-4 select-none shrink-0 font-mono text-[11px]">
            <div className="border border-white/5 bg-white/[0.01] px-4 py-2 rounded-xl flex flex-col text-right">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">NIFTY 50 INDEX</span>
              <span className="font-black text-emerald-400 flex items-center gap-1">
                {niftyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                <ChevronUp className="w-3.5 h-3.5" />
              </span>
              <span className="text-[9px] font-bold text-gray-600">+{niftyChange}% YTD clearance</span>
            </div>
          </div>
        </div>

        {/* Dynamic content rendering */}
        <div className="flex-1 overflow-hidden p-6 bg-[#020202]">
          <AnimatePresence mode="wait">
            
            {/* Live Chart SubTab */}
            {activeSubTab === 'CHART' && (
              <motion.div 
                key="chart" 
                className="h-full flex flex-col gap-4 overflow-hidden"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
              >
                <div className="flex-1 glass rounded-2xl p-4 relative border border-white/5">
                  <MainChart data={data} />
                </div>
                
                {/* Statistics grids */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-24 shrink-0">
                  {['Volume Feed', 'OBV Alpha', 'ADX Decouple', 'ATR Spread'].map((stat, idx) => (
                    <div key={stat} className="glass rounded-xl p-4 flex flex-col justify-between border border-white/5">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">{stat}</span>
                      <div className="text-sm font-black text-white font-mono">
                        {idx === 0 && '842.1k'}
                        {idx === 1 && '+120.4k'}
                        {idx === 2 && '34.2'}
                        {idx === 3 && '14.5'}
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${60 + Math.random() * 30}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Screener SubTab */}
            {activeSubTab === 'SCREENER' && (
              <motion.div 
                key="screener" 
                className="h-full glass rounded-2xl border border-white/5 overflow-hidden flex flex-col"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <div className="p-5 border-b border-white/5 bg-white/[0.01] flex justify-between items-center shrink-0">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Filter by Symbol..." 
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-500 text-white transition-all"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider">Export Ledger</button>
                </div>

                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-white/10 text-[9px] font-black text-gray-500 uppercase tracking-widest sticky top-0 bg-[#050505] z-10">
                        <th className="px-6 py-4">Equity Symbol</th>
                        <th className="px-6 py-4">Live Price</th>
                        <th className="px-6 py-4">Index Change</th>
                        <th className="px-6 py-4">PE Valuation</th>
                        <th className="px-6 py-4">Market Cap</th>
                        <th className="px-6 py-4">Div Yield</th>
                        <th className="px-6 py-4">RSI (14)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {watchlist.map(row => (
                        <tr key={row.symbol} className="hover:bg-white/[0.02] transition-colors cursor-pointer group text-xs">
                          <td className="px-6 py-4 text-white font-black group-hover:text-blue-400 transition-colors">{row.symbol}</td>
                          <td className="px-6 py-4 font-mono text-gray-300">{row.price.toFixed(2)}</td>
                          <td className={`px-6 py-4 font-bold ${row.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                            {row.change}
                          </td>
                          <td className="px-6 py-4 font-mono text-gray-400">{row.pe}</td>
                          <td className="px-6 py-4 font-mono text-gray-400">{row.mcap}</td>
                          <td className="px-6 py-4 font-mono text-gray-400">{row.div}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 select-none">
                              <span className="font-mono text-gray-400 text-[10px] w-8">{row.rsi}</span>
                              <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${row.rsi}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Macro Heatmaps SubTab */}
            {activeSubTab === 'HEATMAP' && (
              <motion.div 
                key="heatmap" 
                className="h-full grid grid-cols-1 md:grid-cols-3 gap-4"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                {HEATMAP_SECTORS.map((sec) => (
                  <div key={sec.name} className="glass rounded-xl p-6 border border-white/5 flex flex-col justify-between hover:border-white/12 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-black uppercase text-white tracking-widest">{sec.name}</h3>
                      <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${sec.color}`}>
                        {sec.change}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-6">
                      {sec.items.map(item => (
                        <div 
                          key={item} 
                          className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-mono font-bold text-gray-400 hover:bg-blue-600 hover:text-white transition-colors uppercase"
                        >
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/5 select-none">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Allocation Profile</span>
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-wider font-mono">Institutional BUY</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Neural Quant Lab SubTab */}
            {activeSubTab === 'LAB' && (
              <motion.div 
                key="lab" 
                className="h-full glass rounded-2xl border border-white/5 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
                
                <div className="w-64 h-64 relative z-10 mb-8 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="0.5" />
                    <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1" />
                    <motion.path 
                      d="M100 10 L100 190 M10 100 L190 100" 
                      stroke="rgba(168, 85, 247, 0.2)" 
                      strokeWidth="0.5"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    />
                    {[0, 72, 144, 216, 288].map(angle => (
                      <circle 
                        key={angle}
                        cx={100 + Math.cos(angle * Math.PI / 180) * 60}
                        cy={100 + Math.sin(angle * Math.PI / 180) * 60}
                        r="3.5"
                        fill="#a855f7"
                        className="animate-ping"
                        style={{ animationDuration: '3s' }}
                      />
                    ))}
                    <circle cx="100" cy="100" r="6" fill="#FFF" className="animate-pulse" />
                  </svg>
                </div>

                <div className="space-y-4 max-w-md relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-600/15 border border-purple-500/25 rounded-full text-purple-400 text-[9px] font-black uppercase tracking-widest">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Neural Alpha Model v8.4</span>
                  </div>
                  <h3 className="text-lg font-black uppercase text-white tracking-widest">Sovereign Debt anomaly detector</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Our multi-agent neural network backtests sovereign bond corridors against simulated G7 debt cycles. Currently forecasting a <strong>82.4% probability</strong> of yield clearance decoupling.
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

    </div>
  );
};
