/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Mission Control Top Navigation & Telemetry Clock
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React, { useState, useEffect } from 'react';
import { Activity, Clock, ShieldAlert, RotateCcw, Menu } from 'lucide-react';
import { MEDICAL_DISCLAIMER } from '../../config/thresholds';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onResetData: () => void;
  missionDay: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onResetData,
  missionDay,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-space-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Mobile Toggle & Brand / Mission Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-space-850"
            aria-label="Open mission navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 shadow-neon-cyan/20">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base sm:text-lg tracking-wider text-slate-100">
                  AEGIS<span className="text-cyan-400">.HEALTH</span>
                </span>
                <span className="hidden sm:inline-flex items-center rounded-md bg-cyan-950/80 px-2 py-0.5 text-[10px] font-mono font-medium text-cyan-300 border border-cyan-500/30">
                  PHASE 1
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 font-sans tracking-wide">
                Astronaut Physiological Monitoring System — Deep Space Mission Analog
              </p>
            </div>
          </div>
        </div>

        {/* Center: Mission Elapsed Time (MET) & UTC Telemetry */}
        <div className="hidden xl:flex items-center gap-6 font-mono text-xs text-slate-300">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900/80 border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">UTC:</span>
            <span className="text-cyan-300 font-semibold">{utcTime || 'SYNCHRONIZING...'}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900/80 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">MISSION DAY:</span>
            <span className="text-emerald-400 font-bold">SOL {missionDay}</span>
          </div>
        </div>

        {/* Right: Disclaimer Badge & Developer Tools */}
        <div className="flex items-center gap-3">
          {/* Medical disclaimer indicator */}
          <div
            className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono"
            title={MEDICAL_DISCLAIMER.fullNotice}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline text-[11px]">RESEARCH PROTOTYPE</span>
            {/* Tooltip on hover */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-72 p-3 bg-space-900 border border-amber-500/40 rounded-xl shadow-xl text-[11px] text-slate-300 z-50 normal-case font-sans">
              <p className="font-semibold text-amber-300 mb-1">Medical Notice</p>
              <p>{MEDICAL_DISCLAIMER.fullNotice}</p>
            </div>
          </div>

          {/* Reset sample data action (crucial for testers & judges) */}
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-cyan-300 hover:bg-space-850 border border-transparent hover:border-slate-800 transition-all"
            title="Reload realistic sample demonstration records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Demo Data</span>
          </button>
        </div>

      </div>
    </header>
  );
};
