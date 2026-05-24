'use client';

import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Heart, Share2, Send, Tag, Award, Sparkles } from 'lucide-react';

interface InsightPost {
  id: string;
  author: string;
  avatar: string;
  role: string;
  reputation: number;
  content: string;
  tags: string[];
  category: string;
  timestamp: string;
  upvotes: number;
  commentsCount: number;
  upvotedByUser: boolean;
}

const INITIAL_INSIGHTS: InsightPost[] = [
  {
    id: 'ins-1',
    author: 'Aditya Kaushik',
    avatar: 'AK',
    role: 'Lead Architect',
    reputation: 980,
    content: 'Bilateral metal sanctions stress-test indicators show a structural 22% supply deficit for rare-earth and lithium processing hubs by Q4 2026. Domestic manufacturers and sovereign stockpiles remain highly vulnerable under extreme decoupling regimes.',
    tags: ['CriticalMinerals', 'SupplyChains', 'Geopolitics'],
    category: 'Geopolitics',
    timestamp: '1 hour ago',
    upvotes: 42,
    commentsCount: 3,
    upvotedByUser: false
  },
  {
    id: 'ins-2',
    author: 'Dr. Alistair Vance',
    avatar: 'AV',
    role: 'Fellow Analyst',
    reputation: 820,
    content: 'Emerging market clearing indices flag an unprecedented reallocation. Over $140B in central bank reserves migrated into physical nodes and non-G7 clearing routes during the current cycle. G7 yield curves are structurally underpricing this structural pivot.',
    tags: ['SovereignDebt', 'YieldCurves', 'CapitalReallocation'],
    category: 'Macroeconomics',
    timestamp: '4 hours ago',
    upvotes: 28,
    commentsCount: 1,
    upvotedByUser: false
  },
  {
    id: 'ins-3',
    author: 'Elena Rostova',
    avatar: 'ER',
    role: 'Neural Architect',
    reputation: 720,
    content: 'Backtesting confirmed a 2.45 Information Ratio on out-of-sample order flow spreads under volatile regimes. Integrating spatial-temporal graph transformer networks directly captures liquidity pockets. The weights will be open-sourced next week.',
    tags: ['MachineLearning', 'QuantStrategy', 'OrderBook'],
    category: 'Quantitative Finance',
    timestamp: '1 day ago',
    upvotes: 56,
    commentsCount: 5,
    upvotedByUser: false
  }
];

