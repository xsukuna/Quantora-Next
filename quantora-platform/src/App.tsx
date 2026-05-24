import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Settings,
  Shield, LogOut, User, FileText, BookOpen,
  Activity, Building2, Bell, Sun, Moon
} from 'lucide-react';

// Component Imports
import { LandingPage } from './components/LandingPage';
import { ResearchLibrary } from './components/ResearchLibrary';
import { UploadForm } from './components/UploadForm';
import { AdminDashboard } from './components/AdminDashboard';
import { LiveTerminal } from './components/LiveTerminal';
import { ProfessionalPages } from './components/ProfessionalPages';
import { AuthModal } from './components/AuthModal';

// DB Service Imports
import { getCurrentUser, saveCurrentUser } from './services/db';
import type { User as DBUser } from './services/db';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('HOME');
  const [currentUser, setCurrentUser] = useState<DBUser | null>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  
  // Modals & Panels
  const [authOpen, setAuthOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Theme Preference
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Load auth session
    setCurrentUser(getCurrentUser());
    
    // Load theme setting
    const savedTheme = localStorage.getItem('quantora_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // system check
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

  const handleAuthSuccess = (user: DBUser) => {
    setCurrentUser(user);
  };

  const handleSignOut = () => {
    saveCurrentUser(null);
    setCurrentUser(null);
    setActiveTab('HOME');
  };

  const handleNavigation = (tab: string, paperId?: string) => {
    setActiveTab(tab);
    if (paperId) {
      setSelectedPaperId(paperId);
    } else {
      setSelectedPaperId(null);
    }
  };

  // Mock Notification logs
  const notifications = [
    { id: '1', title: 'Operational Clearance Granted', desc: 'Secure connection established to NY-HUB-04.' },
    { id: '2', title: 'New Geopolitical Index Alert', desc: 'Lithium critical processing choke-point reports uploaded.' }
  ];

  return (
    <div className={`flex h-screen overflow-hidden font-sans bg-[#020202] text-white`}>
      
      {/* 1. DYNAMIC SIDE NAVIGATION BAR */}
      <div className="w-20 border-r border-white/5 flex flex-col items-center justify-between py-6 bg-[#050505] z-50 shrink-0">
        
        {/* Core Branding logo */}
        <div 
          onClick={() => handleNavigation('HOME')}
          className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/5 cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <div className="logo-3d-container scale-90">
            <div className="cube-3d">
              <div className="cube-face cube-face-front"></div>
              <div className="cube-face cube-face-back"></div>
              <div className="cube-face cube-face-left"></div>
              <div className="cube-face cube-face-right"></div>
              <div className="cube-face cube-face-top"></div>
              <div className="cube-face cube-face-bottom"></div>
            </div>
          </div>
        </div>

        {/* Tab Items switches */}
        <div className="flex flex-col gap-6 text-gray-500 mt-4">
          
          <button 
            onClick={() => handleNavigation('HOME')}
            className={`flex flex-col items-center gap-1 group relative`}
          >
            <LayoutDashboard 
              className={`w-6 h-6 cursor-pointer group-hover:text-blue-400 transition-all ${
                activeTab === 'HOME' ? 'text-blue-400 scale-115' : ''
              }`} 
            />
            <span className="text-[8px] font-black uppercase tracking-wider scale-90 opacity-70 group-hover:opacity-100">Index</span>
            {activeTab === 'HOME' && <span className="absolute left-0 top-1/3 w-1 h-3 bg-blue-500 rounded-r" />}
          </button>

          <button 
            onClick={() => handleNavigation('LIBRARY')}
            className={`flex flex-col items-center gap-1 group relative`}
          >
            <BookOpen 
              className={`w-6 h-6 cursor-pointer group-hover:text-blue-400 transition-all ${
                activeTab === 'LIBRARY' ? 'text-blue-400 scale-115' : ''
              }`} 
            />
            <span className="text-[8px] font-black uppercase tracking-wider scale-90 opacity-70 group-hover:opacity-100">Library</span>
            {activeTab === 'LIBRARY' && <span className="absolute left-0 top-1/3 w-1 h-3 bg-blue-500 rounded-r" />}
          </button>

          <button 
            onClick={() => handleNavigation('SUBMIT')}
            className={`flex flex-col items-center gap-1 group relative`}
          >
            <FileText 
              className={`w-6 h-6 cursor-pointer group-hover:text-emerald-400 transition-all ${
                activeTab === 'SUBMIT' ? 'text-emerald-400 scale-115' : ''
              }`} 
            />
            <span className="text-[8px] font-black uppercase tracking-wider scale-90 opacity-70 group-hover:opacity-100">Submit</span>
            {activeTab === 'SUBMIT' && <span className="absolute left-0 top-1/3 w-1 h-3 bg-emerald-500 rounded-r" />}
          </button>

          <button 
            onClick={() => handleNavigation('TERMINAL')}
            className={`flex flex-col items-center gap-1 group relative`}
          >
            <Activity 
              className={`w-6 h-6 cursor-pointer group-hover:text-cyan-400 transition-all ${
                activeTab === 'TERMINAL' ? 'text-cyan-400 scale-115' : ''
              }`} 
            />
            <span className="text-[8px] font-black uppercase tracking-wider scale-90 opacity-70 group-hover:opacity-100">Terminal</span>
            {activeTab === 'TERMINAL' && <span className="absolute left-0 top-1/3 w-1 h-3 bg-cyan-500 rounded-r" />}
          </button>

          <button 
            onClick={() => handleNavigation('PROFESSIONAL')}
            className={`flex flex-col items-center gap-1 group relative`}
          >
            <Building2 
              className={`w-6 h-6 cursor-pointer group-hover:text-purple-400 transition-all ${
                activeTab === 'PROFESSIONAL' ? 'text-purple-400 scale-115' : ''
              }`} 
            />
            <span className="text-[8px] font-black uppercase tracking-wider scale-90 opacity-70 group-hover:opacity-100">Org</span>
            {activeTab === 'PROFESSIONAL' && <span className="absolute left-0 top-1/3 w-1 h-3 bg-purple-500 rounded-r" />}
          </button>

          {currentUser && currentUser.role === 'Admin' && (
            <button 
              onClick={() => handleNavigation('ADMIN')}
              className={`flex flex-col items-center gap-1 group relative`}
            >
              <Shield 
                className={`w-6 h-6 cursor-pointer group-hover:text-red-400 transition-all ${
                  activeTab === 'ADMIN' ? 'text-red-400 scale-115' : ''
                }`} 
              />
              <span className="text-[8px] font-black uppercase tracking-wider scale-90 opacity-70 group-hover:opacity-100 text-red-500">Admin</span>
              {activeTab === 'ADMIN' && <span className="absolute left-0 top-1/3 w-1 h-3 bg-red-500 rounded-r" />}
            </button>
          )}

        </div>

        {/* Bottom Utility controls */}
        <div className="flex flex-col gap-5 text-gray-500 items-center">
          {/* Theme Preference switch */}
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center text-gray-400 hover:text-white"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <Settings className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* MAIN CONTAINER PLATFORM SHELL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 2. TOP HEAD BAR */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#050505]/95 backdrop-blur-md z-40 select-none shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex flex-col cursor-pointer" onClick={() => handleNavigation('HOME')}>
              <span className="text-[12px] font-black tracking-[0.3em] text-blue-500 uppercase">Quantora Analytics</span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Global Research & Intelligence Ecosystem</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            
            {/* Live active connection indicators */}
            <div className="text-right border-r border-white/10 pr-6 hidden sm:block">
              <div className="text-[10px] font-black text-emerald-400 flex items-center gap-1.5 justify-end">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                <span>SECURE SHAKESHAKE v4.2 [OK]</span>
              </div>
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Node: NY-HUB-04</div>
            </div>

            {/* Notifications Feed */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center text-gray-300 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    {/* click backdrop close */}
                    <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
                    
                    <motion.div 
                      className="absolute right-0 top-full mt-2 w-80 bg-[#0A0F1E] border border-white/10 rounded-2xl shadow-2xl p-4 space-y-4 z-40"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clearance Notifications</h4>
                      <div className="space-y-3">
                        {notifications.map(n => (
                          <div key={n.id} className="p-3 bg-white/2 border border-white/5 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-white uppercase block">{n.title}</span>
                            <span className="text-[10px] text-gray-400 leading-normal block font-normal">{n.desc}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Authentication profile display */}
            {currentUser ? (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 hover:bg-white/8 transition-all relative group select-none">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                
                <div className="flex flex-col text-left shrink-0">
                  <span className="text-xs font-bold text-white max-w-[100px] truncate">{currentUser.name}</span>
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider">{currentUser.badge} | Rep: {currentUser.reputation}</span>
                </div>
                
                <button 
                  onClick={handleSignOut}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 hover:bg-red-600/10 text-gray-500 hover:text-red-400 transition-colors flex items-center justify-center shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setAuthOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
              >
                Request Clearance
              </button>
            )}

          </div>
        </header>

        {/* 3. DYNAMIC CONTENT RENDERING TABS */}
        <main className="flex-1 overflow-hidden bg-[#020202] relative">
          <AnimatePresence mode="wait">
            
            {activeTab === 'HOME' && (
              <motion.div key="home" className="h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LandingPage onNavigate={handleNavigation} openAuth={() => setAuthOpen(true)} />
              </motion.div>
            )}

            {activeTab === 'LIBRARY' && (
              <motion.div key="library" className="h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ResearchLibrary 
                  initialSelectedPaperId={selectedPaperId} 
                  onClearSelectedPaper={() => setSelectedPaperId(null)} 
                  currentUser={currentUser}
                  openAuth={() => setAuthOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'SUBMIT' && (
              <motion.div key="submit" className="h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <UploadForm 
                  currentUser={currentUser}
                  openAuth={() => setAuthOpen(true)}
                  onUploadSuccess={() => handleNavigation('LIBRARY')}
                />
              </motion.div>
            )}

            {activeTab === 'TERMINAL' && (
              <motion.div key="terminal" className="h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LiveTerminal />
              </motion.div>
            )}

            {activeTab === 'PROFESSIONAL' && (
              <motion.div key="professional" className="h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProfessionalPages />
              </motion.div>
            )}

            {activeTab === 'ADMIN' && currentUser && currentUser.role === 'Admin' && (
              <motion.div key="admin" className="h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AdminDashboard currentUser={currentUser} openAuth={() => setAuthOpen(true)} />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* 4. FOOTER RUNNING TICKER TAPE */}
        <footer className="h-10 border-t border-white/5 bg-[#050505] flex items-center px-6 overflow-hidden z-40 select-none shrink-0">
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest animate-ticker">
            {['S&P 500 +1.24%', 'NASDAQ 100 +0.85%', 'FTSE 100 -0.12%', 'USD/EUR +0.04%', 'BTC/USD +4.12%', 'NIKKEI 225 +0.56%', 'GOLD +0.22%', 'CRUDE OIL -1.45%'].map((tick, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-gray-500">CORRIDOR-{idx+1}</span>
                <span className={tick.includes('-') ? 'text-red-400' : 'text-emerald-400'}>{tick}</span>
                <span className="text-gray-800 font-normal">|</span>
              </div>
            ))}
          </div>
        </footer>

      </div>

      {/* GATEWAY AUTH MODAL OVERLAY */}
      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />

    </div>
  );
};

export default App;
