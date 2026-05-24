'use client';

import React, { useState } from 'react';
import { ArrowLeft, Award, Users, BookOpen, CheckCircle, ChevronRight, Play, Check } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  sponsor: string;
  logo: string;
  description: string;
  reward: string;
  repAward: number;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  teamsCount: number;
  solutionsCount: number;
  joined: boolean;
  submitted: boolean;
}

const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'ch-1',
    title: 'Rare-Earth Mineral Logistics Models',
    sponsor: 'World Economic Forum',
    logo: 'WEF',
    description: 'Establish flow graph stress-test models analyzing regional logistical disruptions on lithium processing hubs in Southeast Asia.',
    reward: '$25,000 Grant',
    repAward: 500,
    category: 'Geopolitics',
    difficulty: 'Expert',
    teamsCount: 8,
    solutionsCount: 3,
    joined: false,
    submitted: false
  },
  {
    id: 'ch-2',
    title: 'Agricultural Credit Leakage Analysis',
    sponsor: 'NABARD',
    logo: 'NAB',
    description: 'Design analytical digital tracking metrics to evaluate out-of-pocket health costs leaking from rural agricultural accounts.',
    reward: 'Fellowship Position',
    repAward: 400,
    category: 'Public Policy',
    difficulty: 'Expert',
    teamsCount: 14,
    solutionsCount: 5,
    joined: true,
    submitted: false
  },
  {
    id: 'ch-3',
    title: 'High-Frequency Order Book Graph Transformers',
    sponsor: 'Quantora Labs',
    logo: 'QL',
    description: 'Design deep order book transformers parsing order flow imbalances under volatile regimes for sovereign multi-agent grids.',
    reward: '$10,000 Award',
    repAward: 300,
    category: 'Quantitative Finance',
    difficulty: 'Expert',
    teamsCount: 19,
    solutionsCount: 2,
    joined: false,
    submitted: false
  }
];

