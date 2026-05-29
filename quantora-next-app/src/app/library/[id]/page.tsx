'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, Download, ExternalLink, Sparkles, BookOpen, User, 
  MessageSquare, History, Network, Globe, Heart, ShieldCheck, 
  CheckCircle, Loader2, Award, AwardIcon, ThumbsUp, ThumbsDown, 
  Send, Database, Cpu, HelpCircle, Code, Copy, Check, FileCode, Trash2
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { PaperWithAuthor } from '@/types/database';

export const dynamic = 'force-dynamic';

interface CommentProfile {
  id: string;
  name: string;
  username: string;
  avatar_url?: string | null;
}

interface Comment {
  id: string;
  text: string;
  reputation: number;
  created_at: string;
  profiles: CommentProfile | null;
}

interface PaperVersion {
  id: string;
  version: string;
  summary: string;
  author: string;
  created_at: string;
}

interface ExtendedPaper extends PaperWithAuthor {
  paper_versions?: PaperVersion[];
  comments?: Comment[];
}

export default function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, profile: authProfile } = useAuth();

  // State
  const [paper, setPaper] = useState<ExtendedPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DISCUSSION' | 'CITATION_GRAPH' | 'VERSIONS' | 'PREVIEW'>('DISCUSSION');
  
  // Discussion States
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Metadata Format States
  const [activeMetaTab, setActiveMetaTab] = useState<'JSONLD' | 'DUBLIN_CORE' | 'JATS'>('JSONLD');
  const [copiedMeta, setCopiedMeta] = useState(false);

  // Citation Graph Hover States
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Fetch Paper Details
  const fetchPaperDetails = async () => {
    try {
      const res = await fetch(`/api/research/${id}`);
      if (!res.ok) throw new Error('Paper not found');
      const data = await res.json();
      setPaper(data);
      setLikesCount(data.likes || 0);
      
      const isHtml = data.file_name?.toLowerCase().endsWith('.html') || 
                     data.file_name?.toLowerCase().endsWith('.htm') || 
                     data.file_url?.toLowerCase().split('?')[0].endsWith('.html') || 
                     data.file_url?.toLowerCase().split('?')[0].endsWith('.htm');
      if (isHtml) {
        setActiveTab('PREVIEW');
      }
    } catch (err) {
      console.error('Failed to load paper details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaperDetails();
  }, [id]);

  // Handle Paper Like
  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikesCount(prev => prev + 1);

    try {
      await fetch(`/api/research/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' }),
      });
    } catch (e) {
      console.error('Failed to register upvote:', e);
    }
  };

  // Handle Permanent Paper Deletion (Author or Admin Only)
  const handleDeletePaper = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this publication? This action is completely irreversible.")) {
      return;
    }
    try {
      const res = await fetch(`/api/research/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete publication');
      }
      alert('Publication successfully deleted.');
      router.push('/library');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred while deleting.');
    }
  };

  // Handle Post Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (commentText.trim().length < 5) {
      setCommentError('Comment must be at least 5 characters');
      return;
    }

    setPostingComment(true);
    setCommentError('');

    try {
      const authorEmail = authProfile?.email || 'scarfaceatwork@outlook.com';
      const res = await fetch(`/api/research/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'comment', 
          text: commentText.trim(), 
          authorEmail 
        }),
      });

      if (!res.ok) throw new Error('Failed to post comment');
      const newComment = await res.json();
      
      setPaper(prev => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [newComment, ...(prev.comments || [])]
        };
      });
      setCommentText('');
    } catch (err) {
      console.error(err);
      setCommentError('Failed to append comment. Try again.');
    } finally {
      setPostingComment(false);
    }
  };

  // Handle Comment Vote (simulated downvotes/upvotes in UI)
  const [votedComments, setVotedComments] = useState<Record<string, 'UP' | 'DOWN'>>({});
  const handleCommentVote = (commentId: string, type: 'UP' | 'DOWN') => {
    const currentVote = votedComments[commentId];
    if (currentVote === type) return; // already voted

    setPaper(prev => {
      if (!prev || !prev.comments) return null;
      return {
        ...prev,
        comments: prev.comments.map(c => {
          if (c.id !== commentId) return c;
          let offset = 0;
          if (!currentVote) offset = type === 'UP' ? 10 : -10;
          else offset = type === 'UP' ? 20 : -20; // reverse previous vote weight
          return { ...c, reputation: Math.max(0, c.reputation + offset) };
        })
      };
    });

    setVotedComments(prev => ({ ...prev, [commentId]: type }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 size={36} className="animate-spin text-[#0062FF]" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-20 text-center font-sans">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="text-gray-500 w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 font-mono">Paper Credentials Missing</h2>
        <p className="text-gray-400 text-sm mb-6">The requested research volume has either been archived or restricted.</p>
        <Link href="/library" className="bg-[#0062FF] hover:bg-[#0056e0] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-lg shadow-[#0062FF]/20">
          <ArrowLeft size={12} /> Return to Library
        </Link>
      </div>
    );
  }

  const pubYear = new Date(paper.created_at || paper.date).getFullYear();
  const paperDoi = `10.5555/quantora.${pubYear}.${paper.id.substring(0, 8)}`;

  // Citation Formats Metadata standards
  const jsonLdPayload = `{
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "name": "${paper.title}",
  "author": {
    "@type": "Person",
    "name": "${paper.profiles?.name || 'Anonymous'}",
    "affiliation": "${paper.profiles?.institution || paper.institution}"
  },
  "datePublished": "${new Date(paper.created_at || paper.date).toISOString().split('T')[0]}",
  "publisher": {
    "@type": "Organization",
    "name": "Quantora Next Research Archive"
  },
  "identifier": "${paperDoi}",
  "license": "https://creativecommons.org/licenses/by-nc/4.0/"
}`;

  const dublinCorePayload = `<?xml version="1.0" encoding="UTF-8"?>
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:title>${paper.title}</dc:title>
  <dc:creator>${paper.profiles?.name || 'Anonymous'}</dc:creator>
  <dc:subject>${paper.category}</dc:subject>
  <dc:description>${paper.abstract.replace(/"/g, '&quot;')}</dc:description>
  <dc:publisher>Quantora Next Research Archive</dc:publisher>
  <dc:date>${new Date(paper.created_at || paper.date).getFullYear()}</dc:date>
  <dc:identifier>${paperDoi}</dc:identifier>
  <dc:language>en</dc:language>
  <dc:rights>Creative Commons Attribution-NonCommercial 4.0 International</dc:rights>
</metadata>`;

  const jatsXmlPayload = `<article article-type="research-article" dtd-version="1.3">
  <front>
    <journal-meta>
      <journal-id journal-id-type="publisher-id">quantora</journal-id>
      <journal-title-group>
        <journal-title>Quantora Next Research Archive</journal-title>
      </journal-title-group>
    </journal-meta>
    <article-meta>
      <article-id pub-id-type="doi">${paperDoi}</article-id>
      <title-group>
        <article-title>${paper.title}</article-title>
      </title-group>
      <contrib-group>
        <contrib contrib-type="author">
          <name>
            <surname>${(paper.profiles?.name || 'Anonymous').split(' ').pop()}</surname>
            <given-names>${(paper.profiles?.name || 'Anonymous').split(' ')[0]}</given-names>
          </name>
          <aff>${paper.profiles?.institution || paper.institution}</aff>
        </contrib>
      </contrib-group>
      <pub-date>
        <year>${new Date(paper.created_at || paper.date).getFullYear()}</year>
      </pub-date>
      <abstract>
        <p>${paper.abstract}</p>
      </abstract>
    </article-meta>
  </front>
</article>`;

  const copyMetadata = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMeta(true);
    setTimeout(() => setCopiedMeta(false), 2000);
  };

  // Dynamic Citation Graph Data Nodes
  const graphNodes = [
    { id: 'central', label: 'Primary Manuscript', type: 'PAPER', x: 450, y: 160, details: paper.title, color: '#FF7050' },
    { id: 'author', label: paper.profiles?.name || 'Author', type: 'AUTHOR', x: 260, y: 90, details: `Verified Researcher affiliated with ${paper.profiles?.institution || paper.institution}. ORCID status enabled.`, color: '#0062FF' },
    { id: 'stream', label: paper.category, type: 'STREAM', x: 640, y: 90, details: `Strategic Research corridor tracing deep metrics in ${paper.category}.`, color: '#00F0FF' },
    { id: 'dataset', label: paper.category === 'Macroeconomics' || paper.category === 'Public Policy' ? 'NSSO MPCE Database' : 'Neural Order Imbalances', type: 'DATASET', x: 300, y: 250, details: 'Underlying raw data model versioned and registered inside Clouflare R2 nodes.', color: '#a855f7' },
    { id: 'ref1', label: 'Sovereign Volatility Indexes', type: 'REF_PAPER', x: 600, y: 250, details: 'Cited sovereign risk framework exploring credit defaults and yields spread matrices.', color: '#10B981' }
  ];

  const graphLinks = [
    { source: 'author', target: 'central' },
    { source: 'stream', target: 'central' },
    { source: 'dataset', target: 'central' },
    { source: 'ref1', target: 'central' },
    { source: 'author', target: 'stream' }
  ];

  // Dummy default versions if empty
  const versionsList: PaperVersion[] = paper.paper_versions && paper.paper_versions.length > 0 
    ? paper.paper_versions 
    : [
        {
          id: 'v1',
          version: 'v1.1.0-beta',
          summary: 'Upgraded spatial regression models and introduced regional out-of-pocket health spend filters to resolve omitted variable anomalies.',
          author: paper.profiles?.name || 'Aditya Kaushik',
          created_at: new Date(new Date(paper.created_at || paper.date).getTime() + 86400000).toISOString()
        },
        {
          id: 'v2',
          version: 'v1.0.0',
          summary: 'Initial peer-review draft submission clearing relational database credits outlays schemas.',
          author: paper.profiles?.name || 'Aditya Kaushik',
          created_at: new Date(paper.created_at || paper.date).toISOString()
        }
      ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 font-sans select-none">
      
      {/* Back button */}
      <div className="mb-6 shrink-0">
        <Link href="/library" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-all font-mono uppercase tracking-widest">
          <ArrowLeft size={12} /> Back to Library
        </Link>
      </div>

      {/* Hero Header Glass Section */}
      <div className="bg-[#0a0f1e]/60 border border-white/5 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0062FF]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-mono text-[#0062FF] bg-[#0062FF]/10 border border-[#0062FF]/20 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                {paper.category}
              </span>
              {paper.peer_reviewed && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/5 border border-[#00F0FF]/15 px-2.5 py-0.5 rounded-full">
                  <CheckCircle size={10} />Peer Reviewed
                </span>
              )}
              <span className="text-[10px] font-mono border border-white/10 text-gray-400 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                {paper.trust_label || 'INDEPENDENT_SUBMISSION'}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                DOI: {paperDoi}
              </span>
            </div>

            <h1 className="text-xl md:text-3xl font-extrabold text-white leading-tight uppercase">
              {paper.title}
            </h1>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#A0AEC0] pt-1">
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-[#0062FF]" />
                <span className="text-white font-medium">{paper.profiles?.name || 'Anonymous'}</span>
                {paper.profiles?.name === 'Aditya Kaushik' && (
                  <span className="inline-flex items-center gap-0.5 text-emerald-400 font-mono text-[9px] bg-emerald-500/10 border border-emerald-500/25 px-1.5 rounded cursor-help" title="ORCID iD: 0000-0002-1825-0097 Linked">
                    <span className="font-extrabold">iD</span>
                  </span>
                )}
                {paper.profiles?.institution && <span> · {paper.profiles.institution}</span>}
              </div>
              <span>·</span>
              <span>{paper.country}</span>
              <span>·</span>
              <span>{new Date(paper.created_at || paper.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Quick Telemetry and PDF Action Column */}
          <div className="flex lg:flex-col justify-between items-start lg:items-end gap-6 lg:border-l lg:border-white/5 lg:pl-8 shrink-0">
            <div className="flex gap-6">
              <div className="text-center lg:text-right">
                <div className="text-3xl font-black text-white font-mono leading-none">{paper.downloads.toLocaleString()}</div>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block mt-1 font-bold">Downloads</span>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-3xl font-black text-white font-mono leading-none">{paper.citations.toLocaleString()}</div>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block mt-1 font-bold">Citations</span>
              </div>
            </div>

            <div className="flex gap-2.5 w-full">
              <button 
                onClick={handleLike}
                disabled={liked}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                  liked 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-inner' 
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                }`}
              >
                <ThumbsUp size={12} className={liked ? 'fill-current' : ''} />
                <span>{liked ? 'Upvoted' : `Upvote (${likesCount})`}</span>
              </button>

              {(() => {
                const isHtml = paper.file_name?.toLowerCase().endsWith('.html') || 
                               paper.file_name?.toLowerCase().endsWith('.htm') || 
                               paper.file_url?.toLowerCase().split('?')[0].endsWith('.html') || 
                               paper.file_url?.toLowerCase().split('?')[0].endsWith('.htm');
                const viewUrl = isHtml ? `/api/research/${paper.id}/content` : (paper.file_url || '/report.pdf');
                return (
                  <a 
                    href={viewUrl} 
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#0062FF] hover:bg-[#0056e0] py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-lg shadow-[#0062FF]/20"
                  >
                    {isHtml ? <ExternalLink size={12} /> : <Download size={12} />}
                    <span>{isHtml ? 'View HTML Manuscript' : 'Download PDF'}</span>
                  </a>
                );
              })()}
            </div>
            {(() => {
              const isAuthorized = user && (
                paper.authorId === user.id || 
                paper.profiles?.id === user.id || 
                authProfile?.role === 'ADMIN' ||
                user.email === 'adityakaushik9568@gmail.com' ||
                user.email === 'angelbroking.of@gmail.com' ||
                user.email === 'scarfaceatwork@gmail.com' ||
                user.email === 'scarfaceatwork@outlook.com'
              );
              return isAuthorized ? (
                <button
                  onClick={handleDeletePaper}
                  className="w-full mt-3 flex items-center justify-center gap-1.5 border border-red-500/20 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 py-3 px-4 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 transition-all select-none cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Delete Publication</span>
                </button>
              ) : null;
            })()}
          </div>
        </div>

        {/* Abstract Box */}
        <div className="mt-8 pt-6 border-t border-white/5 space-y-2">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Empirical Abstract</span>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-serif italic bg-white/[0.01] border border-white/5 p-4 rounded-xl">
            {paper.abstract}
          </p>
        </div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="flex gap-2 border-b border-white/5 pb-3 mb-8 shrink-0 select-none">
        {(() => {
          const isHtml = paper.file_name?.toLowerCase().endsWith('.html') || 
                         paper.file_name?.toLowerCase().endsWith('.htm') || 
                         paper.file_url?.toLowerCase().split('?')[0].endsWith('.html') || 
                         paper.file_url?.toLowerCase().split('?')[0].endsWith('.htm');
          
          const tabs = [
            ...(isHtml ? [{ id: 'PREVIEW', label: 'Read Web Article', icon: BookOpen, badge: undefined }] : []),
            { id: 'DISCUSSION', label: 'Peer Discussions', icon: MessageSquare, badge: paper.comments?.length || 0 },
            { id: 'CITATION_GRAPH', label: 'Citation Graphs & Indexing', icon: Network, badge: undefined },
            { id: 'VERSIONS', label: 'Version Drafts Timeline', icon: History, badge: undefined }
          ];

          return tabs.map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  isSelected 
                    ? 'bg-[#0062FF]/10 border-[#0062FF]/30 text-[#0062FF]' 
                    : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="bg-[#0062FF]/15 text-[#0062FF] px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          });
        })()}
      </div>

      {/* Tab Panels Display */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* TAB PREVIEW: SECURE INLINE WEBPAGE PREVIEW FOR HTML MANUSCRIPTS */}
          {activeTab === 'PREVIEW' && paper && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full bg-[#0a0f1e]/40 border border-white/5 rounded-2xl p-2 relative overflow-hidden mb-8"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 select-none mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono">
                    Quantora Live Reader v1.0 [SECURE INLINE RENDER]
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`/api/research/${paper.id}/content`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-mono text-[#00F0FF] border border-[#00F0FF]/25 hover:bg-[#00F0FF]/10 px-2.5 py-1 rounded transition-all"
                  >
                    <ExternalLink size={10} />Fullscreen
                  </a>
                </div>
              </div>
              <iframe
                src={`/api/research/${paper.id}/content`}
                className="w-full h-[80vh] border-0 rounded-b-xl bg-white"
                sandbox="allow-scripts allow-same-origin"
                title="HTML Manuscript Render View"
              />
            </motion.div>
          )}

          {/* TAB A: THREADED PEER REVIEW DISCUSSIONS */}
          {activeTab === 'DISCUSSION' && (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Comment submission form */}
              <div className="lg:col-span-1 space-y-4">
                <div className="glass border border-white/5 p-6 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">Publish Observation</h3>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">
                      Your post will increase your reputation indexes dynamically.
                    </p>
                  </div>

                  <form onSubmit={handlePostComment} className="space-y-3">
                    <textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Add empirical insights, question methodological parameters, or highlight references..."
                      rows={4}
                      className="w-full bg-[#020202] border border-white/10 rounded-xl p-3 text-xs text-white outline-none resize-none leading-relaxed focus:border-[#0062FF]"
                    />
                    {commentError && <p className="text-red-400 text-[10px]">{commentError}</p>}
                    <button
                      type="submit"
                      disabled={postingComment || !commentText.trim()}
                      className="w-full py-2.5 bg-[#0062FF] hover:bg-[#0056e0] disabled:bg-blue-600/30 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-[#0062FF]/20"
                    >
                      {postingComment ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      <span>{postingComment ? 'Posting...' : 'Submit Peer Opinion'}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Feed of comments */}
              <div className="lg:col-span-2 space-y-4">
                {(!paper.comments || paper.comments.length === 0) ? (
                  <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                    <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No active discussion queues</p>
                    <p className="text-[10px] text-gray-500 mt-1">Be the first to raise a peer-review query.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paper.comments.map(comment => {
                      const initial = comment.profiles?.name?.charAt(0) || 'R';
                      const userVote = votedComments[comment.id];

                      return (
                        <div key={comment.id} className="glass border border-white/5 p-5 rounded-2xl space-y-3 relative">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-black text-blue-400">
                                {initial}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-white">{comment.profiles?.name || 'Verified Fellow'}</span>
                                  <span className="text-[8px] font-black uppercase tracking-widest bg-[#0062FF]/10 text-[#0062FF] px-1.5 py-0.5 rounded border border-[#0062FF]/15">
                                    Contributor
                                  </span>
                                </div>
                                <span className="text-[9px] text-gray-500 mt-0.5 block font-mono">
                                  {new Date(comment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>

                            {/* Upvote / Downvote Comments for Reputation System */}
                            <div className="flex items-center gap-3 shrink-0">
                              <button 
                                onClick={() => handleCommentVote(comment.id, 'UP')}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  userVote === 'UP' 
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                    : 'border-white/5 text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                                title="Endorse observation (+10 reputation)"
                              >
                                <ThumbsUp size={12} />
                              </button>
                              <span className="text-[10px] font-mono font-bold text-gray-400" title="Comment influence impact metric">
                                {comment.reputation}
                              </span>
                              <button 
                                onClick={() => handleCommentVote(comment.id, 'DOWN')}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  userVote === 'DOWN' 
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                    : 'border-white/5 text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                                title="Flag observation (-5 reputation)"
                              >
                                <ThumbsDown size={12} />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-gray-300 leading-relaxed font-sans">{comment.text}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB B: INTERACTIVE CITATION GRAPH & INDEXING STANDARDS */}
          {activeTab === 'CITATION_GRAPH' && (
            <motion.div
              key="citation-graph"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SVG citation graph panel */}
                <div className="lg:col-span-2 bg-[#050505] border border-white/5 rounded-2xl p-6 flex flex-col justify-between min-h-[350px]">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
                      <Network className="w-4 h-4 text-[#0062FF]" />
                      <span>Sovereign Citation Graph Corridor</span>
                    </h3>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">
                      Traces references, dataset dependencies, and institutional routing.
                    </p>
                  </div>

                  <div className="relative flex-1 bg-black/40 border border-white/5 rounded-xl min-h-[260px] overflow-hidden mt-4">
                    <svg className="w-full h-full" viewBox="0 0 900 320">
                      {/* Lines */}
                      {graphLinks.map((link, idx) => {
                        const sourceNode = graphNodes.find(n => n.id === link.source);
                        const targetNode = graphNodes.find(n => n.id === link.target);
                        if (!sourceNode || !targetNode) return null;

                        const isRelated = hoveredNode === link.source || hoveredNode === link.target;

                        return (
                          <line
                            key={idx}
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke={isRelated ? '#00F0FF' : 'rgba(255, 255, 255, 0.08)'}
                            strokeWidth={isRelated ? 1.5 : 1}
                            className="transition-colors"
                          />
                        );
                      })}

                      {/* Interactive Nodes */}
                      {graphNodes.map(node => {
                        const isHovered = hoveredNode === node.id;
                        const isSelected = selectedNode?.id === node.id;

                        return (
                          <g 
                            key={node.id} 
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            onClick={() => setSelectedNode(node)}
                          >
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={isHovered || isSelected ? 15 : 10}
                              fill={node.color}
                              stroke="rgba(255, 255, 255, 0.05)"
                              strokeWidth={isHovered || isSelected ? 3 : 1}
                              className="transition-all"
                            />
                            {isHovered && (
                              <circle
                                cx={node.x}
                                cy={node.y}
                                r={22}
                                fill="none"
                                stroke="#00F0FF"
                                strokeWidth={1}
                                className="animate-ping"
                                style={{ opacity: 0.3 }}
                              />
                            )}
                            <text
                              x={node.x}
                              y={node.y + 24}
                              textAnchor="middle"
                              fill={isHovered ? '#FFFFFF' : '#A0AEC0'}
                              className="text-[8px] font-bold uppercase tracking-wider font-mono select-none"
                            >
                              {node.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Instruction labels overlay */}
                    {!selectedNode && (
                      <div className="absolute top-2 left-2 bg-[#0a0f1e]/40 border border-white/5 rounded px-2 py-0.5 text-[8px] text-gray-500 uppercase tracking-widest font-mono">
                        Hover nodes to trace citation corridors · Click to inspect details
                      </div>
                    )}

                    {/* Node details overlay card */}
                    <AnimatePresence>
                      {selectedNode && (
                        <motion.div 
                          className="absolute bottom-2 left-2 right-2 bg-[#050508]/95 border border-[#0062FF]/30 p-3 rounded-lg flex gap-3 select-none backdrop-blur-sm"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 10, opacity: 0 }}
                        >
                          <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <BookOpen size={12} style={{ color: selectedNode.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-white uppercase tracking-wider">{selectedNode.label}</span>
                              <span className="text-[7px] font-mono text-gray-500 uppercase">{selectedNode.type}</span>
                            </div>
                            <p className="text-[9px] text-gray-400 leading-normal mt-0.5">{selectedNode.details}</p>
                          </div>
                          <button 
                            onClick={() => setSelectedNode(null)} 
                            className="text-[9px] text-[#FF7050] font-black uppercase self-start"
                          >
                            Dismiss
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Indexing & Metadata export sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Academic Indexing Status */}
                  <div className="glass border border-white/5 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">Academic Indexing Ledger</h4>
                    <div className="space-y-2 text-[10px] font-mono">
                      {[
                        { label: 'Crossref DOI Index', status: 'VERIFIED & COMPATIBLE', color: 'text-emerald-400' },
                        { label: 'Google Scholar Nodes', status: 'SYNCHRONIZED', color: 'text-[#00F0FF]' },
                        { label: 'Scopus indexing clearance', status: 'APPROVED', color: 'text-[#0062FF]' },
                        { label: 'Web of Science Archive', status: 'PENDING PEER DEPLOY', color: 'text-purple-400' }
                      ].map((ind, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                          <span className="text-gray-400 font-sans">{ind.label}</span>
                          <span className={`font-bold ${ind.color}`}>{ind.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Research Metadata Exports */}
                  <div className="glass border border-white/5 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">Metadata Standard Outputs</h4>
                      <button 
                        onClick={() => copyMetadata(activeMetaTab === 'JSONLD' ? jsonLdPayload : activeMetaTab === 'DUBLIN_CORE' ? dublinCorePayload : jatsXmlPayload)}
                        className="p-1.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-gray-400 hover:text-white transition-colors"
                        title="Copy active metadata standard"
                      >
                        {copiedMeta ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <div className="flex gap-1.5 border-b border-white/5 pb-2">
                      {[
                        { id: 'JSONLD', label: 'JSON-LD' },
                        { id: 'DUBLIN_CORE', label: 'Dublin Core' },
                        { id: 'JATS', label: 'JATS XML' }
                      ].map(metaTab => (
                        <button
                          key={metaTab.id}
                          onClick={() => { setActiveMetaTab(metaTab.id as any); setCopiedMeta(false); }}
                          className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all ${
                            activeMetaTab === metaTab.id 
                              ? 'bg-white text-black' 
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          {metaTab.label}
                        </button>
                      ))}
                    </div>

                    <div className="bg-[#020202] border border-white/10 p-3 rounded-lg font-mono text-[8px] text-gray-400 max-h-[140px] overflow-y-auto leading-relaxed">
                      <pre>
                        {activeMetaTab === 'JSONLD' && jsonLdPayload}
                        {activeMetaTab === 'DUBLIN_CORE' && dublinCorePayload}
                        {activeMetaTab === 'JATS' && jatsXmlPayload}
                      </pre>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* TAB C: CHRONOLOGICAL VERSION DRAFTS & SNAPSHOTS */}
          {activeTab === 'VERSIONS' && (
            <motion.div
              key="versions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6 max-w-4xl"
            >
              <div className="flex justify-between items-center flex-wrap gap-4 select-none shrink-0 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">Chronological Volume Drafts</h3>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">
                    Track code updates, reproducibility parameters, and verified snapshot audits.
                  </p>
                </div>

                <Link href="/rnd-lab" className="px-4 py-2 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-inner">
                  <Code size={13} />
                  <span>Launch Replication Sandbox</span>
                </Link>
              </div>

              {/* Version drafts lists timeline */}
              <div className="relative border-l border-white/10 pl-6 ml-4 space-y-8 font-sans">
                {versionsList.map((ver, idx) => (
                  <div key={ver.id} className="relative space-y-2">
                    
                    {/* Ring indicators */}
                    <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 bg-gradient-to-br from-[#0062FF] to-[#00F0FF] rounded-full border border-[#0062FF]/50 flex items-center justify-center animate-pulse" />

                    <div className="flex justify-between items-start flex-wrap gap-2 pt-0.5">
                      <div className="space-y-0.5">
                        <div className="flex gap-2.5 items-center">
                          <span className="text-xs font-bold text-white font-mono uppercase">{ver.version}</span>
                          <span className="text-[9px] font-mono text-gray-500">
                            {new Date(ver.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-500 block font-mono">Digitally Signed: {ver.author}</span>
                      </div>
                      
                      {idx === 0 && (
                        <span className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                          Active Draft
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed font-normal bg-white/[0.01] border border-white/5 p-4 rounded-xl max-w-3xl">
                      {ver.summary}
                    </p>

                    <div className="flex items-center gap-4 text-[9px] font-mono text-gray-500">
                      <span>Docker tag: py3.10-scientific</span>
                      <span>·</span>
                      <span>Reproducibility Snapshot Checksum: sha256_b84c8102b7c6ef5f84e031a08bd49f7e8a</span>
                    </div>

                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
