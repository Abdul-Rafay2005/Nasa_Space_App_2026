/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Master Application Layout — Phase 2 UI Refresh
 * Lead Developer: Abdul Rafay
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
    <div className="flex h-screen overflow-hidden font-sans text-slate-100" style={{ background: '#060b18' }}>

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={onSelectPage}
        astronautProfile={astronautProfile}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onResetData={onResetData}
          missionDay={astronautProfile.currentMissionDay}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
