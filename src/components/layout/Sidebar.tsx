/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Mission Control Sidebar Navigation — Exact Design Mockup
 * UI Design: Matches 01_dashboard.png & 08_dashboard_full_concept.png
 */

import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  User,
  TrendingUp,
  ShieldCheck,
  CalendarCheck,
  History,
  Activity,
  Settings,
} from 'lucide-react';
import { AstronautProfile } from '../../types/health';

export type NavigationPage =
  | 'dashboard'
  | 'assessment'
  | 'body-map'
  | 'analytics'
  | 'guidance'
  | 'routine'
  | 'history'
  | 'overview';

interface SidebarProps {
  currentPage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  astronautProfile: AstronautProfile;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'assessment' as NavigationPage, label: 'Health Check-in', icon: ClipboardCheck },
  { id: 'body-map' as NavigationPage, label: 'Body Overview', icon: User },
  { id: 'analytics' as NavigationPage, label: 'Trends & Charts', icon: TrendingUp },
  { id: 'guidance' as NavigationPage, label: 'Guidance & Alerts', icon: ShieldCheck },
  { id: 'routine' as NavigationPage, label: 'Mission Routine', icon: CalendarCheck },
  { id: 'history' as NavigationPage, label: 'Health History Log', icon: History },
  { id: 'overview' as NavigationPage, label: 'Baseline Overview', icon: Activity },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  astronautProfile,
  isOpenMobile,
  onCloseMobile,
}) => {
  const handleItemClick = (page: NavigationPage) => {
    onSelectPage(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-[#070b1a] border-r border-[#152042] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 select-none ${
          isOpenMobile ? 'translate-x-0' : 'max-lg:-translate-x-full'
        }`}
      >
        {/* Logo & Header (matches design mockup) */}
        <div className="flex flex-col items-center pt-7 pb-6 px-4 border-b border-[#152042]/70">
          {/* NASA Meatball Badge */}
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/60 ring-2 ring-blue-400/30">
              <span className="text-white font-black text-sm tracking-widest font-sans">NASA</span>
            </div>
            {/* Subtle orbital ring */}
            <div className="absolute -inset-1 rounded-full border border-blue-400/20 pointer-events-none" />
          </div>

          <h1 className="text-base font-extrabold text-white tracking-wide font-sans text-center">
            Space Health Monitor
          </h1>
          <p className="text-[11px] font-medium text-slate-400 tracking-wider text-center mt-0.5">
            Stay Healthy. Go Further.
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#111c3d]/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-white scale-110' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Settings button */}
        <div className="px-3 pb-2">
          <button
            onClick={() => alert('Mission Telemetry Settings: System nominal. Encryption AES-256 GCM active.')}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-[#111c3d]/60 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>
        </div>

        {/* Bottom Profile & Mission Badge */}
        <div className="p-3 border-t border-[#152042]/70 bg-gradient-to-b from-[#070b1a] to-[#0a1026]">
          {/* Astronaut Profile Pill */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0f1738]/80 border border-blue-500/20">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0 ring-1 ring-cyan-400/40">
              {astronautProfile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">
                {astronautProfile.name}
              </p>
              <p className="text-[10px] text-cyan-400 font-mono truncate">
                {astronautProfile.callSign} • SOL {astronautProfile.currentMissionDay}
              </p>
            </div>
          </div>

          {/* NASA Space Apps 2026 Footer Tag */}
          <div className="mt-2.5 px-2 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              NASA Space Apps 2026
            </p>
            <p className="text-[10px] text-blue-400 font-mono mt-0.5">
              🚀 Team Odyssey
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
