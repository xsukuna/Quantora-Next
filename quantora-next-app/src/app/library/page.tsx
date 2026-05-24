'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowLeft, Volume2, Globe as TranslationIcon, Download, 
  ExternalLink, CheckCircle, ShieldAlert, Sparkles, Filter, ChevronDown, ListFilter
} from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  abstract: string;
  category: string;
  author: string;
  institution: string;
  country: string;
  tags: string[];
  date: string;
  downloads: number;
  citations: number;
  likes: number;
  trustLabel: string;
  peerReviewed: boolean;
  fileUrl: string;
}

const INITIAL_PAPERS: Paper[] = [
  {
    id: 'paper-5',
    title: 'Broken Promises in the Fields: ₹127,290 Crore and Farmers Are Still Dying',
    abstract: "A 26-year forensic analysis (FY 2000–2026) of India's agricultural budget expenditure across three governments — and the inconvenient truth that money alone cannot fix a structurally broken system. Despite a 580% increase in government spending, farmer suicides remain endemic, rural indebtedness exceeds 51%, and the average farm household earns less than a daily-wage urban worker.",
    category: 'Public Policy',
    author: 'Aditya Kaushik',
    institution: 'Independent Research',
    country: 'India',
    tags: ['Agriculture', 'Rural Economy', 'Farmer Welfare', 'India'],
    date: '2026-05-22',
    downloads: 3450,
    citations: 128,
    likes: 912,
    trustLabel: 'Verified Research',
    peerReviewed: true,
    fileUrl: '/report.html'
  },
  {
    id: 'paper-1',
    title: 'India’s Semiconductor Expansion & Global Supply Chains',
    abstract: 'An empirical analysis of India’s domestic semiconductor fabrication buildout under industrial policy frameworks, exploring supply chain dependencies, geopolitical risk vectors, and emerging tech sovereignty.',
    category: 'Macroeconomics',
    author: 'Dr. Alistair Vance',
    institution: 'Quantora Analytics Institute',
    country: 'India',
    tags: ['Semiconductors', 'Supply Chain', 'Industrial Policy', 'India'],
    date: '2026-05-12',
    downloads: 890,
    citations: 42,
    likes: 245,
    trustLabel: 'Verified Research',
    peerReviewed: true,
    fileUrl: '/report.pdf'
  },
  {
    id: 'paper-2',
    title: 'Neural Alpha: Multi-Agent Deep Reinforcement Learning in Volatile Regimes',
    abstract: 'We introduce Neural Alpha, a multi-agent deep reinforcement learning framework for algorithmic signal generation and market-making under extreme volatility. By mapping Order Book depth matrices into spatial-temporal graph networks, our model outperforms standard Transformer baselines by 45%.',
    category: 'Quantitative Finance',
    author: 'Elena Rostova',
    institution: 'MIT Media Lab',
    country: 'United States',
    tags: ['Machine Learning', 'Quantitative Finance', 'Market Making'],
    date: '2026-04-29',
    downloads: 1240,
    citations: 18,
    likes: 412,
    trustLabel: 'Verified Research',
    peerReviewed: true,
    fileUrl: '/report.pdf'
  },
  {
    id: 'paper-3',
    title: 'Renewable Transition in South Asia: Regional Grids and Carbon-Neutral Finance',
    abstract: 'This paper presents strategic frameworks for cross-border grid integration and decentralized renewable energy infrastructure in South Asian developing economies, outlining funding models to scale green assets.',
    category: 'Public Policy',
    author: 'Marcus Aurelius Vance',
    institution: 'London School of Economics',
    country: 'India',
    tags: ['Renewable Energy', 'Climate Finance', 'South Asia'],
    date: '2026-05-02',
    downloads: 512,
    citations: 29,
    likes: 189,
    trustLabel: 'Verified Research',
    peerReviewed: true,
    fileUrl: '/report.pdf'
  },
  {
    id: 'paper-4',
    title: 'Decentralized Micro-Credit: Slicing Ledger Overheads in Rural Agrarian Blocks',
    abstract: 'Exploring low-bandwidth offline decentralized validation networks to deploy agricultural ledger tools without standard telemetry pipelines.',
    category: 'Technology Insights',
    author: 'Siddharth Roy',
    institution: 'Delhi Technological University',
    country: 'India',
    tags: ['Blockchain', 'Agritech', 'Micro-Credit'],
    date: '2026-05-24',
    downloads: 87,
    citations: 2,
    likes: 34,
    trustLabel: 'Independent Submission',
    peerReviewed: false,
    fileUrl: '/report.pdf'
  }
];

