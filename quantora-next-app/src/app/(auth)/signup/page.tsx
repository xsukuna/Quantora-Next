'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Lock, Mail, User, AtSign, Zap, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false)
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          username: form.username,
        },
      },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    // If email confirmation is disabled, user is immediately signed in
    if (data.session) {
      router.push('/')
      router.refresh()
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap size={32} className="text-[#00F0FF]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">Check your email</h2>
          <p className="text-[#A0AEC0] mb-6">
            We sent a confirmation link to <strong className="text-white">{form.email}</strong>. Click it to activate your Quantora account.
          </p>
          <Link href="/login" className="text-[#00F0FF] hover:underline text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,98,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,98,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#0062FF]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#00F0FF]/5 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#0062FF] rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-black tracking-widest text-sm uppercase">QUANTORA-NEXT</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white mb-2">Create Account</h1>
          <p className="text-[#A0AEC0] text-sm">Join the open research network</p>
        </div>

        <div className="bg-[#0a0f1e]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                <input name="name" type="text" value={form.name} onChange={handleChange}
                  placeholder="John Doe" required
                  className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none transition-all"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                <input name="username" type="text" value={form.username} onChange={handleChange}
                  placeholder="john_doe" required
                  className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="you@institution.edu" required
                  className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange}
                  placeholder="Min. 8 characters" required
                  className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder:text-[#A0AEC0]/50 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-[0_4px_20px_rgba(0,98,255,0.4)] hover:-translate-y-0.5">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight size={14} /></>}
            </button>
          </form>

          <p className="text-center text-[#A0AEC0] text-xs mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#00F0FF] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
