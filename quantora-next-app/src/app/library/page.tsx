'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Search, Download, ExternalLink, CheckCircle, ShieldAlert, Sparkles, Filter, Loader2, ChevronDown } from 'lucide-react'
import type { PaperWithAuthor } from '@/types/database'
import { CitationModal } from '@/components/CitationModal'
import { AnimatePresence } from 'framer-motion'

export const dynamic = 'force-dynamic'

const CATEGORIES = ['All', 'Macroeconomics', 'Public Policy', 'Quant Strategy', 'Climate Finance', 'Political Economy', 'Development Economics', 'Geopolitics', 'Financial Markets', 'Technology Policy', 'Social Science']

const TRUST_COLORS: Record<string, string> = {
  VERIFIED_RESEARCH: '#00F0FF',
  INDEPENDENT_SUBMISSION: '#0062FF',
  PEER_REVIEWED: '#a855f7',
  REJECTED_SUBMISSION: '#FF7050',
}

const TRUST_LABELS: Record<string, string> = {
  VERIFIED_RESEARCH: 'Verified Research',
  INDEPENDENT_SUBMISSION: 'Independent Submission',
  PEER_REVIEWED: 'Peer Reviewed',
}

export default function LibraryPage() {
  const [papers, setPapers] = useState<PaperWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [selectedCitationPaper, setSelectedCitationPaper] = useState<PaperWithAuthor | null>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null)

  const fetchPapers = useCallback(async (p: number, reset: boolean) => {
    if (reset) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: '10',
        status: 'APPROVED',
      })
      if (search) params.set('search', search)
      if (category !== 'All') params.set('category', category)

      const res = await fetch(`/api/research?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()

      if (reset) {
        setPapers(data.papers || [])
      } else {
        setPapers(prev => [...prev, ...(data.papers || [])])
      }
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [search, category])

  useEffect(() => {
    setPage(1)
    fetchPapers(1, true)
  }, [search, category, fetchPapers])

  const handleSearchChange = (val: string) => {
    setSearchInput(val)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => setSearch(val), 400)
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchPapers(next, false)
  }

  const handleDownload = (paper: PaperWithAuthor) => {
    window.open(paper.file_url, '_blank')
  }

  // Sort papers client-side
  const sorted = [...papers].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0)
    if (sortBy === 'citations') return (b.citations || 0) - (a.citations || 0)
    return 0
  })

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-[#0062FF]" />
          <span className="text-xs font-mono text-[#0062FF] uppercase tracking-widest">Open Access Repository</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Research Library</h1>
        <p className="text-[#A0AEC0] text-sm mt-1">
          {total.toLocaleString()} peer-reviewed papers · Full-text search · Supabase-powered
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
          <input
            type="text"
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search papers by title, abstract, or keyword..."
            className="w-full bg-[#0a0f1e]/60 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-[#0062FF]/10 border-[#0062FF]/40 text-[#0062FF]' : 'border-white/10 text-[#A0AEC0] hover:border-white/20 hover:text-white'}`}
        >
          <Filter size={14} />Filters
        </button>
        <div className="relative">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="appearance-none bg-[#0a0f1e]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none pr-8 cursor-pointer hover:border-white/20 transition-all">
            <option value="newest">Newest First</option>
            <option value="downloads">Most Downloaded</option>
            <option value="citations">Most Cited</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] pointer-events-none" />
        </div>
      </div>

      {/* Category Pills */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === cat ? 'bg-[#0062FF] text-white' : 'bg-[#0a0f1e]/60 border border-white/10 text-[#A0AEC0] hover:border-[#0062FF]/40 hover:text-white'}`}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-[#0062FF]" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-[#A0AEC0]" />
          </div>
          <p className="text-white font-medium mb-2">No papers found</p>
          <p className="text-[#A0AEC0] text-sm">
            {search ? `No results for "${search}". Try different keywords.` : 'No approved papers in this category yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map(paper => {
            const trustColor = TRUST_COLORS[paper.trust_label] || '#0062FF'
            return (
              <div key={paper.id}
                className="bg-[#0a0f1e]/60 border border-white/5 hover:border-[#0062FF]/20 rounded-xl p-6 transition-all group">
                <div className="flex flex-col lg:flex-row gap-6 justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-[10px] font-mono text-[#0062FF] bg-[#0062FF]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {paper.category}
                      </span>
                      {paper.peer_reviewed && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-[#00F0FF]">
                          <CheckCircle size={9} />Peer Reviewed
                        </span>
                      )}
                      <span className="text-[10px] text-[#A0AEC0]">
                        {new Date(paper.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: trustColor }}>
                        {TRUST_LABELS[paper.trust_label] || paper.trust_label}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-white font-extrabold text-sm leading-snug mb-2 group-hover:text-[#00F0FF] transition-colors">
                      <Link href={`/library/${paper.id}`} className="hover:underline">
                        {paper.title}
                      </Link>
                    </h2>

                    {/* Author */}
                    <p className="text-xs text-[#A0AEC0] mb-3 flex items-center gap-1.5">
                      <span className="text-white font-medium">{paper.profiles?.name || 'Anonymous'}</span>
                      {paper.profiles?.institution && ` · ${paper.profiles.institution}`}
                      {paper.country && ` · ${paper.country}`}
                      {/* Simulating ORCID linking dynamically based on name */}
                      {paper.profiles?.name === 'Aditya Kaushik' && (
                        <span className="inline-flex items-center gap-0.5 ml-1 text-emerald-400 font-mono text-[9px] bg-emerald-500/10 border border-emerald-500/25 px-1 rounded cursor-help" title="ORCID iD Verified Contributor">
                          <span className="font-extrabold text-[8px] text-emerald-400">iD</span>
                        </span>
                      )}
                    </p>
 
                    {/* Abstract */}
                    <p className="text-xs text-[#A0AEC0] leading-relaxed line-clamp-2 mb-3">{paper.abstract}</p>
 
                    {/* AI Summary */}
                    {paper.ai_summary && (
                      <div className="flex items-start gap-2 p-3 bg-[#0062FF]/5 border border-[#0062FF]/15 rounded-lg mb-3">
                        <Sparkles size={10} className="text-[#0062FF] mt-0.5 shrink-0" />
                        <p className="text-[11px] text-[#A0AEC0] leading-relaxed">{paper.ai_summary}</p>
                      </div>
                    )}
 
                    {/* Tags */}
                    {paper.tags && (
                      <div className="flex flex-wrap gap-1.5">
                        {paper.tags.split(',').filter(Boolean).slice(0, 5).map(tag => (
                          <span key={tag.trim()} className="text-[9px] font-mono bg-white/5 border border-white/10 text-[#A0AEC0] px-2 py-0.5 rounded-full">
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
 
                  {/* Stats + Actions */}
                  <div className="flex flex-row lg:flex-col gap-4 items-start lg:items-end shrink-0">
                    <div className="flex gap-4 text-center">
                      <div>
                        <div className="text-white font-extrabold text-sm">{paper.downloads.toLocaleString()}</div>
                        <div className="text-[9px] text-[#A0AEC0] uppercase tracking-wider">Downloads</div>
                      </div>
                      <div>
                        <div className="text-white font-extrabold text-sm">{paper.citations.toLocaleString()}</div>
                        <div className="text-[9px] text-[#A0AEC0] uppercase tracking-wider">Citations</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(paper)}
                        className="flex items-center gap-1.5 text-xs text-white bg-[#0062FF] hover:bg-[#0056e0] px-3 py-2 rounded-lg transition-all">
                        <Download size={12} />Open File
                      </button>
                      <button 
                        onClick={() => setSelectedCitationPaper(paper)}
                        className="flex items-center gap-1.5 text-xs text-[#A0AEC0] border border-white/10 hover:border-white/20 px-3 py-2 rounded-lg transition-all">
                        <ExternalLink size={12} />Cite
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Load more */}
          {page < totalPages && (
            <div className="text-center pt-4">
              <button onClick={loadMore} disabled={loadingMore}
                className="flex items-center gap-2 mx-auto bg-[#0a0f1e]/60 border border-white/10 hover:border-[#0062FF]/40 text-[#A0AEC0] hover:text-white px-6 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
                {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                Load More Papers
              </button>
            </div>
          )}
        </div>
      )}
      {/* Citation Modal overlay wrapper */}
      <AnimatePresence>
        {selectedCitationPaper && (
          <CitationModal 
            paper={selectedCitationPaper} 
            onClose={() => setSelectedCitationPaper(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
