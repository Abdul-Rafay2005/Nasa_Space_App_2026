/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Astronaut Profile Dashboard Card
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React from 'react';
import { Card } from '../common/Card';
import { AstronautProfile } from '../../types/health';
import { User, Shield, Compass, HeartPulse, Gauge, Thermometer } from 'lucide-react';

interface AstronautProfileCardProps {
  profile: AstronautProfile;
}

export const AstronautProfileCard: React.FC<AstronautProfileCardProps> = ({ profile }) => {
  return (
    <Card
      glow="cyan"
      title="Crew Telemetry Profile"
      subtitle="Deep-space analog crew biometric registration"
      icon={<User className="w-4 h-4" />}
      headerSlot={
        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
          ID: {profile.id}
        </span>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Left Column: Avatar & Primary Identifiers */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-neon-cyan/30">
              <div className="w-full h-full rounded-[14px] bg-space-900 flex items-center justify-center text-cyan-300 font-mono font-bold text-xl">
                {profile.callSign.slice(0, 2)}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-space-900 shadow-neon-green/50" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 font-sans tracking-wide">
                {profile.name}
              </h2>
            </div>
            <p className="text-xs text-cyan-400 font-mono font-medium">
              {profile.rank}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {profile.role}
            </p>
          </div>
        </div>

        {/* Center Column: Mission & Vehicle Metadata */}
        <div className="space-y-2 border-l border-r border-slate-800/80 px-0 md:px-5">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400">Mission:</span>
            <span className="font-medium text-slate-200 truncate">{profile.missionName}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400">Habitat:</span>
            <span className="font-medium text-slate-200 truncate">{profile.spacecraft}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
            <span>Age: <strong className="text-slate-200">{profile.age}</strong></span>
            <span>Blood: <strong className="text-slate-200">{profile.bloodType}</strong></span>
            <span>Status: <strong className="text-emerald-400">Active EVA</strong></span>
          </div>
        </div>

        {/* Right Column: Pre-Flight Baseline Vitals */}
        <div className="bg-space-950/70 rounded-xl p-3 border border-slate-800">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
            Nominal Pre-Flight Baselines
          </p>
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-space-900/80 p-2 rounded-lg border border-slate-800/80">
              <HeartPulse className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
              <div className="text-xs font-bold text-slate-200">{profile.restingHeartRateBaseline}</div>
              <div className="text-[10px] text-slate-400">BPM</div>
            </div>

            <div className="bg-space-900/80 p-2 rounded-lg border border-slate-800/80">
              <Gauge className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
              <div className="text-xs font-bold text-slate-200">
                {profile.bloodPressureBaseline.systolic}/{profile.bloodPressureBaseline.diastolic}
              </div>
              <div className="text-[10px] text-slate-400">mmHg</div>
            </div>

            <div className="bg-space-900/80 p-2 rounded-lg border border-slate-800/80">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
              <div className="text-xs font-bold text-slate-200">{profile.bodyTemperatureBaseline}°C</div>
              <div className="text-[10px] text-slate-400">Core</div>
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
};

