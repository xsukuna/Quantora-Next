import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Users, ChevronRight, Search, Award, CheckCircle 
} from 'lucide-react';
import { getChallenges, joinChallenge, submitChallengeSolution, getPapers } from '../services/db';
import type { RndChallenge, User as DBUser } from '../services/db';

interface RndLabProps {
  openAuth: () => void;
  currentUser: DBUser | null;
}

const RndChallengeSkeleton: React.FC = () => {
  return (
    <div className="border border-white/5 bg-[#0a0f1e]/10 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between h-40">
      {/* Moving Shimmer Bar Overlay */}
      <div className="absolute inset-0 animate-shimmer pointer-events-none" />
      <div className="space-y-3 animate-pulse">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-3.5 w-20 bg-white/5 rounded" />
            <div className="h-5 w-3/4 bg-white/10 rounded" />
          </div>
          <div className="h-6 w-20 bg-white/5 rounded" />
        </div>
        <div className="h-3 w-[95%] bg-white/5 rounded" />
        <div className="h-3 w-[70%] bg-white/5 rounded" />
      </div>
      <div className="flex justify-between items-center border-t border-white/5 pt-3 animate-pulse">
        <div className="flex gap-4">
          <div className="h-3.5 w-16 bg-white/5 rounded" />
          <div className="h-3.5 w-20 bg-white/5 rounded" />
        </div>
        <div className="h-7 w-28 bg-white/10 rounded" />
      </div>
    </div>
  );
};

