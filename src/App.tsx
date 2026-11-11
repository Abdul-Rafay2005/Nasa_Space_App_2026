/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Root Application Component — Complete Integration
 * Lead Developer: Abdul Rafay | Visualization: Sameen | UI: Abdullah
 */

import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { NavigationPage } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DailyAssessment } from './pages/DailyAssessment';
import { HealthHistory } from './pages/HealthHistory';
import { HealthOverview } from './pages/HealthOverview';
import { TrendAnalyticsPage } from './pages/TrendAnalyticsPage';
import { BodyMapPage } from './pages/BodyMapPage';
import { FlightSurgeonGuidancePage } from './pages/FlightSurgeonGuidancePage';
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
  const [selectedBodyPartId, setSelectedBodyPartId] = useState<string | undefined>();

  // Reload telemetry from storage
  useEffect(() => {
    setProfile(getAstronautProfile());
    setRecords(getStoredAssessments());
  }, []);

  const latestAssessment = records.length > 0 ? records[0] : undefined;
  const isCompletedToday = hasCompletedTodayAssessment(profile.currentMissionDay);

  // Handle new daily assessment submission
  const handleSubmitSuccess = (newRecord: DailyAssessmentRecord) => {
    const updated = saveAssessment(newRecord);
    setRecords(updated);
  };

  // Reset demo telemetry
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
      {/* 1. Master Dashboard */}
      {currentPage === 'dashboard' && (
        <Dashboard
          profile={profile}
          latestAssessment={latestAssessment}
          historyRecords={records}
          isCompletedToday={isCompletedToday}
          onNavigateToAssessment={() => setCurrentPage('assessment')}
          onNavigateToHistory={() => setCurrentPage('history')}
          onNavigateToOverview={() => setCurrentPage('overview')}
          onNavigateToBodyMap={(partId) => {
            setSelectedBodyPartId(partId);
            setCurrentPage('body-map');
          }}
          onNavigateToAnalytics={() => setCurrentPage('analytics')}
          onNavigateToGuidance={() => setCurrentPage('guidance')}
          onNavigateToRoutine={() => setCurrentPage('routine')}
        />
      )}

      {/* 2. Daily Health Check-in */}
      {currentPage === 'assessment' && (
        <DailyAssessment
          profile={profile}
          onSubmitSuccess={handleSubmitSuccess}
          onNavigateToDashboard={() => setCurrentPage('dashboard')}
        />
      )}

      {/* 3. Interactive Anatomical Body Map (Sameen) */}
      {currentPage === 'body-map' && (
        <BodyMapPage
          profile={profile}
          latestAssessment={latestAssessment}
          onNavigateToAssessment={() => setCurrentPage('assessment')}
          initialSelectedPartId={selectedBodyPartId}
        />
      )}

      {/* 4. Dynamic Trend Analytics & Longitudinal Charts (Sameen) */}
      {currentPage === 'analytics' && (
        <TrendAnalyticsPage
          profile={profile}
          records={records}
          onRecordsChange={(updated) => setRecords(updated)}
          onNavigateToAssessment={() => setCurrentPage('assessment')}
        />
      )}

      {/* 5. Flight Surgeon Clinical Guidance & SBAR Decision Engine (Sameen & Abdul Rafay) */}
      {currentPage === 'guidance' && (
        <FlightSurgeonGuidancePage
          profile={profile}
          latestAssessment={latestAssessment}
          onNavigateToAssessment={() => setCurrentPage('assessment')}
          onNavigateToBodyMap={(partId) => {
            setSelectedBodyPartId(partId);
            setCurrentPage('body-map');
          }}
        />
      )}

      {/* 6. Mission Routine & Countermeasures Checklist */}
      {currentPage === 'routine' && (
        <FeaturePlaceholder
          pageId={currentPage}
          onNavigateToDashboard={() => setCurrentPage('dashboard')}
          records={records}
          latestAssessment={latestAssessment}
        />
      )}

      {/* 7. Health History Log Archive (Phase 1) */}
      {currentPage === 'history' && (
        <HealthHistory
          records={records}
          onSelectRecord={() => {}}
          onNavigateToAssessment={() => setCurrentPage('assessment')}
        />
      )}

      {/* 8. Baseline & Health Overview Matrix (Phase 1) */}
      {currentPage === 'overview' && (
        <HealthOverview
          profile={profile}
          latestAssessment={latestAssessment}
        />
      )}
    </AppLayout>
  );
};

export default App;
