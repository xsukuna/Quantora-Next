import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Users, Briefcase, FileSpreadsheet, Terminal, 
  ShieldCheck, CheckCircle, ChevronRight, Copy, Check 
} from 'lucide-react';

export const ProfessionalPages: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'ABOUT' | 'CAREERS' | 'EDITORIAL' | 'API'>('ABOUT');
  
  // Careers job apply modal
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applyName, setApplyName] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyFile, setApplyFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  
  // API key copy mock
  const [copiedKey, setCopiedKey] = useState(false);

  const jobsList = [
    { id: 'j-1', title: 'Lead Geopolitical Risk Analyst', dept: 'Macroeconomics Strategy', location: 'London Hub / Remote', desc: 'Audit alternative capital flow indices and compile sovereign clearance risk models. Requirements: PhD in Economics, 5+ years forecasting debt cycles.' },
    { id: 'j-2', title: 'Senior Quantitative Systems Engineer', dept: 'High-Frequency Networks', location: 'New York HQ', desc: 'Design reinforcement learning market-making systems and coordinate multi-agent deep order book simulators. Requirements: Ms/PhD in Math or CS, Rust/C++.' },
    { id: 'j-3', title: 'Research Fellow - Energy Pipelines', dept: 'Public Policy R&D', location: 'Singapore Transit Hub', desc: 'Assess rare-earth supply grids and lithium pipeline fractures against bilateral sanctions. Requirements: Strong network optimization modeling background.' }
  ];

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyName || !applyEmail || !applyFile) {
      alert('Please complete all application credentials.');
      return;
    }
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setSelectedJob(null);
        setApplyName('');
        setApplyEmail('');
        setApplyFile(null);
      }, 2000);
    }, 1500);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText('qa_live_cf84e031a08bd49f7e8a32b90b84c8102b');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#020202]">
      
      {/* 1. SIDE SUBNAV FOR PROFESSIONAL PAGES */}
      <aside className="w-64 border-r border-white/5 bg-[#050505] p-6 hidden md:flex flex-col gap-6 select-none shrink-0">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Institutional Hub</span>
          <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Corporate Pages</span>
          </h3>
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setActiveSubTab('ABOUT')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
              activeSubTab === 'ABOUT' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <span>About the Institute</span>
            <Users className="w-3.5 h-3.5 text-blue-500" />
          </button>
          
          <button
            onClick={() => setActiveSubTab('CAREERS')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
              activeSubTab === 'CAREERS' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <span>Fellow Careers</span>
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={() => setActiveSubTab('EDITORIAL')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
              activeSubTab === 'EDITORIAL' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <span>Ethics & Council</span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <button
            onClick={() => setActiveSubTab('API')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
              activeSubTab === 'API' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <span>Public API Gateway</span>
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>
      </aside>

      {/* 2. SUBTAB CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-[#050505]/30 relative z-20 shrink-0">
          <h2 className="text-xl font-black uppercase tracking-widest text-white">
            {activeSubTab === 'ABOUT' && 'About Quantora Analytics'}
            {activeSubTab === 'CAREERS' && 'Fellowships & Strategic Careers'}
            {activeSubTab === 'EDITORIAL' && 'Editorial Council & Research Ethics'}
            {activeSubTab === 'API' && 'Open API Gateway Documentation'}
          </h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">
            Institutional credentials audited and approved annually.
          </p>
        </div>

        {/* Inner Scroll container */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#020202] scrollbar-hide">
          <AnimatePresence mode="wait">
            
            {/* ABOUT THE INSTITUTE */}
            {activeSubTab === 'ABOUT' && (
              <motion.div 
                key="about" 
                className="space-y-8 max-w-4xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-black uppercase text-white tracking-wider">A Global Sovereign Intelligence Collective</h3>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-normal">
                    Quantora Analytics operates at the convergence of open scientific collaboration, high-frequency quantitative modeling, and international public policy design.
                    Established as an independent decentralized research institute, we reject traditional siloed knowledge corridors in favor of transparent, peer-reviewed open science.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="glass rounded-xl p-6 border border-white/5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">Algorithmic Rigor</h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-normal">
                      We harness state-of-the-art multi-agent neural networks, alternative sentiment indexes, and deep spatial-temporal graph structures to analyze and backtest macroeconomic trends under extreme market Drawdowns.
                    </p>
                  </div>
                  <div className="glass rounded-xl p-6 border border-white/5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Geopolitical Openness</h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-normal">
                      Quantora’s research indexes are completely open to the public. We publish mineral transition models, sovereign debt stress graphs, and monetary corridor simulations to democratize institutional intelligence.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest">Global Routing Hubs</h4>
                  <p className="text-xs text-gray-400 font-mono">
                    New York HQ | London Strategic Hub | Tokyo Quantitative Group | Singapore Policy Lab | Zurich Sovereign Audit
                  </p>
                </div>
              </motion.div>
            )}

            {/* FELLOW CAREERS */}
            {activeSubTab === 'CAREERS' && (
              <motion.div 
                key="careers" 
                className="space-y-6 max-w-4xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase text-white tracking-wider">Strategic Fellowships</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-normal">
                    We recruit sovereign analysts, high-frequency systems designers, rare-earth pipeline engineers, and policy authors dedicated to structural open science.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  {jobsList.map(job => (
                    <div 
                      key={job.id} 
                      className="glass rounded-xl border border-white/5 p-6 hover:border-white/12 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex gap-3 items-center">
                          <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{job.title}</h4>
                          <span className="text-[8px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
                            {job.dept}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed font-normal">{job.desc}</p>
                        <div className="text-[10px] text-gray-500 font-mono uppercase font-bold">{job.location}</div>
                      </div>
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider shrink-0 transition-colors flex items-center gap-1.5"
                      >
                        <span>Apply Credentials</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* EDITORIAL BOARD & ETHICS */}
            {activeSubTab === 'EDITORIAL' && (
              <motion.div 
                key="editorial" 
                className="space-y-8 max-w-4xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Scientific Rigor & Peer Review Ethics</span>
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-normal">
                    Every manuscript submitted to the Quantora Platform undergoes double-blind auditing. Under our peer-review directives:
                  </p>
                </div>

                <div className="space-y-4 border-l border-white/10 pl-6 ml-2 font-sans">
                  {[
                    { title: 'Plagiarism & Credence Audit', desc: 'No paper is indexed without passing our natural language plagiarising scanners, which checks raw code formulas and text frameworks across 14,000 global science databases.' },
                    { title: 'Independent Reference Mapping', desc: 'All empirical citations are validated via graph relation pipelines to guarantee reference authenticity and eliminate self-citation inflation.' },
                    { title: 'Conflict Disclaimers', desc: 'Sovereign-funded or privately sponsored researchers must declare full corporate affiliations, financial subsidies, and asset exposures prior to clearing.' }
                  ].map((eth, idx) => (
                    <div key={idx} className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-white">{eth.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-normal">{eth.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PUBLIC API DOCS */}
            {activeSubTab === 'API' && (
              <motion.div 
                key="api" 
                className="space-y-6 max-w-4xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase text-white tracking-wider">Integrate Quantora Research</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-normal">
                    We host a public REST and WebSocket API gateway allowing strategic developers to pull approved papers, abstracts, citations, and market signals.
                  </p>
                </div>

                {/* API key block */}
                <div className="glass rounded-xl p-4 border border-white/5 flex justify-between items-center bg-white/[0.01]">
                  <div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Sandbox API Key</span>
                    <span className="text-xs text-blue-400 font-mono">qa_live_cf84e031a08bd49f7e8a32b90b84c8102b</span>
                  </div>
                  <button
                    onClick={copyApiKey}
                    className="p-2 border border-white/5 hover:border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors relative"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest">Public REST Endpoint</h4>
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-4 font-mono text-[10px] text-gray-300 space-y-2">
                    <div>
                      <span className="text-emerald-400 font-bold uppercase mr-3">GET</span>
                      <span className="text-white">https://api.quantora.analytics/v1/research/papers</span>
                    </div>
                    <div className="text-gray-500">// Returns JSON grid of all approved papers, peer markers & AI summaries</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest">Submit Manuscript API</h4>
                  <div className="bg-[#050505] border border-white/10 rounded-xl p-4 font-mono text-[10px] text-gray-300 space-y-2">
                    <div>
                      <span className="text-blue-400 font-bold uppercase mr-3">POST</span>
                      <span className="text-white">https://api.quantora.analytics/v1/research/submit</span>
                    </div>
                    <div className="text-gray-500">// Upload a raw JSON payload with PDF files attached as base64 array</div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* 3. CAREERS APPLICATION FORM POPUP */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
            />
            
            <motion.div
              className="relative w-full max-w-lg bg-[#050505] border border-white/10 p-8 rounded-2xl shadow-2xl z-10 space-y-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div>
                <h3 className="text-sm font-black uppercase text-white tracking-widest">Submit Fellow Credentials</h3>
                <p className="text-[10px] text-gray-500 uppercase mt-0.5 font-mono">Job Clearance: {selectedJob.title}</p>
              </div>

              {applySuccess ? (
                <div className="py-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center gap-3 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400 animate-bounce" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Credentials clearance Initiated</span>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={applyName}
                      onChange={(e) => setApplyName(e.target.value)}
                      placeholder="e.g. Dr. Alistair Vance"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Secure Email</label>
                    <input
                      type="email"
                      required
                      value={applyEmail}
                      onChange={(e) => setApplyEmail(e.target.value)}
                      placeholder="e.g. vance@quantora.org"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Academic CV / Bio Portfolio (.PDF Only)</label>
                    <div className="border border-dashed border-white/15 bg-white/[0.01] hover:bg-blue-600/[0.01] hover:border-blue-500/40 rounded-xl p-4 text-center transition-all cursor-pointer relative">
                      <input 
                        type="file" 
                        required
                        accept=".pdf"
                        onChange={(e) => setApplyFile(e.target.files ? e.target.files[0] : null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <span className="text-xs text-gray-400 font-bold">
                        {applyFile ? applyFile.name : 'Upload PDF Academic Portfolio'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedJob(null)}
                      className="px-5 py-2.5 border border-white/5 hover:border-white/10 text-xs font-black uppercase text-gray-500 hover:text-white rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applying}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                      {applying ? 'Submitting Portfolio...' : 'Authorize Submission'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
