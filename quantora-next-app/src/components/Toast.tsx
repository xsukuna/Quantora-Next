'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  warning: (msg: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | null>(null);

// ─── Config per type ─────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ToastType, { color: string; bg: string; border: string; icon: string }> = {
  success: {
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.30)',
    icon: '✓',
  },
  error: {
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.30)',
    icon: '✕',
  },
  info: {
    color: '#0062FF',
    bg: 'rgba(0,98,255,0.12)',
    border: 'rgba(0,98,255,0.30)',
    icon: 'ℹ',
  },
  warning: {
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.30)',
    icon: '⚠',
  },
};

// ─── Individual Toast Item ────────────────────────────────────────────────────

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const cfg = TYPE_CONFIG[toast.type];

  useEffect(() => {
    // Trigger slide-in on mount
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Start exit animation before removal
    const exitTimer = setTimeout(() => setVisible(false), 3600);
    // Remove after exit animation
    const removeTimer = setTimeout(() => onRemove(toast.id), 4000);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onRemove]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 350);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '12px',
        border: `1px solid ${cfg.border}`,
        background: `${cfg.bg}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
        minWidth: '280px',
        maxWidth: '360px',
        transform: visible ? 'translateX(0)' : 'translateX(110%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease',
        pointerEvents: 'auto',
      }}
    >
      {/* Icon */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: cfg.color,
          color: '#fff',
          fontSize: '11px',
          fontWeight: 700,
          flexShrink: 0,
          marginTop: '1px',
          lineHeight: 1,
        }}
      >
        {cfg.icon}
      </span>

      {/* Message */}
      <span
        style={{
          flex: 1,
          fontSize: '13px',
          fontWeight: 500,
          color: '#E2E8F0',
          lineHeight: '1.4',
          wordBreak: 'break-word',
        }}
      >
        {toast.message}
      </span>

      {/* Close button */}
      <button
        onClick={handleClose}
        aria-label="Dismiss notification"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '18px',
          height: '18px',
          background: 'rgba(255,255,255,0.08)',
          border: 'none',
          borderRadius: '4px',
          color: '#A0AEC0',
          cursor: 'pointer',
          fontSize: '11px',
          flexShrink: 0,
          marginTop: '2px',
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)';
          (e.currentTarget as HTMLButtonElement).style.color = '#fff';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
          (e.currentTarget as HTMLButtonElement).style.color = '#A0AEC0';
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Toaster ─────────────────────────────────────────────────────────────────

export function Toaster() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  // Access internal toasts list via a separate internal context
  return null; // Rendered by ToastProvider internally
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const value: ToastContextType = {
    toast: addToast,
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container — fixed bottom-right */}
      <div
        aria-label="Notifications"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
