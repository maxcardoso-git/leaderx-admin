'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckIcon, CloseIcon, AlertIcon, InfoIcon } from '@/components/icons';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999,
        maxWidth: '400px',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const config = {
    success: {
      icon: <CheckIcon size={20} />,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    error: {
      icon: <CloseIcon size={20} />,
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
    },
    warning: {
      icon: <AlertIcon size={20} />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
    },
    info: {
      icon: <InfoIcon size={20} />,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
  };

  const { icon, bg, border, iconBg, iconColor } = config[toast.type];

  return (
    <div
      className={`${bg} ${border} border rounded-xl backdrop-blur-sm animate-slide-in-up`}
      style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      }}
    >
      <div className={`${iconBg} ${iconColor} p-2 rounded-lg flex-shrink-0`}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="text-sm text-text-primary" style={{ wordBreak: 'break-word' }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors flex-shrink-0"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  );
}
