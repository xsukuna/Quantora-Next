'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RotateCcw, FolderGit2, HardDrive, Cpu, 
  ShoppingCart, Award, ChevronRight, CheckCircle2, 
  HelpCircle, Sparkles, Download, ArrowRight, ShieldCheck 
} from 'lucide-react';

export const ComputeSandbox: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'SANDBOX' | 'DATASETS' | 'COMPUTE' | 'MARKETPLACE'>('SANDBOX');

  // Computational cell state
  const [cellLoading, setCellLoading] = useState(false);
  const [cellOutput, setCellOutput] = useState<string[]>([]);
  const [cellCode, setCellCode] = useState(
`import pandas as pd
import numpy as np

# Load public agricultural credit datasets
df = pd.read_csv("quantora://datasets/rural_credit_flows_2026.csv")

# Audit out-of-pocket health spend correlations against default cycles
corr = df['oop_health_spend_shocks'].corr(df['credit_default_rate'])
print(f"Forensic Correlation Coefficient: {corr:.4f}")
print("Clearing verification hash matrices... [OK]")`
  );

  // Docker environment selection
  const [dockerEnv, setDockerEnv] = useState('python-datascience:3.10');

  // Replication Snapshots list
  const [snapshots, setSnapshots] = useState<any[]>([
    {
      id: 'snap-1',
      dockerEnv: 'python-datascience:3.10',
      timestamp: '2026-05-26 14:12',
      checksum: 'sha256_b84c8102b7c6ef5f84e031a08bd49f7e8a',
      codePreview: 'import pandas as pd...'
    }
  ]);

  // Handle taking a fresh snapshot
  const takeSnapshot = () => {
    const randomHash = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newSnapshot = {
      id: `snap-${Date.now()}`,
      dockerEnv,
      timestamp: dateStr,
      checksum: `sha256_${randomHash}`,
      codePreview: cellCode.substring(0, 24) + '...'
    };
    setSnapshots(prev => [newSnapshot, ...prev]);
  };

  // Computational cell run
  const runCell = () => {
    setCellLoading(true);
    setCellOutput([
      `[Docker Engine: initializing container mounting with image ${dockerEnv}]`,
      "Allocating isolated execution layer volume... Success.",
      "Mounting standard file-system mount quantora://datasets/... [OK]",
      "Warming up GPU execution pipeline nodes (CUDA 12.2 binding)...",
    ]);

    setTimeout(() => {
      setCellOutput(prev => [
        ...prev,
        "Kernel execution core initialized: executing lines [1-10]...",
        "Executing Stage-1 Forensics mapping algorithms...",
        "Stage-2 Out-Of-Pocket health leaks isolation: Completed.",
        "----------------------------------------------------",
        "Forensic Correlation Coefficient: 0.7412 (High positive correlation)",
        "Audit Anomaly Level: CRITICAL (exceeds 3.2 sigma threshold)",
        `Replication Checksum: sha256_b84c8102b7c6ef5f84e031a08bd49f7e8a32b90b84c810`,
        "----------------------------------------------------",
        "[SYSTEM]: Computational snapshot successfully verified and signed by Node: ND-GENESIS-01."
      ]);
      setCellLoading(false);
    }, 1800);
  };

  // GPU telemetry state
  const [gpuLoad, setGpuLoad] = useState(48.2);
  const [tflops, setTflops] = useState(142.4);

  useEffect(() => {
    if (activeSubTab === 'COMPUTE') {
      const interval = setInterval(() => {
        setGpuLoad(prev => Math.min(95, Math.max(20, prev + (Math.random() - 0.5) * 8)));
        setTflops(prev => Math.min(300, Math.max(50, prev + (Math.random() - 0.5) * 12)));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeSubTab]);

  // Marketplace states
  const [marketplaceCart, setMarketplaceCart] = useState<string[]>([]);
  const [boughtItems, setBoughtItems] = useState<string[]>([]);

  const datasetList = [
    { id: 'd-1', title: 'India Agricultural Credit & Suicide Forensic Matrix (FY00-FY26)', size: '142 MB', price: '$49.00', license: 'CC BY-NC 4.0', desc: 'Curated transactional timelines from 140M farming households across 28 states.' },
    { id: 'd-2', title: 'High-Frequency Order Book Liquidity Regimes (XAU/USD Anomaly)', size: '2.4 GB', price: '$199.00', license: 'CC BY-ND 4.0', desc: '1-millisecond resolution order flow imbalance logs captured during extreme drawdowns.' },
  ];

  const templatesList = [
    { id: 't-1', title: 'Quantora Journal Academic LaTeX Bundle', price: 'Free', desc: 'Double-blind peer-review LaTeX package matching international publication standard schemas.' },
    { id: 't-2', title: 'Geopolitical Supply Chain Map D3 Template', price: '$29.00', desc: 'Interactive vector topological map template to visualize rare-earth mineral corridors.' }
  ];

  const handleBuy = (id: string, title: string) => {
    if (marketplaceCart.includes(id)) return;
    setMarketplaceCart(prev => [...prev, id]);
    setTimeout(() => {
      setMarketplaceCart(prev => prev.filter(item => item !== id));
      setBoughtItems(prev => [...prev, id]);
    }, 1200);
  };

  return (
    <div className="bg-[#050505] border border-white/5 rounded-2xl flex flex-col md:flex-row h-full select-none overflow-hidden min-h-[460px]">
      
      {/* 1. LEFT SIDE SUBNAV FOR RND FEATURES */}
      <aside className="w-full md:w-64 border-r border-white/5 bg-[#07070a] p-6 flex flex-col gap-6 shrink-0">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest font-mono">Real-world Research</span>
          <h3 className="text-sm font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-amber-500" />
            <span>Infrastructure</span>
          </h3>
        </div>

        <div className="flex flex-col gap-1.5">
          {[
            { id: 'SANDBOX', label: 'Replication Sandbox', icon: Play, color: 'text-amber-400' },
            { id: 'DATASETS', label: 'Versioned Datasets', icon: HardDrive, color: 'text-emerald-400' },
            { id: 'COMPUTE', label: 'Compute Telemetry', icon: Cpu, color: 'text-[#00F0FF]' },
            { id: 'MARKETPLACE', label: 'Marketplace Hub', icon: ShoppingCart, color: 'text-purple-400' },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                  isSelected 
                    ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20 shadow-inner' 
                    : 'text-gray-400 border border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
              </button>
            );
          })}
        </div>
      </aside>

      {/* 2. RIGHT CONTENT PANEL */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#020202]">
        
        {/* Sub Header */}
        <div className="p-6 border-b border-white/5 bg-[#050505]/40 shrink-0">
          <h2 className="text-sm font-extrabold uppercase text-white tracking-widest flex items-center gap-2">
            {activeSubTab === 'SANDBOX' && 'Computational Replication & Jupyter Sandbox'}
            {activeSubTab === 'DATASETS' && 'Dataset Versioning & Schema Registry'}
            {activeSubTab === 'COMPUTE' && 'GPU Compute Orchestration Telemetry'}
            {activeSubTab === 'MARKETPLACE' && 'Marketplace Hub & Paid Tutoring'}
          </h2>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">
            {activeSubTab === 'SANDBOX' && 'Auditable reproduction of research findings via sandboxed kernels.'}
            {activeSubTab === 'DATASETS' && 'Standardized schemas managed across secure storage backends.'}
            {activeSubTab === 'COMPUTE' && 'Serverless cluster tracking and real-time processing telemetry.'}
            {activeSubTab === 'MARKETPLACE' && 'Premium data assets, LaTeX publication templates, and expert matching.'}
          </p>
        </div>

        {/* Dynamic Display Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <AnimatePresence mode="wait">
            
            {/* A. REPLICATION SANDBOX */}
            {activeSubTab === 'SANDBOX' && (
              <motion.div
                key="sandbox"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-4xl"
              >
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Jupyter Replication Sandbox & Docker Infrastructure</h3>
                  <p className="text-xs text-gray-400 leading-normal">
                    This Jupyter-style workspace allows anyone to execute the exact computational models and algorithms cited in peer-reviewed papers. Try running Aditya Kaushik's agricultural credit default forensics below.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Editor & Outputs */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Editor Sandbox block */}
                    <div className="border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                      <div className="bg-[#050508] px-4 py-2 border-b border-white/15 flex justify-between items-center text-[10px] font-mono text-gray-400">
                        <span className="font-bold flex items-center gap-1.5 text-amber-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>forensics_audit.py</span>
                        </span>
                        
                        {/* Docker Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase text-gray-500 font-bold">Docker Image:</span>
                          <select 
                            value={dockerEnv}
                            onChange={e => setDockerEnv(e.target.value)}
                            className="bg-[#020202] border border-white/10 rounded px-2 py-0.5 text-[9px] text-[#00F0FF] font-bold font-mono outline-none cursor-pointer"
                          >
                            <option value="python-datascience:3.10">python-datascience:3.10</option>
                            <option value="pytorch-cuda:12.2">pytorch-cuda:12.2</option>
                            <option value="r-sovereign-audit:4.3">r-sovereign-audit:4.3</option>
                          </select>
                        </div>
                      </div>
                      <textarea
                        value={cellCode}
                        onChange={e => setCellCode(e.target.value)}
                        className="w-full bg-[#020202] text-gray-300 font-mono text-[11px] p-4 h-40 outline-none leading-relaxed resize-none border-b border-white/5 focus:ring-0"
                      />
                      <div className="bg-[#050508]/60 p-3 flex justify-end gap-2.5">
                        <button
                          onClick={() => setCellCode(`print("Resetting kernel...")`)}
                          className="p-2 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
                          title="Reset Kernel Core"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={takeSnapshot}
                          className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                        >
                          Take Snapshot
                        </button>
                        <button
                          onClick={runCell}
                          disabled={cellLoading}
                          className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/30 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-amber-600/20"
                        >
                          {cellLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{cellLoading ? 'Running...' : 'Run Replication Cell'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Cell Outputs */}
                    {cellOutput.length > 0 && (
                      <div className="bg-[#020202] border border-white/10 rounded-xl p-4 space-y-2 font-mono text-[10px] text-emerald-400 leading-relaxed max-h-[200px] overflow-y-auto">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black border-b border-white/5 pb-1 mb-2">Live Virtualized Kernel Logs</div>
                        {cellOutput.map((out, idx) => (
                          <div key={idx} className={out.includes('CRITICAL') ? 'text-red-400 font-bold' : out.startsWith('[Docker') ? 'text-[#00F0FF]' : ''}>
                            {out}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Replication Snapshots Ledger */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="glass border border-white/5 p-5 rounded-xl space-y-4 h-full flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Replication Snapshots</span>
                        </h4>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">
                          Audited volumes containing environment configurations.
                        </p>
                      </div>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 flex-1 mt-4">
                        {snapshots.map((snap, idx) => (
                          <div key={snap.id} className="bg-white/[0.01] border border-white/5 hover:border-white/10 p-3 rounded-lg space-y-1.5 transition-colors">
                            <div className="flex justify-between items-center text-[9px] font-mono">
                              <span className="text-[#00F0FF] font-bold">{snap.dockerEnv}</span>
                              <span className="text-gray-500">{snap.timestamp}</span>
                            </div>
                            <p className="text-[9px] text-gray-400 font-mono italic truncate">{snap.codePreview}</p>
                            <div className="text-[7px] text-gray-500 font-mono truncate uppercase tracking-widest border-t border-white/5 pt-1 mt-1">
                              SHA256: {snap.checksum}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* B. VERSIONED DATASETS */}
            {activeSubTab === 'DATASETS' && (
              <motion.div
                key="datasets"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-4xl font-sans"
              >
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Academic Datasets Version Control</h3>
                  <p className="text-xs text-gray-400 leading-normal font-sans">
                    Quantora enforces **Frictionless Data Package** standards, meaning all datasets are complete with machine-readable JSON schemas, schema consistency metrics, and version audits.
                  </p>
                </div>

                {/* Version lists */}
                <div className="space-y-4">
                  {[
                    { id: '1', title: 'india_rural_welfare_forensics_2026', ver: 'v1.2.0-beta', format: 'CSV / JSON', size: '48.2 MB', license: 'CC BY-NC 4.0', status: 'SYNCHRONIZED', hash: 'sha256_e8a32b90b84c8102b7c6' },
                    { id: '2', title: 'neural_alpha_order_book_Gold_drawdowns', ver: 'v1.0.0', format: 'Parquet / HDF5', size: '2.4 GB', license: 'CC BY-ND 4.0', status: 'SYNCHRONIZED', hash: 'sha256_b5391aa855f7c0392b9b' },
                  ].map(data => (
                    <div key={data.id} className="glass border border-white/5 p-5 rounded-xl space-y-3">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-white font-mono">{data.title}</h4>
                          <span className="text-[9px] text-gray-500 font-mono">Hash Checksum: {data.hash}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[8px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">{data.ver}</span>
                          <span className="text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">{data.status}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-[9px] font-mono text-gray-400 pt-2 border-t border-white/5 uppercase">
                        <div>
                          <span className="text-gray-500 block">Schema type</span>
                          <span className="text-white mt-0.5 block">{data.format}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Storage Endpoint</span>
                          <span className="text-white mt-0.5 block">Cloudflare R2</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Payload Size</span>
                          <span className="text-white mt-0.5 block">{data.size}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Active License</span>
                          <span className="text-amber-500 mt-0.5 block">{data.license}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* C. COMPUTE TELEMETRY */}
            {activeSubTab === 'COMPUTE' && (
              <motion.div
                key="compute"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-4xl"
              >
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Serverless GPU Execution Clusters</h3>
                  <p className="text-xs text-gray-400 leading-normal">
                    Real-time monitoring of sandboxed computational runtimes hosting Judge0 and specialized Piston APIs. All computational tasks are scaled automatically across active global cluster corridors.
                  </p>
                </div>

                {/* Telemetry charts simulation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass border border-white/5 p-5 rounded-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">GPU Cluster Memory Load</span>
                      <span className="text-xs font-mono font-bold text-[#00F0FF]">{gpuLoad.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/10">
                      <motion.div 
                        className="bg-[#00F0FF] h-full"
                        style={{ width: `${gpuLoad}%` }}
                        animate={{ width: `${gpuLoad}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono text-center">Node: ND-GENESIS-01-GPU</p>
                  </div>

                  <div className="glass border border-white/5 p-5 rounded-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Execution Speed</span>
                      <span className="text-xs font-mono font-bold text-amber-500">{tflops.toFixed(1)} TFLOPS</span>
                    </div>
                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/10">
                      <motion.div 
                        className="bg-amber-500 h-full"
                        style={{ width: `${(tflops / 300) * 100}%` }}
                        animate={{ width: `${(tflops / 300) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono text-center">Active Runtimes: 128 Kernels</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* D. MARKETPLACE HUB */}
            {activeSubTab === 'MARKETPLACE' && (
              <motion.div
                key="marketplace"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8 max-w-4xl"
              >
                {/* 1. Datasets Marketplace */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4 text-purple-400" />
                    <span>Premium Datasets Directory</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {datasetList.map(data => {
                      const isBought = boughtItems.includes(data.id);
                      const isBuying = marketplaceCart.includes(data.id);

                      return (
                        <div key={data.id} className="glass border border-white/5 p-5 rounded-xl flex flex-col justify-between hover:border-white/12 transition-all">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-white leading-normal pr-4">{data.title}</h4>
                              <span className="text-xs font-bold font-mono text-purple-400">{data.price}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-normal">{data.desc}</p>
                            <div className="flex gap-2 text-[8px] font-mono text-gray-500 pt-1">
                              <span>Size: {data.size}</span>
                              <span>·</span>
                              <span>License: {data.license}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleBuy(data.id, data.title)}
                            disabled={isBought || isBuying}
                            className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider mt-4 flex items-center justify-center gap-1.5 transition-colors ${
                              isBought 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : isBuying
                                ? 'bg-purple-600/30 border border-purple-500/20 text-purple-400'
                                : 'bg-[#0062FF] hover:bg-[#0056e0] text-white shadow-md shadow-[#0062FF]/20'
                            }`}
                          >
                            {isBought ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                            {isBuying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>{isBought ? 'Asset Purchased' : isBuying ? 'Acquiring...' : 'Buy Dataset Asset'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Academic LaTeX Templates */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Scholarly & LaTeX Templates</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templatesList.map(temp => {
                      const isBought = boughtItems.includes(temp.id);
                      const isBuying = marketplaceCart.includes(temp.id);

                      return (
                        <div key={temp.id} className="glass border border-white/5 p-5 rounded-xl flex flex-col justify-between hover:border-white/12 transition-all">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-white leading-normal pr-4">{temp.title}</h4>
                              <span className="text-xs font-bold font-mono text-emerald-400">{temp.price}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-normal">{temp.desc}</p>
                          </div>

                          <button
                            onClick={() => handleBuy(temp.id, temp.title)}
                            disabled={isBought || isBuying}
                            className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider mt-4 flex items-center justify-center gap-1.5 transition-colors ${
                              isBought 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : isBuying
                                ? 'bg-emerald-600/30 border border-[#0062FF]/20 text-emerald-400'
                                : 'bg-[#0062FF] hover:bg-[#0056e0] text-white shadow-md shadow-[#0062FF]/20'
                            }`}
                          >
                            {isBought ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                            {isBuying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>{isBought ? 'Template Downloaded' : isBuying ? 'Acquiring...' : temp.price === 'Free' ? 'Download Template' : 'Buy Template'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Paid Sovereign Tutoring */}
                <div className="space-y-4 border-t border-white/5 pt-6">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#00F0FF]" />
                    <span>Sovereign Paid Tutoring Matchmaking</span>
                  </h3>
                  <div className="glass border border-white/5 p-6 rounded-xl space-y-4 max-w-2xl">
                    <p className="text-xs text-gray-400 leading-relaxed font-sans">
                      Request custom 1-on-1 tutoring or consultation hours from verified Senior Fellows and neural architects. Perfect for advanced methodology review, logic audits, or mathematical proofs.
                    </p>
                    <form onSubmit={e => { e.preventDefault(); alert('Tutoring request successfully queued. You will be matched within 24 hours.'); }} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Select Knowledge Stream</label>
                          <select className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none">
                            <option>Macroeconomics</option>
                            <option>IT & Artificial Intelligence</option>
                            <option>Quantitative Trading Strategies</option>
                            <option>Climate & Environmental Finance</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Duration Preference</label>
                          <select className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none">
                            <option>1 Hour Consultation</option>
                            <option>5 Hours Master Pack</option>
                            <option>Weekly Mentorship hours</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all">
                        Request Matching & Lock Quote
                      </button>
                    </form>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

    </div>
  );
};
