/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Root Application Component — Phase 2 Navigation
 * Lead Developer: Abdul Rafay
 */

import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { NavigationPage } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DailyAssessment } from './pages/DailyAssessment';
import { HealthHistory } from './pages/HealthHistory';
import { HealthOverview } from './pages/HealthOverview';
import { FeaturePlaceholder } from './pages/Placeholders';
import {
  getStoredAssessments,
  saveAssessment,
  resetToSampleData,
  getAstronautProfile,
  hasCompletedTodayAssessment,
} from './services/storage';
import { AstronautProfile, DailyAssessmentRecord } from './types/health';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [profile, setProfile] = useState<AstronautProfile>(getAstronautProfile());
  const [records, setRecords] = useState<DailyAssessmentRecord[]>(getStoredAssessments());

  useEffect(() => {
    setProfile(getAstronautProfile());
    setRecords(getStoredAssessments());
  }, []);

  const latestAssessment = records.length > 0 ? records[0] : undefined;
  const isCompletedToday = hasCompletedTodayAssessment(profile.currentMissionDay);

  const handleSubmitSuccess = (newRecord: DailyAssessmentRecord) => {
    const updated = saveAssessment(newRecord);
    setRecords(updated);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all telemetry records back to nominal demonstration data?')) {
      const resetRecords = resetToSampleData();
      setRecords(resetRecords);
      setProfile(getAstronautProfile());
      setCurrentPage('dashboard');
    }
  };

  return (
    <AppLayout
      currentPage={currentPage}
      onSelectPage={(page) => setCurrentPage(page)}
      astronautProfile={profile}
      onResetData={handleResetData}
    >
      {currentPage === 'dashboard' && (
        <Dashboard
          profile={profile}
          latestAssessment={latestAssessment}
          historyRecords={records}
          isCompletedToday={isCompletedToday}
          onNavigateToAssessment={() => setCurrentPage('assessment')}
          onNavigateToHistory={() => setCurrentPage('analytics')}
          onNavigateToOverview={() => setCurrentPage('overview')}
        />
      )}

      {currentPage === 'assessment' && (
        <DailyAssessment
          profile={profile}
          onSubmitSuccess={handleSubmitSuccess}
          onNavigateToDashboard={() => setCurrentPage('dashboard')}
        />
      )}

      {/* history page — legacy, redirects to analytics */}
      {currentPage === 'history' && (
        <HealthHistory
          records={records}
          onSelectRecord={() => {}}
          onNavigateToAssessment={() => setCurrentPage('assessment')}
        />
      )}

      {currentPage === 'overview' && (
        <HealthOverview
          profile={profile}
          latestAssessment={latestAssessment}
        />
      )}

      {(currentPage === 'body-map' ||
        currentPage === 'analytics' ||
        currentPage === 'routine' ||
        currentPage === 'guidance') && (
        <FeaturePlaceholder
          pageId={currentPage}
          onNavigateToDashboard={() => setCurrentPage('dashboard')}
          records={records}
          latestAssessment={latestAssessment}
        />
      )}
    </AppLayout>
  );
};

export default App;
