/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Daily Assessment Completion Status & Action Banner
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React from 'react';
import { Card } from '../common/Card';
import { CheckCircle, AlertCircle, ArrowRight, Calendar } from 'lucide-react';

interface DailyCompletionStatusProps {
  isCompletedToday: boolean;
  missionDay: number;
  lastLoggedTimestamp?: string;
  onNavigateToAssessment: () => void;
  onNavigateToHistory: () => void;
}

export const DailyCompletionStatus: React.FC<DailyCompletionStatusProps> = ({
  isCompletedToday,
  missionDay,
  lastLoggedTimestamp,
  onNavigateToAssessment,
  onNavigateToHistory,
}) => {
  return (
    <Card
      glow={isCompletedToday ? 'green' : 'cyan'}
      title="Daily Protocol Compliance"
      subtitle={`Mission Day (Sol) ${missionDay} telemetry status`}
      icon={<Calendar className="w-4 h-4" />}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Compliance State Message */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`p-3 rounded-xl border shrink-0 ${
              isCompletedToday
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400 animate-pulse'
            }`}
          >
            {isCompletedToday ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-mono font-bold text-sm text-slate-100">
                {isCompletedToday
                  ? `MISSION PROTOCOL COMPLETED (SOL ${missionDay})`
                  : `DAILY TELEMETRY ASSESSMENT PENDING (SOL ${missionDay})`}
              </h4>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isCompletedToday
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-950 text-amber-300 border-amber-500/30'
                }`}
              >
                {isCompletedToday ? 'LOGGED' : 'ACTION REQUIRED'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 font-sans">
              {isCompletedToday
                ? `Biometric entry logged successfully at ${
                    lastLoggedTimestamp ? new Date(lastLoggedTimestamp).toLocaleTimeString() : 'Mission standard time'
                  }. Next scheduled log cycle opens tomorrow.`
                : 'Crew protocol requires logging all 6 physiological parameters daily to preserve flight readiness and track microgravity adaptation.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          <button
            onClick={onNavigateToAssessment}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-md ${
              isCompletedToday
                ? 'bg-space-850 hover:bg-space-800 text-slate-200 border border-slate-700'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-neon-cyan/30'
            }`}
          >
            <span>{isCompletedToday ? 'Submit New Assessment' : 'Log Daily Vitals'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onNavigateToHistory}
            className="hidden md:flex items-center justify-center px-3 py-2.5 rounded-xl font-mono text-xs text-slate-400 hover:text-cyan-300 hover:bg-space-850 border border-slate-800 transition-all"
          >
            View History
          </button>
        </div>

      </div>
    </Card>
  );
};
