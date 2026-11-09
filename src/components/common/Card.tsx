/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Futuristic Mission Control Card Container
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'green' | 'yellow' | 'red' | 'none';
  headerSlot?: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  headerSlot,
  title,
  subtitle,
  icon,
}) => {
  const glowClasses = {
    cyan: 'border-cyan-500/40 shadow-neon-cyan/20 hover:border-cyan-400/60',
    green: 'border-emerald-500/40 shadow-neon-green/20 hover:border-emerald-400/60',
    yellow: 'border-amber-500/40 shadow-neon-yellow/20 hover:border-amber-400/60',
    red: 'border-rose-500/50 shadow-neon-red/30 hover:border-rose-400/70',
    none: 'border-slate-800/80 hover:border-slate-700/80',
  };

  return (
    <div
      className={`relative rounded-xl border bg-gradient-to-b from-space-900/90 via-space-850/80 to-space-950/90 backdrop-blur-xl p-5 transition-all duration-200 ${glowClasses[glow]} ${className}`}
    >
      {/* Subtle corner tech tick marks */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/40 rounded-tl pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/40 rounded-tr pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/40 rounded-bl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/40 rounded-br pointer-events-none" />

      {(title || headerSlot) && (
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
          {title && (
            <div className="flex items-center gap-2.5">
              {icon && <span className="text-cyan-400">{icon}</span>}
              <div>
                <h3 className="font-sans font-semibold text-sm tracking-wide text-slate-100 uppercase">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-slate-400 font-normal">{subtitle}</p>
                )}
              </div>
            </div>
          )}
          {headerSlot && <div className="shrink-0">{headerSlot}</div>}
        </div>
      )}

      {children}
    </div>
  );
};

