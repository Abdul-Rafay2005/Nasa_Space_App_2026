/**
 * Aegis Health — Longitudinal Health Trend Analytics Page
 * Conforms to Section 10.3 of PLAN.md
 * Integrates time-series exploration with astronaut baseline comparison tabs.
 */

import React, { useState } from 'react';
import { TrendChart } from '../components/charts/TrendChart';
import { DailyAssessmentRecord, AstronautProfile } from '../types/health';
import { HealthOverview } from './HealthOverview';
import {
  LineChart,
  Target,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';

interface TrendAnalyticsPageProps {
  profile: AstronautProfile;
  records: DailyAssessmentRecord[];
  onRecordsChange?: (updated: DailyAssessmentRecord[]) => void;
  onNavigateToAssessment?: () => void;
}

export const TrendAnalyticsPage: React.FC<TrendAnalyticsPageProps> = ({
  profile,
  records,
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'baselines'>('trends');
  const [showHowToRead, setShowHowToRead] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Mission Analytics Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border border-cyan-500/30 shadow-xl shadow-cyan-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-sans tracking-wide flex items-center gap-2.5">
              <LineChart className="w-6 h-6 text-cyan-400" />
              Longitudinal Health & Biometric Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-3xl">
              Calibrated time-series evaluation tracking astronaut vital deviations across Mission Sols against clinical flight threshold envelopes.
            </p>
          </div>

          {/* Quick Metrics Bar & Tab Switcher */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex bg-space-950/90 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('trends')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'trends'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Trends</span>
              </button>
              <button
                onClick={() => setActiveTab('baselines')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'baselines'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Baselines</span>
              </button>
            </div>

            <button
              onClick={() => setShowHowToRead(!showHowToRead)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-space-950/90 border border-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-mono transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>How to Read</span>
            </button>
          </div>
        </div>
      </div>

      {/* "How to read this chart" Collapsible Disclosure */}
      {showHowToRead && (
        <div className="p-4 rounded-xl bg-space-950/90 border border-cyan-500/30 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans animate-fade-in">
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-200 mb-1">Clinical Flight Threshold Envelopes</h4>
              <p className="text-slate-300 leading-relaxed">
                Green shaded bands denote optimal microgravity adaptation ranges. Yellow bands highlight mild adaptation drift, and Red bands represent critical boundaries requiring flight surgeon review.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <TrendingUp className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-200 mb-1">Colorblind-Safe Marker Geometry</h4>
              <p className="text-slate-300 leading-relaxed">
                Telemetry points use geometric shapes for non-color dependent accessibility: Circles (Nominal), Triangles (Warning), and Diamonds (Urgent/Critical).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'trends' ? (
        <TrendChart records={records} />
      ) : (
        <HealthOverview profile={profile} latestAssessment={records[0]} />
      )}
    </div>
  );
};
