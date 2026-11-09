/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Mission Control Sidebar Navigation
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React from 'react';
import {
  LayoutDashboard,
  ClipboardPlus,
  History,
  Activity,
  User,
  LineChart,
  CalendarCheck,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { AstronautProfile } from '../../types/health';

export type NavigationPage =
  | 'dashboard'
  | 'assessment'
  | 'history'
  | 'overview'
  | 'body-map'
  | 'analytics'
  | 'routine'
  | 'guidance';

interface SidebarProps {
  currentPage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  astronautProfile: AstronautProfile;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  astronautProfile,
  isOpenMobile,
  onCloseMobile,
}) => {
  const activeNavItems = [
    {
      id: 'dashboard' as NavigationPage,
      label: 'Telemetry Dashboard',
      shortLabel: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      description: 'Overview, vitals & quick actions',
    },
    {
      id: 'assessment' as NavigationPage,
      label: 'Daily Assessment',
      shortLabel: 'Assessment',
      icon: <ClipboardPlus className="w-4 h-4" />,
      description: '6 vital indicator telemetry entry',
    },
    {
      id: 'history' as NavigationPage,
      label: 'Health History Log',
      shortLabel: 'History',
      icon: <History className="w-4 h-4" />,
      description: 'Past logs & telemetry breakdowns',
    },
    {
      id: 'overview' as NavigationPage,
      label: 'Baseline & Health Overview',
      shortLabel: 'Overview',
      icon: <Activity className="w-4 h-4" />,
      description: 'Thresholds & baseline variance',
    },
  ];

  const plannedPhase2Items = [
    {
      id: 'body-map' as NavigationPage,
      label: 'Interactive Body Map',
      icon: <User className="w-4 h-4" />,
      assignee: 'Phase 2: Sameen',
    },
    {
      id: 'analytics' as NavigationPage,
      label: 'Dynamic Trend Charts',
      icon: <LineChart className="w-4 h-4" />,
      assignee: 'Phase 2: Sameen',
    },
    {
      id: 'routine' as NavigationPage,
      label: 'Mission Routine & Countermeasures',
      icon: <CalendarCheck className="w-4 h-4" />,
      assignee: 'Phase 2: Sameen',
    },
    {
      id: 'guidance' as NavigationPage,
      label: 'Flight Surgeon Guidance Engine',
      icon: <ShieldCheck className="w-4 h-4" />,
      assignee: 'Phase 2: Sameen',
    },
  ];

  const handleItemClick = (page: NavigationPage) => {
    onSelectPage(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-space-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col border-r border-slate-800 bg-space-950/95 backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
        }`}
      >
        {/* Top telemetry identity info */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-neon-cyan/20">
              <div className="w-full h-full rounded-[10px] bg-space-900 flex items-center justify-center text-cyan-300 font-mono font-bold text-sm">
                {astronautProfile.callSign.slice(0, 2)}
              </div>
            </div>
            <div className="overflow-hidden">
              <h2 className="font-semibold text-sm text-slate-100 truncate">
                {astronautProfile.name}
              </h2>
              <p className="text-xs text-cyan-400 font-mono truncate">
                {astronautProfile.callSign} • FLIGHT DAY {astronautProfile.currentMissionDay}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          
          {/* Main Phase 1 Navigation */}
          <div>
            <div className="px-2 mb-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <span>Phase 1 Modules</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <nav className="space-y-1">
              {activeNavItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan/15 font-semibold'
                        : 'text-slate-300 hover:text-slate-100 hover:bg-space-850/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="text-left font-sans">{item.label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Planned Phase 2 Modules (Integrated Architecture for Sameen) */}
          <div>
            <div className="px-2 mb-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <span>Phase 2 Roadmap</span>
              <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                PLANNED
              </span>
            </div>
            <nav className="space-y-1">
              {plannedPhase2Items.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-space-850/50 border border-dashed border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{item.icon}</span>
                      <span className="text-left font-sans">{item.label}</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-space-800 text-amber-300/90 border border-amber-500/20">
                      Sameen
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

        </div>

        {/* Bottom system footer */}
        <div className="p-4 border-t border-slate-800/80 bg-space-950">
          <div className="p-3 rounded-xl bg-space-900/80 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 font-mono text-[11px]">ARCHITECT</span>
              <span className="text-cyan-400 font-mono text-[11px] font-medium">Abdul Rafay</span>
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed font-sans">
              NASA Space Apps 2026 Core Telemetry Foundation
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
