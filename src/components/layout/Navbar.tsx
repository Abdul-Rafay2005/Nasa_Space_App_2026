/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Top Navigation Bar — Exact Design Mockup
 * UI Design: Matches 01_dashboard.png & 08_dashboard_full_concept.png
 */

import React, { useState, useEffect } from 'react';
import { Bell, Menu, Calendar, RotateCcw, User, ShieldAlert } from 'lucide-react';
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
  const [utcTime, setUtcTime] = useState('');
  const [hasAlerts] = useState(true);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#152042]/80 bg-[#070b1a]/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open mission navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <img
              src="/nasa_logo.png"
              alt="NASA"
              className="w-9 h-auto object-contain drop-shadow-[0_0_10px_rgba(37,99,235,0.6)]"
            />
            <div className="hidden sm:block">
              <span className="text-xs font-black tracking-widest text-white uppercase font-sans">
                NASA SPACE HEALTH MONITOR
              </span>
              <span className="block text-[10px] text-cyan-400 font-mono">
                DEEP SPACE CREW BIO-TELEMETRY
              </span>
            </div>
          </div>
        </div>

        {/* Right side items matching 01_dashboard.png and 08_dashboard_full_concept.png */}
        <div className="flex items-center gap-3 ml-auto">

          {/* Research Disclaimer Badge */}
          <div
            className="group relative hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono"
            title={MEDICAL_DISCLAIMER.fullNotice}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] font-semibold">RESEARCH PROTOTYPE</span>
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-72 p-3 bg-[#0c142b] border border-amber-500/40 rounded-xl shadow-2xl text-[11px] text-slate-300 z-50 font-sans leading-relaxed">
              <strong className="text-amber-300 block mb-1">NASA Space Apps 2026</strong>
              {MEDICAL_DISCLAIMER.fullNotice}
            </div>
          </div>

          {/* Mission Day Pill (green glowing dot) */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0e1738] border border-emerald-500/30 text-xs font-semibold text-white shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 ring-2 ring-emerald-400/30" />
            <span className="font-sans">Mission Day {missionDay}</span>
          </div>

          {/* Date pill */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0e1738] border border-[#1e2e5c] text-xs font-semibold text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-sans">{utcTime || 'Nov 9, 2026'}</span>
          </div>

          {/* Reset Demo button */}
          <button
            onClick={onResetData}
            title="Reset telemetry to default demo"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Reset Demo</span>
          </button>

          {/* Notification Bell */}
          <button
            className="relative p-2 rounded-full bg-[#0e1738] border border-[#1e2e5c] text-slate-300 hover:text-white hover:bg-[#152354] transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasAlerts && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#070b1a]" />
            )}
          </button>

          {/* User Avatar Circle */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-white">
            <User className="w-4 h-4 text-white" />
          </div>

        </div>

      </div>
    </header>
  );
};