export default function Insights() {
  const [insights, setInsights] = useState<InsightPost[]>(INITIAL_INSIGHTS);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Geopolitics');
  const [newTags, setNewTags] = useState('');

  // Handle post upvoting
  const toggleUpvote = (id: string) => {
    setInsights(prev => prev.map(post => {
      if (post.id === id) {
        return {
          ...post,
          upvotes: post.upvotedByUser ? post.upvotes - 1 : post.upvotes + 1,
          upvotedByUser: !post.upvotedByUser
        };
      }
      return post;
    }));
  };

  // Publish new opinion
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const parsedTags = newTags
      .split(',')
      .map(t => t.trim().replace('#', ''))
      .filter(t => t.length > 0);

    const newPost: InsightPost = {
      id: `ins-${Date.now()}`,
      author: 'Independent Analyst',
      avatar: 'IA',
      role: 'Contributor',
      reputation: 10,
      content: newContent,
      tags: parsedTags.length > 0 ? parsedTags : ['GeneralIntelligence'],
      category: newCategory,
      timestamp: 'Just now',
      upvotes: 1,
      commentsCount: 0,
      upvotedByUser: true
    };

    setInsights([newPost, ...insights]);
    setNewContent('');
    setNewTags('');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] font-sans selection:bg-[#0062FF] selection:text-white pb-20">
      
      {/* Mesh Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(0,98,255,0.06),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,240,255,0.06),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
      </div>

      <div className="max-w-[800px] mx-auto px-6 pt-12 relative z-10">
        
        {/* Back Link */}
        <a href="/" className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#A0AEC0] hover:text-white uppercase mb-8 transition-colors">
          <ArrowLeft size={14} />
          <span>Genesis Landing Page</span>
        </a>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white to-[#0062FF] bg-clip-text text-transparent">INTELLIGENCE FEED</h1>
          <p className="text-sm text-[#A0AEC0] mt-2">Real-time micro-blogging sector analysis and macroeconomic observations from certified contributors.</p>
        </div>

        {/* Publish Opinion Card */}
        <div className="bg-[#0a0f1e]/40 border border-white/5 p-6 rounded-xl mb-8">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0062FF] to-[#00F0FF] flex items-center justify-center font-extrabold text-white">
              IA
            </div>
            
            <form onSubmit={handlePublish} className="flex-1 space-y-4">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs md:text-sm text-white placeholder:text-[#A0AEC0]/40 focus:border-[#0062FF]/50 focus:ring-0 outline-none resize-none min-h-[90px]"
                placeholder="Publish your analytical opinion or geopolitical observation..."
              />
              
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                
                {/* Category & Tags selectors */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="bg-black/60 border border-white/10 text-xs text-white rounded px-2.5 py-1.5 focus:ring-0 outline-none"
                  >
                    <option value="Geopolitics">Geopolitics</option>
                    <option value="Macroeconomics">Macroeconomics</option>
                    <option value="Quantitative Finance">Quant Finance</option>
                    <option value="Public Policy">Public Policy</option>
                  </select>

                  <div className="relative flex-1 sm:w-44">
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 text-xs text-white rounded px-3 py-1.5 focus:ring-0 outline-none"
                      placeholder="Tags: debt, lithium..."
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full sm:w-auto bg-[#0062FF] hover:bg-[#0056e0] text-white py-2 px-6 text-xs font-bold uppercase rounded tracking-wider flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,98,255,0.2)] cursor-pointer"
                >
                  <Send size={12} />
                  <span>Publish Opinion</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-6">
          {insights.map(post => (
            <div key={post.id} className="bg-[#0a0f1e]/20 border border-white/5 p-6 rounded-xl hover:border-white/10 transition-colors">
              
              {/* Header row */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-black flex items-center justify-center font-extrabold text-sm text-[#00F0FF]">
                    {post.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{post.author}</span>
                      <span className="bg-[#00F0FF]/10 border border-[#00F0FF]/25 px-2 py-0.5 rounded text-[8px] text-[#00F0FF] font-extrabold uppercase tracking-wide">
                        {post.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#A0AEC0] font-mono mt-0.5">
                      <span>Reputation: <strong className="text-[#00FF00]">+{post.reputation}</strong></span>
                      <span className="mx-2">•</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[9px] font-mono font-bold tracking-widest text-[#0062FF] border border-[#0062FF]/20 bg-[#0062FF]/5 px-2 py-0.5 rounded uppercase">
                  {post.category}
                </span>
              </div>

              {/* Body Content */}
              <p className="text-xs md:text-sm text-[#A0AEC0] leading-relaxed text-justify mb-4">
                {post.content}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-mono text-[#00F0FF] hover:underline cursor-pointer">#{tag}</span>
                ))}
              </div>

              {/* Social row */}
              <div className="flex justify-between border-t border-white/5 pt-4 text-xs text-[#A0AEC0]">
                <div className="flex gap-6">
                  
                  {/* Upvote */}
                  <button 
                    onClick={() => toggleUpvote(post.id)}
                    className={`flex items-center gap-1.5 hover:text-[#FF4D4D] transition-colors cursor-pointer ${post.upvotedByUser ? 'text-[#FF4D4D]' : ''}`}
                  >
                    <Heart size={14} className={post.upvotedByUser ? 'fill-[#FF4D4D]' : ''} />
                    <span>Upvote ({post.upvotes})</span>
                  </button>

                  {/* Comment */}
                  <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
                    <MessageSquare size={14} />
                    <span>Critique ({post.commentsCount})</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
                  <Share2 size={14} />
                  <span>Transmit</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
