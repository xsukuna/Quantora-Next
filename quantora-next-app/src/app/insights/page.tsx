'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Heart, MessageSquare, Share2, Send, Tag, Award, Sparkles, Loader2, Plus, X, ChevronDown } from 'lucide-react'
import type { InsightWithAuthor } from '@/types/database'

export const dynamic = 'force-dynamic'

const CATEGORIES = ['All', 'Macroeconomics', 'Public Policy', 'Quant Strategy', 'Climate Finance', 'Geopolitics', 'Financial Markets', 'General']

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function InsightsPage() {
  const { user, profile } = useAuth()
  const [insights, setInsights] = useState<InsightWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [category, setCategory] = useState('All')
  const [showCompose, setShowCompose] = useState(false)
  const [content, setContent] = useState('')
  const [newCategory, setNewCategory] = useState('General')
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchInsights = useCallback(async (p: number, reset: boolean) => {
    try {
      const params = new URLSearchParams({ page: String(p), limit: '15' })
      if (category !== 'All') params.set('category', category)
      const res = await fetch(`/api/insights?${params}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      if (reset) setInsights(data.insights || [])
      else setInsights(prev => [...prev, ...(data.insights || [])])
      setTotalPages(data.totalPages || 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    setLoading(true)
    setPage(1)
    fetchInsights(1, true)
  }, [category, fetchInsights])

  const handleUpvote = async (insightId: string) => {
    if (!user) return
    // Optimistic update
    setInsights(prev => prev.map(ins => {
      if (ins.id !== insightId) return ins
      const wasUpvoted = ins.userHasUpvoted
      return {
        ...ins,
        upvotes_count: wasUpvoted ? ins.upvotes_count - 1 : ins.upvotes_count + 1,
        userHasUpvoted: !wasUpvoted
      }
    }))
    // API call
    await fetch(`/api/insights/${insightId}/upvote`, { method: 'POST' })
  }

  const handleSubmit = async () => {
    if (!user) return
    if (content.trim().length < 20) {
      setError('Insight must be at least 20 characters')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), category: newCategory }),
      })
      if (!res.ok) throw new Error('Failed to post')
      const { insight } = await res.json()
      // Prepend new insight optimistically
      setInsights(prev => [{ ...insight, userHasUpvoted: false }, ...prev])
      setContent('')
      setShowCompose(false)
    } catch (e) {
      setError('Failed to post insight. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-[#0062FF]" />
            <span className="text-xs font-mono text-[#0062FF] uppercase tracking-widest">Research Network</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Research Insights</h1>
          <p className="text-[#A0AEC0] text-sm mt-1">Short-form insights from the global research community</p>
        </div>
        {user && (
          <button onClick={() => setShowCompose(!showCompose)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${showCompose ? 'bg-white/5 border border-white/10 text-[#A0AEC0]' : 'bg-[#0062FF] text-white shadow-[0_4px_20px_rgba(0,98,255,0.4)]'}`}>
            {showCompose ? <><X size={14} />Cancel</> : <><Plus size={14} />Post Insight</>}
          </button>
        )}
      </div>

      {/* Compose Panel */}
      {showCompose && user && (
        <div className="bg-[#0a0f1e]/60 border border-[#0062FF]/20 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#0062FF] flex items-center justify-center text-white text-xs font-extrabold shrink-0">
              {getInitials(profile?.name || 'U')}
            </div>
            <div className="flex-1">
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Share a research insight, data observation, or analytical note..."
                rows={4}
                className="w-full bg-transparent text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Tag size={12} className="text-[#A0AEC0]" />
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                className="bg-transparent text-[#A0AEC0] text-xs outline-none cursor-pointer hover:text-white transition-colors">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-[#A0AEC0]/40 text-xs">{content.length}/500</span>
            </div>
            <button onClick={handleSubmit} disabled={submitting || content.trim().length < 20}
              className="flex items-center gap-2 bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
              {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Post
            </button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${category === cat ? 'bg-[#0062FF] text-white' : 'bg-[#0a0f1e]/60 border border-white/10 text-[#A0AEC0] hover:border-[#0062FF]/40 hover:text-white'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin text-[#0062FF]" />
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-24">
          <Sparkles size={32} className="text-[#A0AEC0] mx-auto mb-4" />
          <p className="text-white font-medium mb-2">No insights yet</p>
          <p className="text-[#A0AEC0] text-sm">Be the first to share a research insight in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map(insight => (
            <div key={insight.id} className="bg-[#0a0f1e]/60 border border-white/5 hover:border-white/10 rounded-xl p-5 transition-all">
              {/* Author header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0062FF] to-[#00F0FF] flex items-center justify-center text-white text-xs font-extrabold shrink-0">
                  {getInitials(insight.profiles?.name || 'A')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm">{insight.profiles?.name || 'Anonymous'}</span>
                    {insight.profiles?.badge && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-[#0062FF] bg-[#0062FF]/10 px-2 py-0.5 rounded-full">
                        <Award size={8} />{insight.profiles.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#A0AEC0]">
                    <span>{timeAgo(insight.created_at)}</span>
                    <span className="text-[#0062FF]">· {insight.category}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="text-[#E2E8F0] text-sm leading-relaxed mb-4">{insight.content}</p>

              {/* Tags */}
              {insight.tags && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {insight.tags.split(',').filter(Boolean).slice(0, 5).map(tag => (
                    <span key={tag.trim()} className="text-[9px] font-mono bg-[#0062FF]/5 border border-[#0062FF]/15 text-[#0062FF] px-2 py-0.5 rounded-full">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button onClick={() => handleUpvote(insight.id)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-all group ${insight.userHasUpvoted ? 'text-[#FF7050]' : 'text-[#A0AEC0] hover:text-[#FF7050]'}`}>
                  <Heart size={14} className={insight.userHasUpvoted ? 'fill-current' : 'group-hover:scale-110 transition-transform'} />
                  {insight.upvotes_count}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-[#A0AEC0] hover:text-white transition-colors">
                  <MessageSquare size={14} />{insight.comments_count}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-[#A0AEC0] hover:text-[#0062FF] transition-colors ml-auto">
                  <Share2 size={12} />Share
                </button>
              </div>
            </div>
          ))}

          {/* Load more */}
          {page < totalPages && (
            <div className="text-center pt-4">
              <button onClick={() => { const next = page + 1; setPage(next); fetchInsights(next, false) }}
                className="bg-[#0a0f1e]/60 border border-white/10 hover:border-[#0062FF]/40 text-[#A0AEC0] hover:text-white px-6 py-3 rounded-xl text-sm font-medium transition-all">
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
