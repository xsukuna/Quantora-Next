'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, MessageCircle, Trophy, FileText, 
  Users, Leaf, Activity, Building2, Shield, Settings, Sun, Moon, 
  Bell, LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { QBrainWidget } from './QBrainWidget';


export const PlatformShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user, profile, signOut, isAdmin } = useAuth();
  
  // Modals & Panels
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Theme Preference
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Load theme setting
    const savedTheme = localStorage.getItem('quantora_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      const initial = prefersLight ? 'light' : 'dark';
      setTheme(initial);
      applyTheme(initial);
    }
  }, []);

  const applyTheme = (t: 'dark' | 'light') => {
    if (t === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    localStorage.setItem('quantora_theme', next);
  };

  // Mock Notification logs
  const notifications = [
    { id: '1', title: 'Operational Clearance Granted', desc: 'Secure connection established to NY-HUB-04.' },
    { id: '2', title: 'New Geopolitical Index Alert', desc: 'Lithium critical processing choke-point reports uploaded.' }
  ];

  // Active navigation items matching paths
  const navItems = [
    { name: 'Index', icon: LayoutDashboard, path: '/', color: 'group-hover:text-blue-400', activeColor: 'text-blue-400', accentBorder: 'bg-blue-500', title: 'Index Hub' },
    { name: 'Library', icon: BookOpen, path: '/library', color: 'group-hover:text-blue-400', activeColor: 'text-blue-400', accentBorder: 'bg-blue-500', title: 'Research Library' },
    { name: 'Insights', icon: MessageCircle, path: '/insights', color: 'group-hover:text-blue-400', activeColor: 'text-blue-400', accentBorder: 'bg-blue-500', title: 'Intelligence Network' },
    { name: 'R&D Lab', icon: Trophy, path: '/rnd-lab', color: 'group-hover:text-amber-400', activeColor: 'text-amber-400', accentBorder: 'bg-amber-500', title: 'Open R&D Lab' },
    { name: 'Submit', icon: FileText, path: '/submit', color: 'group-hover:text-emerald-400', activeColor: 'text-emerald-400', accentBorder: 'bg-emerald-500', title: 'Submit Manuscript' },
    { name: 'Profiles', icon: Users, path: '/profiles', color: 'group-hover:text-blue-400', activeColor: 'text-blue-400', accentBorder: 'bg-blue-500', title: 'Researcher Identity' },
    { name: 'Climate', icon: Leaf, path: '/climate', color: 'group-hover:text-emerald-400', activeColor: 'text-emerald-400', accentBorder: 'bg-emerald-500', title: 'Environmental Hub' },
    { name: 'Terminal', icon: Activity, path: '/terminal', color: 'group-hover:text-cyan-400', activeColor: 'text-cyan-400', accentBorder: 'bg-cyan-500', title: 'Fintech Terminal' },
    { name: 'Org', icon: Building2, path: '/institutional', color: 'group-hover:text-purple-400', activeColor: 'text-purple-400', accentBorder: 'bg-purple-500', title: 'Institutional Hub' },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      
      {/* 1. DYNAMIC SIDE NAVIGATION BAR */}
      <div className="w-20 border-r border-[var(--border)] flex flex-col items-center justify-between py-6 bg-[var(--surface)] z-50 shrink-0 transition-colors duration-300">
        
        {/* Core Branding logo */}
        <Link 
          href="/"
          className="w-12 h-12 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all hover:drop-shadow-[0_0_12px_rgba(0,98,255,0.6)]"
        >
          <div className="logo-3d-container">
            <div className="cube-3d">
              <div className="cube-face cube-face-front"></div>
              <div className="cube-face cube-face-back"></div>
              <div className="cube-face cube-face-left"></div>
              <div className="cube-face cube-face-right"></div>
              <div className="cube-face cube-face-top"></div>
              <div className="cube-face cube-face-bottom"></div>
            </div>
          </div>
        </Link>

        {/* Tab Items switches */}
        <div className="flex flex-col gap-5 text-gray-500 mt-2 overflow-y-auto scrollbar-hide py-4 items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name}
                href={item.path}
                className="flex flex-col items-center gap-1 group relative shrink-0"
                title={item.title}
              >
                <Icon 
                  className={`w-5 h-5 cursor-pointer transition-all ${
                    isActive ? `${item.activeColor} scale-110` : `group-hover:${item.activeColor}`
                  }`} 
                />
                <span className="text-[7.5px] font-black uppercase tracking-wider opacity-70 group-hover:opacity-100">
                  {item.name}
                </span>
                {isActive && <span className={`absolute left-0 top-1/4 w-0.5 h-3 ${item.accentBorder} rounded-r`} />}
              </Link>
            );
          })}

          {/* Admin link conditional */}
          {isAdmin && (
            <Link 
              href="/admin"
              className="flex flex-col items-center gap-1 group relative shrink-0"
              title="Admin Workstation"
            >
              <Shield 
                className={`w-5 h-5 cursor-pointer group-hover:text-red-400 transition-all ${
                  pathname === '/admin' ? 'text-red-400 scale-110' : 'text-red-500'
                }`} 
              />
              <span className="text-[7.5px] font-black uppercase tracking-wider opacity-70 group-hover:opacity-100 text-red-500 font-mono">
                Admin
              </span>
              {pathname === '/admin' && <span className="absolute left-0 top-1/4 w-0.5 h-3 bg-red-500 rounded-r" />}
            </Link>
          )}
        </div>

        {/* Bottom Utility controls */}
        <div className="flex flex-col gap-4 text-gray-500 items-center shrink-0">
          <button 
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] hover:border-blue-500/30 hover:bg-[var(--surface-hover)]/80 transition-all flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          
          <Settings className="w-4 h-4 cursor-pointer hover:text-[var(--foreground)] transition-colors" />
        </div>
      </div>

      {/* MAIN CONTAINER PLATFORM SHELL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 2. TOP HEAD BAR */}
        <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-8 bg-[var(--surface)]/95 backdrop-blur-md z-40 select-none shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex flex-col cursor-pointer">
              <span className="text-[12px] font-black tracking-[0.3em] text-blue-500 uppercase">Quantora Analytics</span>
              <span className="text-[9px] text-[var(--foreground-dim)] font-bold uppercase tracking-widest mt-0.5 font-sans">Global Research & Intelligence Ecosystem</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            
            {/* Live active connection indicators */}
            <div className="text-right border-r border-[var(--border)] pr-6 hidden sm:block">
              <div className="text-[10px] font-black text-emerald-500 flex items-center gap-1.5 justify-end font-mono">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span>SECURE SHAKESHAKE v4.2 [OK]</span>
              </div>
              <div className="text-[9px] font-bold text-[var(--foreground-dim)] uppercase tracking-widest mt-0.5 font-mono">Node: ND-GENESIS-01</div>
            </div>

            {/* Notifications Feed */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-10 h-10 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-hover)]/80 transition-colors border border-[var(--border)] flex items-center justify-center text-[var(--foreground-muted)] relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
                    
                    <motion.div 
                      className="absolute right-0 top-full mt-2 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-4 space-y-4 z-40"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <h4 className="text-[10px] font-black text-[var(--foreground-dim)] uppercase tracking-widest font-mono">Clearance Notifications</h4>
                      <div className="space-y-3">
                        {notifications.map(n => (
                          <div key={n.id} className="p-3 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-[var(--foreground)] uppercase block">{n.title}</span>
                            <span className="text-[10px] text-[var(--foreground-muted)] leading-normal block font-normal font-sans">{n.desc}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Authentication profile display */}
            {user ? (
              <div className="flex items-center gap-3 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl px-4 py-2 hover:bg-[var(--surface-hover)]/80 transition-all relative group select-none">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-500 font-bold uppercase text-xs">
                  {(profile?.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                
                <div className="flex flex-col text-left shrink-0">
                  <span className="text-xs font-bold text-[var(--foreground)] max-w-[100px] truncate">{profile?.name || user.email?.split('@')[0]}</span>
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-wider font-mono">
                    {profile?.badge ? profile.badge.substring(0, 15) : 'Researcher'} · Rep: {profile?.reputation ?? 0}
                  </span>
                </div>
                
                <button 
                  onClick={signOut}
                  className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:bg-red-600/10 text-[var(--foreground-dim)] hover:text-red-500 transition-colors flex items-center justify-center shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20 font-sans cursor-pointer"
              >
                Sign In
              </Link>
            )}

          </div>
        </header>

        {/* 3. DYNAMIC CONTENT RENDERING */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)] relative transition-colors duration-300">
          {children}
        </main>

        {/* 4. FOOTER RUNNING TICKER TAPE */}
        <footer className="h-10 border-t border-[var(--border)] bg-[var(--surface)] flex items-center px-6 overflow-hidden z-40 select-none shrink-0 transition-colors duration-300">
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest animate-ticker font-mono">
            {['S&P 500 +1.24%', 'NASDAQ 100 +0.85%', 'FTSE 100 -0.12%', 'USD/EUR +0.04%', 'BTC/USD +4.12%', 'NIKKEI 225 +0.56%', 'GOLD +0.22%', 'CRUDE OIL -1.45%'].map((tick, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-[var(--foreground-dim)]">CORRIDOR-{idx+1}</span>
                <span className={tick.includes('-') ? 'text-red-500' : 'text-emerald-500'}>{tick}</span>
                <span className="text-[var(--border)] font-normal">|</span>
              </div>
            ))}
          </div>
        </footer>

      </div>

      {/* Auth handled via /login route */}

      {/* Q-Brain Floating AI Widget — always visible on left side */}
      <QBrainWidget />

    </div>
  );
};
