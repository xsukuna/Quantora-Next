import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BookOpen, Download, ThumbsUp, Bookmark, 
  Share2, Calendar, FileText, Send, User, ChevronRight, Copy, Check 
} from 'lucide-react';
import { 
  getPapers, upvotePaper, bookmarkPaper, incrementDownloads, 
  addComment 
} from '../services/db';
import type { Paper, User as DBUser } from '../services/db';


interface ResearchLibraryProps {
  initialSelectedPaperId?: string | null;
  onClearSelectedPaper: () => void;
  currentUser: DBUser | null;
  openAuth: () => void;
}

export const ResearchLibrary: React.FC<ResearchLibraryProps> = ({ 
  initialSelectedPaperId, onClearSelectedPaper, currentUser, openAuth 
}) => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [peerReviewedOnly, setPeerReviewedOnly] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  
  // Comment inputs
  const [commentText, setCommentText] = useState('');
  
  // Citation Generator state
  const [citationFormat, setCitationFormat] = useState<'APA' | 'MLA' | 'BibTeX'>('APA');
  const [citationCopied, setCitationCopied] = useState(false);
  
  // Share state
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    loadPapers();
  }, []);

  useEffect(() => {
    if (initialSelectedPaperId) {
      const allPapers = getPapers();
      const match = allPapers.find(p => p.id === initialSelectedPaperId);
      if (match) {
        setSelectedPaper(match);
      }
    }
  }, [initialSelectedPaperId]);

  const loadPapers = () => {
    setPapers(getPapers().filter(p => p.status === 'Approved'));
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

  // Autocomplete Suggestions
  const suggestions = papers
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 2)
    .slice(0, 4);

  // Filters
  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          paper.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          paper.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          paper.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'ALL' || 
                            paper.category.toUpperCase() === activeCategory.toUpperCase() ||
                            (activeCategory === 'BOOKMARKS' && currentUser && paper.bookmarkedBy.includes(currentUser.id));
                            
    const matchesPeerReview = !peerReviewedOnly || paper.peerReviewed;

    return matchesSearch && matchesCategory && matchesPeerReview;
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
      <aside className="w-64 border-r border-white/5 bg-[#050505] p-6 hidden md:flex flex-col gap-8 select-none">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Library Navigator</span>
          <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Research Fields</span>
          </h3>
        </div>

        <div className="flex flex-col gap-1.5">
          {categories.map(cat => {
            const isSelected = activeCategory === cat;
            if (cat === 'BOOKMARKS' && !currentUser) return null; // hide bookmarks if not authenticated
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
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
        <div className="p-6 border-b border-white/5 bg-[#050505]/30 flex flex-col md:flex-row gap-4 justify-between items-center relative z-20">
          <div className="relative w-full max-w-xl">
            <div className="absolute left-4 top-3.5 text-gray-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by Title, Keywords, Authors or Abstract..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs outline-none focus:border-blue-500 focus:bg-white/10 text-white transition-all"
            />
            
            {/* Autocomplete autocomplete popover */}
            <AnimatePresence>
              {searchQuery.length > 2 && suggestions.length > 0 && (
                <motion.div 
                  className="absolute left-0 right-0 top-full mt-2 bg-[#0A0F1E] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <div className="px-4 py-2 border-b border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    Suggested Research matches
                  </div>
                  {suggestions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedPaper(s);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center justify-between text-xs font-bold text-gray-300 hover:text-white transition-colors"
                    >
                      <span className="truncate pr-4">{s.title}</span>
                      <span className="text-[9px] uppercase text-blue-400 font-mono shrink-0">{s.category}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2 text-xs text-gray-400 shrink-0 font-bold font-mono">
            Showing <span className="text-white">{filteredPapers.length}</span> papers
          </div>
        </div>

        {/* Papers Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {filteredPapers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <FileText className="w-12 h-12 text-gray-600 mb-4 animate-bounce" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Clearance Results</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">No research papers match your search parameters. Try expanding your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPapers.map(paper => (
                <div
                  key={paper.id}
                  onClick={() => setSelectedPaper(paper)}
                  className="glass rounded-xl border border-white/5 p-6 hover:border-white/15 transition-all cursor-pointer group flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded">
                        {paper.category}
                      </span>
                      {paper.peerReviewed && (
                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          Peer Reviewed
                        </span>
                      )}
                      <span className="text-[9px] text-gray-500 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{paper.date}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base md:text-lg leading-snug group-hover:text-blue-400 transition-colors">
                      {paper.title}
                    </h3>
                    
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 md:line-clamp-3">
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

                  {/* Actions & Metrics column */}
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
                        className="px-4 py-2 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
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
          <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
            {/* Backdrop click to close */}
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedPaper(null);
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
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#070707]">
                <div className="flex items-center gap-2.5">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                    {selectedPaper.category}
                  </span>
                  {selectedPaper.peerReviewed && (
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      PEER REVIEWED CLEARANCE
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedPaper(null);
                    onClearSelectedPaper();
                  }}
                  className="px-3 py-1.5 border border-white/5 hover:border-white/15 text-xs text-gray-500 hover:text-white rounded-lg transition-colors font-bold"
                >
                  ESC [x]
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                
                {/* Title and metadata */}
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-normal leading-tight text-white">
                    {selectedPaper.title}
                  </h2>
                  <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-gray-500 font-bold uppercase">
                    <div>
                      Author: <span className="text-gray-300">{selectedPaper.author}</span>
                    </div>
                    <div>
                      Institution: <span className="text-gray-300 font-mono">{selectedPaper.institution}</span>
                    </div>
                    <div>
                      Origin: <span className="text-gray-300">{selectedPaper.country}</span>
                    </div>
                    <div>
                      Released: <span className="text-gray-300 font-mono">{selectedPaper.date}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap gap-3 py-4 border-t border-b border-white/5">
                  <button
                    onClick={() => handleDownload(selectedPaper.id)}
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-blue-600/25"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Clearance ({selectedPaper.fileSize})</span>
                  </button>
                  
                  <button
                    onClick={(e) => handleUpvote(e, selectedPaper.id)}
                    className={`px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
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
                    className={`p-3.5 rounded-xl border transition-all ${
                      currentUser && selectedPaper.bookmarkedBy.includes(currentUser.id)
                        ? 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                        : 'border-white/5 hover:border-white/10 text-gray-500 hover:text-white'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleShare(selectedPaper)}
                    className="p-3.5 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white rounded-xl transition-all relative"
                  >
                    {shareCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    {shareCopied && (
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0A0F1E] border border-white/10 px-2 py-1 rounded text-[8px] text-emerald-400 font-mono whitespace-nowrap">
                        Link Copied!
                      </span>
                    )}
                  </button>
                </div>

                {/* Abstract box */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Research Abstract</h4>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-normal bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
                    {selectedPaper.abstract}
                  </p>
                </div>

                {/* AI Research Summarizer */}
                <div className="space-y-4 p-6 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-2xl">
                  <div className="flex items-center gap-2 text-blue-400">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Quantora AI Summarizer</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedPaper.aiSummary.split('\n').map((line, idx) => (
                      <p key={idx} className="text-xs text-gray-300 leading-relaxed flex gap-2">
                        <span>{line}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Citation Generator */}
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
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
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selected References</h4>
                    <p className="text-xs text-gray-500 italic leading-relaxed">
                      {selectedPaper.references}
                    </p>
                  </div>
                )}

                {/* Real-time Comments forum */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Intelligence Discussion Forum ({selectedPaper.comments.length})
                  </h4>

                  {/* Comment submit form */}
                  {currentUser ? (
                    <form onSubmit={handleCommentSubmit} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          required
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Contribute analytical insight to this thread..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 bg-white/2 border border-white/5 rounded-xl text-center">
                      <span className="text-[11px] text-gray-500">
                        You must be authorized to submit insights.{' '}
                        <button onClick={openAuth} className="text-blue-400 hover:underline font-bold">
                          Authorize Credentials
                        </button>
                      </span>
                    </div>
                  )}

                  {/* Comment Feed list */}
                  <div className="space-y-4">
                    {selectedPaper.comments.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No community critiques published on this research. Be the first to analyze.</p>
                    ) : (
                      selectedPaper.comments.map(c => (
                        <div key={c.id} className="flex gap-3 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-white">{c.author}</span>
                              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                Rep: {c.reputation}
                              </span>
                              <span className="text-[9px] font-mono text-gray-600">{c.timestamp}</span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed font-normal">{c.text}</p>
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

    </div>
  );
};
