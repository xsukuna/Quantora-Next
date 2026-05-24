import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Send, MessageSquare, ThumbsUp, Hash, Search, ShieldCheck 
} from 'lucide-react';
import { getInsights, addInsight, upvoteInsight } from '../services/db';
import type { Insight, User as DBUser } from '../services/db';

interface InsightsFeedProps {
  openAuth: () => void;
  currentUser: DBUser | null;
}

export const InsightsFeed: React.FC<InsightsFeedProps> = ({ openAuth, currentUser }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Macroeconomics');
  const [tagsInput, setTagsInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterCategory, setActiveFilterCategory] = useState('ALL');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = () => {
    setInsights(getInsights());
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuth();
      return;
    }
    if (!content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace('#', ''))
      .filter(t => t.length > 0);

    const newInsight = addInsight(
      content,
      tags.length > 0 ? tags : ['GeneralIntel'],
      category
    );

    if (newInsight) {
      setContent('');
      setTagsInput('');
      loadInsights();
    }
  };

  const handleUpvote = (id: string) => {
    if (!currentUser) {
      openAuth();
      return;
    }
    const updated = upvoteInsight(id, currentUser.id);
    if (updated) {
      loadInsights();
    }
  };

  // Categories list
  const categories = [
    'Macroeconomics', 'Quantitative Finance', 'Public Policy', 'Geopolitics', 'Technology Insights'
  ];

  // Filters logic
  const filteredInsights = insights.filter(ins => {
    const matchesSearch = ins.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ins.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ins.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeFilterCategory === 'ALL' || ins.category === activeFilterCategory;
    const matchesTag = !selectedTag || ins.tags.includes(selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  // Calculate trending hashtags from real-time database
  const getTrendingTags = () => {
    const counts: { [key: string]: number } = {};
    insights.forEach(ins => {
      ins.tags.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
  };

  const trendingTags = getTrendingTags();

  return (
    <div className="flex-1 flex overflow-hidden bg-[#020202]">
      
      {/* 1. FILTER & TRENDING SIDEBAR */}
      <aside className="w-64 border-r border-white/5 bg-[#050505] p-6 hidden md:flex flex-col gap-8 select-none shrink-0">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Intelligence Hub</span>
          <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Trending Insights</span>
          </h3>
        </div>

        {/* Categories filters */}
        <div className="space-y-3">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Categories</span>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => { setActiveFilterCategory('ALL'); setSelectedTag(null); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilterCategory === 'ALL' && !selectedTag
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              All Channels
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveFilterCategory(cat); setSelectedTag(null); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all truncate ${
                  activeFilterCategory === cat && !selectedTag
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Trending tags */}
        <div className="space-y-3">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Trending Indices</span>
          <div className="flex flex-col gap-1.5">
            {trendingTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`flex items-center gap-2 text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  selectedTag === tag 
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Hash className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                <span className="truncate">#{tag}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 2. FEED CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Search header */}
        <div className="p-6 border-b border-white/5 bg-[#050505]/30 flex flex-col md:flex-row gap-4 justify-between items-center relative z-20 shrink-0">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-3 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search intelligence updates, insights, analysts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white/10 text-white transition-all font-sans"
            />
          </div>
          {selectedTag && (
            <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl text-xs text-cyan-400 shrink-0">
              <span>Filtering: #{selectedTag}</span>
              <button onClick={() => setSelectedTag(null)} className="hover:text-white ml-1 font-bold">×</button>
            </div>
          )}
        </div>

        {/* Scrollable feed area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          
          {/* Post opinion widget */}
          <div className="glass rounded-2xl border border-white/5 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Publish Analytical Opinion</span>
            </h3>

            {currentUser ? (
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share a macroeconomic event alert, policy briefing, or analytical insight..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-blue-500 transition-all font-sans leading-relaxed"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Channel Group</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-[#050505]">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Keywords (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Lithium, GoldPrice, Yields"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
                  >
                    <span>Deploy Intelligence</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 bg-white/[0.01] border border-white/5 rounded-xl text-center space-y-1">
                <p className="text-xs text-gray-400">Request clearance authorization to deploy security analytical opinions.</p>
                <button onClick={openAuth} className="text-xs text-blue-400 hover:underline font-black uppercase tracking-wider">
                  Request Credentials Clearance
                </button>
              </div>
            )}
          </div>

          {/* Insights items list */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredInsights.length === 0 ? (
                <div className="p-12 text-center text-gray-500 italic">
                  No intelligence reports matching parameters.
                </div>
              ) : (
                filteredInsights.map(ins => (
                  <motion.div
                    key={ins.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass rounded-xl border border-white/5 p-5 space-y-4 hover:border-white/10 transition-colors"
                  >
                    {/* User profile row */}
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-xs shrink-0 uppercase">
                          {ins.author.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{ins.author}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">
                              {ins.badge}
                            </span>
                          </div>
                          <p className="text-[9px] text-gray-500 font-mono mt-0.5">Role: {ins.role} | Reputation: {ins.reputation}</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5 text-gray-400 font-mono">
                        {ins.category}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-normal">
                      {ins.content}
                    </p>

                    {/* Tags & Action row */}
                    <div className="flex flex-wrap gap-4 items-center justify-between pt-2 border-t border-white/5 text-gray-500 text-[10px] font-bold">
                      <div className="flex flex-wrap gap-1.5">
                        {ins.tags.map(t => (
                          <span 
                            key={t} 
                            onClick={() => setSelectedTag(t === selectedTag ? null : t)}
                            className="px-2 py-0.5 bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors border border-white/5 rounded text-[8px] font-mono text-gray-400 cursor-pointer"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-4 font-mono select-none">
                        <button 
                          onClick={() => handleUpvote(ins.id)}
                          className={`flex items-center gap-1.5 hover:text-white transition-colors ${
                            currentUser && ins.upvotedBy.includes(currentUser.id) ? 'text-emerald-400' : ''
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{ins.upvotes}</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{ins.commentsCount} comments</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

    </div>
  );
};
