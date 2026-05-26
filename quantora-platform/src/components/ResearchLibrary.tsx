import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BookOpen, Download, ThumbsUp, Bookmark, 
  Share2, Calendar, FileText, Send, ChevronRight, Copy, Check,
  Sparkles, GitFork, Volume2, VolumeX, Globe2, MessageSquare, 
  Star, BrainCircuit, Loader2
} from 'lucide-react';
import { 
  getPapers, upvotePaper, bookmarkPaper, incrementDownloads, 
  addComment, ratePaper, addPaperVersion 
} from '../services/db';
import type { Paper, User as DBUser } from '../services/db';

const ResearchCardSkeleton: React.FC = () => {
  return (
    <div className="glass rounded-xl border border-white/5 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
      {/* Moving Shimmer Bar Overlay */}
      <div className="absolute inset-0 animate-shimmer pointer-events-none" />
      
      <div className="space-y-3 flex-1 min-w-0 w-full animate-pulse">
        {/* Category & Metadata badges skeleton */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="h-4.5 w-24 rounded bg-white/5" />
          <div className="h-4.5 w-20 rounded bg-white/5" />
          <div className="h-3.5 w-16 rounded bg-white/5" />
        </div>

        {/* Title skeleton */}
        <div className="h-5 w-3/4 rounded bg-white/10" />
        
        {/* Abstract snippet skeleton */}
        <div className="space-y-2 pt-1">
          <div className="h-3 w-[95%] rounded bg-white/5" />
          <div className="h-3 w-[80%] rounded bg-white/5" />
        </div>

        {/* Tags row skeleton */}
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          <div className="h-4.5 w-12 rounded bg-white/5" />
          <div className="h-4.5 w-10 rounded bg-white/5" />
          <div className="h-4.5 w-16 rounded bg-white/5" />
        </div>
      </div>

      {/* Actions & Metrics skeleton */}
      <div className="flex md:flex-col justify-between items-end gap-4 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0 shrink-0 select-none animate-pulse">
        <div className="flex gap-4">
          <div className="h-3 w-12 rounded bg-white/5" />
          <div className="h-3 w-12 rounded bg-white/5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="h-8 w-8 rounded bg-white/5" />
          <div className="h-8 w-24 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
};

interface ResearchLibraryProps {
  initialSelectedPaperId?: string | null;
  onClearSelectedPaper: () => void;
  currentUser: DBUser | null;
  openAuth: () => void;
  onFork: (paperId: string) => void;
}

export const ResearchLibrary: React.FC<ResearchLibraryProps> = ({ 
  initialSelectedPaperId, onClearSelectedPaper, currentUser, openAuth, onFork
}) => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [peerReviewedOnly, setPeerReviewedOnly] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  
  // Dual-index Tabs
  const [libraryIndexTab, setLibraryIndexTab] = useState<'VERIFIED' | 'UNREVIEWED'>('VERIFIED');

  // AI Semantic Search
  const [semanticSearchActive, setSemanticSearchActive] = useState(false);
  const [semanticSearching, setSemanticSearching] = useState(false);
  const [semanticMessage, setSemanticMessage] = useState('');

  // Comment inputs
  const [commentText, setCommentText] = useState('');
  
  // Citation Generator state
  const [citationFormat, setCitationFormat] = useState<'APA' | 'MLA' | 'BibTeX'>('APA');
  const [citationCopied, setCitationCopied] = useState(false);
  
  // Share state
  const [shareCopied, setShareCopied] = useState(false);

  // Ratings
  const [userRating, setUserRating] = useState<number>(0);

  // Git Revision committing
  const [commitVersion, setCommitVersion] = useState('');
  const [commitSummary, setCommitSummary] = useState('');
  const [commitSuccess, setCommitSuccess] = useState(false);

  // TTS controls
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Translation matrix state
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<string>('English');
  const [translating, setTranslating] = useState(false);
  const [transMsg, setTransMsg] = useState('');

  // AI Copilot Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadPapers();
  }, []);

  useEffect(() => {
    if (initialSelectedPaperId) {
      const allPapers = getPapers();
      const match = allPapers.find(p => p.id === initialSelectedPaperId);
      if (match) {
        setSelectedPaper(match);
        resetDrawerStates(match);
      }
    }
  }, [initialSelectedPaperId]);

  const loadPapers = () => {
    setPapers(getPapers());
  };

  const resetDrawerStates = (paper: Paper) => {
    setUserRating(0);
    setCommitVersion('');
    setCommitSummary('');
    stopSpeech();
    setTranslatedText(null);
    setActiveLang('English');
    setChatMessages([
      { sender: 'ai', text: `Greetings. I am the Quantora Research Copilot. Ask me any analytical critique about: "${paper.title}"` }
    ]);
  };

  const handleUpvote = (e: React.MouseEvent, paperId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      openAuth();
      return;
    }
    const updated = upvotePaper(paperId, currentUser.id);
    if (updated) {
      loadPapers();
      if (selectedPaper && selectedPaper.id === paperId) {
        setSelectedPaper(updated);
      }
    }
  };

  const handleBookmark = (e: React.MouseEvent, paperId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      openAuth();
      return;
    }
    const updated = bookmarkPaper(paperId, currentUser.id);
    if (updated) {
      loadPapers();
      if (selectedPaper && selectedPaper.id === paperId) {
        setSelectedPaper(updated);
      }
    }
  };

  const handleRating = (rating: number) => {
    if (!currentUser || !selectedPaper) {
      openAuth();
      return;
    }
    setUserRating(rating);
    const updated = ratePaper(selectedPaper.id, rating);
    if (updated) {
      loadPapers();
      setSelectedPaper(updated);
    }
  };

  const handleCommitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedPaper || !commitVersion || !commitSummary) return;

    const updated = addPaperVersion(selectedPaper.id, commitVersion, commitSummary);
    if (updated) {
      loadPapers();
      setSelectedPaper(updated);
      setCommitVersion('');
      setCommitSummary('');
      setCommitSuccess(true);
      setTimeout(() => setCommitSuccess(false), 2500);
    }
  };

  const handleDownload = (paperId: string) => {
    incrementDownloads(paperId);
    loadPapers();
    if (selectedPaper && selectedPaper.id === paperId) {
      setSelectedPaper(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : null);
    }
    
    if (selectedPaper && selectedPaper.fileUrl && selectedPaper.fileUrl !== '#') {
      const element = document.createElement("a");
      element.href = selectedPaper.fileUrl;
      element.download = selectedPaper.fileName;
      element.target = "_blank";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }
    
    // Simulate File Download
    const element = document.createElement("a");
    const file = new Blob(["Mock Institutional PDF Content for Quantora Analytics Research Paper."], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = selectedPaper ? selectedPaper.fileName : "quantora_research.pdf";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuth();
      return;
    }
    if (!commentText.trim() || !selectedPaper) return;
    
    const newComment = addComment(selectedPaper.id, currentUser.name, commentText);
    if (newComment) {
      const allPapers = getPapers();
      const updated = allPapers.find(p => p.id === selectedPaper.id);
      if (updated) {
        setSelectedPaper(updated);
      }
      setCommentText('');
      loadPapers();
    }
  };

  // Text-To-Speech (TTS)
  const startSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechUtteranceRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech Synthesis not supported in this browser.');
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
    } else if (selectedPaper) {
      const speechBody = translatedText || selectedPaper.abstract;
      startSpeech(speechBody);
    }
  };

  // Translate abstract matrix
  const handleTranslate = (lang: string) => {
    if (!selectedPaper) return;
    if (lang === 'English') {
      setTranslatedText(null);
      setActiveLang('English');
      return;
    }

    setTranslating(true);
    setTransMsg('Parsing computational linguistics...');
    
    const messages = [
      'Compiling linguistic lexical matrices...',
      'Translating abstract context anchors...',
      'Rebuilding semantic vectors [SUCCESS]'
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setTransMsg(messages[i]);
        i++;
      } else {
        clearInterval(interval);
        setTranslating(false);
        setActiveLang(lang);
        
        // Mock translated values
        const transTable: { [key: string]: string } = {
          Hindi: `[कृत्रिम अनुवाद]: ${selectedPaper.title} श्रेणी में व्यापक परिणाम प्रस्तुत करता है। NABARD स्वास्थ्य लीक और सूक्ष्म ऋण सूचकांकों से जुड़े कृषि वित्तीय तनाव का यह शोध एक गहरा लेखा परीक्षा है।`,
          Japanese: `[AI 翻訳]: 本研究は、マクロ経済のボラティリティ下における ${selectedPaper.category} の清算経路と構造的変動ストレスを監査するものです。`,
          Spanish: `[Traducción IA]: Esta investigación cuantitativa audita los corredores de volatilidad macroeconómica y las grietas de financiamiento estructural.`,
          German: `[KI-Übersetzung]: Diese quantitative Untersuchung prüft makroökonomische Volatilitätskorridore und strukturierte Liquiditätsengpässe.`
        };
        setTranslatedText(transTable[lang] || `[AI Translated - ${lang}]: Mock lexical translation for paper ${selectedPaper.title}.`);
      }
    }, 400);
  };

  // AI Copilot Chat submission
  const handleChatPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim() || !selectedPaper) return;

    const userMsg = chatPrompt;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatPrompt('');
    setChatLoading(true);

    setTimeout(() => {
      setChatLoading(false);
      let response = '';

      if (userMsg.toLowerCase().includes('findings') || userMsg.toLowerCase().includes('summarize')) {
        response = `Based on my semantic indexing of: "${selectedPaper.title}", the key takeaways are:\n1. Empirically validates critical stress factors in category: ${selectedPaper.category}.\n2. Highlights structural single-points-of-failures within localized regional corridors.\n3. Proposes robust mitigating models based on ${selectedPaper.institution} metrics.`;
      } else if (userMsg.toLowerCase().includes('plagiarism') || userMsg.toLowerCase().includes('original')) {
        response = `Anti-Plagiarism Audit Node NY-HUB confirms an originality matrix of 98.4%. The references tree has been matched successfully against 14,000 science datasets.`;
      } else {
        response = `This sovereign paper outlines highly valuable capital corridors and stress indexes. I suggest reviewing the version history tree or downloading the verified PDF document to inspect the Order Book graph configurations.`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: response }]);
    }, 1200);
  };

  // Handle Search Input with simulated AI Semantic toggle
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    setIsLoading(true);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    
    if (semanticSearchActive && val.length > 2) {
      setSemanticSearching(true);
      setSemanticMessage('Analyzing semantic intent...');
      
      const msgs = [
        'Mapping concept correlation graphs...',
        'Filtering emerging policy clusters...',
        'Matching semantic categories [OK]'
      ];
      
      let i = 0;
      const interval = setInterval(() => {
        if (i < msgs.length) {
          setSemanticMessage(msgs[i]);
          i++;
        } else {
          clearInterval(interval);
          setSemanticSearching(false);
        }
      }, 300);
    }
  };

  // Filters
  const filteredPapers = papers.filter(paper => {
    // 1. Dual Index Filter
    const matchesIndexTab = 
      (libraryIndexTab === 'VERIFIED' && paper.status === 'Approved') ||
      (libraryIndexTab === 'UNREVIEWED' && paper.status === 'Pending Review');

    // 2. Search
    const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          paper.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          paper.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          paper.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // 3. Category
    const matchesCategory = activeCategory === 'ALL' || 
                            paper.category.toUpperCase() === activeCategory.toUpperCase() ||
                            (activeCategory === 'BOOKMARKS' && currentUser && paper.bookmarkedBy.includes(currentUser.id));
                            
    // 4. Peer review
    const matchesPeerReview = !peerReviewedOnly || paper.peerReviewed;

    return matchesIndexTab && matchesSearch && matchesCategory && matchesPeerReview;
  });

  const getCitationText = (paper: Paper) => {
    const year = paper.date.split('-')[0];
    if (citationFormat === 'APA') {
      return `${paper.author} (${year}). ${paper.title}. ${paper.institution || 'Quantora Press'}. Retrieved from Quantora Open Archive.`;
    } else if (citationFormat === 'MLA') {
      return `${paper.author}. "${paper.title}." ${paper.institution || 'Quantora Press'}, ${year}. Quantora Analytics Portal.`;
    } else {
      // BibTeX
      const citationKey = `${paper.author.split(' ').pop()?.toLowerCase() || 'key'}${year}`;
      return `@article{${citationKey},\n  author = {${paper.author}},\n  title = {${paper.title}},\n  institution = {${paper.institution || 'Quantora Press'}},\n  year = {${year}},\n  url = {https://quantora.analytics/research/${paper.id}}\n}`;
    }
  };

  const copyCitation = (paper: Paper) => {
    navigator.clipboard.writeText(getCitationText(paper));
    setCitationCopied(true);
    setTimeout(() => setCitationCopied(false), 2000);
  };

  const handleShare = (paper: Paper) => {
    const shareUrl = `https://quantora.analytics/research/${paper.id}`;
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const categories = [
    'ALL', 'Macroeconomics', 'Quantitative Finance', 'Public Policy', 'Geopolitics', 'Technology Insights', 'BOOKMARKS'
  ];

  return (
    <div className="flex-1 flex overflow-hidden bg-[#020202]">
      
      {/* 1. FILTERING SIDEBAR */}
      <aside className="w-64 border-r border-white/5 bg-[#050505] p-6 hidden md:flex flex-col gap-8 select-none shrink-0">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Library Navigator</span>
          <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Research Fields</span>
          </h3>
        </div>

        <div className="flex flex-col gap-1.5">
          {categories.map(cat => {
            const isSelected = activeCategory === cat;
            if (cat === 'BOOKMARKS' && !currentUser) return null;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 550);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                  isSelected 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <span>{cat === 'BOOKMARKS' ? 'My Saved Bookmarks' : cat}</span>
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all ${
                  isSelected ? 'opacity-100 text-blue-400' : 'text-gray-500'
                }`} />
              </button>
            );
          })}
        </div>

        <div className="h-[1px] w-full bg-white/5" />

        <div className="space-y-4">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Clearance Levels</span>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox"
              checked={peerReviewedOnly}
              onChange={(e) => setPeerReviewedOnly(e.target.checked)}
              className="rounded bg-white/5 border-white/10 text-blue-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-gray-400 group-hover:text-white transition-all font-bold">
              Peer-Reviewed Only
            </span>
          </label>
        </div>
      </aside>

      {/* 2. LIBRARY LISTINGS */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Search header bar */}
        <div className="p-6 border-b border-white/5 bg-[#050505]/30 flex flex-col md:flex-row gap-4 justify-between items-center relative z-20 shrink-0">
          <div className="flex gap-4 items-center w-full max-w-xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-3.5 text-gray-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={semanticSearchActive ? "Enter conceptual search (e.g. money vectors)..." : "Search Title, Keywords, Authors or Abstract..."}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs outline-none focus:border-blue-500 focus:bg-white/10 text-white transition-all font-sans"
              />
            </div>
            
            {/* AI Semantic Search Toggle */}
            <button
              onClick={() => {
                setSemanticSearchActive(!semanticSearchActive);
                setSearchQuery('');
              }}
              className={`px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                semanticSearchActive 
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-md shadow-blue-500/5' 
                  : 'border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${semanticSearchActive ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span>AI Semantic</span>
            </button>
          </div>

          {/* Dual-Category Library Index Toggle */}
          <div className="flex bg-white/5 p-0.5 border border-white/10 rounded-xl shrink-0 font-bold text-xs select-none">
            <button
              onClick={() => {
                setLibraryIndexTab('VERIFIED');
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 550);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                libraryIndexTab === 'VERIFIED' ? 'bg-blue-600 text-white font-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Verified Library
            </button>
            <button
              onClick={() => {
                setLibraryIndexTab('UNREVIEWED');
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 550);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                libraryIndexTab === 'UNREVIEWED' ? 'bg-amber-600 text-white font-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Unreviewed Index
            </button>
          </div>
        </div>

        {/* AI Semantic search simulation status */}
        <AnimatePresence>
          {semanticSearchActive && semanticSearching && (
            <motion.div 
              className="px-6 py-2 bg-blue-600/10 border-b border-blue-500/20 text-[10px] text-blue-400 font-mono flex items-center gap-2"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
              <span>{semanticMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Papers Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {isLoading || semanticSearching ? (
            <div className="grid grid-cols-1 gap-4">
              <ResearchCardSkeleton />
              <ResearchCardSkeleton />
              <ResearchCardSkeleton />
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <FileText className="w-12 h-12 text-gray-600 mb-4 animate-bounce" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Papers Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm font-sans leading-relaxed">
                No documents match the search parameters. Try changing tabs or expanding fields.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPapers.map(paper => (
                <div
                  key={paper.id}
                  onClick={() => {
                    setSelectedPaper(paper);
                    resetDrawerStates(paper);
                  }}
                  className="glass rounded-xl border border-white/5 p-6 hover:border-white/15 transition-all cursor-pointer group flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
                >
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded">
                        {paper.category}
                      </span>
                      {paper.peerReviewed && (
                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          Peer Reviewed
                        </span>
                      )}
                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest border border-amber-500/10 px-1.5 py-0.5 rounded font-mono">
                        {paper.trustLabel || 'Independent Submission'}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{paper.date}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base md:text-lg leading-snug group-hover:text-blue-400 transition-colors truncate">
                      {paper.title}
                    </h3>
                    
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 font-sans">
                      {paper.abstract}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {paper.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-mono text-gray-500 bg-white/2 border border-white/5 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Metrics Column */}
                  <div className="flex md:flex-col justify-between items-end gap-4 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0 shrink-0 select-none">
                    <div className="flex gap-4 text-[10px] font-bold font-mono text-gray-500">
                      <span className="flex items-center gap-1 hover:text-white" onClick={(e) => handleUpvote(e, paper.id)}>
                        <ThumbsUp className={`w-3.5 h-3.5 ${currentUser && paper.upvotedBy.includes(currentUser.id) ? 'text-emerald-400 fill-emerald-500/10' : ''}`} />
                        <span>{paper.likes}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        <span>{paper.downloads}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleBookmark(e, paper.id)}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                          currentUser && paper.bookmarkedBy.includes(currentUser.id) 
                            ? 'border-blue-500/30 bg-blue-600/10 text-blue-400' 
                            : 'border-white/5 hover:border-white/10 text-gray-500 hover:text-white'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button 
                        className="px-4 py-2 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 font-sans"
                      >
                        <span>Clearance</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 3. PAPERS READER DRAWER / MODAL */}
      <AnimatePresence>
        {selectedPaper && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm select-none">
            {/* Backdrop click close */}
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedPaper(null);
                stopSpeech();
                onClearSelectedPaper();
              }}
            />

            <motion.div
              className="relative w-full max-w-3xl h-full bg-[#050505] border-l border-white/10 shadow-2xl flex flex-col z-10 overflow-hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            >
              {/* Drawer header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#070707] shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                    {selectedPaper.category}
                  </span>
                  <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest border border-amber-500/10 px-1.5 py-0.5 rounded font-mono">
                    {selectedPaper.trustLabel || 'Independent Submission'}
                  </span>
                  {selectedPaper.forkedFrom && (
                    <span className="text-[8px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      <span>Forked</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedPaper(null);
                    stopSpeech();
                    onClearSelectedPaper();
                  }}
                  className="px-3 py-1.5 border border-white/5 hover:border-white/15 text-xs text-gray-500 hover:text-white rounded-lg transition-colors font-bold font-mono"
                >
                  ESC [x]
                </button>
              </div>

              {/* Drawer Content Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                
                {/* Title & Metadata */}
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-normal leading-tight text-white">
                    {selectedPaper.title}
                  </h2>
                  <div className="flex flex-wrap gap-y-2 gap-x-6 text-[10px] text-gray-500 font-bold uppercase font-mono">
                    <div>Author: <span className="text-gray-300">{selectedPaper.author}</span></div>
                    <div>Institution: <span className="text-gray-300">{selectedPaper.institution}</span></div>
                    <div>Origin: <span className="text-gray-300">{selectedPaper.country}</span></div>
                    <div>Released: <span className="text-gray-300">{selectedPaper.date}</span></div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap gap-3 py-4 border-t border-b border-white/5 select-none shrink-0">
                  <button
                    onClick={() => handleDownload(selectedPaper.id)}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-md shadow-blue-600/10 font-sans"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF ({selectedPaper.fileSize})</span>
                  </button>
                  
                  <button
                    onClick={(e) => handleUpvote(e, selectedPaper.id)}
                    className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                      currentUser && selectedPaper.upvotedBy.includes(currentUser.id)
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'border-white/5 hover:border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{selectedPaper.likes} Upvotes</span>
                  </button>

                  <button
                    onClick={(e) => handleBookmark(e, selectedPaper.id)}
                    className={`p-3 rounded-xl border transition-all ${
                      currentUser && selectedPaper.bookmarkedBy.includes(currentUser.id)
                        ? 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                        : 'border-white/5 hover:border-white/10 text-gray-500 hover:text-white'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  {/* Fork Research Button */}
                  <button
                    onClick={() => onFork(selectedPaper.id)}
                    className="px-4 py-3 border border-blue-500/20 text-blue-400 hover:bg-blue-600/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                    title="Fork this research branch"
                  >
                    <GitFork className="w-4 h-4" />
                    <span>Fork Branch</span>
                  </button>

                  <button
                    onClick={() => handleShare(selectedPaper)}
                    className="p-3 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white rounded-xl transition-all relative"
                  >
                    {shareCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className={`px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                      chatOpen ? 'bg-purple-600/10 border-purple-500/30 text-purple-400' : 'border-white/5 hover:border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>AI Copilot</span>
                  </button>
                </div>

                {/* Rating Widget */}
                <div className="glass border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block font-mono">Research Quality Rating</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star}
                          onClick={() => handleRating(star)}
                          className={`w-4 h-4 cursor-pointer transition-colors ${
                            star <= (userRating || selectedPaper.averageRating || 0) 
                              ? 'text-amber-500 fill-amber-500/10' 
                              : 'text-gray-600 hover:text-amber-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block font-mono">Average Rating</span>
                    <span className="text-sm font-black text-white font-mono">{selectedPaper.averageRating || '0.0'} / 5.0</span>
                  </div>
                </div>

                {/* Abstract box with Knowledge Accessibility Hub toolbar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">Research Abstract</h4>
                    
                    {/* Accessibility toolbar */}
                    <div className="flex items-center gap-2 select-none">
                      {/* TTS Toggle */}
                      <button
                        onClick={toggleSpeech}
                        className={`p-2 border rounded-lg transition-colors flex items-center justify-center ${
                          isSpeaking 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse' 
                            : 'border-white/5 hover:border-white/10 text-gray-400 hover:text-white'
                        }`}
                        title={isSpeaking ? "Mute Reader" : "Speak Abstract"}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      {/* Multi-language selector */}
                      <div className="relative">
                        <select
                          value={activeLang}
                          onChange={(e) => handleTranslate(e.target.value)}
                          className="bg-white/5 border border-white/10 text-gray-400 rounded-lg px-2.5 py-1.5 text-[10px] font-bold outline-none cursor-pointer hover:border-white/20 transition-all font-mono"
                        >
                          <option value="English" className="bg-[#050505]">EN English</option>
                          <option value="Hindi" className="bg-[#050505]">HI हिन्दी</option>
                          <option value="Japanese" className="bg-[#050505]">JA 日本語</option>
                          <option value="Spanish" className="bg-[#050505]">ES Español</option>
                          <option value="German" className="bg-[#050505]">DE Deutsch</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {translating ? (
                      <motion.div 
                        key="translating"
                        className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl text-xs font-mono text-cyan-400 animate-pulse-glow"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {transMsg}
                      </motion.div>
                    ) : (
                      <motion.p 
                        key={activeLang}
                        className="text-xs md:text-sm text-gray-300 leading-relaxed font-normal bg-white/[0.01] border border-white/5 p-5 rounded-2xl font-sans"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {translatedText || selectedPaper.abstract}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* AI Research Summarizer */}
                <div className="space-y-4 p-6 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-2xl">
                  <div className="flex items-center gap-2 text-blue-400 font-mono">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Quantora AI Summarizer</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedPaper.aiSummary.split('\n').map((line, idx) => (
                      <p key={idx} className="text-xs text-gray-300 leading-relaxed flex gap-2 font-sans">
                        <span>{line}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Research Impact Metrics Gauges */}
                <div className="glass border border-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-gray-400 font-mono">
                    <Globe2 className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Geographical Reach Indices</h4>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2 font-mono text-[10px] select-none text-center">
                    <div className="space-y-1">
                      <span className="text-gray-500 block">ASIA/PACIFIC</span>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400" style={{ width: '45%' }} />
                      </div>
                      <span className="text-xs text-cyan-400 font-black">45.2% CITATION MAPPING</span>
                    </div>

                    <div className="space-y-1 border-l border-r border-white/5">
                      <span className="text-gray-500 block">EUROPE ZONE</span>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '30%' }} />
                      </div>
                      <span className="text-xs text-blue-400 font-black">30.1% IMPACT VECTOR</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-gray-500 block">AMERICAS HUB</span>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: '25%' }} />
                      </div>
                      <span className="text-xs text-purple-400 font-black">24.7% ANCHOR REACH</span>
                    </div>
                  </div>
                </div>

                {/* Git Revision Control ("Git-for-Research") */}
                <div className="glass border border-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-gray-400 font-mono">
                    <div className="flex items-center gap-2">
                      <GitFork className="w-4 h-4 text-blue-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Research Revision Ledger</h4>
                    </div>
                    <span className="text-[9px] font-black text-gray-600">REPOSITORY: SECURE</span>
                  </div>

                  {/* Git history tree */}
                  <div className="space-y-3 font-mono text-[10px] pl-4 border-l border-white/10 relative">
                    {selectedPaper.versions && selectedPaper.versions.map((ver, idx) => (
                      <div key={idx} className="relative space-y-1">
                        {/* Dot indicator */}
                        <div className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-blue-500 border border-black shadow shadow-blue-500" />
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white font-black uppercase">v{ver.version} - {ver.summary}</span>
                          <span className="text-gray-600">{ver.date}</span>
                        </div>
                        <span className="text-gray-500 block">Author signature: {ver.author} [clearance: OK]</span>
                      </div>
                    ))}
                  </div>

                  {/* Add revision form */}
                  {currentUser && selectedPaper.author === currentUser.name && (
                    <form onSubmit={handleCommitRevision} className="space-y-3 border-t border-white/5 pt-4">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block font-mono">Commit New Revision Version</span>
                      
                      {commitSuccess ? (
                        <div className="py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-emerald-400 text-xs font-bold font-mono">
                          Revision Ledger Committed Successfully!
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            required
                            placeholder="Version (e.g. 1.2.0)"
                            value={commitVersion}
                            onChange={(e) => setCommitVersion(e.target.value)}
                            className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
                          />
                          <input 
                            type="text" 
                            required
                            placeholder="Revision summary (e.g. Added agricultural vectors)"
                            value={commitSummary}
                            onChange={(e) => setCommitSummary(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shrink-0 transition-colors font-mono"
                          >
                            Commit
                          </button>
                        </div>
                      )}
                    </form>
                  )}
                </div>

                {/* Citation Generator */}
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4 shrink-0">
                  <div className="flex justify-between items-center font-mono">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Citation Generator</h4>
                    
                    <div className="flex gap-2 bg-white/5 p-0.5 border border-white/10 rounded-lg">
                      {['APA', 'MLA', 'BibTeX'].map(f => (
                        <button
                          key={f}
                          onClick={() => setCitationFormat(f as any)}
                          className={`px-2.5 py-1 rounded text-[9px] font-bold ${
                            citationFormat === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <pre className="w-full bg-[#020202] border border-white/5 rounded-xl p-4 text-[10px] text-gray-400 leading-relaxed font-mono whitespace-pre-wrap select-all pr-12">
                      {getCitationText(selectedPaper)}
                    </pre>
                    <button
                      onClick={() => copyCitation(selectedPaper)}
                      className="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
                    >
                      {citationCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* References */}
                {selectedPaper.references && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">Selected References</h4>
                    <p className="text-xs text-gray-500 italic leading-relaxed font-sans">
                      {selectedPaper.references}
                    </p>
                  </div>
                )}

                {/* Comments Forum */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">
                    Intelligence Discussion Forum ({selectedPaper.comments.length})
                  </h4>

                  {/* Comment submit form */}
                  {currentUser ? (
                    <form onSubmit={handleCommentSubmit} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 uppercase text-xs shrink-0 select-none">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          required
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Contribute analytical insight to this thread..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-sans"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 bg-white/2 border border-white/5 rounded-xl text-center font-mono">
                      <span className="text-[11px] text-gray-500">
                        You must be authorized to submit insights.{' '}
                        <button onClick={openAuth} className="text-blue-400 hover:underline font-bold">
                          Authorize Credentials
                        </button>
                      </span>
                    </div>
                  )}

                  {/* Comment list feed */}
                  <div className="space-y-4">
                    {selectedPaper.comments.length === 0 ? (
                      <p className="text-xs text-gray-500 italic p-4 border border-dashed border-white/5 rounded-xl text-center font-sans">
                        No community critiques published on this research. Be the first to analyze.
                      </p>
                    ) : (
                      selectedPaper.comments.map(c => (
                        <div key={c.id} className="flex gap-3 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-gray-400 uppercase select-none">
                            {c.author.charAt(0)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-white">{c.author}</span>
                              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                Rep: {c.reputation}
                              </span>
                              <span className="text-[9px] font-mono text-gray-600">{c.timestamp}</span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed font-normal font-sans">{c.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. AI RESEARCH COPILOT CHAT PANEL (SLIDES FROM BOTTOM/SIDE) */}
      <AnimatePresence>
        {chatOpen && selectedPaper && (
          <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-[#07070a]/95 backdrop-blur border border-purple-500/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[500px]">
            <div className="p-4 border-b border-white/5 bg-[#0a0a0f] flex justify-between items-center select-none shrink-0 font-mono">
              <div className="flex items-center gap-2 text-purple-400">
                <BrainCircuit className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Research Copilot chat</span>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-xs font-black text-gray-500 hover:text-white"
              >
                [x]
              </button>
            </div>

            {/* Messages feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs max-h-[350px]">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white/5 border border-white/5 text-gray-300 rounded-bl-none'
                  }`}>
                    {msg.text.split('\n').map((line, lidx) => (
                      <p key={lidx}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing vectors...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleChatPromptSubmit} className="p-4 border-t border-white/5 bg-[#0a0a0f] flex gap-2 shrink-0 select-none">
              <input
                type="text"
                required
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                placeholder="Ask paper summarize, credentials, check plagiarism..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-purple-500 transition-all font-sans"
              />
              <button
                type="submit"
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
