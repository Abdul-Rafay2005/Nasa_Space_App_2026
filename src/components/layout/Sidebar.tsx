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
  Bot,
} from 'lucide-react';
import { AstronautProfile } from '../../types/health';

export type NavigationPage =
  | 'dashboard'
  | 'ai-chat'
  | 'assessment'
  | 'body-map'
  | 'analytics'
  | 'guidance'
  | 'routine'
  | 'history'
  | 'overview'
  | 'sources';

interface SidebarProps {
  currentPage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  astronautProfile: AstronautProfile;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ai-chat' as NavigationPage, label: 'AI Flight Surgeon', icon: Bot, badge: 'Gemini' },
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
        {/* Logo & Header (Official NASA Insignia - Transparent & Prominent) */}
        <div className="flex flex-col items-center pt-6 pb-5 px-4 border-b border-[#152042]/70">
          <div
            className="relative mb-3 flex items-center justify-center group cursor-pointer"
            onClick={() => onSelectPage('dashboard')}
            title="NASA Space Health Monitor"
          >
            {/* Ambient blue glow behind meatball */}
            <div className="absolute inset-0 bg-blue-500/25 rounded-full blur-xl group-hover:bg-blue-500/40 transition-all pointer-events-none" />
            <img
              src="/nasa_logo.png"
              alt="NASA Official Meatball Logo"
              className="relative w-28 sm:w-32 h-auto object-contain drop-shadow-[0_4px_20px_rgba(30,58,138,0.8)] group-hover:scale-105 transition-all duration-300"
            />
          </div>

          <h1 className="text-base font-extrabold text-white tracking-wide font-sans text-center">
            Space Health Monitor
          </h1>
          <p className="text-[11px] font-medium text-cyan-400 tracking-wider text-center mt-0.5 font-mono">
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
                <span className="truncate flex-1">{item.label}</span>
                {'badge' in item && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings button */}
        <div className="px-3 pb-2">
          <button
            onClick={() => handleItemClick('sources')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
              currentPage === 'sources'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-[#111c3d]/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Sources & Settings</span>
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
