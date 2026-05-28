'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Lock, Mail, Zap, ArrowRight, Loader2, User as UserIcon, AtSign } from 'lucide-react'
import { SignIn, SignUp } from '@clerk/nextjs'

const isClerkEnabled = false

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const urlError = searchParams.get('error')
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin'
  
  const supabase = createClient()

  // Sign In / Sign Up Main Tabs
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialTab)

  // Sign In Form States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(urlError || '')
  const [mounted, setMounted] = useState(false)

  // Email-based OTP
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpStage, setOtpStage] = useState<'idle' | 'sent' | 'verify'>('idle')
  const [activeSignInTab, setActiveSignInTab] = useState<'password' | 'otp'>('password')

  // Sign Up Form States
  const [signupForm, setSignupForm] = useState({ name: '', username: '', email: '', password: '' })
  const [signupSuccess, setSignupSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync state if query param changes
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'signup') {
      setAuthMode('signup')
    } else if (tabParam === 'signin') {
      setAuthMode('signin')
    }
  }, [searchParams])

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value })
  }

  // ─── Email / Password sign-in ───
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

  // ─── Supabase Sign Up ───
  const handleSupabaseSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (signupForm.username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false)
      return
    }

    if (signupForm.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email: signupForm.email,
      password: signupForm.password,
      options: {
        data: {
          name: signupForm.name,
          username: signupForm.username,
        },
      },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/')
      router.refresh()
    } else {
      setSignupSuccess(true)
    }
    setLoading(false)
  }

  // ─── Google OAuth ───
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  // ─── Email OTP ───
  const sendEmailOtp = async () => {
    if (!otpEmail) {
      setError('Please enter your email address')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ email: otpEmail })
    if (error) {
      setError(error.message)
    } else {
      setOtpStage('verify')
    }
    setLoading(false)
  }

  const verifyEmailOtp = async () => {
    if (!otpCode) {
      setError('Please enter the OTP code')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({
      email: otpEmail,
      token: otpCode,
      type: 'email',
    })
    if (error) {
      setError(error.message)
    } else {
      router.push(redirect)
      router.refresh()
    }
    setLoading(false)
  }

  // Clerk UI custom style definition
  const clerkAppearance = {
    elements: {
      card: 'bg-[#0a0f1e]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.5)]',
      headerTitle: 'text-white font-extrabold',
      headerSubtitle: 'text-[#A0AEC0]',
      socialButtonsBlockButton:
        'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all',
      socialButtonsBlockButtonText: 'text-white font-medium',
      dividerLine: 'bg-white/10',
      dividerText: 'text-[#A0AEC0] font-mono',
      formLabel:
        'text-xs font-bold text-[#A0AEC0] uppercase tracking-wider',
      formInput:
        'bg-white/5 border border-white/10 focus:border-[#0062FF]/50 rounded-xl text-white',
      formButtonPrimary:
        'bg-[#0062FF] hover:bg-[#0056e0] text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(0,98,255,0.4)] transition-all',
      footerActionText: 'text-[#A0AEC0]',
      footerActionLink: 'text-[#00F0FF] hover:underline font-medium',
    },
  }

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center relative overflow-hidden py-12">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,98,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,98,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0062FF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00F0FF]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-8 h-8 bg-[#0062FF] rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-black tracking-widest text-sm uppercase">
              QUANTORA-NEXT
            </span>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {authMode === 'signin' ? 'Access Research Portal' : 'Create Contributor Profile'}
          </h1>
        </div>

        {/* Dynamic Dual Tab Switcher */}
        <div className="flex bg-white/5 backdrop-blur-md rounded-xl p-1 mb-6 border border-white/5 shadow-2xl">
          <button
            onClick={() => {
              setAuthMode('signin')
              setError('')
            }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-300 ${
              authMode === 'signin'
                ? 'bg-gradient-to-r from-[#0062FF] to-[#004bb3] text-white shadow-xl'
                : 'text-[#A0AEC0] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthMode('signup')
              setError('')
            }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-300 ${
              authMode === 'signup'
                ? 'bg-gradient-to-r from-[#0062FF] to-[#004bb3] text-white shadow-xl'
                : 'text-[#A0AEC0] hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Authentication Content Panel */}
        {isClerkEnabled ? (
          <div className="flex flex-col items-center">
            {authMode === 'signin' ? (
              <SignIn path="/login" routing="path" signUpUrl="/login?tab=signup" fallbackRedirectUrl="/" appearance={clerkAppearance} />
            ) : (
              <SignUp path="/signup" routing="path" signInUrl="/login?tab=signin" fallbackRedirectUrl="/" appearance={clerkAppearance} />
            )}
          </div>
        ) : (
          <div className="bg-[#0a0f1e]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
            
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all mb-6 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[#A0AEC0] text-xs font-mono uppercase">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            {/* SIGN IN SUB-PANEL */}
            {authMode === 'signin' && (
              <>
                {/* Switch Password vs OTP */}
                <div className="flex bg-white/5 rounded-lg p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSignInTab('password')
                      setError('')
                    }}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                      activeSignInTab === 'password' ? 'bg-[#0062FF] text-white shadow-lg' : 'text-[#A0AEC0] hover:text-white'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSignInTab('otp')
                      setError('')
                    }}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                      activeSignInTab === 'otp' ? 'bg-[#0062FF] text-white shadow-lg' : 'text-[#A0AEC0] hover:text-white'
                    }`}
                  >
                    Email OTP
                  </button>
                </div>

                {activeSignInTab === 'password' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Email</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="researcher@institution.edu"
                          required
                          className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-12 py-3 text-white text-sm outline-none transition-all"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-white transition-colors">
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-[0_4px_20px_rgba(0,98,255,0.4)]">
                      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight size={14} /></>}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {otpStage === 'idle' || otpStage === 'sent' ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Email Address</label>
                          <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                            <input
                              type="email"
                              value={otpEmail}
                              onChange={(e) => setOtpEmail(e.target.value)}
                              placeholder="you@email.com"
                              className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition-all"
                            />
                          </div>
                        </div>
                        <button type="button" onClick={sendEmailOtp} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-[0_4px_20px_rgba(0,98,255,0.4)]">
                          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Send OTP Code <ArrowRight size={14} /></>}
                        </button>
                      </>
                    ) : null}

                    {otpStage === 'verify' && (
                      <>
                        <p className="text-[#A0AEC0] text-sm text-center">A 6-digit code was sent to <strong className="text-white">{otpEmail}</strong></p>
                        <div>
                          <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Enter OTP Code</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl px-4 py-3 text-white text-sm text-center tracking-[0.5em] font-mono outline-none transition-all"
                          />
                        </div>
                        <button type="button" onClick={verifyEmailOtp} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-[0_4px_20px_rgba(0,98,255,0.4)]">
                          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Verify & Sign In <ArrowRight size={14} /></>}
                        </button>
                        <button type="button" onClick={() => { setOtpStage('idle'); setOtpCode(''); setError('') }} className="w-full text-[#A0AEC0] hover:text-white text-xs transition-colors">
                          ← Send to a different email
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* SIGN UP SUB-PANEL */}
            {authMode === 'signup' && (
              <>
                {signupSuccess ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Zap size={32} className="text-[#00F0FF]" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mb-3">Check your email</h2>
                    <p className="text-[#A0AEC0] mb-6">
                      We sent a confirmation link to <strong className="text-white">{signupForm.email}</strong>. Click it to activate your account.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSupabaseSignup} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Full Name</label>
                      <div className="relative">
                        <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                        <input
                          name="name"
                          type="text"
                          value={signupForm.name}
                          onChange={handleSignupChange}
                          placeholder="John Doe"
                          required
                          className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    {/* Username */}
                    <div>
                      <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Username</label>
                      <div className="relative">
                        <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                        <input
                          name="username"
                          type="text"
                          value={signupForm.username}
                          onChange={handleSignupChange}
                          placeholder="john_doe"
                          required
                          className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Email</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                        <input
                          name="email"
                          type="email"
                          value={signupForm.email}
                          onChange={handleSignupChange}
                          placeholder="you@institution.edu"
                          required
                          className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={signupForm.password}
                          onChange={handleSignupChange}
                          placeholder="Min. 8 characters"
                          required
                          className="w-full bg-white/5 border border-white/10 focus:border-[#0062FF]/50 focus:ring-2 focus:ring-[#0062FF]/20 rounded-xl pl-10 pr-12 py-3 text-white text-sm outline-none transition-all"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-white transition-colors">
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#0062FF] hover:bg-[#0056e0] disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-[0_4px_20px_rgba(0,98,255,0.4)]">
                      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={14} /></>}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        <p className="text-center text-[#A0AEC0]/50 text-xs mt-6">
          <Link href="/" className="hover:text-[#A0AEC0] transition-colors">
            ← Back to QUANTORA-NEXT
          </Link>
        </p>
      </div>
    </div>
  )
}

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
