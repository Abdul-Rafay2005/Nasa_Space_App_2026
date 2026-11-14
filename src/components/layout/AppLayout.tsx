/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Master Application Layout
 * UI Design: Deep dark cosmic theme with orbital glow matching 01_dashboard.png & 08_dashboard_full_concept.png
 */

import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar, NavigationPage } from './Sidebar';
import { AstronautProfile } from '../../types/health';

interface AppLayoutProps {
  currentPage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  astronautProfile: AstronautProfile;
  onResetData: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  onSelectPage,
  astronautProfile,
  onResetData,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      className="flex h-screen overflow-hidden font-sans text-slate-100 select-none"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #0c163b 0%, #060a1a 60%, #030611 100%)',
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={onSelectPage}
        astronautProfile={astronautProfile}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Mission Control Container */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">

        {/* Top Navbar */}
        <Navbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onResetData={onResetData}
          missionDay={astronautProfile.currentMissionDay}
          onNavigateToGuidance={() => onSelectPage('guidance')}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Subtle bottom cosmic Earth glow */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[800px] h-32 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />
      </div>
    </div>
  );
};
