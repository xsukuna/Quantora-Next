import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, CheckCircle, Fingerprint } from 'lucide-react';
import { handleMockAuth } from '../services/db';
import type { User as DBUser } from '../services/db';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: DBUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginMethod = (method: 'Google' | 'GitHub' | 'OTP') => {
    setIsLoading(true);
    setTimeout(() => {
      let targetEmail = email;
      if (method === 'Google') targetEmail = 'aditya.kaushik@gmail.com';
      if (method === 'GitHub') targetEmail = 'scarfaceatwork@outlook.com';
      
      if (method === 'OTP' && !isOtpSent) {
        if (!email.includes('@')) {
          alert('Please enter a valid email address.');
          setIsLoading(false);
          return;
        }
        setIsOtpSent(true);
        setIsLoading(false);
        return;
      }

      const user = handleMockAuth(targetEmail, method);
      setSuccessMsg(`Access Authorized. Welcome back, ${user.name}!`);
      setIsLoading(false);
      
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
        setSuccessMsg('');
        setIsOtpSent(false);
        setEmail('');
        setOtp('');
      }, 1500);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          {/* Backdrop click */}
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative w-full max-w-md overflow-hidden glass rounded-2xl border border-white/10 shadow-2xl z-10 p-8"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          >
            {/* Ambient background glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest text-white">Security Gateway</h3>
              <p className="text-xs text-gray-400 mt-1">Authenticate to access the Quantora Intelligence Platform</p>
            </div>

            {successMsg ? (
              <motion.div 
                className="my-8 py-6 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center gap-3 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle className="w-8 h-8 text-emerald-400 animate-bounce" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{successMsg}</span>
              </motion.div>
            ) : (
              <div className="mt-8 space-y-6">
                {!isOtpSent ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 text-gray-500 w-4 h-4" />
                        <input
                          type="email"
                          placeholder="e.g. aditya@quantora.org"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:border-blue-500 focus:bg-white/10 text-white transition-all font-mono"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleLoginMethod('OTP')}
                      disabled={isLoading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-blue-600/20"
                    >
                      {isLoading ? 'Requesting Clearance...' : 'Generate OTP Clearance'}
                    </button>

                    <div className="flex items-center justify-between text-gray-500 my-4">
                      <div className="h-[1px] w-full bg-white/5" />
                      <span className="text-[9px] font-black uppercase px-3 tracking-widest whitespace-nowrap">Or Clearance Via</span>
                      <div className="h-[1px] w-full bg-white/5" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleLoginMethod('Google')}
                        className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all text-gray-300"
                      >
                        <Fingerprint className="w-4 h-4 text-red-400" />
                        <span>Google</span>
                      </button>
                      <button
                        onClick={() => handleLoginMethod('GitHub')}
                        className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all text-gray-300"
                      >
                        <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        <span>GitHub</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center text-xs text-blue-400">
                      OTP generated successfully and sent to <strong className="font-mono text-white">{email}</strong>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clearance OTP</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 text-gray-500 w-4 h-4" />
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit credential"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:border-blue-500 focus:bg-white/10 text-white transition-all font-mono tracking-[0.5em] text-center"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleLoginMethod('OTP')}
                      disabled={otp.length !== 6 || isLoading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/40 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-emerald-600/20"
                    >
                      {isLoading ? 'Verifying clearance...' : 'Authorize Clearance'}
                    </button>

                    <button
                      onClick={() => setIsOtpSent(false)}
                      className="w-full py-2 border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      Change Email
                    </button>
                  </motion.div>
                )}
              </div>
            )}
            
            <div className="mt-8 text-center">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest">
                By entering, you verify compliance with Quantora Editorial & Ethical Directives.
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
