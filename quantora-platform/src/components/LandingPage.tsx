import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, ArrowUpRight, Cpu, Compass, 
  Network, TrendingUp, AlertTriangle, ArrowRight, CheckCircle 
} from 'lucide-react';
import { getPapers } from '../services/db';
import type { Paper } from '../services/db';

interface LandingPageProps {
  onNavigate: (tab: string, paperId?: string) => void;
  openAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [counts, setCounts] = useState({
    assets: 120,
    downloads: 14500,
    contributors: 340,
    alerts: 14
  });

  useEffect(() => {
    setPapers(getPapers().filter(p => p.status === 'Approved').slice(0, 3));
    
    // Animate counter values mock
    const interval = setInterval(() => {
      setCounts(prev => ({
        assets: prev.assets + (Math.random() > 0.8 ? 1 : 0),
        downloads: prev.downloads + Math.floor(Math.random() * 3),
        contributors: prev.contributors + (Math.random() > 0.95 ? 1 : 0),
        alerts: prev.alerts + (Math.random() > 0.9 ? 1 : 0) - (Math.random() > 0.93 ? 1 : 0)
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#020202] text-white scrollbar-hide">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center px-8 md:px-16 py-20 overflow-hidden border-b border-white/5">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Glowing Blobs */}
        <div className="absolute top-1/4 right-10 w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[30vw] h-[30vw] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Cpu className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Global Intelligence Ecosystem</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[1.05] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-blue-400"
            >
              Global Intelligence.<br/>
              Public Research.<br/>
              <span className="text-blue-500">Collective Knowledge.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl"
            >
              Quantora Analytics operates as an international open-science collective. We bridge advanced quantitative algorithms, public policy framework design, and market intelligence to empower strategic builders globally.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <button 
                onClick={() => onNavigate('LIBRARY')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20 flex items-center gap-2 group"
              >
                <span>Explore Library</span>
                <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
              </button>
              <button 
                onClick={() => onNavigate('SUBMIT')}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Publish Research</span>
                <FileText className="w-4 h-4 text-gray-400" />
              </button>
            </motion.div>
          </div>

          {/* Right Visual Mesh Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center items-center h-[380px] lg:h-[450px]"
          >
            {/* Elegant World Intelligence Grid visualization */}
            <svg viewBox="0 0 500 400" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(0,100,255,0.2)]">
              {/* Grid dots */}
              <g className="opacity-20">
                {Array.from({ length: 9 }).map((_, r) => 
                  Array.from({ length: 9 }).map((_, c) => (
                    <circle key={`${r}-${c}`} cx={50 + c * 50} cy={40 + r * 40} r="1" fill="#FFF" />
                  ))
                )}
              </g>
              
              {/* Geopolitical clearing curves representing flows */}
              <motion.path 
                d="M50 160 Q150 60 250 160 T450 160" 
                fill="none" 
                stroke="url(#blue-grad)" 
                strokeWidth="1.5" 
                opacity="0.6"
                strokeDasharray="4 4"
                animate={{ strokeDashoffset: -20 }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              />
              <motion.path 
                d="M80 240 Q200 320 320 180 T420 280" 
                fill="none" 
                stroke="url(#cyan-grad)" 
                strokeWidth="1.5" 
                opacity="0.4"
                strokeDasharray="5 5"
                animate={{ strokeDashoffset: 20 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />

              {/* Hub connections */}
              <line x1="100" y1="120" x2="250" y2="200" stroke="rgba(0, 98, 255, 0.2)" strokeWidth="1" />
              <line x1="250" y1="200" x2="400" y2="100" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="1" />
              <line x1="250" y1="200" x2="350" y2="280" stroke="rgba(0, 98, 255, 0.2)" strokeWidth="1" />
              <line x1="100" y1="120" x2="350" y2="280" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />

              {/* Pulsating Hub Nodes */}
              <circle cx="100" cy="120" r="6" fill="#0062FF" className="animate-pulse" />
              <circle cx="100" cy="120" r="14" fill="none" stroke="#0062FF" strokeWidth="1" opacity="0.3" className="animate-ping" style={{ animationDuration: '3s' }} />
              
              <circle cx="400" cy="100" r="5" fill="#00F0FF" />
              <circle cx="400" cy="100" r="11" fill="none" stroke="#00F0FF" strokeWidth="1" opacity="0.3" className="animate-ping" style={{ animationDuration: '2.5s' }} />

              <circle cx="350" cy="280" r="5" fill="#00F0FF" />
              <circle cx="250" cy="200" r="8" fill="#FFF" className="animate-pulse" />
              <circle cx="250" cy="200" r="20" fill="none" stroke="#FFF" strokeWidth="1" opacity="0.2" className="animate-ping" style={{ animationDuration: '4s' }} />

              <g style={{ fontFamily: 'monospace', fontSize: '8px', fill: '#64748b' }}>
                <text x="115" y="123">NY-HUB-04 [92.4%]</text>
                <text x="265" y="204">CORE-ROUTING-NODE [OK]</text>
                <text x="365" y="284">SG-TRANSIT [ACTIVE]</text>
                <text x="415" y="103">LDN-PRIMARY [84.1%]</text>
              </g>

              {/* Gradients */}
              <defs>
                <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0062FF" />
                  <stop offset="100%" stopColor="#00F0FF" />
                </linearGradient>
                <linearGradient id="cyan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0062FF" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Live Floating Insight card */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-lg border border-white/10 p-4 rounded-xl max-w-[220px]">
              <div className="flex gap-2 items-center text-amber-500 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-wider">Geopolitical Index</span>
              </div>
              <p className="text-[10px] text-gray-300 font-medium">Bilateral metal sanctions stress-test signals systemic supply deficit for lithium grids.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. RESEARCH IMPACT METRICS TICKER */}
      <section className="bg-white/[0.01] border-b border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center md:text-left md:border-r border-white/5 last:border-0 pr-4">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.25em]">Sovereign Reports</span>
            <div className="text-2xl md:text-3xl font-black text-white mt-1 font-mono">{counts.assets}</div>
          </div>
          <div className="text-center md:text-left md:border-r border-white/5 last:border-0 pr-4">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.25em]">Global Downloads</span>
            <div className="text-2xl md:text-3xl font-black text-blue-400 mt-1 font-mono">
              {(counts.downloads / 1000).toFixed(1)}k
            </div>
          </div>
          <div className="text-center md:text-left md:border-r border-white/5 last:border-0 pr-4">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.25em]">Core Researchers</span>
            <div className="text-2xl md:text-3xl font-black text-cyan-400 mt-1 font-mono">{counts.contributors}</div>
          </div>
          <div className="text-center md:text-left last:border-0">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.25em]">Risk Alerts</span>
            <div className="text-2xl md:text-3xl font-black text-amber-500 mt-1 font-mono">{counts.alerts}</div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED RESEARCH HUB */}
      <section className="py-20 px-8 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Featured Insights</span>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-wider text-white">Sovereign & Quantitative Analysis</h2>
          </div>
          <button 
            onClick={() => onNavigate('LIBRARY')}
            className="text-xs font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1.5 hover:underline"
          >
            <span>Access All Research</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <div 
              key={paper.id} 
              className="glass rounded-2xl border border-white/5 p-6 hover:border-white/15 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600/0 to-blue-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                    {paper.category}
                  </span>
                  {paper.peerReviewed && (
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      Peer Reviewed
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-white text-base leading-snug group-hover:text-blue-400 transition-colors">
                  {paper.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {paper.abstract}
                </p>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-white/5 mt-6 relative z-10">
                <div className="text-[10px] text-gray-500 font-bold uppercase">
                  By {paper.author}
                </div>
                <button 
                  onClick={() => onNavigate('LIBRARY', paper.id)}
                  className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center text-gray-400"
                >
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. REAL-TIME AI INSIGHTS & SIGNALS */}
      <section className="py-20 bg-white/[0.01] border-t border-b border-white/5 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">R&D Intelligence</span>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-wider text-white">Neural Anomaly Detection Feed</h2>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              Our high-frequency models process continuous alternative data streams, including geopolitical policy drafts, supply chains, options order flows, and raw resource clearing.
            </p>
            <button 
              onClick={() => onNavigate('TERMINAL')}
              className="px-6 py-3 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Connect Terminal OS
            </button>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {[
              { title: 'EM Clearing Corridors Expanding', status: 'SIGNAL DETECTED', desc: 'Sovereign clearing patterns demonstrate significant capital decoupling from G7 settlement pipelines in gold backed reserves.', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: TrendingUp },
              { title: 'Frontier Bond Yield Anomaly', status: 'RISK DETECTED', desc: 'Proprietary debt-stress indices flag a severe liquidity mismatch across Sub-Saharan sovereign bonds.', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
              { title: 'Lithium Processing Choke-Points', status: 'STRUCTURAL GAP', desc: 'Critical refinery output reports confirm Southeast Asian supply chains face immediate containment risks.', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Network }
            ].map((sig, idx) => {
              const Icon = sig.icon;
              return (
                <div key={idx} className={`p-5 rounded-2xl border ${sig.bg} flex gap-4 items-start`}>
                  <div className={`p-2 rounded-xl bg-black/40 ${sig.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex gap-3 items-center">
                      <h4 className="text-xs font-bold text-white uppercase">{sig.title}</h4>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-black/40 rounded ${sig.color}`}>
                        {sig.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{sig.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. INSTITUTIONAL COLLABORATORS (McKinsey / Bloomberg Credibility) */}
      <section className="py-20 px-8 text-center max-w-7xl mx-auto space-y-10">
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Institutional Network & Partners</span>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale hover:opacity-50 transition-opacity">
          <div className="text-xs font-bold tracking-widest uppercase">Brookings Institute</div>
          <div className="text-xs font-bold tracking-widest uppercase">MIT Media Lab</div>
          <div className="text-xs font-bold tracking-widest uppercase">World Economic Forum</div>
          <div className="text-xs font-bold tracking-widest uppercase">LSE Economics</div>
          <div className="text-xs font-bold tracking-widest uppercase">IMF Intelligence</div>
        </div>
      </section>

      {/* 6. NEWSLETTER & COMMUNITY */}
      <section className="py-20 border-t border-white/5 px-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.25em]">Subscribe to Intelligence Digest</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wide text-white">Sovereign Intel, Delivered.</h2>
          <p className="text-xs md:text-sm text-gray-400 leading-relaxed max-w-lg mx-auto">
            Join 45,000+ policy advisors, quantitative fund managers, sovereign fund chiefs, and technology designers receiving our bi-weekly intelligence briefings.
          </p>

          {subscribed ? (
            <motion.div 
              className="py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Authorization Granted. Welcome to the Intelligence Feed.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Secure email (e.g. vance@quantora.org)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-mono"
              />
              <button 
                type="submit"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
              >
                Access Intel Feed
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};
