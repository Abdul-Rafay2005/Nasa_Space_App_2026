/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Accessible Modal Dialog
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark backdrop blur */}
      <div
        className="fixed inset-0 bg-space-950/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} my-8 rounded-2xl border border-cyan-500/30 bg-space-900/95 p-6 shadow-2xl shadow-cyan-950/40 text-slate-100 z-10`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold tracking-wider text-slate-100 uppercase font-mono">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-space-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};
