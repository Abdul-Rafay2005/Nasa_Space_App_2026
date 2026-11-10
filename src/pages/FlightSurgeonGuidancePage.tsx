/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Flight Surgeon Guidance Engine Page
 * Second Developer: Sameen (Phase 2 Clinical Decision Support)
 *
 * Implements the "Flight Surgeon Guidance Engine" from the Phase 2 Roadmap.
 * Transforms evaluated physiological telemetry readings into data-driven clinical protocols.
 * All guidance rules sourced from src/data/guidanceRules.json.
 */

import React, { useState, useMemo } from 'react';
import rawGuidanceRules from '../data/guidanceRules.json';
import { GuidanceRule } from '../types/guidance';
import { DailyAssessmentRecord, AstronautProfile, HealthStatus } from '../types/health';
import { getGuidance } from '../lib/guidanceEngine';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  X,
  Target,
  CheckSquare,
  Square,
  Radio,
  Clock,
  BookOpen,
  Info,
  HeartPulse,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  Filter,
} from 'lucide-react';

const guidanceRulesData = rawGuidanceRules as GuidanceRule[];

interface FlightSurgeonGuidancePageProps {
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
  onNavigateToAssessment: () => void;
  onNavigateToBodyMap: (partId?: string) => void;
}

type FilterLevel = 'ALL' | 'RED' | 'YELLOW' | 'GREEN';

