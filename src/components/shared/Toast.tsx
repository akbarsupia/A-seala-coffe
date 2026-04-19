'use client';

import React, { useEffect, useState } from 'react';
import { NotificationType } from '@/context/NotificationContext';

interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  onClose: () => void;
}

export default function Toast({ title, message, type, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation slightly before auto-dismiss
    const timer = setTimeout(() => setIsExiting(true), 3700);
    return () => clearTimeout(timer);
  }, []);

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info'
  };

  const colors = {
    success: 'text-emerald-500 bg-emerald-50/10 border-emerald-500/20',
    error: 'text-red-500 bg-red-50/10 border-red-500/20',
    info: 'text-primary bg-primary/10 border-primary/20'
  };

  return (
    <div 
      className={`
        pointer-events-auto w-full max-w-[380px] group
        bg-[#3a2a18]/90 backdrop-blur-xl border-l-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)]
        rounded-2xl overflow-hidden transition-all duration-500 ease-out
        ${isExiting ? 'translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
        animate-in slide-in-from-right-12 duration-500
        ${type === 'success' ? 'border-emerald-500' : type === 'error' ? 'border-red-500' : 'border-primary'}
      `}
    >
      <div className="p-5 flex items-start gap-4">
        <div className={`
          h-12 w-12 rounded-2xl flex items-center justify-center shrink-0
          bg-white/5 border border-white/10 group-hover:scale-110 transition-transform
        `}>
          <span className={`material-symbols-outlined text-2xl ${type === 'success' ? 'text-emerald-400' : type === 'error' ? 'text-red-400' : 'text-primary-container'}`}>
            {icons[type]}
          </span>
        </div>
        
        <div className="flex-1 min-w-0 pr-6">
          <h4 className="text-white font-headline font-bold text-sm tracking-wide mb-1">
            {title}
          </h4>
          <p className="text-stone-300 text-xs leading-relaxed font-medium">
            {message}
          </p>
        </div>

        <button 
          onClick={() => { setIsExiting(true); setTimeout(onClose, 300); }}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors p-1"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-white/10 w-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-[4000ms] linear ${type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-primary'}`}
          style={{ width: isExiting ? '0%' : '100%' }}
        />
      </div>
    </div>
  );
}
