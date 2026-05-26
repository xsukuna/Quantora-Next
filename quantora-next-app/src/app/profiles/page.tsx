'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  User, Mail, Building2, Globe, Award, TrendingUp,
  Edit3, Save, X, Loader2, Camera, FileText, Zap
} from 'lucide-react'
import type { Profile } from '@/types/database'

export const dynamic = 'force-dynamic'

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const REPUTATION_BADGES: [number, string][] = [
  [0, 'Fellow Contributor'],
  [100, 'Research Associate'],
  [300, 'Senior Analyst'],
  [600, 'Principal Researcher'],
  [1000, 'Distinguished Fellow'],
]

function getBadge(rep: number) {
  let badge = REPUTATION_BADGES[0][1]
  for (const [threshold, label] of REPUTATION_BADGES) {
    if (rep >= threshold) badge = label as string
  }
  return badge
}

export default function ProfilesPage() {
  const { user, profile: authProfile, refreshProfile } = useAuth()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', institution: '', country: '', website: '' })
  const [paperCount, setPaperCount] = useState(0)
  const [insightCount, setInsightCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authProfile) {
      setProfile(authProfile)
      setForm({
        name: authProfile.name,
        bio: authProfile.bio || '',
        institution: authProfile.institution || '',
        country: authProfile.country || '',
        website: authProfile.website || '',
      })
      // Load paper + insight counts
      Promise.all([
        supabase.from('papers').select('*', { count: 'exact', head: true }).eq('author_id', authProfile.id).eq('status', 'APPROVED'),
        supabase.from('insights').select('*', { count: 'exact', head: true }).eq('author_id', authProfile.id),
      ]).then(([paperRes, insightRes]) => {
        setPaperCount(paperRes.count || 0)
        setInsightCount(insightRes.count || 0)
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [authProfile, supabase])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({
        name: form.name.trim(),
        bio: form.bio.trim() || null,
        institution: form.institution.trim() || null,
        country: form.country.trim() || null,
        website: form.website.trim() || null,
      }).eq('id', user.id)

      if (!error) {
        await refreshProfile()
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <User size={48} className="text-[#A0AEC0] mx-auto mb-4" />
        <h1 className="text-xl font-extrabold text-white mb-3">Sign In to View Your Profile</h1>
        <p className="text-[#A0AEC0] mb-6">Access your researcher profile, submitted papers, and reputation dashboard.</p>
        <a href="/login" className="bg-[#0062FF] hover:bg-[#0056e0] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all inline-block">
          Sign In
        </a>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#0062FF]" />
      </div>
    )
  }

  const badge = getBadge(profile?.reputation || 0)
  const repToNext = REPUTATION_BADGES.find(([t]) => t > (profile?.reputation || 0))
  const repProgress = repToNext
    ? Math.round(((profile?.reputation || 0) / repToNext[0]) * 100)
    : 100

  return (
    <div className="max-w-[800px] mx-auto px-6 py-10">
      {/* Profile Header */}
      <div className="bg-[#0a0f1e]/60 border border-white/5 rounded-2xl p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="relative group">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-[#0062FF]/30" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0062FF] to-[#00F0FF] flex items-center justify-center text-white text-2xl font-extrabold border-2 border-[#0062FF]/30">
                {getInitials(profile?.name || 'U')}
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera size={16} className="text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="bg-transparent text-white font-extrabold text-2xl outline-none border-b border-[#0062FF]/50 w-full mb-2 pb-1"
                placeholder="Your name"
              />
            ) : (
              <h1 className="text-2xl font-extrabold text-white mb-1">{profile?.name || user.email?.split('@')[0]}</h1>
            )}
            <p className="text-xs font-mono text-[#A0AEC0] mb-2">@{profile?.username}</p>

            <div className="flex items-center gap-2 mb-3">
              <Award size={12} className="text-[#0062FF]" />
              <span className="text-xs font-bold text-[#0062FF]">{badge}</span>
              {profile?.role === 'ADMIN' && (
                <span className="text-[9px] font-mono bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">ADMIN</span>
              )}
            </div>

            {editing ? (
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                className="w-full bg-transparent text-[#A0AEC0] text-sm outline-none resize-none border border-white/10 rounded-lg p-2"
                rows={2}
                placeholder="Brief bio (optional)"
              />
            ) : (
              profile?.bio && <p className="text-sm text-[#A0AEC0] leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Edit button */}
          <div className="flex gap-2 shrink-0">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}Save
                </button>
                <button onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 border border-white/10 text-[#A0AEC0] hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
                  <X size={12} />Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 border border-white/10 hover:border-[#0062FF]/40 text-[#A0AEC0] hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
                <Edit3 size={12} />Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Meta fields */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
          {[
            { icon: Building2, label: 'Institution', field: 'institution' as const },
            { icon: Globe, label: 'Country', field: 'country' as const },
            { icon: Globe, label: 'Website', field: 'website' as const },
            { icon: Mail, label: 'Email', value: user.email },
          ].map(({ icon: Icon, label, field, value }) => (
            <div key={label}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={11} className="text-[#A0AEC0]" />
                <span className="text-[9px] text-[#A0AEC0] uppercase tracking-wider font-bold">{label}</span>
              </div>
              {editing && field ? (
                <input value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  className="bg-transparent text-white text-xs outline-none border-b border-white/10 w-full pb-0.5"
                  placeholder={`Your ${label.toLowerCase()}`}
                />
              ) : (
                <p className="text-white text-xs font-medium truncate">
                  {(field ? profile?.[field] : value) || <span className="text-[#A0AEC0]">—</span>}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Reputation', value: profile?.reputation ?? 0, icon: TrendingUp, color: '#0062FF' },
          { label: 'Papers Published', value: paperCount, icon: FileText, color: '#00F0FF' },
          { label: 'Insights Posted', value: insightCount, icon: Zap, color: '#a855f7' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#0a0f1e]/60 border border-white/5 rounded-xl p-5 text-center hover:border-white/10 transition-all">
            <Icon size={18} className="mx-auto mb-2" style={{ color }} />
            <div className="text-3xl font-extrabold text-white">{value.toLocaleString()}</div>
            <div className="text-[9px] text-[#A0AEC0] uppercase tracking-wider mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Reputation Progress */}
      <div className="bg-[#0a0f1e]/60 border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-[#0062FF]" />
            <span className="text-sm font-bold text-white">Reputation Progress</span>
          </div>
          <span className="text-xs text-[#A0AEC0]">
            {profile?.reputation} {repToNext ? `/ ${repToNext[0]} for "${repToNext[1]}"` : '(Max level reached)'}
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#0062FF] to-[#00F0FF] rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(repProgress, 100)}%` }} />
        </div>
        <div className="flex justify-between text-[9px] text-[#A0AEC0] mt-2">
          {REPUTATION_BADGES.map(([t, l]) => (
            <span key={l} className={`${(profile?.reputation || 0) >= t ? 'text-[#0062FF]' : ''}`}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
