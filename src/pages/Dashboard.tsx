/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Dashboard Page
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React, { useState } from 'react';
import { AstronautProfile, DailyAssessmentRecord } from '../types/health';
import { AstronautProfileCard } from '../components/dashboard/AstronautProfileCard';
import { OverallHealthCard } from '../components/dashboard/OverallHealthCard';
import { IndicatorSummaryCard } from '../components/dashboard/IndicatorSummaryCard';
import { DailyCompletionStatus } from '../components/dashboard/DailyCompletionStatus';
import { RecentActivityList } from '../components/dashboard/RecentActivityList';
import { AssessmentDetailModal } from '../components/health/AssessmentDetailModal';
import { Card } from '../components/common/Card';
import {
  Activity,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { MEDICAL_DISCLAIMER } from '../config/thresholds';

interface DashboardProps {
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
  historyRecords: DailyAssessmentRecord[];
  isCompletedToday: boolean;
  onNavigateToAssessment: () => void;
  onNavigateToHistory: () => void;
  onNavigateToOverview: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  latestAssessment,
  historyRecords,
  isCompletedToday,
  onNavigateToAssessment,
  onNavigateToHistory,
  onNavigateToOverview,
}) => {
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<DailyAssessmentRecord | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Welcome Section & Mission Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              TELEMETRY UPLINK NOMINAL • DEEP SPACE HABITAT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
            Welcome, {profile.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-0.5">
            Mission Day {profile.currentMissionDay} Biometric Surveillance & Cardiovascular Countermeasures
          </p>
        </div>

        {/* Quick action pill */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToAssessment}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-semibold shadow-neon-cyan/20 transition-all"
          >
            <Activity className="w-4 h-4" />
            <span>Enter Daily Assessment</span>
          </button>
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2.5 font-sans">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-mono text-amber-300 mr-1">[RESEARCH NOTICE]:</strong>
          {MEDICAL_DISCLAIMER.fullNotice}
        </div>
      </div>

      {/* 2. Daily Protocol Compliance Status */}
      <DailyCompletionStatus
        isCompletedToday={isCompletedToday}
        missionDay={profile.currentMissionDay}
        lastLoggedTimestamp={latestAssessment?.timestamp}
        onNavigateToAssessment={onNavigateToAssessment}
        onNavigateToHistory={onNavigateToHistory}
      />

      {/* 3. Overall Health Status & Astronaut Profile Grid */}
      <div className="grid grid-cols-1 gap-6">
        {latestAssessment ? (
          <OverallHealthCard
            overall={latestAssessment.overall}
            lastUpdatedTime={latestAssessment.timestamp}
          />
        ) : (
          <Card glow="cyan" title="Health Status Awaiting Telemetry">
            <p className="text-xs text-slate-300">
              No daily assessments submitted yet for this flight cycle. Please log your first vitals.
            </p>
          </Card>
        )}

        {/* Astronaut Profile Placeholder */}
        <AstronautProfileCard profile={profile} />
      </div>

      {/* 4. Latest Health Indicators Grid (6 indicators) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
              Latest Physiological Telemetry (6 Core Indicators)
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Real-time evaluated status against microgravity operational flight thresholds
            </p>
          </div>
          <button
            onClick={onNavigateToOverview}
            className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Threshold Matrix</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {latestAssessment ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <IndicatorSummaryCard
              indicator={latestAssessment.results.heartRate}
              onClickDetail={() => setSelectedRecordForModal(latestAssessment)}
            />
            <IndicatorSummaryCard
              indicator={latestAssessment.results.bloodPressure}
              onClickDetail={() => setSelectedRecordForModal(latestAssessment)}
            />
            <IndicatorSummaryCard
              indicator={latestAssessment.results.bloodSugar}
              onClickDetail={() => setSelectedRecordForModal(latestAssessment)}
            />
            <IndicatorSummaryCard
              indicator={latestAssessment.results.bodyTemperature}
              onClickDetail={() => setSelectedRecordForModal(latestAssessment)}
            />
            <IndicatorSummaryCard
              indicator={latestAssessment.results.sleepDuration}
              onClickDetail={() => setSelectedRecordForModal(latestAssessment)}
            />
            <IndicatorSummaryCard
              indicator={latestAssessment.results.mood}
              onClickDetail={() => setSelectedRecordForModal(latestAssessment)}
            />
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 bg-space-900/60 rounded-xl border border-slate-800">
            No indicator readings available. Submit a daily health assessment to populate vitals.
          </div>
        )}
      </div>

      {/* 5. Recent Activity Section */}
      <RecentActivityList
        records={historyRecords}
        onSelectRecord={(rec) => setSelectedRecordForModal(rec)}
        onViewAllHistory={onNavigateToHistory}
      />

      {/* Detail Modal for Selected Assessment */}
      <AssessmentDetailModal
        record={selectedRecordForModal}
        isOpen={!!selectedRecordForModal}
        onClose={() => setSelectedRecordForModal(null)}
      />

    </div>
  );
};
