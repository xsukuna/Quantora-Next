import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, BookOpen as BookIcon, Download as DownloadIcon, 
  ThumbsUp as UpvoteIcon, ChevronRight as RightIcon,
  Users, Search, Mail, Activity, Trophy
} from 'lucide-react';

export interface DBUser {
  id: string;
  name: string;
  email: string;
  role: string;
  reputation: number;
  badge: string;
  avatarUrl?: string | null;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  category: string;
  author: string;
  institution: string;
  country: string;
  tags: string[];
  downloads: number;
  citations: number;
  likes: number;
  trustLabel: string;
  peerReviewed: boolean;
  fileUrl: string;
}

interface ResearcherProfilesProps {
  onNavigate: (tab: string, paperId?: string) => void;
}

export const ResearcherProfiles: React.FC<ResearcherProfilesProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'ROSTER' | 'LEADERBOARD'>('ROSTER');

  const handleRepChange = (type: 'UP' | 'DOWN') => {
    if (!selectedUser) return;
    const offset = type === 'UP' ? 10 : -10;
    
    setUsers(prev => prev.map(u => {
      if (u.id !== selectedUser.id) return u;
      return { ...u, reputation: Math.max(0, u.reputation + offset) };
    }));
    
    setSelectedUser(prev => {
      if (!prev) return null;
      return { ...prev, reputation: Math.max(0, prev.reputation + offset) };
    });
  };

  useEffect(() => {
    // Fetch users and papers in parallel from SQLite APIs
    Promise.all([
      fetch('/api/users').then(res => res.json()),
      fetch('/api/research').then(res => res.json())
    ])
      .then(([usersData, papersData]) => {
        setUsers(usersData);
        setPapers(papersData);
        
        // Auto select first user once loaded
        if (usersData.length > 0) {
          setSelectedUser(usersData[0]);
        }
      })
      .catch(err => console.error('Failed to load researcher profile metrics:', err));
  }, []);

  // Filter users by search
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get papers uploaded by selected user
  const getUserPapers = (name: string): Paper[] => {
    return papers.filter(p => p.author === name);
  };

  // Mock GitHub contribution cells (365 days / 52 weeks represented)
  const renderContributionGrid = () => {
    const cells = [];
    const colors = ['bg-[#0e162f] border-white/5', 'bg-[#1e295d] border-white/5', 'bg-blue-600/30 border-blue-500/10', 'bg-blue-500/50 border-blue-400/20', 'bg-emerald-500/60 border-emerald-400/20'];
    
    // Render 7 rows x 20 columns grid of contribution micro-blocks
    for (let i = 0; i < 7 * 20; i++) {
      // Pick random density color weights favoring lower activity
      const weight = Math.random() > 0.85 ? (Math.random() > 0.5 ? 4 : 3) : (Math.random() > 0.6 ? 2 : (Math.random() > 0.3 ? 1 : 0));
      cells.push(
        <div 
          key={i} 
          className={`w-3.5 h-3.5 rounded border transition-colors cursor-crosshair hover:bg-cyan-400/80 ${colors[weight]}`}
          title={`Commits / Activities registered [Audit Vector: ${weight * 2 + 1}]`}
        />
      );
    }
    return cells;
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#020202]">
      
      {/* 1. RESEARCHER DIRECTORY COLUMN */}
      <aside className="w-80 border-r border-white/5 bg-[#050505] p-6 flex flex-col gap-5 select-none shrink-0 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">Fellow Network</span>
          <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Research Directory</span>
          </h3>
        </div>

        {/* Sidebar Toggle tab switcher */}
        <div className="flex gap-1 bg-[#020202] border border-white/5 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSidebarTab('ROSTER')}
            className={`flex-1 text-center py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeSidebarTab === 'ROSTER' ? 'bg-white text-black font-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            All Fellows
          </button>
          <button
            onClick={() => setActiveSidebarTab('LEADERBOARD')}
            className={`flex-1 text-center py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeSidebarTab === 'LEADERBOARD' ? 'bg-white text-black font-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Leaderboard
          </button>
        </div>

        {activeSidebarTab === 'ROSTER' ? (
          <>
            {/* Search */}
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search academic profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white/10 text-white transition-all"
              />
            </div>

            {/* List */}
            <div className="flex flex-col gap-2">
              {filteredUsers.map(user => {
                const isSelected = selectedUser && selectedUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex gap-3 group relative overflow-hidden ${
                      isSelected 
                        ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-inner' 
                        : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {/* Glow border element */}
                    {isSelected && <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-blue-500" />}

                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black uppercase text-xs shrink-0 select-none text-blue-400">
                      {user.name.charAt(0)}
                    </div>

                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">{user.name}</span>
                      <span className="text-[9px] font-bold text-gray-500 truncate mt-0.5 uppercase tracking-wider">{user.badge}</span>
                    </div>

                    <RightIcon className={`w-3.5 h-3.5 self-center opacity-0 group-hover:opacity-100 transition-all ${
                      isSelected ? 'opacity-100 text-blue-400' : 'text-gray-500'
                    }`} />
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* Leaderboard sorted list */
          <div className="flex flex-col gap-2.5">
            {[...users].sort((a, b) => b.reputation - a.reputation).map((user, idx) => {
              const isSelected = selectedUser && selectedUser.id === user.id;
              const rank = idx + 1;
              
              // Honor Badge colors
              let rankStyle = 'bg-white/5 border-white/10 text-gray-400';
              let isTopThree = false;
              if (rank === 1) { rankStyle = 'bg-amber-400/10 border-amber-500/30 text-amber-400'; isTopThree = true; }
              else if (rank === 2) { rankStyle = 'bg-slate-300/10 border-slate-300/30 text-slate-300'; isTopThree = true; }
              else if (rank === 3) { rankStyle = 'bg-orange-500/10 border-orange-500/30 text-orange-400'; isTopThree = true; }

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-center gap-3 relative overflow-hidden group ${
                    isSelected 
                      ? 'bg-blue-600/10 border-blue-500/30 shadow-inner' 
                      : 'border-white/5 hover:border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-mono font-black shrink-0 ${rankStyle}`}>
                      {isTopThree ? <Trophy size={11} /> : rank}
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">{user.name}</span>
                      <span className="text-[8px] text-gray-500 mt-0.5 truncate uppercase tracking-widest font-mono font-bold">{user.badge}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">{user.reputation}</span>
                    <span className="text-[7px] text-gray-500 uppercase tracking-widest block font-mono">Rep</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* 2. RESEARCHER PROFILE DISPLAY SPACE */}
      <main className="flex-1 overflow-y-auto bg-[#020202] scrollbar-hide">
        <AnimatePresence mode="wait">
          {selectedUser ? (
            <motion.div
              key={selectedUser.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-8 md:p-12 space-y-8 max-w-4xl"
            >
              {/* Profile Card Summary Banner */}
              <div className="glass rounded-2xl border border-white/5 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex gap-5 items-start">
                  <div className="w-16 h-16 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black uppercase text-2xl shrink-0 text-blue-400 select-none">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-2.5 items-center">
                      <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">{selectedUser.name}</h2>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
                        {selectedUser.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-normal max-w-md font-sans">
                      Research Fellow specializing in quantitative analytical modeling, sovereign debt structures, and economic data models.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedUser.email}</span>
                    </div>
                  </div>
                </div>

                {/* Reputation Badge Display */}
                <div className="bg-gradient-to-r from-blue-600/15 to-transparent border border-blue-500/25 px-6 py-4 rounded-xl text-center md:text-right shrink-0">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Academic Reputation</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block select-all">
                    {selectedUser.reputation}
                  </span>
                  <span className="text-[8px] text-gray-500 font-mono font-bold uppercase mt-0.5 block">Nodes Impact Verified</span>
                </div>
              </div>

              {/* Badge Cabinets & Reputation Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rep Actions */}
                <div className="glass rounded-xl border border-white/5 p-4 flex justify-between items-center bg-white/[0.01]">
                  <div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Endorse Researcher</span>
                    <p className="text-[10px] text-gray-400 mt-1">Upvote to recognize academic contributions & verify credentials.</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => handleRepChange('UP')}
                      className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                      + Upvote
                    </button>
                    <button 
                      onClick={() => handleRepChange('DOWN')}
                      className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/25 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                      - Downvote
                    </button>
                  </div>
                </div>

                {/* Badge Cabinets */}
                <div className="glass rounded-xl border border-white/5 p-4 flex flex-col gap-2 bg-white/[0.01]">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Verification Badges Cabinet</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedUser.badge === 'Lead Architect' && (
                      <>
                        <span className="bg-[#00F0FF]/15 border border-[#00F0FF]/25 text-[#00F0FF] rounded-lg px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase">Welfare Auditor</span>
                        <span className="bg-purple-500/15 border border-purple-500/25 text-purple-400 rounded-lg px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase">Methodology Expert</span>
                      </>
                    )}
                    {selectedUser.badge === 'Neural Architect' && (
                      <>
                        <span className="bg-[#0062FF]/15 border border-[#0062FF]/25 text-[#0062FF] rounded-lg px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase">Ethics Reviewer</span>
                        <span className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-lg px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase">Deep Learning Pioneer</span>
                      </>
                    )}
                    {selectedUser.badge !== 'Lead Architect' && selectedUser.badge !== 'Neural Architect' && (
                      <>
                        <span className="bg-white/5 border border-white/10 text-gray-400 rounded-lg px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase">Verified Researcher</span>
                        <span className="bg-blue-500/15 border border-blue-500/25 text-blue-400 rounded-lg px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase">Sovereign Analyst</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Research Metrics indicators row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="glass rounded-xl border border-white/5 p-4 text-center">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Published Volumes</span>
                  <span className="text-xl font-black text-white font-mono mt-1 block">
                    {getUserPapers(selectedUser.name).length}
                  </span>
                </div>
                <div className="glass rounded-xl border border-white/5 p-4 text-center">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Reference Citations</span>
                  <span className="text-xl font-black text-blue-400 font-mono mt-1 block">
                    {getUserPapers(selectedUser.name).reduce((sum, p) => sum + p.citations, 0)}
                  </span>
                </div>
                <div className="glass rounded-xl border border-white/5 p-4 text-center col-span-2 sm:col-span-1">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Total Downloads</span>
                  <span className="text-xl font-black text-cyan-400 font-mono mt-1 block">
                    {getUserPapers(selectedUser.name).reduce((sum, p) => sum + p.downloads, 0)}
                  </span>
                </div>
              </div>

              {/* GitHub style Contribution Heatmap */}
              <div className="glass rounded-2xl border border-white/5 p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span>Academic Contribution Grid</span>
                  </h4>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider font-mono mt-0.5">Clearing matrices mapped across 365 cycles</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {renderContributionGrid()}
                </div>

                <div className="flex justify-between items-center text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                  <span>Less Active</span>
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 bg-[#0e162f] rounded border border-white/5" />
                    <div className="w-2.5 h-2.5 bg-[#1e295d] rounded border border-white/5" />
                    <div className="w-2.5 h-2.5 bg-blue-600/30 rounded border border-blue-500/10" />
                    <div className="w-2.5 h-2.5 bg-blue-500/50 rounded border border-blue-400/20" />
                    <div className="w-2.5 h-2.5 bg-emerald-500/60 rounded border border-emerald-400/20" />
                  </div>
                  <span>Highly Active</span>
                </div>
              </div>

              {/* User publications list */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                  <BookIcon className="w-4 h-4 text-blue-500" />
                  <span>Authored Research Portfolios</span>
                </h4>

                <div className="space-y-3">
                  {getUserPapers(selectedUser.name).length === 0 ? (
                    <p className="text-xs text-gray-500 italic p-6 border border-dashed border-white/10 rounded-xl text-center">
                      No research publications registered under this user profile.
                    </p>
                  ) : (
                    getUserPapers(selectedUser.name).map(paper => (
                      <div
                        key={paper.id}
                        onClick={() => onNavigate('LIBRARY', paper.id)}
                        className="glass border border-white/5 hover:border-white/10 p-5 rounded-xl transition-all cursor-pointer flex justify-between items-center group"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                              {paper.category}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest border border-white/10 text-gray-400 px-1.5 py-0.5 rounded font-mono">
                              {paper.trustLabel || 'Independent Submission'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                            {paper.title}
                          </h4>
                        </div>

                        <div className="flex gap-4 shrink-0 text-[10px] font-mono text-gray-500">
                          <span className="flex items-center gap-1">
                            <UpvoteIcon className="w-3.5 h-3.5" />
                            <span>{paper.likes}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <DownloadIcon className="w-3.5 h-3.5" />
                            <span>{paper.downloads}</span>
                          </span>
                          <RightIcon className="w-4 h-4 self-center group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
              <Users className="w-12 h-12 text-gray-700 mb-3" />
              <span>Selecting Academic profile credentials...</span>
            </div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
};
