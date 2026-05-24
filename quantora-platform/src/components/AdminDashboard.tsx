import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, FileText, Users, Download, 
  Activity, AlertCircle, Edit3, Trash2, ArrowUpRight, Save, Clock 
} from 'lucide-react';
import { 
  getPapers, updatePaperStatus, updatePaperMetadata, 
  deletePaper, getAllUsers 
} from '../services/db';
import type { Paper, User as DBUser } from '../services/db';

interface AdminDashboardProps {
  currentUser: DBUser | null;
  openAuth: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, openAuth }) => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [users, setUsers] = useState<DBUser[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'MODERATION' | 'ANALYTICS'>('MODERATION');
  
  // Editing state for paper metadata in admin panel
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAbstract, setEditAbstract] = useState('');
  const [editTags, setEditTags] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPapers(getPapers());
    setUsers(getAllUsers());
  };

  const handleStatusChange = (id: string, status: 'Approved' | 'Rejected') => {
    const updated = updatePaperStatus(id, status);
    if (updated) {
      loadData();
      alert(`Paper "${updated.title}" successfully ${status.toLowerCase()}!`);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to purge this submission from the secure archive?")) {
      const success = deletePaper(id);
      if (success) {
        loadData();
      }
    }
  };

  const handleEditClick = (paper: Paper) => {
    setEditingPaper(paper);
    setEditTitle(paper.title);
    setEditAbstract(paper.abstract);
    setEditTags(paper.tags.join(', '));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaper) return;

    const tags = editTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const updated = updatePaperMetadata(editingPaper.id, {
      title: editTitle,
      abstract: editAbstract,
      tags: tags.length > 0 ? tags : editingPaper.tags
    });

    if (updated) {
      loadData();
      setEditingPaper(null);
      alert('Manuscript metadata successfully updated.');
    }
  };

  const pendingPapers = papers.filter(p => p.status === 'Pending Review');
  const approvedPapers = papers.filter(p => p.status === 'Approved');

  // SVG Chart Mock Data - Visitor Traffic (24 hours)
  const trafficDataPoints = [120, 150, 180, 140, 160, 210, 240, 270, 260, 310, 340, 290, 310, 350, 420, 380, 410, 430, 480, 520, 490, 460, 390, 310];
  const maxTraffic = Math.max(...trafficDataPoints);
  const minTraffic = Math.min(...trafficDataPoints);

  const getSvgPath = () => {
    const width = 600;
    const height = 150;
    const padding = 20;
    const pointsCount = trafficDataPoints.length;
    const stepX = (width - padding * 2) / (pointsCount - 1);
    
    return trafficDataPoints.map((val, idx) => {
      const x = padding + idx * stepX;
      // invert scale since SVG y is top-down
      const y = height - padding - ((val - minTraffic) / (maxTraffic - minTraffic)) * (height - padding * 2);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#020202]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
        <h3 className="text-lg font-black uppercase text-white tracking-widest">Unauthorized Access</h3>
        <p className="text-xs text-gray-500 mt-2 max-w-sm leading-relaxed">
          The Admin workstation is restricted to Authorized Editorial Directors. Please request credentials to connect.
        </p>
        <button
          onClick={openAuth}
          className="mt-6 px-6 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Authorize clearance
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#020202]">
      
      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-white/5 bg-[#050505] p-6 hidden md:flex flex-col gap-6 select-none">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Editor Workstation</span>
          <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400" />
            <span>Admin Console</span>
          </h3>
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setActiveSubTab('MODERATION')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
              activeSubTab === 'MODERATION' 
                ? 'bg-red-600/10 text-red-400 border border-red-500/20 shadow-inner' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <span>Moderation Queue</span>
            {pendingPapers.length > 0 && (
              <span className="bg-red-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-black shrink-0">
                {pendingPapers.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveSubTab('ANALYTICS')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
              activeSubTab === 'ANALYTICS' 
                ? 'bg-red-600/10 text-red-400 border border-red-500/20 shadow-inner' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <span>Platform Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-gray-500" />
          </button>
        </div>
      </aside>

      {/* Main panel area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-[#050505]/30 flex justify-between items-center relative z-20">
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest text-white">
              {activeSubTab === 'MODERATION' ? 'Manuscript Moderation Console' : 'Operational System Analytics'}
            </h2>
            <p className="text-[10px] text-gray-500 uppercase mt-0.5 tracking-wider font-mono">
              Cleared as: {currentUser.name} | Integrity Index: 100% [Clearance: OK]
            </p>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <AnimatePresence mode="wait">
            
            {/* 1. MODERATION QUEUE TAB */}
            {activeSubTab === 'MODERATION' && (
              <motion.div 
                key="moderation"
                className="space-y-6"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                {pendingPapers.length === 0 ? (
                  <div className="glass border border-white/5 p-12 text-center rounded-2xl">
                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">Queue Clear</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">All global research manuscripts have been thoroughly audited, compiled, and indexed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPapers.map(paper => (
                      <div key={paper.id} className="glass rounded-xl border border-red-500/10 p-6 flex flex-col gap-6 relative overflow-hidden">
                        
                        {/* Ambient alert line */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-600/30" />
                        
                        <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                                {paper.category}
                              </span>
                              <span className="text-[9px] text-gray-500 font-mono flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Awaiting audit clearance | Submitted: {paper.date}</span>
                              </span>
                            </div>
                            <h3 className="font-bold text-white text-base md:text-lg">{paper.title}</h3>
                            <p className="text-xs text-gray-400 leading-relaxed font-normal bg-black/40 p-4 rounded-xl border border-white/5">
                              {paper.abstract}
                            </p>
                            <div className="flex flex-wrap gap-4 pt-1.5 text-[10px] text-gray-500 font-bold uppercase">
                              <span>Author: <strong className="text-gray-300">{paper.author}</strong></span>
                              <span>Institution: <strong className="text-gray-300 font-mono">{paper.institution}</strong></span>
                              <span>Country: <strong className="text-gray-300">{paper.country}</strong></span>
                              <span>Payload: <strong className="text-blue-400 font-mono">{paper.fileName} ({paper.fileSize})</strong></span>
                            </div>
                          </div>

                          {/* Control Panel buttons */}
                          <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                            <button
                              onClick={() => handleStatusChange(paper.id, 'Approved')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Clear & Publish</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(paper.id, 'Rejected')}
                              className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject Manuscript</span>
                            </button>
                            <button
                              onClick={() => handleEditClick(paper)}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Edit Metadata</span>
                            </button>
                            <button
                              onClick={() => handleDelete(paper.id)}
                              className="px-4 py-2 hover:bg-red-600/10 text-gray-500 hover:text-red-400 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Purge</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* 2. PLATFORM ANALYTICS TAB */}
            {activeSubTab === 'ANALYTICS' && (
              <motion.div 
                key="analytics"
                className="space-y-8"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                {/* Visual stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass rounded-xl p-6 space-y-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>Global Researchers</span>
                    </span>
                    <div className="text-3xl font-black text-white font-mono">{users.length}</div>
                    <p className="text-[10px] text-emerald-400 font-mono">+12.4% MoM active growth</p>
                  </div>
                  <div className="glass rounded-xl p-6 space-y-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>Published Papers</span>
                    </span>
                    <div className="text-3xl font-black text-white font-mono">{approvedPapers.length}</div>
                    <p className="text-[10px] text-emerald-400 font-mono">100% peer index compiled</p>
                  </div>
                  <div className="glass rounded-xl p-6 space-y-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Download className="w-4 h-4 text-red-400" />
                      <span>Index Downloads</span>
                    </span>
                    <div className="text-3xl font-black text-white font-mono">
                      {papers.reduce((sum, p) => sum + p.downloads, 0)}
                    </div>
                    <p className="text-[10px] text-emerald-400 font-mono">+432 today</p>
                  </div>
                </div>

                {/* SVG Traffic Analytics Chart */}
                <div className="glass rounded-2xl p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-black uppercase text-white tracking-widest">Digital Hub Traffic Trends (24h)</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Dynamic routing metrics across server corridors</p>
                  </div>
                  
                  <div className="w-full bg-[#020202]/60 border border-white/5 rounded-xl p-4 overflow-x-auto scrollbar-hide">
                    <svg viewBox="0 0 600 150" className="w-full h-[150px] filter drop-shadow-[0_0_8px_rgba(239,68,68,0.15)]">
                      {/* Grid Lines */}
                      <line x1="20" y1="20" x2="580" y2="20" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
                      <line x1="20" y1="75" x2="580" y2="75" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
                      <line x1="20" y1="130" x2="580" y2="130" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                      
                      {/* Main Sparkline Path */}
                      <path 
                        d={getSvgPath()} 
                        fill="none" 
                        stroke="#ef4444" 
                        strokeWidth="2.5" 
                      />

                      {/* Area Fill */}
                      <path
                        d={`${getSvgPath()} L 580 130 L 20 130 Z`}
                        fill="url(#traffic-gradient)"
                        opacity="0.08"
                      />

                      {/* Gradients */}
                      <defs>
                        <linearGradient id="traffic-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 uppercase tracking-widest px-2">
                    <span>24h Peak: {maxTraffic} reqs/s</span>
                    <span>Active Gateway: NY-HUB-04</span>
                    <span>24h Min: {minTraffic} reqs/s</span>
                  </div>
                </div>

                {/* Event log activity feed */}
                <div className="glass rounded-xl p-6 space-y-4">
                  <div className="flex gap-2 items-center text-gray-400">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">System Clearing Event logs</h3>
                  </div>

                  <div className="space-y-2.5 font-mono text-[10px] text-gray-500 max-h-[180px] overflow-y-auto pr-2">
                    <div className="flex gap-3 py-1.5 border-b border-white/2"><span className="text-emerald-400">[08:42:15]</span> <span>Security Check [OK] - Plagiarism engine passed for decoupling_debt_cycles_2026.pdf</span></div>
                    <div className="flex gap-3 py-1.5 border-b border-white/2"><span className="text-blue-400">[08:10:42]</span> <span>Indexing completed - Citation matrix mapped for Elena Rostova (Neural Alpha)</span></div>
                    <div className="flex gap-3 py-1.5 border-b border-white/2"><span className="text-amber-500">[07:44:09]</span> <span>Plagiarism Filter - Purged 1 duplicate submission from guest anonymous IP</span></div>
                    <div className="flex gap-3 py-1.5 border-b border-white/2"><span className="text-cyan-400">[06:30:10]</span> <span>Automated Backup [SUCCESS] - Replicated 14.2 GB payload archive to London transit hub</span></div>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* 3. METADATA EDITOR POPUP MODAL */}
      <AnimatePresence>
        {editingPaper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPaper(null)}
            />
            
            <motion.div
              className="relative w-full max-w-2xl bg-[#050505] border border-white/10 p-8 rounded-2xl shadow-2xl z-10 space-y-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div>
                <h3 className="text-sm font-black uppercase text-white tracking-widest">Audit Manuscript Metadata</h3>
                <p className="text-[10px] text-gray-500 uppercase mt-0.5 font-mono">Draft Editing: {editingPaper.id}</p>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Manuscript Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-red-500 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Abstract (Executive Summary)</label>
                  <textarea
                    required
                    rows={5}
                    value={editAbstract}
                    onChange={(e) => setEditAbstract(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-red-500 leading-relaxed font-normal"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Keywords / Tags (Comma Separated)</label>
                  <input
                    type="text"
                    required
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingPaper(null)}
                    className="px-5 py-2.5 border border-white/5 hover:border-white/10 text-xs font-black uppercase text-gray-500 hover:text-white rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
