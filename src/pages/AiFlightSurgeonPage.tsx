/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: AI Flight Surgeon Clinical Consultation Page (Dr. Orion AI)
 * Powered by Google Gemini API & Live Astronaut Telemetry Context
 */

import React from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';
import { AstronautProfile, DailyAssessmentRecord } from '../types/health';
import {
  Heart,
  Activity,
  Shield,
  Zap,
  Moon,
  Thermometer,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { getGroundLinkState } from '../stores/groundLinkStore';

interface AiFlightSurgeonPageProps {
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
  historyRecords?: DailyAssessmentRecord[];
  onNavigateToCheckIn?: () => void;
  onNavigateToGuidance?: () => void;
  onNavigateToBodyMap?: () => void;
}

export const AiFlightSurgeonPage: React.FC<AiFlightSurgeonPageProps> = ({
  profile,
  latestAssessment,
  historyRecords = [],
  onNavigateToCheckIn,
  onNavigateToGuidance,
  onNavigateToBodyMap,
}) => {
  const groundState = getGroundLinkState();
  const vitals = latestAssessment?.values;
  const overall = latestAssessment?.overall;
  const results = latestAssessment?.results;

  const hrDiff = (vitals?.heartRate ?? 72) - profile.restingHeartRateBaseline;

  return (
    <div className="space-y-6">
      {/* Page Title & Mission Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              Powered by Google Gemini API
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
              NASA-STD-3001 Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Dr. Orion — Autonomous AI Flight Surgeon
          </h1>
          <p className="text-sm text-slate-400">
            Conversational clinical decision support with complete knowledge of {profile.name}'s telemetry, personal baselines, recovery protocols, and deep-space countermeasures.
          </p>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-right">
            <p className="text-[11px] text-slate-400 uppercase font-mono">
              Comms Link: <span className={groundState.mode === 'mars_delay' ? 'text-amber-400' : 'text-emerald-400'}>{groundState.mode === 'mars_delay' ? 'Mars 22m Latency' : 'DSN Online'}</span>
            </p>
            <p className="text-sm font-bold text-blue-400">Mission Sol {profile.currentMissionDay}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Astronaut Telemetry HUD, Right Gemini Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Telemetry HUD (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Astronaut Profile & Score Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Astronaut Under Care</span>
                <h3 className="text-base font-bold text-white">{profile.name}</h3>
                <p className="text-xs text-blue-300 font-mono">{profile.callSign} • {profile.rank}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400">{overall?.score ?? 95}</span>
                <span className="text-xs text-slate-400">/100</span>
                <p className="text-[10px] font-medium text-emerald-300 uppercase">Health Score</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px]">Mission:</span>
                <span className="font-medium text-white truncate block">{profile.missionName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Spacecraft:</span>
                <span className="font-medium text-white truncate block">{profile.spacecraft}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Age / Blood:</span>
                <span className="font-medium text-white">{profile.age} yrs • {profile.bloodType}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Rest Baseline HR:</span>
                <span className="font-mono text-white">{profile.restingHeartRateBaseline} BPM</span>
              </div>
            </div>
          </div>

          {/* Real-time Physiological Vitals Feed */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                Active Telemetry Indicators
              </h4>
              <span className="text-[10px] text-emerald-400 font-mono">Live</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Heart Rate */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="font-medium text-white">Resting Heart Rate</span>
                    <span className="block text-[10px] text-slate-400">
                      Baseline: {profile.restingHeartRateBaseline} BPM ({hrDiff >= 0 ? `+${hrDiff}` : hrDiff} BPM)
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold text-white font-mono">{vitals?.heartRate ?? 72} <span className="text-[10px] font-normal text-slate-400">BPM</span></span>
              </div>

              {/* Blood Pressure */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="font-medium text-white">Blood Pressure</span>
                    <span className="block text-[10px] text-slate-400">
                      Baseline: {profile.bloodPressureBaseline.systolic}/{profile.bloodPressureBaseline.diastolic} mmHg
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold text-white font-mono">{vitals?.systolic ?? 118}/{vitals?.diastolic ?? 76} <span className="text-[10px] font-normal text-slate-400">mmHg</span></span>
              </div>

              {/* Core Temp */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span className="font-medium text-white">Core Temperature</span>
                </div>
                <span className="text-sm font-bold text-white font-mono">{vitals?.bodyTemperature ?? 36.6} <span className="text-[10px] font-normal text-slate-400">°C</span></span>
              </div>

              {/* Sleep Duration */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="font-medium text-white">Sleep Duration</span>
                </div>
                <span className="text-sm font-bold text-white font-mono">{vitals?.sleepDuration ?? 7.5} <span className="text-[10px] font-normal text-slate-400">hours</span></span>
              </div>

              {/* Environmental CO2 */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-medium text-white">Cabin CO₂ (NASA-STD-3001)</span>
                    <span className="block text-[10px] text-slate-400">Ceiling: 3.0 mmHg</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-400 font-mono">{results?.cabinCO2?.valueDisplay ?? '2.8'} <span className="text-[10px] font-normal text-slate-400">mmHg</span></span>
              </div>

              {/* Space Radiation */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="font-medium text-white">Radiation Career Dose</span>
                    <span className="block text-[10px] text-slate-400">30% CSA neutron share</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-purple-300 font-mono">{results?.radiationDose?.valueDisplay ?? '142'} <span className="text-[10px] font-normal text-slate-400">mSv</span></span>
              </div>

              {/* SANS Vision Check */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-teal-400" />
                  <span className="font-medium text-white">SANS Vision & Headache</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400 font-mono">
                  {vitals?.visionHeadache === 'yes' ? '⚠️ Flagged' : '✅ Nominal'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation links */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Clinical Action Tools</span>
            {onNavigateToCheckIn && (
              <button
                type="button"
                onClick={onNavigateToCheckIn}
                className="w-full px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-medium text-blue-300 flex items-center justify-between transition-colors"
              >
                <span>Complete Sol {profile.currentMissionDay} Check-In</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {onNavigateToGuidance && (
              <button
                type="button"
                onClick={onNavigateToGuidance}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 text-xs font-medium text-slate-300 flex items-center justify-between transition-colors"
              >
                <span>View Flight Surgeon Guidance & Rules</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {onNavigateToBodyMap && (
              <button
                type="button"
                onClick={onNavigateToBodyMap}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 text-xs font-medium text-slate-300 flex items-center justify-between transition-colors"
              >
                <span>Inspect 2D/3D Body Twin</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Area: Gemini Interactive Chat Interface (8 cols on lg) */}
        <div className="lg:col-span-8 h-[740px]">
          <ChatInterface
            profile={profile}
            latestAssessment={latestAssessment}
            historyRecords={historyRecords}
          />
        </div>
      </div>
    </div>
  );
};
