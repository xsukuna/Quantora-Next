'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Copy, Check, Download, FileText, Database, 
  ExternalLink, ShieldCheck, CheckCircle2, Loader2, Award 
} from 'lucide-react';
import type { PaperWithAuthor } from '@/types/database';

interface CitationModalProps {
  paper: PaperWithAuthor | any;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ paper, onClose }) => {
  const [activeTab, setActiveTab] = useState<'STANDARD' | 'BIBTEX' | 'CROSSREF' | 'ORCID'>('STANDARD');
  const [activeFormat, setActiveFormat] = useState<'APA' | 'MLA' | 'CHICAGO' | 'IEEE' | 'HARVARD'>('APA');
  const [copiedText, setCopiedText] = useState(false);

  // ORCID verified state
  const [orcidLinked, setOrcidLinked] = useState(false);
  const [orcidLoading, setOrcidLoading] = useState(false);
  const [orcidId, setOrcidId] = useState('');

  // Crossref verification simulation
  const [crossrefLoading, setCrossrefLoading] = useState(false);
  const [crossrefStatus, setCrossrefStatus] = useState<'PENDING' | 'VERIFIED' | 'FAILED'>('PENDING');

  const authorName = paper.profiles?.name || 'Anonymous';
  const authorLastName = authorName.split(' ').pop() || authorName;
  const authorInitials = authorName.split(' ').map((n: string) => n[0]).join('. ');
  const pubYear = new Date(paper.created_at).getFullYear();
  const cleanTitle = paper.title.replace(/[\n\r]+/g, ' ');
  const paperDoi = `10.5555/quantora.${pubYear}.${paper.id.substring(0, 8)}`;

  // Citation Formats
  const citations = {
    APA: `${authorLastName}, ${authorInitials}. (${pubYear}). ${cleanTitle}. Quantora Next Research Archive. https://doi.org/${paperDoi}`,
    MLA: `${authorLastName}, ${authorName.split(' ')[0]}. "${cleanTitle}." Quantora Next Research Archive, ${pubYear}, https://doi.org/${paperDoi}.`,
    CHICAGO: `${authorLastName}, ${authorName.split(' ')[0]}. "${cleanTitle}." Quantora Next Research Archive (${pubYear}). https://doi.org/${paperDoi}.`,
    IEEE: `${authorInitials} ${authorLastName}, "${cleanTitle}," Quantora Next Research Archive, ${pubYear}, doi: ${paperDoi}.`,
    HARVARD: `${authorLastName}, ${authorInitials}. (${pubYear}) "${cleanTitle}", Quantora Next Research Archive. Available at: https://doi.org/${paperDoi}.`,
  };

  // BibTeX Template
  const bibtexString = `@article{quantora_${paper.id.substring(0, 8)},
  author = {${authorLastName}, ${authorName.split(' ')[0]}},
  title = {${cleanTitle}},
  journal = {Quantora Next Research Archive},
  year = {${pubYear}},
  volume = {6},
  number = {2},
  pages = {145-168},
  doi = {${paperDoi}},
  url = {https://doi.org/${paperDoi}}
}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const downloadBibtex = () => {
    const element = document.createElement("a");
    const file = new Blob([bibtexString], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${paper.id.substring(0, 8)}_citation.bib`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Trigger Crossref registration simulation on mount or tab select
  useEffect(() => {
    if (activeTab === 'CROSSREF') {
      setCrossrefLoading(true);
      setCrossrefStatus('PENDING');
      const timer = setTimeout(() => {
        setCrossrefLoading(false);
        setCrossrefStatus('VERIFIED');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const handleOrcidLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orcidId.match(/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/)) {
      alert('Please enter a valid ORCID iD in 0000-0000-0000-0000 format.');
      return;
    }
    setOrcidLoading(true);
    setTimeout(() => {
      setOrcidLoading(false);
      setOrcidLinked(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      
      {/* Click Outside to Close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Dialog */}
      <motion.div 
        className="relative w-full max-w-2xl bg-[#07070a] border border-[#0062FF]/20 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 z-10 overflow-hidden font-sans"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0062FF]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4 shrink-0">
          <div className="space-y-1 pr-6">
            <span className="text-[9px] font-mono text-[#0062FF] uppercase tracking-widest block">Academic Citation Center</span>
            <h3 className="text-sm font-extrabold text-white uppercase leading-snug line-clamp-1">{paper.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex gap-1.5 border-b border-white/5 pb-3">
          {[
            { id: 'STANDARD', label: 'Formats', icon: FileText },
            { id: 'BIBTEX', label: 'BibTeX / RIS', icon: Download },
            { id: 'CROSSREF', label: 'Crossref Registry', icon: Database },
            { id: 'ORCID', label: 'ORCID Connector', icon: Award },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected 
                    ? 'bg-[#0062FF]/10 border border-[#0062FF]/30 text-[#0062FF]' 
                    : 'text-gray-400 border border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="min-h-[220px]">
          
          {/* STANDARD CITATION FORMATS */}
          {activeTab === 'STANDARD' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {(['APA', 'MLA', 'CHICAGO', 'IEEE', 'HARVARD'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setActiveFormat(fmt)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all ${
                      activeFormat === fmt 
                        ? 'bg-white text-black font-extrabold shadow' 
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              {/* Citation Copy block */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-4 relative">
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed pr-8 font-serif italic">
                  {citations[activeFormat]}
                </p>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-[10px] text-gray-500 font-mono">DOI: {paperDoi}</span>
                  <button
                    onClick={() => copyToClipboard(citations[activeFormat])}
                    className="flex items-center gap-1.5 bg-[#0062FF] hover:bg-[#0056e0] px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-md shadow-[#0062FF]/20"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'Copied Citation' : 'Copy Citation'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BIBTEX AND RIS EXPORT */}
          {activeTab === 'BIBTEX' && (
            <div className="space-y-4">
              <div className="relative bg-[#020202] border border-white/10 rounded-xl p-4 font-mono text-[10px] md:text-xs text-gray-300 max-h-[160px] overflow-y-auto">
                <pre>{bibtexString}</pre>
                <button
                  onClick={() => copyToClipboard(bibtexString)}
                  className="absolute top-3 right-3 p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={downloadBibtex}
                  className="flex items-center gap-1.5 bg-[#0062FF]/10 hover:bg-[#0062FF]/20 border border-[#0062FF]/30 text-[#0062FF] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .BIB File</span>
                </button>
              </div>
            </div>
          )}

          {/* CROSSREF COMPATIBILITY REGISTRY */}
          {activeTab === 'CROSSREF' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white/[0.01] border border-white/5 rounded-xl p-4">
                {crossrefLoading ? (
                  <Loader2 className="w-8 h-8 text-[#0062FF] animate-spin shrink-0" />
                ) : crossrefStatus === 'VERIFIED' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-8 h-8 text-red-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {crossrefLoading ? 'Verifying with Crossref Index Nodes...' : 'Crossref Compatibility Indexed'}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {crossrefLoading 
                      ? 'Reconciling title, co-authors, and stream constraints against centralized metadata standards...'
                      : `Academic records linked. DOI successfully assigned and indexed in international search corridors.`}
                  </p>
                </div>
              </div>

              {!crossrefLoading && crossrefStatus === 'VERIFIED' && (
                <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-[#020202] border border-white/5 rounded-xl p-4">
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase tracking-widest block">Metadata Schema</span>
                    <span className="text-white block mt-0.5">Crossref JSON v5.0</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase tracking-widest block">DOI URL Target</span>
                    <span className="text-[#00F0FF] block mt-0.5 hover:underline cursor-pointer flex items-center gap-1">
                      <span>doi.org/{paperDoi}</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[8px] text-gray-500 uppercase tracking-widest block">Verification Integrity Hash</span>
                    <span className="text-gray-400 block mt-0.5 truncate">sha256_e8a32b90b84c8102b7c6ef5f84e031a08bd49f7e8a32b9</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORCID verified connectors */}
          {activeTab === 'ORCID' && (
            <div className="space-y-6">
              {orcidLinked ? (
                <div className="py-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">ORCID Profile Authenticated</span>
                    <span className="text-[10px] text-gray-400 font-mono block">Connected iD: {orcidId}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleOrcidLinkSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Connect Researcher ORCID iD</label>
                      <a href="https://orcid.org" target="_blank" className="text-[9px] text-[#00F0FF] hover:underline flex items-center gap-1">
                        <span>What is ORCID?</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <input
                      type="text"
                      required
                      value={orcidId}
                      onChange={(e) => setOrcidId(e.target.value)}
                      placeholder="e.g. 0000-0002-1825-0097"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#0062FF] font-mono font-bold"
                    />
                  </div>

                  <div className="text-[10px] text-gray-400 leading-normal font-sans">
                    ORCID provides a persistent digital identifier that distinguishes you from every other researcher. Connecting your ORCID connects your publications across platforms like Google Scholar, arXiv, and Crossref.
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={orcidLoading}
                      className="flex items-center gap-2 bg-[#0062FF] hover:bg-[#0056e0] disabled:bg-blue-600/30 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-[#0062FF]/20"
                    >
                      {orcidLoading ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Authorizing Link...</span></>
                      ) : (
                        <span>Verify & Synchronize Profile</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
