'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Trophy, Users, Clock, Zap, CheckCircle, Loader2, AlertCircle, ChevronRight, Filter } from 'lucide-react'
import type { RndChallenge } from '@/types/database'

type ChallengeWithJoin = RndChallenge & { userHasJoined?: boolean }

const CATEGORIES = ['All', 'Public Policy', 'Quant Strategy', 'Climate Finance', 'Macroeconomics', 'Technology']
const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: '#00FF00',
  Intermediate: '#FFD700',
  Advanced: '#FF7050',
  Expert: '#a855f7',
}

export default function RndLabPage() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<ChallengeWithJoin[]>([])
  const [loading, setLoading] = useState(true)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [category, setCategory] = useState('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchChallenges = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'All') params.set('category', category)
      const res = await fetch(`/api/rnd?${params}`)
      if (!res.ok) throw new Error('Failed')
      const { challenges } = await res.json()
      setChallenges(challenges || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  const handleJoin = async (challengeId: string) => {
    if (!user) return
    setJoiningId(challengeId)
    try {
      const res = await fetch(`/api/rnd/${challengeId}/join`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      const { action } = await res.json()
      // Optimistic update
      setChallenges(prev => prev.map(c => {
        if (c.id !== challengeId) return c
        return {
          ...c,
          userHasJoined: action === 'joined',
          teams_count: action === 'joined' ? c.teams_count + 1 : Math.max(0, c.teams_count - 1)
        }
      }))
    } catch (e) {
      console.error(e)
    } finally {
      setJoiningId(null)
    }
  }

  const getDaysLeft = (deadline: string | null) => {
    if (!deadline) return 'Open'
    const diff = new Date(deadline).getTime() - Date.now()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Closed'
    if (days === 0) return 'Today'
    return `${days}d left`
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-[#0062FF]" />
            <span className="text-xs font-mono text-[#0062FF] uppercase tracking-widest">Innovation Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">R&D Marketplace</h1>
          <p className="text-[#A0AEC0] text-sm mt-1">
            Sponsored research challenges · Real rewards · Global talent pool
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-white">{challenges.length}</div>
            <div className="text-[9px] text-[#A0AEC0] uppercase tracking-wider">Active Challenges</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-extrabold text-[#0062FF]">
              {challenges.reduce((sum, c) => sum + c.teams_count, 0)}
            </div>
            <div className="text-[9px] text-[#A0AEC0] uppercase tracking-wider">Participants</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
        <Filter size={12} className="text-[#A0AEC0] shrink-0" />
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${category === cat ? 'bg-[#0062FF] text-white' : 'bg-[#0a0f1e]/60 border border-white/10 text-[#A0AEC0] hover:border-[#0062FF]/40 hover:text-white'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Challenges */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-[#0062FF]" />
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-24">
          <Trophy size={32} className="text-[#A0AEC0] mx-auto mb-4" />
          <p className="text-white font-medium mb-2">No active challenges</p>
          <p className="text-[#A0AEC0] text-sm">Check back soon for new R&D opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {challenges.map(challenge => {
            const daysLeft = getDaysLeft(challenge.deadline)
            const diffColor = DIFFICULTY_COLORS[challenge.difficulty] || '#A0AEC0'
            const isExpanded = expandedId === challenge.id

            return (
              <div key={challenge.id}
                className={`bg-[#0a0f1e]/60 border rounded-xl overflow-hidden transition-all ${challenge.userHasJoined ? 'border-[#0062FF]/30' : 'border-white/5 hover:border-white/10'}`}>

                {/* Card Header */}
                <div className="p-6">
                  {/* Sponsor + Status row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#0062FF]/10 border border-[#0062FF]/20 rounded-lg flex items-center justify-center">
                        <Zap size={12} className="text-[#0062FF]" />
                      </div>
                      <span className="text-[10px] font-mono text-[#0062FF] uppercase tracking-widest">{challenge.sponsor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border"
                        style={{ color: diffColor, borderColor: `${diffColor}30`, background: `${diffColor}10` }}>
                        {challenge.difficulty}
                      </span>
                      <span className={`text-[9px] font-mono uppercase tracking-widest ${daysLeft === 'Closed' ? 'text-red-400' : daysLeft === 'Today' ? 'text-[#FFD700]' : 'text-[#A0AEC0]'}`}>
                        {daysLeft}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-white font-extrabold text-sm leading-snug mb-2">{challenge.title}</h2>

                  {/* Description */}
                  <p className="text-xs text-[#A0AEC0] leading-relaxed mb-4 line-clamp-2">{challenge.description}</p>

                  {/* Reward banner */}
                  <div className="flex items-center gap-3 p-3 bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-lg mb-4">
                    <Trophy size={14} className="text-[#FFD700] shrink-0" />
                    <div>
                      <div className="text-[#FFD700] font-extrabold text-sm">{challenge.reward}</div>
                      <div className="text-[9px] text-[#A0AEC0]">+{challenge.rep_award} reputation points</div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-[#A0AEC0]">
                    <span className="flex items-center gap-1">
                      <Users size={11} />{challenge.teams_count} teams
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle size={11} />{challenge.solutions_count} solutions
                    </span>
                    <span className="text-[9px] font-mono text-[#0062FF] bg-[#0062FF]/10 px-2 py-0.5 rounded-full ml-auto">
                      {challenge.category}
                    </span>
                  </div>

                  {/* Expand details button */}
                  {challenge.details && (
                    <button onClick={() => setExpandedId(isExpanded ? null : challenge.id)}
                      className="flex items-center gap-1 text-xs text-[#A0AEC0] hover:text-white mb-4 transition-colors">
                      <ChevronRight size={12} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      {isExpanded ? 'Hide details' : 'View full brief'}
                    </button>
                  )}
                  {isExpanded && challenge.details && (
                    <div className="mb-4 p-4 bg-black/20 rounded-lg border border-white/5">
                      <p className="text-xs text-[#A0AEC0] leading-relaxed whitespace-pre-line">{challenge.details}</p>
                    </div>
                  )}

                  {/* Action button */}
                  {user ? (
                    <button
                      onClick={() => handleJoin(challenge.id)}
                      disabled={joiningId === challenge.id || daysLeft === 'Closed'}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                        challenge.userHasJoined
                          ? 'border border-[#0062FF]/30 text-[#0062FF] hover:bg-[#0062FF]/5'
                          : daysLeft === 'Closed'
                          ? 'border border-white/10 text-[#A0AEC0] cursor-not-allowed opacity-50'
                          : 'bg-[#0062FF] hover:bg-[#0056e0] text-white shadow-[0_4px_16px_rgba(0,98,255,0.4)]'
                      }`}>
                      {joiningId === challenge.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : challenge.userHasJoined ? (
                        <><CheckCircle size={14} />Joined · Withdraw</>
                      ) : daysLeft === 'Closed' ? (
                        'Challenge Closed'
                      ) : (
                        <><Zap size={14} />Join Challenge</>
                      )}
                    </button>
                  ) : (
                    <a href="/login"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-[#0062FF] hover:bg-[#0056e0] text-white transition-all">
                      <Zap size={14} />Sign In to Join
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