export default function Library() {
  const [papers, setPapers] = useState<Paper[]>(INITIAL_PAPERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [semanticMode, setSemanticMode] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'Verified' | 'Public'>('Verified');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // TTS State
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  
  // Translation State
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translatedAbstracts, setTranslatedAbstracts] = useState<Record<string, { lang: string; text: string }>>({});

  // Semantic search simulation
  useEffect(() => {
    if (!searchQuery) {
      setPapers(INITIAL_PAPERS);
      return;
    }

    setSearching(true);
    const delay = setTimeout(() => {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = INITIAL_PAPERS.filter(p => {
        if (semanticMode) {
          // Conceptual search mapping
          if (lowerQuery.includes('farm') || lowerQuery.includes('suicide') || lowerQuery.includes('money')) {
            return p.id === 'paper-5';
          }
          if (lowerQuery.includes('chip') || lowerQuery.includes('fab') || lowerQuery.includes('silicon')) {
            return p.id === 'paper-1';
          }
          if (lowerQuery.includes('rl') || lowerQuery.includes('ai') || lowerQuery.includes('trade')) {
            return p.id === 'paper-2';
          }
        }
        return p.title.toLowerCase().includes(lowerQuery) || 
               p.abstract.toLowerCase().includes(lowerQuery) ||
               p.author.toLowerCase().includes(lowerQuery);
      });
      setPapers(filtered);
      setSearching(false);
    }, semanticMode ? 1200 : 300);

    return () => clearTimeout(delay);
  }, [searchQuery, semanticMode]);

  // TTS Read Abstract
  const readAbstract = (id: string, text: string) => {
    if (typeof window === 'undefined') return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Translation Simulator
  const simulateTranslation = (id: string, originalText: string, targetLang: string) => {
    setTranslatingId(id);
    
    // Hindi Mock translation
    const hindiMock = "यह शोध भारत के कृषि बजट व्यय (वित्त वर्ष 2000-2026) का एक 26-वर्षीय फोरेंसिक विश्लेषण प्रस्तुत करता है। यह स्पष्ट करता है कि बढ़ते व्यय के बावजूद कृषि कल्याण संरचनात्मक रूप से बाधित रहा है, और ऋणग्रस्तता में निरंतर वृद्धि देखी गई है।";
    const germanMock = "Diese Arbeit präsentiert eine 26-jährige forensische Analyse der indischen Agrarbudgetausgaben. Sie verdeutlicht, dass trotz gestiegener Ausgaben die Wohlfahrt strukturell gehemmt bleibt.";

    setTimeout(() => {
      setTranslatedAbstracts(prev => ({
        ...prev,
        [id]: {
          lang: targetLang,
          text: targetLang === 'Hindi' ? hindiMock : germanMock
        }
      }));
      setTranslatingId(null);
    }, 1500);
  };

  // Filter papers by trust tag tab and category
  const displayedPapers = papers.filter(p => {
    const matchesTab = selectedTab === 'Verified' 
      ? p.trustLabel === 'Verified Research' 
      : p.trustLabel !== 'Verified Research';
    
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    return matchesTab && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] font-sans selection:bg-[#0062FF] selection:text-white pb-20">
      
      {/* 3D Mesh Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(0,98,255,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,240,255,0.08),transparent_40%)]" />
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
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white to-[#0062FF] bg-clip-text text-transparent">RESEARCH HUB</h1>
          <p className="text-sm md:text-base text-[#A0AEC0] mt-2">Browse the public archive of verified corporate reports and open independent drafts.</p>
        </div>

        {/* Global Control Center */}
        <div className="bg-[#0a0f1e]/40 border border-white/5 p-4 rounded-xl mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full md:max-w-md flex items-center bg-black/60 border border-white/10 rounded-lg overflow-hidden focus-within:border-[#0062FF]/50 transition-colors">
            <div className="pl-4 text-[#A0AEC0]"><Search size={18} /></div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none py-3 px-3 text-xs md:text-sm text-white placeholder:text-[#A0AEC0]/40 focus:ring-0"
              placeholder={semanticMode ? "Ask AI for concepts (e.g. farmer credit suicide, chip fabs)..." : "Search title, author, abstract..."}
            />
            {searching && (
              <span className="pr-4 shrink-0 text-xs font-mono text-[#00F0FF] animate-pulse">Scanning...</span>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto shrink-0 justify-end">
            
            {/* AI Semantic Toggle */}
            <button 
              onClick={() => setSemanticMode(!semanticMode)}
              className={`flex items-center gap-2 border px-4 py-2.5 rounded text-xs font-mono tracking-wider transition-all cursor-pointer ${
                semanticMode 
                  ? 'bg-[#0062FF]/20 border-[#0062FF] text-[#00F0FF] shadow-[0_0_20px_rgba(0,98,255,0.25)]' 
                  : 'bg-black/40 border-white/10 text-[#A0AEC0] hover:border-white/20'
              }`}
            >
              <Sparkles size={14} className={semanticMode ? 'animate-bounce' : ''} />
              <span>AI SEMANTIC SEARCH: {semanticMode ? 'ACTIVE' : 'OFF'}</span>
            </button>

            {/* Category selection */}
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-[#A0AEC0]">
              <ListFilter size={14} />
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white focus:ring-0 cursor-pointer"
              >
                <option value="All" className="bg-[#050505]">All Categories</option>
                <option value="Macroeconomics" className="bg-[#050505]">Macroeconomics</option>
                <option value="Quantitative Finance" className="bg-[#050505]">Quant Strategy</option>
                <option value="Public Policy" className="bg-[#050505]">Public Policy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Index filter Tabs */}
        <div className="flex border-b border-white/5 mb-8">
          <button 
            onClick={() => setSelectedTab('Verified')}
            className={`pb-4 px-6 text-xs md:text-sm font-bold tracking-widest uppercase transition-all cursor-pointer ${
              selectedTab === 'Verified' 
                ? 'border-b-2 border-b-[#0062FF] text-[#0062FF]' 
                : 'text-[#A0AEC0] hover:text-white'
            }`}
          >
            Verified Research ({INITIAL_PAPERS.filter(p => p.trustLabel === 'Verified Research').length})
          </button>
          <button 
            onClick={() => setSelectedTab('Public')}
            className={`pb-4 px-6 text-xs md:text-sm font-bold tracking-widest uppercase transition-all cursor-pointer ${
              selectedTab === 'Public' 
                ? 'border-b-2 border-b-[#00F0FF] text-[#00F0FF]' 
                : 'text-[#A0AEC0] hover:text-white'
            }`}
          >
            Public Open Index ({INITIAL_PAPERS.filter(p => p.trustLabel !== 'Verified Research').length})
          </button>
        </div>

        {/* Library Grid */}
        {displayedPapers.length === 0 ? (
          <div className="text-center py-20 bg-[#0a0f1e]/10 border border-white/5 rounded-2xl">
            <p className="text-sm md:text-base text-[#A0AEC0]">No papers matched the active filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedPapers.map(paper => {
              const translated = translatedAbstracts[paper.id];
              const isHindiActive = translated?.lang === 'Hindi';
              const activeText = translated ? translated.text : paper.abstract;

              return (
                <div 
                  key={paper.id} 
                  className={`bg-[#0a0f1e]/30 border rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 transition-all hover:bg-[#0a0f1e]/50 ${
                    paper.id === 'paper-5' 
                      ? 'border-[#0062FF]/40 shadow-[0_0_20px_rgba(0,98,255,0.05)]' 
                      : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Left Column: Metadata & Contents */}
                  <div className="flex-1">
                    
                    {/* Badge row */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-[10px] font-mono tracking-widest text-[#0062FF] uppercase font-bold">{paper.category}</span>
                      
                      <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        paper.trustLabel === 'Verified Research'
                          ? 'bg-[#00FF00]/10 border-[#00FF00]/25 text-[#00FF00]'
                          : 'bg-[#00F0FF]/10 border-[#00F0FF]/25 text-[#00F0FF]'
                      }`}>
                        {paper.trustLabel === 'Verified Research' ? <CheckCircle size={10} /> : <ShieldAlert size={10} />}
                        <span>{paper.trustLabel}</span>
                      </div>

                      {paper.peerReviewed && (
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-white/60 tracking-wider uppercase">PEER_REVIEWED</span>
                      )}
                    </div>

                    {/* Paper Title */}
                    <h3 className="text-lg md:text-xl font-extrabold text-white leading-snug hover:text-[#00F0FF] transition-colors mb-3">
                      {paper.title}
                    </h3>

                    {/* Author & date metadata */}
                    <div className="text-xs text-[#A0AEC0] mb-4">
                      <span>By <strong>{paper.author}</strong></span>
                      <span className="mx-2">•</span>
                      <span>{paper.institution}</span>
                      <span className="mx-2">•</span>
                      <span>{paper.country}</span>
                      <span className="mx-2">•</span>
                      <span className="font-mono">{paper.date}</span>
                    </div>

                    {/* Abstract Box */}
                    <div className="bg-black/40 border border-white/5 rounded-lg p-4 font-sans text-xs md:text-sm leading-relaxed text-[#A0AEC0]">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <span className="font-mono font-bold text-[10px] text-[#00F0FF] tracking-widest uppercase">
                          DOCUMENT ABSTRACT {translated ? `[TRANSLATED: ${translated.lang}]` : '[ENGLISH_ORIGINAL]'}
                        </span>
                        
                        {/* Accessibility Controls */}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => readAbstract(paper.id, activeText)}
                            className={`p-1.5 rounded bg-white/5 border hover:bg-white/15 text-white cursor-pointer ${
                              speakingId === paper.id ? 'border-[#00FF00] text-[#00FF00] bg-[#00FF00]/10' : 'border-white/10'
                            }`}
                            title="Listen to abstract"
                          >
                            <Volume2 size={12} />
                          </button>
                          
                          {/* Hindi Translate mock */}
                          <button 
                            onClick={() => simulateTranslation(paper.id, paper.abstract, 'Hindi')}
                            className="px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/15 text-[10px] text-white flex items-center gap-1 cursor-pointer"
                          >
                            <TranslationIcon size={12} />
                            <span>{translatingId === paper.id ? 'Translating...' : 'Hindi'}</span>
                          </button>
                        </div>
                      </div>
                      <p className="whitespace-pre-line text-justify">{activeText}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {paper.tags.map((tag, i) => (
                        <span key={i} className="bg-white/5 px-2.5 py-1 rounded-full text-[10px] font-mono text-[#A0AEC0]">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Actions & Stats */}
                  <div className="md:w-56 shrink-0 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-6 text-right">
                    
                    {/* Stats */}
                    <div className="space-y-2 font-mono text-[10px] text-[#A0AEC0] w-full">
                      <div className="flex justify-between md:block">
                        <span className="md:block text-white/40">CITATIONS</span>
                        <strong className="text-white text-sm font-bold">{paper.citations}</strong>
                      </div>
                      <div className="flex justify-between md:block">
                        <span className="md:block text-white/40">DOWNLOADS</span>
                        <strong className="text-white text-sm font-bold">{paper.downloads.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between md:block">
                        <span className="md:block text-white/40">PEER UPVOTES</span>
                        <strong className="text-[#00FF00] text-sm font-bold">+{paper.likes}</strong>
                      </div>
                    </div>

                    {/* Button actions */}
                    <div className="w-full space-y-3 mt-6">
                      
                      {paper.id === 'paper-5' ? (
                        <a 
                          href="/report.html" 
                          target="_blank"
                          className="w-full block bg-[#0062FF] hover:bg-[#0056e0] text-center text-white py-2.5 rounded text-xs font-bold tracking-wider uppercase transition-all shadow-[0_4px_12px_rgba(0,98,255,0.2)]"
                        >
                          Read exposé
                        </a>
                      ) : (
                        <a 
                          href="/research/paper-1"
                          className="w-full block bg-[#0a0f1e] border border-[#0062FF]/50 hover:bg-[#0062FF]/10 text-center text-white py-2.5 rounded text-xs font-bold tracking-wider uppercase transition-all"
                        >
                          OPEN WORKSPACE
                        </a>
                      )}

                      <a 
                        href="/report.pdf" 
                        download={`${paper.title.replace(/\s+/g, '_')}.pdf`}
                        className="w-full flex items-center justify-center gap-1.5 border border-white/10 hover:bg-white/5 text-white py-2 rounded text-xs font-bold uppercase transition-all cursor-pointer"
                      >
                        <Download size={12} />
                        <span>DOWNLOAD PDF</span>
                      </a>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
