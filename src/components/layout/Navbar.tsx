/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Top Navigation Bar — Phase 2 UI Refresh
 * Lead Developer: Abdul Rafay
 * UI Design: Abdullah (Phase 2 Reference Images)
 */

import React, { useState, useEffect } from 'react';
import { Bell, RotateCcw, Menu } from 'lucide-react';

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
  const [hasAlerts] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-[#0a0e1f]/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">

        {/* Left: Mobile toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Mission badge + actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Mission Day pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-xs font-semibold text-green-400 font-mono">
              Mission Day {missionDay}
            </span>
          </div>

          {/* Time */}
          <span className="hidden sm:inline text-xs font-mono text-slate-400">{time}</span>

          {/* Alert bell */}
          <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <Bell className="w-4 h-4" />
            {hasAlerts && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
            )}
          </button>

          {/* Reset demo */}
          <button
            onClick={onResetData}
            title="Reset to demonstration data"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>

      </div>
    </header>
  );
};
