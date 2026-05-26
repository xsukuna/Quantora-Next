'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Lock, Mail, Zap, ArrowRight, Loader2 } from 'lucide-react'

// Inner component that uses useSearchParams — must be wrapped in Suspense
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=${redirect}` },
    })
  }

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,98,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,98,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0062FF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00F0FF]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-8 h-8 bg-[#0062FF] rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-black tracking-widest text-sm uppercase">QUANTORA-NEXT</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white mb-2">Welcome Back</h1>
          <p className="text-[#A0AEC0] text-sm">Sign in to access the research platform</p>
        </div>

        <div className="bg-[#0a0f1e]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all mb-6"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[#A0AEC0] text-xs font-mono">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="researcher@institution.edu" required
                  className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-[0_4px_20px_rgba(0,98,255,0.4)] hover:shadow-[0_4px_28px_rgba(0,98,255,0.6)] hover:-translate-y-0.5">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight size={14} /></>}
            </button>
          </form>

          <p className="text-center text-[#A0AEC0] text-xs mt-6">
            No account?{' '}
            <Link href="/signup" className="text-[#00F0FF] hover:underline font-medium">Create one free</Link>
          </p>
        </div>

        <p className="text-center text-[#A0AEC0]/50 text-xs mt-6">
          <Link href="/" className="hover:text-[#A0AEC0] transition-colors">← Back to QUANTORA-NEXT</Link>
        </p>
      </div>
    </div>
  )
}

// Suspense wrapper — required by Next.js for useSearchParams in client components
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#0062FF]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
