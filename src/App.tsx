/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Root Application Component — Complete Integration
 * Compliant with PLAN.md Section 3.1 & 10
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
import { MissionRoutinePage } from './pages/MissionRoutinePage';
import { SourcesPage } from './pages/SourcesPage';
import { AiFlightSurgeonPage } from './pages/AiFlightSurgeonPage';
import { FloatingChatButton } from './components/chat/FloatingChatButton';
import { getCurrentRoute, navigateTo, subscribeToRoute, AppRoute } from './lib/navigation';
import { runV1Migration } from './services/persistence/migrationV1';
import {
  getStoredAssessments,
  saveAssessment,
  resetToSampleData,
  getAstronautProfile,
  hasCompletedTodayAssessment,
} from './services/storage';
import { AstronautProfile, DailyAssessmentRecord } from './types/health';

const routeToNavPage = (r: AppRoute): NavigationPage => {
  switch (r) {
    case 'monitor': return 'dashboard';
    case 'chat': return 'ai-chat';
    case 'trends': return 'analytics';
    case 'body': return 'body-map';
    case 'check-in': return 'assessment';
    case 'alerts': return 'guidance';
    case 'routine': return 'routine';
    case 'history': return 'history';
    case 'overview': return 'overview';
    case 'sources': return 'sources';
    default: return 'dashboard';
  }
};

const navPageToRoute = (p: NavigationPage): AppRoute => {
  switch (p) {
    case 'dashboard': return 'monitor';
    case 'ai-chat': return 'chat';
    case 'analytics': return 'trends';
    case 'body-map': return 'body';
    case 'assessment': return 'check-in';
    case 'guidance': return 'alerts';
    case 'routine': return 'routine';
    case 'history': return 'history';
    case 'overview': return 'overview';
    case 'sources': return 'sources';
    default: return 'monitor';
  }
};

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>(() => routeToNavPage(getCurrentRoute()));
  const [profile, setProfile] = useState<AstronautProfile>(getAstronautProfile());
  const [records, setRecords] = useState<DailyAssessmentRecord[]>(getStoredAssessments());
  const [selectedBodyPartId, setSelectedBodyPartId] = useState<string | undefined>();

  // Subscribe to browser hash changes (back/forward & direct links)
  useEffect(() => {
    // Run idempotent IndexedDB migration on startup
    runV1Migration().catch((err) => console.warn('[App] V1 migration warning:', err));

    return subscribeToRoute((route) => {
      setCurrentPage(routeToNavPage(route));
    });
  }, []);

  const handleSelectPage = (page: NavigationPage) => {
    setCurrentPage(page);
    navigateTo(navPageToRoute(page));
  };

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
      handleSelectPage('dashboard');
    }
  };

  return (
    <AppLayout
      currentPage={currentPage}
      onSelectPage={handleSelectPage}
      astronautProfile={profile}
      onResetData={handleResetData}
    >
      {/* 1. Master Dashboard & Live Telemetry Stream */}
      {currentPage === 'dashboard' && (
        <Dashboard
          profile={profile}
          latestAssessment={latestAssessment}
          historyRecords={records}
          isCompletedToday={isCompletedToday}
          onNavigateToAssessment={() => handleSelectPage('assessment')}
          onNavigateToHistory={() => handleSelectPage('history')}
          onNavigateToOverview={() => handleSelectPage('overview')}
          onNavigateToBodyMap={(partId) => {
            setSelectedBodyPartId(partId);
            handleSelectPage('body-map');
          }}
          onNavigateToAnalytics={() => handleSelectPage('analytics')}
          onNavigateToGuidance={() => handleSelectPage('guidance')}
          onNavigateToRoutine={() => handleSelectPage('routine')}
          onNavigateToAiDoctor={() => handleSelectPage('ai-chat')}
        />
      )}

      {/* AI Flight Surgeon Telemedicine Assistant (Powered by Gemini) */}
      {currentPage === 'ai-chat' && (
        <AiFlightSurgeonPage
          profile={profile}
          latestAssessment={latestAssessment}
          historyRecords={records}
          onNavigateToCheckIn={() => handleSelectPage('assessment')}
          onNavigateToGuidance={() => handleSelectPage('guidance')}
          onNavigateToBodyMap={() => handleSelectPage('body-map')}
        />
      )}

      {/* 2. Daily Health Check-in */}
      {currentPage === 'assessment' && (
        <DailyAssessment
          profile={profile}
          onSubmitSuccess={handleSubmitSuccess}
          onNavigateToDashboard={() => handleSelectPage('dashboard')}
        />
      )}

      {/* 3. Interactive Anatomical Body Map */}
      {currentPage === 'body-map' && (
        <BodyMapPage
          profile={profile}
          latestAssessment={latestAssessment}
          onNavigateToAssessment={() => handleSelectPage('assessment')}
          initialSelectedPartId={selectedBodyPartId}
        />
      )}

      {/* 4. Dynamic Trend Analytics & Longitudinal Charts */}
      {currentPage === 'analytics' && (
        <TrendAnalyticsPage
          profile={profile}
          records={records}
          onRecordsChange={(updated) => setRecords(updated)}
          onNavigateToAssessment={() => handleSelectPage('assessment')}
        />
      )}

      {/* 5. Flight Surgeon Clinical Guidance & SBAR Decision Engine */}
      {currentPage === 'guidance' && (
        <FlightSurgeonGuidancePage
          profile={profile}
          latestAssessment={latestAssessment}
          onNavigateToAssessment={() => handleSelectPage('assessment')}
          onNavigateToBodyMap={(partId) => {
            setSelectedBodyPartId(partId);
            handleSelectPage('body-map');
          }}
        />
      )}

      {/* 6. Mission Routine & Countermeasures Checklist */}
      {currentPage === 'routine' && (
        <MissionRoutinePage
          profile={profile}
        />
      )}

      {/* 7. Health History Log Archive */}
      {currentPage === 'history' && (
        <HealthHistory
          records={records}
          onSelectRecord={() => {}}
          onNavigateToAssessment={() => handleSelectPage('assessment')}
        />
      )}

      {/* 8. Baseline & Health Overview Matrix */}
      {currentPage === 'overview' && (
        <HealthOverview
          profile={profile}
          latestAssessment={latestAssessment}
        />
      )}

      {/* 9. Telemetry Sources & Gateway Settings */}
      {currentPage === 'sources' && (
        <SourcesPage />
      )}

      {/* Floating AI Flight Surgeon Companion (Available across all screens) */}
      <FloatingChatButton
        profile={profile}
        latestAssessment={latestAssessment}
        historyRecords={records}
      />
    </AppLayout>
  );
};

export default App;
