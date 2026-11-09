/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Accessible Telemetry Status Badge
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React from 'react';
import { HealthStatus } from '../../types/health';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: HealthStatus;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'GREEN':
        return {
          bg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 shadow-neon-green/20',
          dot: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
          defaultLabel: 'NOMINAL / GREEN',
          glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
        };
      case 'YELLOW':
        return {
          bg: 'bg-amber-950/70 border-amber-500/40 text-amber-300 shadow-neon-yellow/20',
          dot: 'bg-amber-400',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
          defaultLabel: 'WARNING / YELLOW',
          glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
        };
      case 'RED':
        return {
          bg: 'bg-rose-950/70 border-rose-500/50 text-rose-300 shadow-neon-red/30 animate-pulse',
          dot: 'bg-rose-500',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
          defaultLabel: 'CRITICAL / RED',
          glow: 'shadow-[0_0_12px_rgba(239,68,68,0.4)]',
        };
      default:
        return {
          bg: 'bg-slate-900 border-slate-700 text-slate-400',
          dot: 'bg-slate-400',
          icon: <HelpCircle className="w-3.5 h-3.5 shrink-0" />,
          defaultLabel: 'UNKNOWN',
          glow: '',
        };
    }
  };

  const config = getStatusConfig();
  const displayLabel = label || config.defaultLabel;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md transition-all ${config.bg} ${config.glow} ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label={`Health telemetry status: ${displayLabel}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      {showIcon && config.icon}
      <span className="font-mono uppercase">{displayLabel}</span>
    </span>
  );
};

