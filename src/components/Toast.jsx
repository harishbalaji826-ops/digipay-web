import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      data-testid="toast-notification"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all duration-300 animate-slide-up ${
        type === 'success'
          ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
          : 'bg-rose-950/90 border-rose-500/30 text-rose-200'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
      )}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 opacity-70" />
      </button>
    </div>
  );
}
