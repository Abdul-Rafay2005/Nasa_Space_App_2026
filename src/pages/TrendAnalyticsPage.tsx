/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Trend Analytics Page Canvas
 * Second Developer: Sameen (Phase 1/2 Visualization Engine)
 */

import React from 'react';
import { TrendChart } from '../components/charts/TrendChart';
import { DailyAssessmentRecord, AstronautProfile } from '../types/health';
import { Card } from '../components/common/Card';
import {
  LineChart,
  Calendar,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface TrendAnalyticsPageProps {
  profile: AstronautProfile;
  records: DailyAssessmentRecord[];
  onRecordsChange: (updated: DailyAssessmentRecord[]) => void;
  onNavigateToAssessment: () => void;
}

export const TrendAnalyticsPage: React.FC<TrendAnalyticsPageProps> = ({
  profile,
  records,
  onRecordsChange,
  onNavigateToAssessment,
}) => {
  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Mission Analytics Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border border-cyan-500/30 shadow-xl shadow-cyan-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>PHASE 1 ENGINE • DEVELOPED BY SAMEEN</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-sans tracking-wide flex items-center gap-2.5">
              <LineChart className="w-6 h-6 text-cyan-400" />
              Longitudinal Health Trend Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-3xl">
              Time-series evaluation tracking astronaut vital deviations across Mission Sols against clinical flight threshold bands.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-space-950/90 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Archived Sols</div>
              <div className="text-base font-bold text-cyan-300 font-mono">{records.length}</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-space-950/90 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Current Sol</div>
              <div className="text-base font-bold text-slate-100 font-mono">Sol {profile.currentMissionDay}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Trend Chart Component */}
      <TrendChart
        records={records}
        onRecordsChange={onRecordsChange}
      />

      {/* Auxiliary Context & Quick Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          glow="none"
          title="Threshold Band Model"
          subtitle="Provisional clinical boundaries"
          icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
        >
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Green shaded bands reflect optimal microgravity adaptation windows. Yellow and Red departure envelopes provide automated flight surgeon decision support.
          </p>
        </Card>

        <Card
          glow="none"
          title="Colorblind Geometry"
          subtitle="Accessibility compliance"
          icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
        >
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            In accordance with spaceflight human factors ergonomics, every reading is plotted with distinct geometric markers: Circles (Nominal), Triangles (Warning), and Diamonds (Urgent).
          </p>
        </Card>

        <Card
          glow="none"
          title="Telemetry Synchronization"
          subtitle="Daily check-in integration"
          icon={<Calendar className="w-4 h-4 text-blue-400" />}
        >
          <div className="space-y-2">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              New readings entered via the Daily Assessment form immediately append to this historical timeline.
            </p>
            <button
              onClick={onNavigateToAssessment}
              className="w-full py-1.5 px-3 rounded-lg bg-space-950 border border-cyan-500/30 text-cyan-300 text-xs font-mono hover:bg-space-900 transition-all text-center block"
            >
              + Record New Daily Assessment
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