export default function RndLab() {
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(INITIAL_CHALLENGES[1]);
  const [teamName, setTeamName] = useState('');
  const [solutionUrl, setSolutionUrl] = useState('');

  // Handle joining a team
  const handleJoin = (id: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === id) {
        const nextJoined = !c.joined;
        return {
          ...c,
          joined: nextJoined,
          teamsCount: nextJoined ? c.teamsCount + 1 : c.teamsCount - 1
        };
      }
      return c;
    }));
    
    if (selectedChallenge?.id === id) {
      setSelectedChallenge(prev => prev ? {
        ...prev,
        joined: !prev.joined,
        teamsCount: !prev.joined ? prev.teamsCount + 1 : prev.teamsCount - 1
      } : null);
    }
  };

  // Submit challenge solutions
  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge || !solutionUrl.trim()) return;

    setChallenges(prev => prev.map(c => {
      if (c.id === selectedChallenge.id) {
        return {
          ...c,
          submitted: true,
          solutionsCount: c.solutionsCount + 1
        };
      }
      return c;
    }));

    setSelectedChallenge(prev => prev ? {
      ...prev,
      submitted: true,
      solutionsCount: prev.solutionsCount + 1
    } : null);

    setSolutionUrl('');
    setTeamName('');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] font-sans selection:bg-[#0062FF] selection:text-white pb-20">
      
      {/* 3D Network Lines Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(0,98,255,0.06),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,240,255,0.06),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pt-12 relative z-10">
        
        {/* Back Link */}
        <a href="/" className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#A0AEC0] hover:text-white uppercase mb-8 transition-colors">
          <ArrowLeft size={14} />
          <span>Genesis Landing Page</span>
        </a>

        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white to-[#0062FF] bg-clip-text text-transparent">OPEN R&D LAB</h1>
          <p className="text-sm text-[#A0AEC0] mt-2">Empowering collaborative engineering. Peer-review active projects, register teams, and submit solutions.</p>
        </div>

        {/* Core Layout Splitter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Challenges List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-[#0062FF] uppercase font-bold mb-4">ACTIVE LAB CHALLENGES</h3>
            
            {challenges.map(item => {
              const isSelected = selectedChallenge?.id === item.id;
              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedChallenge(item)}
                  className={`border rounded-xl p-5 cursor-pointer transition-all hover:bg-[#0a0f1e]/30 flex flex-col justify-between ${
                    isSelected 
                      ? 'border-[#0062FF] bg-[#0a0f1e]/40 shadow-[0_0_20px_rgba(0,98,255,0.1)]' 
                      : 'border-white/5 bg-[#0a0f1e]/10'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono tracking-wider text-[#A0AEC0] uppercase">{item.sponsor}</span>
                        <span className="bg-[#00F0FF]/10 px-2 py-0.5 rounded text-[8px] font-extrabold text-[#00F0FF] uppercase tracking-wide">
                          {item.difficulty}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm md:text-base text-white">{item.title}</h4>
                    </div>

                    <span className="bg-[#0062FF]/10 text-[#0062FF] border border-[#0062FF]/20 px-3 py-1 rounded text-xs font-mono font-bold shrink-0">
                      {item.reward}
                    </span>
                  </div>

                  <p className="text-xs text-[#A0AEC0] leading-relaxed mb-4">{item.description}</p>

                  <div className="flex justify-between items-center border-t border-white/5 pt-3 text-[10px] font-mono text-[#A0AEC0]">
                    <div className="flex gap-4">
                      <span>TEAMS: <strong>{item.teamsCount}</strong></span>
                      <span>SOLUTIONS: <strong>{item.solutionsCount}</strong></span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoin(item.id);
                      }}
                      className={`px-3 py-1 rounded font-bold uppercase transition-all cursor-pointer ${
                        item.joined
                          ? 'bg-[#00FF00]/15 border border-[#00FF00]/30 text-[#00FF00]'
                          : 'bg-[#0062FF]/10 border border-[#0062FF]/30 text-[#0062FF] hover:bg-[#0062FF]/20'
                      }`}
                    >
                      {item.joined ? 'Joined' : 'Join Challenge'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Challenge Details Workspace */}
          <div className="lg:col-span-5">
            {selectedChallenge ? (
              <div className="bg-[#0a0f1e]/30 border border-[#0062FF]/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,98,255,0.05)] sticky top-28">
                
                {/* Header */}
                <div className="flex justify-between items-start gap-4 mb-4 pb-4 border-b border-white/5">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase font-bold">WORKSPACE PORTAL</span>
                    <h3 className="font-black text-base md:text-lg text-white mt-1 leading-snug">{selectedChallenge.title}</h3>
                  </div>
                  <div className="w-12 h-12 bg-black border border-white/10 rounded-lg flex items-center justify-center font-extrabold text-sm text-[#0062FF]">
                    {selectedChallenge.logo}
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider text-[#A0AEC0] uppercase block">Problem Objective:</span>
                    <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed text-justify mt-1">
                      Researchers must synthesize alternative telemetry and micro-economical variables to map resource distribution choke-points. Winners receive global publishing clearance, institutional subsidies, and direct payouts.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-[#050505] p-3 rounded border border-white/5">
                      <span className="text-white/40 uppercase block text-[9px] mb-1">Reputation Gain</span>
                      <strong className="text-[#00FF00] font-bold text-sm">+{selectedChallenge.repAward} PTS</strong>
                    </div>
                    <div className="bg-[#050505] p-3 rounded border border-white/5">
                      <span className="text-white/40 uppercase block text-[9px] mb-1">Active Status</span>
                      <strong className="text-[#00F0FF] font-bold text-sm">OPEN SUBMISSIONS</strong>
                    </div>
                  </div>
                </div>

                {/* Team & Solutions forms */}
                {selectedChallenge.joined ? (
                  selectedChallenge.submitted ? (
                    <div className="bg-[#00FF00]/5 border border-[#00FF00]/25 rounded-lg p-5 text-center text-[#00FF00] font-mono text-xs md:text-sm space-y-2">
                      <Check className="mx-auto text-[#00FF00]" size={24} />
                      <p className="font-bold">SOLUTION SUBMITTED SUCCESSFULLY</p>
                      <p className="text-[#A0AEC0] text-xs">Our review board is stress-testing your code vectors. You have been awarded +50 reputation points.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitSolution} className="space-y-4 border-t border-white/5 pt-4">
                      <h4 className="text-xs font-mono tracking-wider text-[#00F0FF] uppercase font-bold">SUBMIT DEPLOYED CODE</h4>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-[#A0AEC0] uppercase block">Collaborative Team Name</label>
                        <input
                          type="text"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-[#0062FF]/50"
                          placeholder="e.g. Delhi Agritech Team A"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-[#A0AEC0] uppercase block">Solution Archive Link (GitHub/Zip)</label>
                        <input
                          type="url"
                          value={solutionUrl}
                          onChange={(e) => setSolutionUrl(e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-[#0062FF]/50"
                          placeholder="e.g. https://github.com/quantora/solution"
                          required
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-[#00FF00] hover:bg-[#00dd00] text-black py-3 rounded text-xs font-bold uppercase tracking-wider shadow-[0_4px_12px_rgba(0,255,0,0.2)] transition-all cursor-pointer text-center"
                      >
                        Submit Deployed Solution
                      </button>
                    </form>
                  )
                ) : (
                  <div className="bg-[#050505] border border-white/5 p-5 rounded-lg text-center font-mono space-y-4">
                    <p className="text-xs text-[#A0AEC0]">You must join the challenge as a contributor before accessing the submission forms.</p>
                    <button 
                      onClick={() => handleJoin(selectedChallenge.id)}
                      className="bg-[#0062FF] hover:bg-[#0056e0] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded cursor-pointer"
                    >
                      Join Challenge Workspace
                    </button>
                  </div>
                )}

              </div>
            ) : (
              <div className="h-40 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-xs text-[#A0AEC0]">
                Select a lab challenge from the list to view the workspace portal.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
