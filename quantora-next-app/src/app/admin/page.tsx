'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  Shield, FileText, Users, TrendingUp, Download,
  CheckCircle, XCircle, Clock, Eye, BarChart3,
  AlertTriangle, Loader2, RefreshCw, Zap
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface AdminStats {
  totalPapers: number
  pendingPapers: number
  approvedPapers: number
  totalUsers: number
  totalInsights: number
  totalChallenges: number
  totalDownloads: number
}

interface PendingPaper {
  id: string
  title: string
  abstract: string
  category: string
  status: string
  created_at: string
  ai_summary: string | null
  ai_keywords: string | null
  file_url: string
  profiles: { name: string; email: string; institution: string }
}

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pendingPapers, setPendingPapers] = useState<PendingPaper[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'papers' | 'users'>('overview')
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, papersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/papers?status=PENDING'),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (papersRes.ok) {
        const { papers } = await papersRes.json()
        setPendingPapers(papers || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) {
      if (!user || profile?.role !== 'ADMIN') {
        router.push('/')
        return
      }
      fetchData()
    }
  }, [authLoading, user, profile, router, fetchData])

  const handleReview = async (paperId: string, action: 'APPROVE' | 'REJECT') => {
    setReviewing(paperId)
    try {
      const res = await fetch(`/api/admin/papers/${paperId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        setPendingPapers(prev => prev.filter(p => p.id !== paperId))
        setStats(prev => prev ? {
          ...prev,
          pendingPapers: prev.pendingPapers - 1,
          approvedPapers: action === 'APPROVE' ? prev.approvedPapers + 1 : prev.approvedPapers,
        } : prev)
      }
    } finally {
      setReviewing(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#0062FF]" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Papers', value: stats?.totalPapers ?? 0, icon: FileText, color: '#0062FF' },
    { label: 'Pending Review', value: stats?.pendingPapers ?? 0, icon: Clock, color: '#FF7050' },
    { label: 'Approved', value: stats?.approvedPapers ?? 0, icon: CheckCircle, color: '#00F0FF' },
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: '#a855f7' },
    { label: 'Total Insights', value: stats?.totalInsights ?? 0, icon: TrendingUp, color: '#00FF00' },
    { label: 'Downloads', value: stats?.totalDownloads ?? 0, icon: Download, color: '#FFD700' },
  ]

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0062FF]/10 border border-[#0062FF]/20 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-[#0062FF]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Admin Control Center</h1>
            <p className="text-xs text-[#A0AEC0]">QUANTORA-NEXT Platform Management</p>
          </div>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 text-xs text-[#A0AEC0] hover:text-white border border-white/10 hover:border-white/20 px-3 py-2 rounded-lg transition-all">
          <RefreshCw size={12} />Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#0a0f1e]/60 border border-white/5 rounded-xl p-4 text-center hover:border-white/10 transition-all">
            <Icon size={18} className="mx-auto mb-2" style={{ color }} />
            <div className="text-2xl font-extrabold text-white">{value.toLocaleString()}</div>
            <div className="text-[9px] font-mono text-[#A0AEC0] uppercase tracking-wider mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#050505] border border-white/5 p-1 rounded-xl w-fit">
        {(['overview', 'papers', 'users'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-[#0062FF] text-white' : 'text-[#A0AEC0] hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Pending Papers Queue */}
      {(activeTab === 'overview' || activeTab === 'papers') && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-[#FF7050]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Pending Review Queue ({pendingPapers.length})
            </h2>
          </div>

          {pendingPapers.length === 0 ? (
            <div className="bg-[#0a0f1e]/40 border border-white/5 rounded-xl p-12 text-center">
              <CheckCircle size={32} className="text-[#00F0FF] mx-auto mb-3" />
              <p className="text-[#A0AEC0] text-sm">All submissions have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPapers.map(paper => (
                <div key={paper.id} className="bg-[#0a0f1e]/60 border border-white/5 hover:border-[#0062FF]/20 rounded-xl p-6 transition-all">
                  <div className="flex flex-col lg:flex-row gap-6 justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono text-[#0062FF] uppercase tracking-widest">{paper.category}</span>
                        <span className="text-[10px] text-[#A0AEC0]">·</span>
                        <span className="text-[10px] text-[#A0AEC0]">{new Date(paper.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-extrabold text-white text-sm mb-1 leading-snug">{paper.title}</h3>
                      <p className="text-xs text-[#A0AEC0] mb-2">
                        By <strong className="text-white">{paper.profiles?.name}</strong> · {paper.profiles?.institution}
                      </p>
                      <p className="text-xs text-[#A0AEC0] leading-relaxed line-clamp-2">{paper.abstract}</p>

                      {paper.ai_summary && (
                        <div className="mt-3 p-3 bg-[#0062FF]/5 border border-[#0062FF]/15 rounded-lg">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap size={10} className="text-[#0062FF]" />
                            <span className="text-[9px] font-mono text-[#0062FF] uppercase tracking-widest">AI Summary</span>
                          </div>
                          <p className="text-xs text-[#A0AEC0]">{paper.ai_summary}</p>
                          {paper.ai_keywords && (
                            <p className="text-[9px] text-[#0062FF] mt-1 font-mono">{paper.ai_keywords}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2 shrink-0 items-start">
                      <a href={paper.file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#00F0FF] border border-[#00F0FF]/20 hover:bg-[#00F0FF]/10 px-3 py-2 rounded-lg transition-all">
                        <Eye size={12} />View PDF
                      </a>
                      <button onClick={() => handleReview(paper.id, 'APPROVE')}
                        disabled={reviewing === paper.id}
                        className="flex items-center gap-1.5 text-xs text-white bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-50 px-3 py-2 rounded-lg transition-all">
                        {reviewing === paper.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        Approve
                      </button>
                      <button onClick={() => handleReview(paper.id, 'REJECT')}
                        disabled={reviewing === paper.id}
                        className="flex items-center gap-1.5 text-xs text-[#FF7050] border border-[#FF7050]/20 hover:bg-[#FF7050]/10 disabled:opacity-50 px-3 py-2 rounded-lg transition-all">
                        <XCircle size={12} />Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="mt-8 bg-[#0a0f1e]/40 border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-[#0062FF]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Platform Health</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-extrabold text-[#00F0FF]">
                {stats && stats.totalPapers > 0 ? Math.round((stats.approvedPapers / stats.totalPapers) * 100) : 0}%
              </div>
              <div className="text-[9px] text-[#A0AEC0] uppercase tracking-wider mt-1">Approval Rate</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#0062FF]">{stats?.totalChallenges ?? 0}</div>
              <div className="text-[9px] text-[#A0AEC0] uppercase tracking-wider mt-1">Active R&D Challenges</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{stats?.totalInsights ?? 0}</div>
              <div className="text-[9px] text-[#A0AEC0] uppercase tracking-wider mt-1">Published Insights</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#FF7050]">{stats?.pendingPapers ?? 0}</div>
              <div className="text-[9px] text-[#A0AEC0] uppercase tracking-wider mt-1">Awaiting Review</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
