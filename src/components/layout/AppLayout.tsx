/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Master Application Layout
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
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
    <div className="flex h-screen overflow-hidden bg-space-950 font-sans text-slate-100">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={onSelectPage}
        astronautProfile={astronautProfile}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onResetData={onResetData}
          missionDay={astronautProfile.currentMissionDay}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

