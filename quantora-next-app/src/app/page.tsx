'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Shield, Cpu, BarChart3, Globe, Activity, Zap, 
  AlertTriangle, ExternalLink, Download, Mail, Linkedin, Twitter, 
  Terminal as TerminalIcon, ShieldAlert, CheckCircle, Award, Leaf, Users
} from 'lucide-react';

export default function Home() {
  // UI State
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalLog, setTerminalLog] = useState<string[]>([
    '[SYSTEM]: Initializing secure handshake...',
    '[SYSTEM]: Connection established to ND-GENESIS-01',
    '[DATA]: Parsing alternative data streams... (842 GB/s)',
    '[AI]: Sentiment analysis complete (S&P 500: Neutral)',
    '[AI]: Detecting anomaly in Bond Yields (10Y UST)...',
    '[ALERT]: Unusual volume detected in XAU/USD',
    'Type "help" to view secure cryptographic CLI commands.'
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [carbonSavings, setCarbonSavings] = useState(0.0012);
  const [activeSignal, setActiveSignal] = useState(0);

  const logEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll terminal log
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLog]);

  // Focus terminal input
  useEffect(() => {
    if (terminalOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [terminalOpen]);

  // Carbon counter simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCarbonSavings(prev => prev + 0.00002);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // Macro Signals rotating feed
  const macroSignals = [
    { type: 'signal', title: 'Semiconductor Rally Sustained', body: 'Alternative data confirms fabrication supply chain easing in South Asia hubs.', color: '#00F0FF', icon: Zap },
    { type: 'risk', title: 'Liquidity Crunch in EM Bonds', body: 'Proprietary debt volatility index signals imminent corrections in frontier yield spreads.', color: '#FF4D4D', icon: AlertTriangle },
    { type: 'signal', title: 'Decoupled Clearing Corridor Expansion', body: 'Over $140B in central assets migrated into sovereign physical nodes during current cycle.', color: '#00FF00', icon: CheckCircle }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSignal(prev => (prev + 1) % macroSignals.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [macroSignals.length]);

  // Command Execution Logic
  const handleCommand = (cmdText: string) => {
    const cleanCmd = cmdText.trim().toLowerCase();
    if (!cleanCmd) return;

    const newLogs = [...terminalLog, `quantora@terminal:~$ ${cmdText}`];

    switch (cleanCmd) {
      case 'help':
        newLogs.push(
          'Available Secure CLI Commands:',
          '  help     - Display secure access instructions',
          '  about    - Access corporate mission statement',
          '  status   - Fetch system node connectivity metrics',
          '  market   - Stream live global alternative pricing feeds',
          '  report   - View central findings of ₹127,290 Cr Agri Exposé',
          '  clear    - Wipe active terminal console history',
          '  exit     - Drop secure connection and exit'
        );
        break;
      case 'about':
        newLogs.push(
          '[QUANTORA INTELLIGENCE ARCHIVE]',
          'Quantora Analytics is a decentralized knowledge network and sovereign R&D ecosystem.',
          'We synthesize macroeconomics, custom quantitative algorithms, and geospatial analytics',
          'to fuel deep-value decisions for advanced global institutions.',
          'Engineered in New Delhi, India. Scaling decentralized research nodes globally.'
        );
        break;
      case 'status':
        newLogs.push(
          '[SYSTEM INTEGRITY METRICS]',
          'Node Connection : ONLINE (ND-GENESIS-01)',
          'Uplink Bandwidth: 842 GB/s',
          'Ping Latency    : 11.8ms (SECURE TRACE)',
          'Quantum Engine  : ACTIVE (128 QUBITS)',
          'Plagiarism check: OK',
          'Synced Peers    : 4,812 globally'
        );
        break;
      case 'market':
        newLogs.push(
          '[LIVE MULTI-ASSET TICKER MATRIX]',
          'S&P 500      : 5,420.25 | +1.24% [BULLISH]',
          'NASDAQ 100   : 19,120.40| +0.85% [BULLISH]',
          'BTC/USD      : 67,420.00| +4.12% [STRONG BUY]',
          'GOLD (XAU)   : 2,340.50 | +0.22% [ACCUMULATE]',
          'CRUDE OIL    : 78.40    | -1.45% [OVERDUE]'
        );
        break;
      case 'report':
        newLogs.push(
          '[FEATURED EXPOSÉ: BROKEN PROMISES IN THE FIELDS]',
          'Author    : Aditya Kaushik',
          'Context   : 26-Year Forensic Budgetary Audit (FY 2000 - 2026)',
          'Core Stat : ₹127,290 Crore structural gap between promise and execution.',
          'Impact    : Deepened farming indebtedness, welfare leakage, and crisis.',
          '* Secure link armed: Click "Read Report" in the main interface to unlock the full 1,000+ line audit.'
        );
        break;
      case 'clear':
        setTerminalLog(['Terminal console history cleared. Type "help" for support.']);
        setTerminalInput('');
        return;
      case 'exit':
        newLogs.push('Terminating secure pipeline session...');
        setTimeout(() => setTerminalOpen(false), 800);
        break;
      default:
        newLogs.push(`Secure Console Error: command "${cleanCmd}" not recognized. Type "help" for support.`);
    }

    setTerminalLog(newLogs);
    setTerminalInput('');
  };

  const SignalIcon = macroSignals[activeSignal].icon;

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] font-sans selection:bg-[#0062FF] selection:text-white overflow-x-hidden">
      
      {/* 3D Glassmorphic Background Matrix */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(0,98,255,0.15),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(0,240,255,0.15),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_30%,transparent_100%)]" />
      </div>

      {/* Global Terminal Overlay */}
      {terminalOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 md:p-8 backdrop-blur-md">
          <div className="w-full max-w-5xl h-[85vh] bg-[#000000] border border-[#0062FF]/40 rounded-xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,98,255,0.25)]">
            
            {/* Terminal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#0062FF]/30 bg-[#070707] shrink-0">
              <div className="flex items-center gap-3">
                <span className="bg-[#0062FF] text-white px-2 py-0.5 text-[0.65rem] font-bold tracking-wider rounded">LIVE</span>
                <span className="text-xs md:text-sm font-mono tracking-widest text-[#0062FF]">QUANTORA_SECURE_CLI_v4.2</span>
              </div>
              <button 
                onClick={() => setTerminalOpen(false)}
                className="text-xs md:text-sm font-mono border border-[#0062FF]/50 text-[#0062FF] hover:bg-[#0062FF]/20 cursor-pointer px-3 py-1.5 transition-colors"
              >
                DISCONNECT [ESC]
              </button>
            </div>

            {/* Terminal Content Splitter */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 min-h-0">
              
              {/* Quick Access Sidebar */}
              <div className="hidden lg:flex flex-col bg-[#050505] border border-[#0062FF]/20 rounded-lg p-4 font-mono text-xs overflow-y-auto">
                <h4 className="text-[#0062FF] font-bold border-b border-[#0062FF]/20 pb-2 mb-4 tracking-wider">SECURE DIRECTORIES</h4>
                <ul className="space-y-3">
                  <li onClick={() => handleCommand('market')} className="text-[#00F0FF] hover:underline cursor-pointer">&gt; MARKET DASHBOARD</li>
                  <li onClick={() => handleCommand('status')} className="text-[#A0AEC0] hover:text-[#00FF00] hover:underline cursor-pointer">&gt; SYSTEM STATUS</li>
                  <li onClick={() => handleCommand('report')} className="text-[#A0AEC0] hover:text-[#00FF00] hover:underline cursor-pointer">&gt; ATTACHED EXPOSÉ</li>
                  <li onClick={() => handleCommand('about')} className="text-[#A0AEC0] hover:text-[#00FF00] hover:underline cursor-pointer">&gt; CORPORATE MISSION</li>
                  <li onClick={() => handleCommand('help')} className="text-[#A0AEC0] hover:text-[#00FF00] hover:underline cursor-pointer">&gt; LIST COMMANDS</li>
                </ul>
              </div>

              {/* Live CLI Panel */}
              <div className="lg:col-span-3 bg-[#020202] border border-[#0062FF]/30 rounded-lg p-4 flex flex-col h-full min-h-0">
                
                {/* Scrollable logs */}
                <div className="flex-1 overflow-y-auto font-mono text-xs md:text-sm text-[#00FF00] space-y-2 pr-2 scrollbar-thin">
                  {terminalLog.map((log, i) => {
                    let colorClass = 'text-[#00FF00]';
                    if (log.startsWith('quantora@')) colorClass = 'text-white font-bold';
                    else if (log.includes('[ALERT]') || log.includes('Error')) colorClass = 'text-[#FF4D4D]';
                    else if (log.startsWith('  ')) colorClass = 'text-[#FFFF00]';
                    else if (log.includes('[SYSTEM]')) colorClass = 'text-[#00AAFF]';

                    return (
                      <div key={i} className={`${colorClass} leading-relaxed whitespace-pre-wrap`}>
                        {log}
                      </div>
                    );
                  })}
                  <div ref={logEndRef} />
                </div>

                {/* Input Prompt */}
                <div className="flex items-center gap-2 border-t border-[#00FF00]/20 pt-3 shrink-0 font-mono text-xs md:text-sm text-[#00FF00]">
                  <span className="font-bold text-white shrink-0">quantora@terminal:~$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCommand(terminalInput);
                      else if (e.key === 'Escape') setTerminalOpen(false);
                    }}
                    className="bg-transparent border-none outline-none text-[#00FF00] flex-1 font-mono focus:ring-0 placeholder:text-[#00FF00]/30"
                    placeholder="Enter cryptographic command..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex items-center max-w-[1400px] mx-auto px-6 py-20">
        <div className="max-w-3xl">
          
          {/* New Delhi Launch Tag */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0062FF]/10 to-[#00F0FF]/10 border border-[#0062FF]/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className="text-[10px] md:text-xs font-mono font-bold tracking-widest text-[#00F0FF]">NEW DELHI GENESIS HUB [PLATFORM LAUNCH]</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
            <span className="bg-gradient-to-b from-white to-[#0062FF] bg-clip-text text-transparent">Publish Research.</span>
            <br />
            <span className="text-white">Share Intelligence.</span>
          </h1>

          <p className="text-lg md:text-xl text-[#A0AEC0] max-w-xl leading-relaxed mb-10">
            A New Delhi based open-access digital research ecosystem where students, academics, and independent analysts publish scientific, policy, and market intelligence without barriers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="#research" 
              className="bg-[#0062FF] hover:bg-[#0056e0] text-white text-center py-4 px-8 text-xs font-bold tracking-wider uppercase rounded shadow-[0_4px_20px_rgba(0,98,255,0.4)] hover:-translate-y-0.5 transition-all"
            >
              Explore Library Index
            </a>
            <a 
              href="#services" 
              className="border border-white/10 hover:bg-white/5 text-white text-center py-4 px-8 text-xs font-bold tracking-wider uppercase rounded transition-all"
            >
              Research Disciplines
            </a>
          </div>
        </div>
      </section>

      {/* Live Macro Ticker Bar */}
      <div className="w-full bg-[#050505]/90 border-y border-white/5 py-3 sticky bottom-0 z-40 backdrop-blur-sm shrink-0">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center gap-6 overflow-hidden">
          
          {/* Rotating Signals Widget */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              className="p-1 rounded flex items-center justify-center transition-colors"
              style={{ backgroundColor: `${macroSignals[activeSignal].color}15`, color: macroSignals[activeSignal].color }}
            >
              <SignalIcon size={14} className="animate-pulse" />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-[#A0AEC0] uppercase shrink-0">LIVE SIGNAL &gt;</span>
            <span className="text-xs font-mono font-semibold truncate max-w-[280px] sm:max-w-md" style={{ color: macroSignals[activeSignal].color }}>
              {macroSignals[activeSignal].title}: {macroSignals[activeSignal].body}
            </span>
          </div>

          {/* Environmental Tracker */}
          <div className="flex items-center gap-2 bg-[#00FF00]/5 border border-[#00FF00]/25 rounded px-3 py-1 font-mono text-[10px] text-[#00FF00] shrink-0">
            <Leaf size={12} className="animate-spin [animation-duration:12s]" />
            <span>CO₂ SAVED: <strong>{carbonSavings.toFixed(6)} kg</strong></span>
          </div>
        </div>
      </div>

      {/* Research Disciplines */}
      <section id="services" className="relative z-10 max-w-[1400px] mx-auto px-6 py-24 border-t border-white/5">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-[#0062FF] bg-clip-text text-transparent mb-2">RESEARCH DISCIPLINES</h2>
        <p className="text-sm md:text-base text-[#A0AEC0] mb-12">Empowering diverse empirical, scientific, and geopolitical fields under a unified open-access infrastructure.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-[#0f1423]/40 border border-white/10 hover:border-[#0062FF]/60 hover:shadow-[0_0_30px_rgba(0,98,255,0.15)] p-6 rounded-xl transition-all [perspective:1000px] hover:-translate-y-1">
            <div className="w-12 h-12 bg-[#0062FF]/10 text-[#0062FF] rounded-lg flex items-center justify-center mb-6"><LineChart size={20} /></div>
            <h3 className="font-extrabold text-sm tracking-wider mb-2">ECONOMICS</h3>
            <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed">Forecasting inflation indexes, GDP flow indices, and emerging market currency corridors.</p>
          </div>

          <div className="bg-[#0f1423]/40 border border-white/10 hover:border-[#0062FF]/60 hover:shadow-[0_0_30px_rgba(0,98,255,0.15)] p-6 rounded-xl transition-all [perspective:1000px] hover:-translate-y-1">
            <div className="w-12 h-12 bg-[#00F0FF]/10 text-[#00F0FF] rounded-lg flex items-center justify-center mb-6"><Activity size={20} /></div>
            <h3 className="font-extrabold text-sm tracking-wider mb-2">STOCK MARKET</h3>
            <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed">Quantitative factor models, deep order flow mapping, and volatility spreads.</p>
          </div>

          <div className="bg-[#0f1423]/40 border border-white/10 hover:border-[#0062FF]/60 hover:shadow-[0_0_30px_rgba(0,98,255,0.15)] p-6 rounded-xl transition-all [perspective:1000px] hover:-translate-y-1">
            <div className="w-12 h-12 bg-[#0062FF]/10 text-[#0062FF] rounded-lg flex items-center justify-center mb-6"><Cpu size={20} /></div>
            <h3 className="font-extrabold text-sm tracking-wider mb-2">AI & TECHNOLOGY</h3>
            <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed">Multi-agent deep reinforcement algorithms, spatial networks, and quantum systems.</p>
          </div>

          <div className="bg-[#0f1423]/40 border border-white/10 hover:border-[#0062FF]/60 hover:shadow-[0_0_30px_rgba(0,98,255,0.15)] p-6 rounded-xl transition-all [perspective:1000px] hover:-translate-y-1">
            <div className="w-12 h-12 bg-[#00F0FF]/10 text-[#00F0FF] rounded-lg flex items-center justify-center mb-6"><Globe size={20} /></div>
            <h3 className="font-extrabold text-sm tracking-wider mb-2">GEOPOLITICS</h3>
            <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed">Sovereign supply containment vectors, alliances, and alternative trade routing.</p>
          </div>

          <div className="bg-[#0f1423]/40 border border-white/10 hover:border-[#0062FF]/60 hover:shadow-[0_0_30px_rgba(0,98,255,0.15)] p-6 rounded-xl transition-all [perspective:1000px] hover:-translate-y-1">
            <div className="w-12 h-12 bg-[#0062FF]/10 text-[#0062FF] rounded-lg flex items-center justify-center mb-6"><Users size={20} /></div>
            <h3 className="font-extrabold text-sm tracking-wider mb-2">AGRICULTURE</h3>
            <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed">Forensic welfare spending audits, credit leakages, and local food logistics.</p>
          </div>

          <div className="bg-[#0f1423]/40 border border-white/10 hover:border-[#00F0FF]/60 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] p-6 rounded-xl transition-all [perspective:1000px] hover:-translate-y-1">
            <div className="w-12 h-12 bg-[#00F0FF]/10 text-[#00F0FF] rounded-lg flex items-center justify-center mb-6"><Leaf size={20} /></div>
            <h3 className="font-extrabold text-sm tracking-wider mb-2">ENVIRONMENT</h3>
            <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed">Decoupled blockchain carbon validators and regional climate micro-finance.</p>
          </div>

        </div>
      </section>

      {/* Pioneering Contributors */}
      <section id="contributors" className="relative z-10 max-w-[1400px] mx-auto px-6 py-24 border-t border-white/5 bg-white/[0.01] rounded-2xl my-10">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-[#00F0FF] bg-clip-text text-transparent mb-2">PIONEERING CONTRIBUTORS</h2>
        <p className="text-sm md:text-base text-[#A0AEC0] mb-12">Meet the researchers, student architects, and independent analysts publishing sovereign ideas without barrier.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Aditya */}
          <div className="bg-[#0a0f1e]/60 border border-white/5 p-6 rounded-xl flex flex-col justify-between items-center text-center relative overflow-hidden group">
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#00F0FF]/10 border border-[#00F0FF]/30 px-2 py-0.5 rounded text-[10px] text-[#00F0FF] font-bold">
              <Award size={10} />
              <span>LEAD ARCHITECT</span>
            </div>
            <div className="w-20 h-20 rounded-full border-2 border-[#00F0FF] flex items-center justify-center bg-black font-extrabold text-2xl text-[#00F0FF] mb-4">AK</div>
            <h3 className="font-extrabold text-sm tracking-wider text-white">Aditya Kaushik</h3>
            <p className="text-xs text-[#A0AEC0] leading-relaxed min-h-[48px] max-w-[240px] mt-2 mb-4">
              Public policy analyst conducting forensic budgetary audits and agricultural credit leakages diagnostics in New Delhi.
            </p>
            <div className="w-full flex justify-between border-t border-white/5 pt-4 text-xs text-[#A0AEC0]">
              <span>Papers: <strong>14</strong></span>
              <span>Reputation: <strong className="text-[#00FF00]">980</strong></span>
            </div>
          </div>

          {/* Elena */}
          <div className="bg-[#0a0f1e]/60 border border-white/5 p-6 rounded-xl flex flex-col justify-between items-center text-center relative overflow-hidden group">
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#0062FF]/10 border border-[#0062FF]/30 px-2 py-0.5 rounded text-[10px] text-[#0062FF] font-bold">
              <Award size={10} />
              <span>NEURAL ARCHITECT</span>
            </div>
            <div className="w-20 h-20 rounded-full border-2 border-[#0062FF] flex items-center justify-center bg-black font-extrabold text-2xl text-[#0062FF] mb-4">ER</div>
            <h3 className="font-extrabold text-sm tracking-wider text-white">Elena Rostova</h3>
            <p className="text-xs text-[#A0AEC0] leading-relaxed min-h-[48px] max-w-[240px] mt-2 mb-4">
              MIT Fellow formulating multi-agent deep reinforcement algorithms for complex order books.
            </p>
            <div className="w-full flex justify-between border-t border-white/5 pt-4 text-xs text-[#A0AEC0]">
              <span>Papers: <strong>8</strong></span>
              <span>Reputation: <strong className="text-[#00FF00]">720</strong></span>
            </div>
          </div>

          {/* Alistair */}
          <div className="bg-[#0a0f1e]/60 border border-white/5 p-6 rounded-xl flex flex-col justify-between items-center text-center relative overflow-hidden group">
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white/60 font-bold">
              <Award size={10} />
              <span>FELLOW ANALYST</span>
            </div>
            <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center bg-black font-extrabold text-2xl text-white/70 mb-4">AV</div>
            <h3 className="font-extrabold text-sm tracking-wider text-white">Dr. Alistair Vance</h3>
            <p className="text-xs text-[#A0AEC0] leading-relaxed min-h-[48px] max-w-[240px] mt-2 mb-4">
              Quantitative macroeconomist stress-testing sovereign yield curves, EM currency flows, and trade corridors.
            </p>
            <div className="w-full flex justify-between border-t border-white/5 pt-4 text-xs text-[#A0AEC0]">
              <span>Papers: <strong>22</strong></span>
              <span>Reputation: <strong className="text-[#00FF00]">820</strong></span>
            </div>
          </div>

        </div>
      </section>

      {/* Trending Research Library Grid */}
      <section id="research" className="relative z-10 max-w-[1400px] mx-auto px-6 py-24 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-[#0062FF] bg-clip-text text-transparent">TRENDING RESEARCH</h2>
            <p className="text-sm md:text-base text-[#A0AEC0] mt-2">Access scholarly indices and forensic audits published dynamically by verified contributors.</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0 bg-[#050505] border border-white/5 p-1 rounded">
            <button className="text-[10px] font-bold tracking-widest bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded uppercase">ALLINDEX</button>
            <button className="text-[10px] font-bold tracking-widest hover:text-white text-[#A0AEC0] px-3 py-1.5 uppercase">PUBLIC POLICY</button>
            <button className="text-[10px] font-bold tracking-widest hover:text-white text-[#A0AEC0] px-3 py-1.5 uppercase">MACROECONOMICS</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Aditya paper */}
          <div className="bg-[#0f1423]/50 border-2 border-[#0062FF]/50 rounded-xl p-6 flex flex-col justify-between hover:shadow-[0_0_40px_rgba(0,98,255,0.2)] transition-all group">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-[#FF7050] tracking-widest uppercase">PUBLIC POLICY</span>
                <span className="bg-[#FF7050]/15 text-[#FF7050] border border-[#FF7050]/20 px-2 py-0.5 text-[9px] font-extrabold tracking-widest rounded uppercase">FEATURED EXPOSÉ</span>
              </div>
              <h4 className="font-extrabold text-sm md:text-base leading-snug text-white hover:text-[#00F0FF] transition-colors mb-3">
                <a href="/report.html" target="_blank">
                  Broken Promises in the Fields:
                  <br />
                  <span className="text-[#FF7050]">₹127,290 Cr and Farmers Dying</span>
                </a>
              </h4>
              <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed mb-6">
                A 26-year forensic budgetary audit (FY 2000-2026) documenting India’s farming credit diversion and systemic welfare structural bottlenecks.
              </p>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-4 text-xs mt-auto">
              <span className="text-[#A0AEC0]">By <strong>Aditya Kaushik</strong></span>
              <a 
                href="/report.html" 
                target="_blank" 
                className="text-[#00F0FF] font-bold flex items-center gap-1.5 hover:underline"
              >
                <span>Read Audit</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Card 2: Semiconductor */}
          <div className="bg-[#0a0f1e]/40 border border-white/5 hover:border-[#0062FF]/60 hover:shadow-[0_0_30px_rgba(0,98,255,0.15)] rounded-xl p-6 flex flex-col justify-between transition-all group">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-[#00F0FF] tracking-widest uppercase">MACROECONOMICS</span>
                <span className="bg-white/5 text-white/60 border border-white/10 px-2 py-0.5 text-[9px] font-bold tracking-widest rounded uppercase">VERIFIED</span>
              </div>
              <h4 className="font-extrabold text-sm md:text-base leading-snug text-white group-hover:text-[#00F0FF] transition-colors mb-3">
                India’s Semiconductor Expansion
              </h4>
              <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed mb-6">
                Analyzing the domestic industrial infrastructure buildout and its impact on emerging market technology supply-chains.
              </p>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-4 text-xs mt-auto">
              <span className="text-[#A0AEC0]">By <strong>Dr. Alistair Vance</strong></span>
              <a 
                href="/report.pdf" 
                download="Indias_Semiconductor_Expansion.pdf" 
                className="text-[#00F0FF] font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <span>Download PDF</span>
                <Download size={12} />
              </a>
            </div>
          </div>

          {/* Card 3: Neural Alpha */}
          <div className="bg-[#0a0f1e]/40 border border-white/5 hover:border-[#0062FF]/60 hover:shadow-[0_0_30px_rgba(0,98,255,0.15)] rounded-xl p-6 flex flex-col justify-between transition-all group">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-[#0062FF] tracking-widest uppercase">QUANT STRATEGY</span>
                <span className="bg-white/5 text-white/60 border border-white/10 px-2 py-0.5 text-[9px] font-bold tracking-widest rounded uppercase">VERIFIED</span>
              </div>
              <h4 className="font-extrabold text-sm md:text-base leading-snug text-white group-hover:text-[#00F0FF] transition-colors mb-3">
                Neural Alpha in Volatile Regimes
              </h4>
              <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed mb-6">
                How spatial-temporal graph transformer models outperform standard architectures under non-stationary order books.
              </p>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-4 text-xs mt-auto">
              <span className="text-[#A0AEC0]">By <strong>Elena Rostova</strong></span>
              <a 
                href="/report.pdf" 
                download="Neural_Alpha_in_Volatile_Regimes.pdf" 
                className="text-[#00F0FF] font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <span>Download PDF</span>
                <Download size={12} />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Open R&D Challenges */}
      <section id="rdlab" className="relative z-10 max-w-[1400px] mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-[#0062FF] bg-clip-text text-transparent">OPEN R&D CHALLENGES</h2>
          <p className="text-sm md:text-base text-[#A0AEC0] mt-2">Solve active research requests from startups, industries, and NGOs to earn funding grants and platforms badges.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-[#0a0f1e]/50 border border-white/5 border-l-4 border-l-[#00F0FF] p-6 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-all group">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase">SPONSOR: NABARD</span>
                <span className="text-[10px] font-mono tracking-widest text-[#0062FF] uppercase font-bold">Expert Difficulty</span>
              </div>
              <h4 className="font-extrabold text-sm md:text-base text-white group-hover:text-[#00F0FF] transition-colors mb-2">Agricultural Credit Leakage Analysis</h4>
              <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed mb-6">
                Develop analytical spatial tracking metrics to analyze out-of-pocket health costs leaking from rural agricultural accounts in New Delhi.
              </p>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-4 text-xs mt-auto">
              <span className="text-[#A0AEC0]">Reward: <strong className="text-[#00F0FF]">Fellowship Position</strong></span>
              <a href="/library" className="text-[#00F0FF] font-bold flex items-center gap-1.5 hover:underline">
                <span>View Workspace</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="bg-[#0a0f1e]/50 border border-white/5 border-l-4 border-l-[#0062FF] p-6 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-all group">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono tracking-widest text-[#0062FF] uppercase">SPONSOR: QUANTORA LABS</span>
                <span className="text-[10px] font-mono tracking-widest text-[#0062FF] uppercase font-bold">Expert Difficulty</span>
              </div>
              <h4 className="font-extrabold text-sm md:text-base text-white group-hover:text-[#00F0FF] transition-colors mb-2">High-Frequency Order Book Graph Transformers</h4>
              <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed mb-6">
                Build deep order book transformers parsing order flow imbalances under volatile regimes for sovereign multi-agent grids.
              </p>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-4 text-xs mt-auto">
              <span className="text-[#A0AEC0]">Reward: <strong className="text-[#00F0FF]">$10,000 Grant</strong></span>
              <a href="/library" className="text-[#00F0FF] font-bold flex items-center gap-1.5 hover:underline">
                <span>View Workspace</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Institutional Transparency Dashboard */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 py-16 border-y border-white/5 bg-[#0a0f1e]/20">
        <div className="text-center mb-10">
          <h2 className="text-sm font-mono tracking-widest text-[#0062FF] uppercase font-bold">Platform Autonomy Dashboard</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-[#020202]/60 border border-white/5 p-4 rounded-lg">
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#00F0FF] mb-1">4,812</h3>
            <p className="text-[9px] md:text-[10px] font-mono tracking-wider text-[#A0AEC0] uppercase">Total Uploads</p>
          </div>
          <div className="bg-[#020202]/60 border border-white/5 p-4 rounded-lg">
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#0062FF] mb-1">2,450</h3>
            <p className="text-[9px] md:text-[10px] font-mono tracking-wider text-[#A0AEC0] uppercase">Reviewed Papers</p>
          </div>
          <div className="bg-[#020202]/60 border border-white/5 p-4 rounded-lg">
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#00F0FF] mb-1">1,280</h3>
            <p className="text-[9px] md:text-[10px] font-mono tracking-wider text-[#A0AEC0] uppercase">Active Analysts</p>
          </div>
          <div className="bg-[#020202]/60 border border-white/5 p-4 rounded-lg">
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-1">99.2%</h3>
            <p className="text-[9px] md:text-[10px] font-mono tracking-wider text-[#A0AEC0] uppercase">Academic Autonomy</p>
          </div>
        </div>
      </section>

      {/* Platform Genesis (Map Area) */}
      <section id="locations" className="relative z-10 max-w-[1400px] mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-[#0062FF] bg-clip-text text-transparent mb-2">PLATFORM GENESIS</h2>
        <p className="text-sm md:text-base text-[#A0AEC0] mb-12">Synthesizing macro intelligence from New Delhi, India. Operating in launch phase, scaling decentralized nodes globally.</p>
        
        <div className="border border-white/10 rounded-2xl h-[450px] relative overflow-hidden bg-black/40 flex items-center justify-center">
          
          {/* Futuristic Network Nodes SVG Map */}
          <svg className="absolute inset-0 w-full h-full opacity-10 filter drop-shadow-[0_0_10px_#0062FF]" viewBox="0 0 1000 500">
            <path d="M480,140 Q580,180 670,220" fill="none" stroke="#00F0FF" strokeDasharray="5 5" strokeWidth="1" />
            <path d="M820,220 Q740,220 670,220" fill="none" stroke="#00F0FF" strokeDasharray="5 5" strokeWidth="1" />
            <path d="M670,220 L780,280" fill="none" stroke="#0062FF" strokeDasharray="5 5" strokeWidth="1" />
            <circle cx="670" cy="220" r="8" fill="#00F0FF" className="animate-pulse" /> {/* New Delhi */}
            <circle cx="480" cy="140" r="4" fill="#A0AEC0" opacity="0.6" /> {/* London */}
            <circle cx="820" cy="220" r="4" fill="#A0AEC0" opacity="0.6" /> {/* Tokyo */}
            <circle cx="780" cy="280" r="4" fill="#A0AEC0" opacity="0.6" /> {/* Singapore */}
          </svg>

          {/* Central Genesis Hub Card */}
          <div className="relative z-10 bg-[#0a0f1e]/85 border border-[#00F0FF]/30 p-6 md:p-8 rounded-xl max-w-sm text-center backdrop-blur-md shadow-[0_10px_35px_rgba(0,240,255,0.15)]">
            <h4 className="font-extrabold text-sm md:text-base text-[#00F0FF] tracking-wider mb-2">NEW DELHI GENESIS [HQ]</h4>
            <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed mb-4">Active R&D Node & Publishing Pipeline<br />New Delhi, India</p>
            <div className="inline-block bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase">
              Launch Phase Active
            </div>
          </div>
        </div>
      </section>

      {/* Global Institutional Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#020202] py-16 text-[#A0AEC0]">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="flex flex-col justify-start">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-gradient-to-r from-white to-[#0062FF] bg-clip-text text-transparent font-black tracking-widest text-lg">QUANTORA</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs mb-6">
              An emerging open-access research network and quantitative intelligence base. Engineered in New Delhi, scaling globally.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-white uppercase mb-4">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#services" className="hover:text-white transition-colors">Research Disciplines</a></li>
              <li><a href="#research" className="hover:text-white transition-colors">Library Index</a></li>
              <li><a href="#contributors" className="hover:text-white transition-colors">Pioneering Contributors</a></li>
              <li><a href="#rdlab" className="hover:text-white transition-colors">R&D Lab challenges</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-white uppercase mb-4">Decentralized Links</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/library" className="hover:text-[#00F0FF] transition-colors">Dynamic Research App</a></li>
              <li><a href="/ai-assistant" className="hover:text-[#00F0FF] transition-colors">AI Research Assistant</a></li>
              <li><a href="#rdlab" className="hover:text-[#00F0FF] transition-colors">Start R&D Team</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Platform Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-white uppercase mb-4">Genesis & Contact</h4>
            <p className="text-xs font-semibold text-white mb-3">New Delhi, India [Active Base]</p>
            <div className="space-y-1.5 text-xs text-[#00F0FF] font-mono leading-relaxed">
              <div className="flex items-center gap-1.5">
                <Mail size={12} className="shrink-0" />
                <a href="mailto:scarfaceatwork@outlook.com" className="hover:underline">scarfaceatwork@outlook.com</a>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={12} className="shrink-0" />
                <a href="mailto:scarfaceatwork@gmail.com" className="hover:underline">scarfaceatwork@gmail.com</a>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Linkedin size={18} className="cursor-pointer hover:text-white transition-colors" />
              <Twitter size={18} className="cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 border-t border-white/5 pt-8 mt-12 text-center text-[10px] text-[#A0AEC0]/40 font-mono uppercase tracking-widest">
          &copy; 2026 Quantora Analytics. All rights reserved. Decentralized academic infrastructure.
        </div>
      </footer>

    </div>
  );
}
