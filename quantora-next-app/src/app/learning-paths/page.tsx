'use client';

import React from 'react';
import { BookOpen, Award, Compass, Clock, Play } from 'lucide-react';

export default function StudyPaths() {
  const paths = [
    {
      title: 'Forensic Budget Auditing',
      desc: 'Master the methods of public sector welfare spend analysis, data aggregation, and regional subvention leakage models.',
      steps: 4,
      duration: '6 hours',
      difficulty: 'Advanced',
      curator: 'Aditya Kaushik'
    },
    {
      title: 'Emerging Market Sovereign Debt',
      desc: 'Analyze refinancing stress transmission channels, bond default correlations, and spatial logistics models.',
      steps: 5,
      duration: '8 hours',
      difficulty: 'Advanced',
      curator: 'Reserve Bank of India Portal'
    },
    {
      title: 'Decentralized Credit Ledger Systems',
      desc: 'Understand smart contracts, farmer identity validation, and immutable ledgers designed to enforce crop subvention destination accountability.',
      steps: 3,
      duration: '4 hours',
      difficulty: 'Intermediate',
      curator: 'ISI New Delhi Research Group'
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="mb-10 space-y-2">
        <span className="text-[10px] font-mono text-[#0062FF] uppercase tracking-widest font-black">Academic Study Corridor</span>
        <h1 className="text-3xl font-extrabold text-white">Smart Learning Paths</h1>
        <p className="text-[#A0AEC0] text-sm">Curated scholarly roadmaps to master sovereign policy auditing and quantitative macroeconomic research.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paths.map((p, idx) => (
          <div key={idx} className="bg-[#0a0f1e]/60 border border-white/5 hover:border-blue-500/30 p-6 rounded-xl transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">
                <span>{p.difficulty}</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {p.duration}</span>
              </div>
              <h3 className="font-extrabold text-base text-white group-hover:text-blue-400 transition-colors">{p.title}</h3>
              <p className="text-xs text-[#A0AEC0] leading-relaxed">{p.desc}</p>
            </div>

            <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs text-gray-500">
              <span>Curated by: <strong className="text-white">{p.curator}</strong></span>
              <button className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 hover:underline">
                <Play size={10} fill="currentColor" />
                <span>Start</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
