/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Overall Health Status Telemetry Card
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React from 'react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { OverallHealthResult } from '../../types/health';
import { ShieldCheck, AlertTriangle, AlertOctagon, Radio } from 'lucide-react';

interface OverallHealthCardProps {
  overall: OverallHealthResult;
  lastUpdatedTime?: string;
}

export const OverallHealthCard: React.FC<OverallHealthCardProps> = ({
  overall,
  lastUpdatedTime,
}) => {
  const glowType =
    overall.status === 'RED'
      ? 'red'
      : overall.status === 'YELLOW'
      ? 'yellow'
      : 'green';

  const getStatusIcon = () => {
    switch (overall.status) {
      case 'RED':
        return <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0" />;
      case 'YELLOW':
        return <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />;
      case 'GREEN':
      default:
        return <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />;
    }
  };

  return (
    <Card
      glow={glowType}
      title="Physiological Status Triage"
      subtitle="Autonomous crew bio-telemetry synthesis"
      icon={<Radio className="w-4 h-4" />}
      headerSlot={
        <div className="flex items-center gap-2">
          {lastUpdatedTime && (
            <span className="hidden sm:inline font-mono text-xs text-slate-400">
              Logged: {new Date(lastUpdatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <StatusBadge status={overall.status} label={overall.statusLabel} size="md" />
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: Overall Indicator Hero Block */}
        <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-space-950/60 p-4 rounded-xl border border-slate-800">
          <div className="p-3 rounded-2xl bg-space-900 border border-slate-700/80 shadow-md">
            {getStatusIcon()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-mono font-bold text-sm sm:text-base text-slate-100 uppercase tracking-wide">
                {overall.alertTitle}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {overall.summary}
            </p>
            <p className="text-xs text-cyan-400 font-mono pt-1">
              <strong>SURGEON ADVISORY:</strong> {overall.recommendationSnippet}
            </p>
          </div>
        </div>

        {/* Right: Metrics Score & Breakdown */}
        <div className="lg:col-span-4 grid grid-cols-3 gap-2">
          
          {/* Normal Count */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-center">
            <span className="block font-mono text-xl sm:text-2xl font-bold text-emerald-400">
              {overall.normalCount}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300/80">
              Nominal
            </span>
          </div>

          {/* Warning Count */}
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-center">
            <span className="block font-mono text-xl sm:text-2xl font-bold text-amber-400">
              {overall.warningCount}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-300/80">
              Caution
            </span>
          </div>

          {/* Urgent Count */}
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 text-center">
            <span className="block font-mono text-xl sm:text-2xl font-bold text-rose-400">
              {overall.urgentCount}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-300/80">
              Urgent
            </span>
          </div>

        </div>

      </div>
    </Card>
  );
};