export const FlightSurgeonGuidancePage: React.FC<FlightSurgeonGuidancePageProps> = ({
  profile,
  latestAssessment,
  onNavigateToAssessment,
  onNavigateToBodyMap,
}) => {
  // Guidance engine calculation
  const guidanceResult = useMemo(() => {
    return getGuidance(latestAssessment?.results, guidanceRulesData);
  }, [latestAssessment]);

  // Filters & Search
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive action checklist state: key is `${item.rule.id}-${actionIndex}`
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});

  // Simulated Flight Surgeon Contact Modal State
  const [uplinkModalItem, setUplinkModalItem] = useState<{
    indicatorName: string;
    reading: string;
    isOpen: boolean;
  } | null>(null);

  const [confirmedUplinks, setConfirmedUplinks] = useState<Record<string, boolean>>({});

  // Toggle checklist item
  const toggleAction = (ruleId: string, actionIndex: number) => {
    const key = `${ruleId}-${actionIndex}`;
    setCheckedActions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filtered and searched items
  const filteredItems = useMemo(() => {
    return guidanceResult.items.filter((item) => {
      // Level filter
      if (filterLevel !== 'ALL' && item.rule.level !== filterLevel) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const indName = item.indicator.displayName.toLowerCase();
        const title = item.rule.title.toLowerCase();
        const actionsText = item.rule.actions.join(' ').toLowerCase();
        const contactText = item.rule.whenToContactFlightSurgeon.toLowerCase();
        return (
          indName.includes(q) ||
          title.includes(q) ||
          actionsText.includes(q) ||
          contactText.includes(q)
        );
      }
      return true;
    });
  }, [guidanceResult.items, filterLevel, searchQuery]);

  // Status banner styling helpers
  const getBannerBorder = (status: HealthStatus) => {
    switch (status) {
      case 'RED':
        return 'border-rose-500/50 bg-rose-950/20 shadow-rose-950/30';
      case 'YELLOW':
        return 'border-amber-500/50 bg-amber-950/20 shadow-amber-950/30';
      case 'GREEN':
      default:
        return 'border-cyan-500/40 bg-space-900/90 shadow-cyan-950/20';
    }
  };

  const getBannerIcon = (status: HealthStatus) => {
    switch (status) {
      case 'RED':
        return <ShieldAlert className="w-8 h-8 text-rose-400 animate-pulse" />;
      case 'YELLOW':
        return <AlertTriangle className="w-8 h-8 text-amber-400" />;
      case 'GREEN':
      default:
        return <ShieldCheck className="w-8 h-8 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">

      {/* ── Top Header Banner ────────────────────────────────────────────── */}
      <div
        className={`p-6 rounded-2xl border shadow-xl transition-all ${getBannerBorder(
          guidanceResult.overallStatus
        )}`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-space-950/90 border border-slate-800 shrink-0">
              {getBannerIcon(guidanceResult.overallStatus)}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>FLIGHT SURGEON GUIDANCE ENGINE • PHASE 2</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  ASTRONAUT: <strong className="text-slate-200">{profile.callSign}</strong>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  • FLIGHT SOL: <strong className="text-cyan-300">{latestAssessment ? latestAssessment.missionDay : profile.currentMissionDay}</strong>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-sans tracking-wide">
                {guidanceResult.overallLabel}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-3xl leading-relaxed">
                {guidanceResult.summary}
              </p>
            </div>
          </div>

          {/* Severity Counters Strip */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-space-950/90 border border-rose-500/30 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Urgent (RED)</div>
              <div className="text-lg font-bold text-rose-400 font-mono flex items-center justify-center gap-1.5">
                {guidanceResult.counts.urgent > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                {guidanceResult.counts.urgent}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-space-950/90 border border-amber-500/30 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Warning (YELLOW)</div>
              <div className="text-lg font-bold text-amber-400 font-mono">
                {guidanceResult.counts.warning}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-space-950/90 border border-emerald-500/30 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Nominal (GREEN)</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {guidanceResult.counts.nominal}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Filters & Live Search ─────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-space-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>LEVEL:</span>
          </div>

          <button
            onClick={() => setFilterLevel('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              filterLevel === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-semibold'
                : 'bg-space-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            All Protocols ({guidanceResult.counts.total})
          </button>

          <button
            onClick={() => setFilterLevel('RED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              filterLevel === 'RED'
                ? 'bg-rose-500/20 text-rose-300 border-rose-400 font-semibold'
                : 'bg-space-950 text-slate-400 border-slate-800 hover:text-rose-300'
            }`}
          >
            Urgent ({guidanceResult.counts.urgent})
          </button>

          <button
            onClick={() => setFilterLevel('YELLOW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              filterLevel === 'YELLOW'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-semibold'
                : 'bg-space-950 text-slate-400 border-slate-800 hover:text-amber-300'
            }`}
          >
            Warning ({guidanceResult.counts.warning})
          </button>

          <button
            onClick={() => setFilterLevel('GREEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              filterLevel === 'GREEN'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-semibold'
                : 'bg-space-950 text-slate-400 border-slate-800 hover:text-emerald-300'
            }`}
          >
            Nominal ({guidanceResult.counts.nominal})
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guidance, actions, symptoms…"
            className="w-full pl-9 pr-9 py-1.5 rounded-lg bg-space-950 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
            aria-label="Search guidance protocols"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Empty Telemetry Notice (If no assessment logged) ───────────────── */}
      {!latestAssessment && (
        <div className="p-6 rounded-2xl bg-space-900/80 border border-cyan-500/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-slate-200">
            No Daily Telemetry Check-in Recorded for Current Sol
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Guidance protocols are generated dynamically from your latest physiological check-in. Complete today's assessment to generate active clinical triage.
          </p>
          <button
            onClick={onNavigateToAssessment}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-950/50 transition-all inline-flex items-center gap-2"
          >
            <span>+ Complete Daily Assessment</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Guidance Cards Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {filteredItems.map((item) => {
          const isUrgent = item.rule.level === 'RED';
          const isWarning = item.rule.level === 'YELLOW';

          const cardGlow = isUrgent ? 'red' : isWarning ? 'yellow' : 'green';

          const levelBadgeClasses = isUrgent
            ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            : isWarning
            ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
            : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300';

          const isUplinkSent = confirmedUplinks[item.rule.id];

          return (
            <Card
              key={item.rule.id}
              glow={cardGlow}
              title={item.indicator.displayName}
              subtitle={`Current Reading: ${item.indicator.valueDisplay} ${item.indicator.unit}`}
              icon={<HeartPulse className="w-4 h-4 text-cyan-400" />}
              headerSlot={
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.indicator.status} size="sm" />
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border ${levelBadgeClasses}`}
                  >
                    {item.rule.levelLabel}
                  </span>
                </div>
              }
            >
              <div className="space-y-4 text-xs font-sans">

                {/* Protocol Title & Clinical Synopsis */}
                <div className="p-3 rounded-lg bg-space-950/80 border border-slate-800">
                  <div className="font-semibold text-slate-100 text-sm mb-1">
                    {item.rule.title}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {item.indicator.reason}
                  </p>
                </div>

                {/* Re-measurement Countdown Interval (for Warning / Yellow) */}
                {item.rule.remeasureIntervalHours && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Re-measurement Protocol:</strong> Re-test telemetry in{' '}
                      <span className="font-mono font-bold">{item.rule.remeasureIntervalHours} hours</span> to assess countermeasure efficacy.
                    </span>
                  </div>
                )}

                {/* Urgent Call-To-Action Block (for RED) */}
                {isUrgent && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-space-950 border border-rose-500/50 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Radio className="w-5 h-5 text-rose-400 animate-pulse shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-rose-300 text-xs font-mono uppercase tracking-wider">
                          Flight Surgeon Consultation Required
                        </div>
                        <p className="text-rose-200/90 text-[11px] leading-relaxed mt-0.5">
                          Critical deviation exceeds autonomous operational thresholds. Immediate space-to-ground audio communication is mandatory.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        onClick={() =>
                          setUplinkModalItem({
                            indicatorName: item.indicator.displayName,
                            reading: `${item.indicator.valueDisplay} ${item.indicator.unit}`,
                            isOpen: true,
                          })
                        }
                        className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2"
                        aria-label={`Initiate Flight Surgeon Uplink for ${item.indicator.displayName}`}
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>{isUplinkSent ? 'Uplink Requested (Active)' : 'Initiate Flight Surgeon Uplink'}</span>
                      </button>

                      {isUplinkSent && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Logged on Loop 1</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommended Actions Checklist */}
                <div>
                  <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-2 flex items-center justify-between">
                    <span>Recommended Countermeasures & Action Checklist:</span>
                    <span className="text-cyan-400 text-[10px]">
                      {item.rule.actions.filter((_, idx) => checkedActions[`${item.rule.id}-${idx}`]).length} / {item.rule.actions.length} Done
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {item.rule.actions.map((action, idx) => {
                      const key = `${item.rule.id}-${idx}`;
                      const isDone = checkedActions[key];
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleAction(item.rule.id, idx)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                            isDone
                              ? 'bg-space-950/40 border-slate-800/60 text-slate-500 line-through'
                              : 'bg-space-950/90 border-slate-800 text-slate-200 hover:border-slate-700'
                          }`}
                          aria-label={`Toggle action: ${action}`}
                        >
                          <span className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500 hover:text-cyan-400" />
                            )}
                          </span>
                          <span className="text-xs leading-relaxed">{action}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* When to Contact Flight Surgeon Guidance */}
                <div className="p-3 rounded-lg bg-space-950/70 border border-slate-800 text-xs">
                  <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center gap-1.5 font-semibold">
                    <Radio className="w-3 h-3 text-cyan-400" />
                    <span>Clinical Escalation Threshold:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {item.rule.whenToContactFlightSurgeon}
                  </p>
                </div>

                {/* Link to Body Map */}
                <div className="pt-1 flex items-center justify-between border-t border-slate-800/80">
                  <button
                    onClick={() => onNavigateToBodyMap(item.rule.relatedBodyPartId)}
                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-mono transition-colors group"
                    title={`View ${item.indicator.displayName} impacts on Interactive Body Map`}
                  >
                    <Target className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span>View on Body Map →</span>
                  </button>

                  <div className="text-[10px] font-mono text-slate-500">
                    Linked: <span className="text-slate-400 capitalize">{item.rule.relatedBodyPartId}</span>
                  </div>
                </div>

                {/* Card Footer: Scientific Source & Review Status */}
                <div className="p-2.5 rounded-lg bg-space-950/90 border border-cyan-500/10 text-[10px] font-mono text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <BookOpen className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">Source: {item.rule.source}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-space-850 border border-amber-500/30 text-amber-300 text-[9px] shrink-0">
                    {item.rule.reviewStatus}
                  </span>
                </div>

              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Official Prototype Disclaimer Banner ──────────────────────────── */}
      <div className="p-4 rounded-xl bg-space-950/90 border border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <p>
          <strong className="text-slate-300 font-medium">NASA Space Apps Challenge 2026 Prototype:</strong> Decision support only, not a medical diagnosis. The Flight Surgeon Guidance Engine provides operational decision-support recommendations based on provisional demonstration criteria. All clinical directives remain subordinate to certified NASA Flight Surgeons.
        </p>
      </div>

      {/* ── Simulated Flight Surgeon Uplink Modal ──────────────────────────── */}
      {uplinkModalItem && (
        <Modal
          isOpen={uplinkModalItem.isOpen}
          onClose={() => setUplinkModalItem(null)}
          title="Flight Surgeon Priority Communication Uplink"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3">
              <Radio className="w-5 h-5 text-rose-400 animate-pulse shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-300 font-mono text-sm">
                  Space-to-Ground Comm Loop 1 Dispatched
                </h4>
                <p className="text-rose-200/90 mt-1 leading-relaxed text-xs">
                  A priority clinical advisory flag for <strong>{uplinkModalItem.indicatorName}</strong> ({uplinkModalItem.reading}) has been simulated and transmitted to Mission Control Center (MCC-Houston / Flight Surgeon Console).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-space-950 border border-slate-800 space-y-2">
              <div className="text-[11px] font-mono text-cyan-400 font-semibold uppercase">
                Simulated Transmission Details:
              </div>
              <ul className="text-slate-300 space-y-1 font-mono text-[11px]">
                <li>• Subject: {profile.name} ({profile.callSign})</li>
                <li>• Spacecraft: {profile.spacecraft}</li>
                <li>• Telemetry Flag: CRITICAL RED DEVIATION</li>
                <li>• Estimated Ground Audio Round-Trip: 240 seconds</li>
              </ul>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              While standing by for audio uplink, remain in your sleep berth or tethered station and execute the recommended primary stabilization checklist items shown on the guidance card.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  // Mark as confirmed
                  const matched = guidanceResult.items.find(
                    (i) => i.indicator.displayName === uplinkModalItem.indicatorName
                  );
                  if (matched) {
                    setConfirmedUplinks((prev) => ({ ...prev, [matched.rule.id]: true }));
                  }
                  setUplinkModalItem(null);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold transition-all"
              >
                Acknowledge & Stand By
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
