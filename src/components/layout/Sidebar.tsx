/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Mission Control Sidebar Navigation — Phase 2 UI Refresh
 * Lead Developer: Abdul Rafay
 * UI Design: Abdullah (Phase 2 Reference Images)
 */

import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  User,
  TrendingUp,
  Bell,
  CalendarCheck,
  Settings,
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

const navItems = [
  { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'assessment' as NavigationPage, label: 'Health Check-in', icon: ClipboardCheck },
  { id: 'body-map' as NavigationPage, label: 'Body Overview', icon: User },
  { id: 'analytics' as NavigationPage, label: 'Trends & Analytics', icon: TrendingUp },
  { id: 'guidance' as NavigationPage, label: 'Guidance & Alerts', icon: Bell },
  { id: 'routine' as NavigationPage, label: 'Mission Routine', icon: CalendarCheck },
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

  const initials = astronautProfile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-56 bg-[#0a0e1f] border-r border-white/5 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : 'max-lg:-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="flex flex-col items-center pt-6 pb-5 px-4 border-b border-white/5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-blue-700 to-indigo-800 flex items-center justify-center mb-2 shadow-lg shadow-blue-900/50">
            <span className="text-white font-black text-xs tracking-widest">NASA</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
            Space Apps 2026
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="px-3 pb-2">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Settings className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Settings</span>
          </button>
        </div>

        {/* Astronaut footer */}
        <div className="px-3 pb-5 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 cursor-default">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">{initials}</span>
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">Astronaut</p>
              <p className="text-[11px] text-slate-400 truncate">{astronautProfile.name}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
