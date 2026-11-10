/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Interactive Body Map Page Canvas
 * Second Developer: Sameen (Phase 1/2 Visualization Engine)
 */

import React from 'react';
import { BodyFigure } from '../components/body/BodyFigure';
import { DailyAssessmentRecord, AstronautProfile } from '../types/health';
import { Card } from '../components/common/Card';
import {
  User,
  ShieldAlert,
  Sparkles,
  Info,
  HeartPulse,
} from 'lucide-react';

interface BodyMapPageProps {
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
  onNavigateToAssessment: () => void;
  initialSelectedPartId?: string;
}

export const BodyMapPage: React.FC<BodyMapPageProps> = ({
  profile,
  latestAssessment,
  onNavigateToAssessment,
  initialSelectedPartId,
}) => {
  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border border-cyan-500/30 shadow-xl shadow-cyan-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>PHASE 1 ENGINE • DEVELOPED BY SAMEEN</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-sans tracking-wide flex items-center gap-2.5">
              <User className="w-6 h-6 text-cyan-400" />
              Interactive Anatomical Telemetry Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-3xl">
              Front-view physiological avatar mapping active telemetry departure into anatomical subsystems with scientific countermeasures.
            </p>
          </div>

          {/* Quick status chip */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-space-950/90 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Astronaut Call Sign</div>
              <div className="text-sm font-bold text-cyan-300 font-mono">{profile.callSign}</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-space-950/90 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Latest Check-in</div>
              <div className="text-sm font-bold text-slate-200 font-mono">
                {latestAssessment ? `Sol ${latestAssessment.missionDay}` : 'None Logged'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Body Figure Component */}
      <BodyFigure
        latestAssessment={latestAssessment}
        initialSelectedId={initialSelectedPartId}
      />

      {/* Auxiliary Context & Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          glow="none"
          title="Data-Driven Architecture"
          subtitle="Configured via src/data/bodyParts.json"
          icon={<HeartPulse className="w-4 h-4 text-cyan-400" />}
        >
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            All anatomical functions, linked indicators, and research references are completely data-driven. Medical research leads (Eman & Moazzama) can edit body part metadata, clinical protocols, and NASA evidence references in <code className="text-cyan-300 font-mono text-[11px]">bodyParts.json</code> without touching application code.
          </p>
        </Card>

        <Card
          glow="none"
          title="Flight Operations Notice"
          subtitle="Autonomous decision support"
          icon={<ShieldAlert className="w-4 h-4 text-amber-400" />}
        >
          <div className="space-y-2">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Organ status colors (Green/Yellow/Red) are automatically triaged from the latest telemetry check-in. If any linked vital enters a Warning or Critical state, the organ displays its advisory immediately.
            </p>
            {!latestAssessment && (
              <button
                onClick={onNavigateToAssessment}
                className="w-full py-1.5 px-3 rounded-lg bg-space-950 border border-cyan-500/30 text-cyan-300 text-xs font-mono hover:bg-space-900 transition-all text-center block"
              >
                + Complete Initial Telemetry Assessment
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Official Prototype Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-space-950/90 border border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <p>
          <strong className="text-slate-300 font-medium">NASA Space Apps Challenge 2026 Prototype:</strong> This interactive body model serves as autonomous engineering decision support for communication-delayed deep space operations and does not replace certified NASA Flight Surgeons.
        </p>
      </div>
    </div>
  );
};