export const RndLab: React.FC<RndLabProps> = ({ openAuth, currentUser }) => {
  const [challenges, setChallenges] = useState<RndChallenge[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedChallenge, setSelectedChallenge] = useState<RndChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Submit solution state
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [submittingSolution, setSubmittingSolution] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const delay = setTimeout(() => {
      loadChallenges();
      setIsLoading(false);
    }, 650);
    return () => clearTimeout(delay);
  }, []);

  const loadChallenges = () => {
    setChallenges(getChallenges());
  };

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  const handleJoin = (e: React.MouseEvent, challengeId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      openAuth();
      return;
    }
    const updated = joinChallenge(challengeId, currentUser.id);
    if (updated) {
      loadChallenges();
      if (selectedChallenge && selectedChallenge.id === challengeId) {
        setSelectedChallenge(updated);
      }
      alert('Joined Challenge successfully! You earned +15 Reputation!');
    }
  };

  const handleSolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedChallenge || !selectedPaperId) return;

    setSubmittingSolution(true);
    setTimeout(() => {
      const updated = submitChallengeSolution(selectedChallenge.id, currentUser.id);
      if (updated) {
        loadChallenges();
        setSelectedChallenge(updated);
        setSubmittingSolution(false);
        setSubmissionSuccess(true);
        setSelectedPaperId('');
        setTimeout(() => setSubmissionSuccess(false), 2500);
      }
    }, 1500);
  };

  // Categories list
  const categories = ['ALL', 'Geopolitics', 'Public Policy', 'Quantitative Finance', 'Technology Insights'];

  // Filters logic
  const filteredChallenges = challenges.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.sponsor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'ALL' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Get user papers that can be submitted as solutions
  const userPapers = getPapers().filter(p => currentUser && (p.author === currentUser.name || p.bookmarkedBy.includes(currentUser.id)));


  return (
    <div className="flex-1 flex overflow-hidden bg-[#020202]">
      
      {/* 1. SIDE NAVIGATION */}
      <aside className="w-64 border-r border-white/5 bg-[#050505] p-6 hidden md:flex flex-col gap-8 select-none shrink-0">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">R&D Marketplace</span>
          <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Open Challenges</span>
          </h3>
        </div>

        <div className="flex flex-col gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                activeCategory === cat 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <span>{cat === 'ALL' ? 'All Areas' : cat}</span>
              <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all ${
                activeCategory === cat ? 'opacity-100 text-blue-400' : 'text-gray-500'
              }`} />
            </button>
          ))}
        </div>
      </aside>

      {/* 2. CHALLENGES MARKETPLACE LISTINGS */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Search header */}
        <div className="p-6 border-b border-white/5 bg-[#050505]/30 flex flex-col md:flex-row gap-4 justify-between items-center relative z-20 shrink-0">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-3 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search R&D requests, corporate challenges, sponsors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white/10 text-white transition-all font-sans"
            />
          </div>
          <div className="text-xs text-gray-400 font-mono font-bold shrink-0">
            Available Requests: <span className="text-white">{filteredChallenges.length}</span>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {isLoading ? (
            <div className="space-y-4">
              <RndChallengeSkeleton />
              <RndChallengeSkeleton />
              <RndChallengeSkeleton />
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Trophy className="w-12 h-12 text-gray-600 mb-4 animate-bounce" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Active Challenges</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">No R&D challenges match your search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredChallenges.map(challenge => {
                const hasJoined = currentUser && challenge.joinedUsers.includes(currentUser.id);

                return (
                  <div
                    key={challenge.id}
                    onClick={() => setSelectedChallenge(challenge)}
                    className="glass rounded-xl border border-white/5 p-6 hover:border-white/15 transition-all cursor-pointer group flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded">
                          {challenge.category}
                        </span>
                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono">
                          {challenge.sponsor}
                        </span>
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest border border-white/10 px-1.5 py-0.5 rounded font-mono">
                          Difficulty: {challenge.difficulty}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-base md:text-lg group-hover:text-blue-400 transition-colors">
                        {challenge.title}
                      </h3>
                      
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                        {challenge.description}
                      </p>
                    </div>

                    {/* Reward & Join button Column */}
                    <div className="flex md:flex-col justify-between items-end gap-4 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0 shrink-0 select-none">
                      <div className="text-right">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">REWARD GRANT</span>
                        <span className="text-xs font-black text-emerald-400 font-mono block">{challenge.reward}</span>
                        <span className="text-[9px] text-gray-500 font-mono font-bold">+{challenge.repAward} Reputation</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono font-bold mr-2">
                          <Users className="w-3.5 h-3.5" />
                          <span>{challenge.teamsCount} Teams</span>
                        </span>
                        
                        <button
                          onClick={(e) => handleJoin(e, challenge.id)}
                          className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                            hasJoined
                              ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <span>{hasJoined ? 'Registered' : 'Register Lab'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 3. CHALLENGE DETAIL POPUP */}
      <AnimatePresence>
        {selectedChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedChallenge(null)}
            />
            
            <motion.div
              className="relative w-full max-w-2xl bg-[#050505] border border-white/10 p-8 rounded-2xl shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto scrollbar-hide"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <div className="flex gap-2 items-center">
                    <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
                      {selectedChallenge.category}
                    </span>
                    <span className="text-[8px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono uppercase">
                      {selectedChallenge.sponsor}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black uppercase text-white tracking-widest">{selectedChallenge.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-white border border-white/5 rounded"
                >
                  ESC [x]
                </button>
              </div>

              {/* Reward stats cards */}
              <div className="grid grid-cols-3 gap-4 border-t border-b border-white/5 py-4">
                <div className="text-center">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Reward Pool</span>
                  <span className="text-xs font-black text-emerald-400 font-mono mt-0.5 block">{selectedChallenge.reward}</span>
                </div>
                <div className="text-center border-l border-r border-white/5">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Reputation Gain</span>
                  <span className="text-xs font-black text-blue-400 font-mono mt-0.5 block">+{selectedChallenge.repAward} Rep</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Difficulty Rating</span>
                  <span className="text-xs font-black text-gray-300 font-mono mt-0.5 block">{selectedChallenge.difficulty}</span>
                </div>
              </div>

              {/* Requirement details */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Challenge Directives</h4>
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-normal bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
                  {selectedChallenge.details}
                </p>
              </div>

              {/* solution submissions panel */}
              <div className="space-y-4 p-6 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-2xl">
                <div className="flex gap-2 items-center text-blue-400">
                  <Award className="w-4 h-4" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">R&D Submission Workstation</h4>
                </div>

                {currentUser ? (
                  selectedChallenge.joinedUsers.includes(currentUser.id) ? (
                    submissionSuccess ? (
                      <div className="py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle className="w-4 h-4 animate-bounce" />
                        <span>Research Solution Submitted! +50 Reputation Earned!</span>
                      </div>
                    ) : (
                      <form onSubmit={handleSolutionSubmit} className="space-y-3">
                        <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                          Link one of your uploaded manuscripts or bookmarked papers to submit as a solution to this strategic request:
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <select
                            required
                            value={selectedPaperId}
                            onChange={(e) => setSelectedPaperId(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="" className="bg-[#050505]">Select your clearance manuscript...</option>
                            {userPapers.map(paper => (
                              <option key={paper.id} value={paper.id} className="bg-[#050505]">{paper.title}</option>
                            ))}
                          </select>

                          <button
                            type="submit"
                            disabled={submittingSolution || !selectedPaperId}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/30 text-white rounded-xl text-xs font-black uppercase tracking-widest shrink-0 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>{submittingSolution ? 'Encrypting...' : 'Deploy Solution'}</span>
                          </button>
                        </div>
                      </form>
                    )
                  ) : (
                    <div className="text-center p-4 bg-white/2 border border-white/5 rounded-xl">
                      <p className="text-xs text-gray-400 mb-2">You must register your lab group for this challenge before deploying solutions.</p>
                      <button
                        onClick={(e) => handleJoin(e, selectedChallenge.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider"
                      >
                        Register Lab
                      </button>
                    </div>
                  )
                ) : (
                  <div className="text-center p-4 bg-white/2 border border-white/5 rounded-xl">
                    <span className="text-[11px] text-gray-500">
                      Request security clearance to register labs and submit solutions.{' '}
                      <button onClick={openAuth} className="text-blue-400 hover:underline font-bold">
                        Authorize Credentials
                      </button>
                    </span>
                  </div>
                )}
              </div>

              {/* Footer info */}
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono font-bold select-none pt-2 border-t border-white/5">
                <span>Challenge: {selectedChallenge.id}</span>
                <span>Active Registrations: {selectedChallenge.teamsCount} groups</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
