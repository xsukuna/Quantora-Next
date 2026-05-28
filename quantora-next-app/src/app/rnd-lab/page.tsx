'use client'
import { Trophy, Clock, Zap, Shield } from 'lucide-react'

export default function RndLabPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-[1200px] mx-auto px-6 py-12 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#0062FF]/10 to-[#00F0FF]/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* Animated Trophy Icon Container */}
        <div className="inline-flex items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#0062FF] to-[#00F0FF] opacity-40 blur animate-pulse" />
            <div className="relative w-16 h-16 bg-[#0a0f1e]/80 border border-white/10 rounded-full flex items-center justify-center text-[#00F0FF]">
              <Trophy size={28} />
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-[#0062FF]/10 border border-[#0062FF]/20 px-3 py-1 rounded-full text-[10px] text-[#00F0FF] font-mono tracking-widest uppercase">
            <Zap size={10} className="animate-pulse" />
            <span>Open R&D Labs Pipeline</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            R&D Challenges <span className="bg-gradient-to-r from-[#00F0FF] to-[#0062FF] bg-clip-text text-transparent">COMING SOON</span>
          </h1>
          <div className="h-[2px] w-24 bg-gradient-to-r from-[#00F0FF] to-[#0062FF] mx-auto my-4" />
        </div>

        {/* Curated Research Quote Box */}
        <div className="bg-[#0f1423]/50 border border-white/10 p-8 rounded-2xl relative overflow-hidden backdrop-blur-md group hover:border-[#00F0FF]/30 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#00F0FF] to-[#0062FF]" />
          <p className="text-[#E2E8F0] text-sm md:text-base italic leading-relaxed font-medium">
            "Great research is not rushed. We are curating forensic, institutional, and macroeconomic challenges from sovereign groups and global agencies. Connect your identity, review the archives, and prepare to publish."
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono text-[#A0AEC0] uppercase tracking-wider">
            <Clock size={12} className="text-[#00F0FF]" />
            <span>Deployment Phase Init · Q3 2026</span>
          </div>
        </div>

        {/* Informative Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="bg-[#0a0f1e]/40 border border-white/5 p-5 rounded-xl flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#0062FF]/10 border border-[#0062FF]/20 flex items-center justify-center text-[#0062FF] shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-xs tracking-wider uppercase mb-1">Sovereign Validation</h3>
              <p className="text-[11px] text-[#A0AEC0] leading-relaxed">
                All challenges will be vetted by institutional partners and sovereign regulatory frameworks.
              </p>
            </div>
          </div>
          <div className="bg-[#0a0f1e]/40 border border-white/5 p-5 rounded-xl flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center text-[#00F0FF] shrink-0">
              <Trophy size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-xs tracking-wider uppercase mb-1">Decentralized Bounties</h3>
              <p className="text-[11px] text-[#A0AEC0] leading-relaxed">
                Earn platform reputation badges, verified co-authorships, and real-time funding payouts.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Pulse Pipeline Label */}
        <div className="text-[11px] font-mono tracking-widest text-[#00F0FF] font-bold uppercase pt-4 animate-pulse">
          ⚡ Core Engine Online · Awaiting Challenge Seed...
        </div>
      </div>
    </div>
  )
}

