/**
 * Aegis Health — Flight Surgeon Guidance & Clinical Decision Support
 * Updated 14 November 2026 per Official NASA & CSA Research Report (Eman Saleem)
 * 
 * Implements 4-part alert card format:
 * 1. What Happened
 * 2. Why It Matters (linked to official NASA HRP Risk)
 * 3. What To Do Now (countermeasures checklist)
 * 4. When To Tell Earth (communication protocol)
 * Tagged with NASA 5 Hazards, EIMO 2023 autonomy, and SBAR medical packet generation.
 */

import React, { useState, useMemo } from 'react';
import rawGuidanceRules from '../data/guidanceRules.json';
import { GuidanceRule } from '../types/guidance';
import { DailyAssessmentRecord, AstronautProfile } from '../types/health';
import { getGuidance } from '../lib/guidanceEngine';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { acknowledgeIncident } from '../services/alertEngine';
import { NasaResourcesModal } from '../components/common/NasaResourcesModal';
import {
  ShieldAlert,
  Search,
  Target,
  CheckSquare,
  Square,
  CheckCircle2,
  FileText,
  Copy,
  Download,
  Check,
  BookOpen,
  ExternalLink,
  Radio,
  Sparkles,
} from 'lucide-react';

const guidanceRulesData = rawGuidanceRules as GuidanceRule[];

interface FlightSurgeonGuidancePageProps {
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
  onNavigateToAssessment?: () => void;
  onNavigateToBodyMap: (partId?: string) => void;
}

type FilterLevel = 'ALL' | 'RED' | 'YELLOW' | 'GREEN';

export const FlightSurgeonGuidancePage: React.FC<FlightSurgeonGuidancePageProps> = ({
  profile,
  latestAssessment,
  onNavigateToBodyMap,
}) => {
  const guidanceResult = useMemo(() => {
    return getGuidance(latestAssessment?.results, guidanceRulesData);
  }, [latestAssessment]);

  const [filterLevel, setFilterLevel] = useState<FilterLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [acknowledgedRules, setAcknowledgedRules] = useState<Record<string, boolean>>({});
  const [sbarModalOpen, setSbarModalOpen] = useState(false);
  const [resourcesModalOpen, setResourcesModalOpen] = useState(false);
  const [copiedSbar, setCopiedSbar] = useState(false);

  const toggleAction = (ruleId: string, actionIndex: number) => {
    const key = `${ruleId}-${actionIndex}`;
    setCheckedActions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAcknowledge = (ruleId: string) => {
    setAcknowledgedRules((prev) => ({ ...prev, [ruleId]: true }));
    acknowledgeIncident(ruleId);
  };

  const filteredItems = useMemo(() => {
    return guidanceResult.items.filter((item) => {
      if (filterLevel !== 'ALL' && item.rule.level !== filterLevel) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const indName = item.indicator.displayName.toLowerCase();
        const title = item.rule.title.toLowerCase();
        const hazard = (item.rule.nasaHazard || '').toLowerCase();
        const risk = (item.rule.nasaRisk || '').toLowerCase();
        const actionsText = item.rule.actions.join(' ').toLowerCase();
        return indName.includes(q) || title.includes(q) || hazard.includes(q) || risk.includes(q) || actionsText.includes(q);
      }
      return true;
    });
  }, [guidanceResult.items, filterLevel, searchQuery]);

  // Generate SBAR (Situation, Background, Assessment, Recommendation) structured report
  const sbarReport = useMemo(() => {
    const urgentItems = guidanceResult.items.filter((i) => i.rule.level === 'RED' || i.rule.level === 'YELLOW');
    const situations = urgentItems.map((i) => `${i.indicator.displayName}: ${i.indicator.valueDisplay} (${i.rule.level})`).join(', ');

    return `SBAR MEDICAL TELEMETRY SUMMARY
==================================================
Date/Time (UTC): ${new Date().toISOString()}
Subject: ${profile.name} (${profile.callSign})
Spacecraft: ${profile.spacecraft} | Mission Sol: ${profile.currentMissionDay}
Protocol: Autonomous Onboard Decision Support (NASA EIMO 2023)

1. SITUATION:
Observed vital deviations: ${situations || 'All active indicators nominal.'}

2. BACKGROUND:
Astronaut baseline comparisons (Standard Measures):
- Heart Rate: ${profile.restingHeartRateBaseline} BPM
- Blood Pressure: ${profile.bloodPressureBaseline.systolic}/${profile.bloodPressureBaseline.diastolic} mmHg
- Body Temperature: ${profile.bodyTemperatureBaseline.toFixed(1)} °C
Latest Assessment ID: ${latestAssessment?.id || 'STREAM-CURRENT'}

3. ASSESSMENT:
Primary clinical advisory: ${guidanceResult.items[0]?.rule.title || 'Nominal adaptation status'}
Hazard Classification: ${guidanceResult.items[0]?.rule.nasaHazard || 'Gravity Fields'}
NASA Risk: ${guidanceResult.items[0]?.rule.nasaRisk || 'Cardiovascular Adaptations'}
Clinical Basis: ${guidanceResult.items[0]?.rule.source || 'NASA HRP / NEWS2 Guidelines'}

4. RECOMMENDATIONS (COUNTERMEASURES):
${guidanceResult.items.flatMap((i) => i.rule.actions).map((a, idx) => `[ ] ${idx + 1}. ${a}`).join('\n')}

5. COMMUNICATION DIRECTIVE:
${guidanceResult.items[0]?.rule.whenToTellEarth || guidanceResult.items[0]?.rule.whenToContactFlightSurgeon || 'Include in routine daily downlink.'}
==================================================
Notice: Decision-support prototype only. Subordinate to certified NASA Flight Surgeons.`;
  }, [guidanceResult, profile, latestAssessment]);

  const handleCopySbar = () => {
    navigator.clipboard.writeText(sbarReport);
    setCopiedSbar(true);
    setTimeout(() => setCopiedSbar(false), 2000);
  };

  const handleExportSbar = () => {
    const blob = new Blob([sbarReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SBAR_${profile.callSign}_Sol${profile.currentMissionDay}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border border-cyan-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>NASA HRP 5 HAZARDS & 17 RISKS INTEGRATED • DECISION-SUPPORT PROTOTYPE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-sans tracking-wide flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-cyan-400" />
              Flight Surgeon Guidance & Countermeasure Protocols
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-3xl">
              Autonomous clinical decision-support engine designed for deep space missions (NASA EIMO 2023). Every alert explains <em>What happened</em>, <em>Why it matters</em>, <em>What to do now</em>, and <em>When to tell Earth</em>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setResourcesModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-space-950/90 border border-cyan-500/40 text-xs font-mono text-cyan-300 hover:bg-space-850 transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>NASA Resources Map</span>
            </button>
            <button
              onClick={() => setSbarModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-space-950/90 border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-space-850 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Preview SBAR Packet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by NASA Hazard, Risk, Protocol, or Countermeasure..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-space-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
        </div>

        <div className="flex items-center gap-1 bg-space-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {(['ALL', 'RED', 'YELLOW', 'GREEN'] as FilterLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterLevel === lvl
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Guidance Cards Grid — Structured 4-Field Format */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isAcknowledged = acknowledgedRules[item.rule.id];
          return (
            <Card
              key={item.rule.id}
              glow={item.rule.level === 'RED' ? 'red' : item.rule.level === 'YELLOW' ? 'yellow' : 'green'}
              title={item.rule.title}
              subtitle={`${item.indicator.displayName} • Reading: ${item.indicator.valueDisplay}`}
              icon={<ShieldAlert className="w-4 h-4 text-cyan-400" />}
              headerSlot={
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.rule.level} size="sm" />
                  {isAcknowledged ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(item.rule.id)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-space-950 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              }
            >
              <div className="space-y-3.5 text-xs font-sans">
                {/* NASA Hazard & Risk Badges */}
                <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-800/80 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-space-900 border border-cyan-500/30 text-cyan-300">
                    Hazard: {item.rule.nasaHazard || 'Gravity Fields'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-space-900 border border-indigo-500/30 text-indigo-300">
                    Risk: {item.rule.nasaRisk || 'Cardiovascular Adaptations'}
                  </span>
                </div>

                {/* 1. What Happened */}
                <div className="p-2.5 rounded-lg bg-space-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    1. What Happened
                  </span>
                  <p className="text-slate-200 leading-relaxed font-sans text-xs">
                    {item.rule.whatHappened || item.indicator.reason}
                  </p>
                </div>

                {/* 2. Why It Matters */}
                <div className="p-2.5 rounded-lg bg-space-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                      2. Why It Matters (NASA Risk Analysis)
                    </span>
                    <a
                      href={item.rule.nasaRiskUrl || "https://www.nasa.gov/hrp/risks"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 font-mono"
                    >
                      <span>NASA Risk Page</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans text-xs">
                    {item.rule.whyItMatters || 'Microgravity adaptations alter autonomic regulation, requiring active countermeasure compliance.'}
                  </p>
                </div>

                {/* 3. What To Do Now (Action Checklist) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    3. What To Do Now (Countermeasures Checklist)
                  </span>
                  <div className="space-y-1">
                    {(item.rule.whatToDoNow || item.rule.actions).map((act, idx) => {
                      const checked = checkedActions[`${item.rule.id}-${idx}`];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleAction(item.rule.id, idx)}
                          className="flex items-start gap-2 p-2 rounded-lg bg-space-900/40 hover:bg-space-900/80 cursor-pointer transition-colors"
                        >
                          {checked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          )}
                          <span className={checked ? 'line-through text-slate-500 text-xs' : 'text-slate-200 text-xs'}>
                            {act}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. When To Tell Earth */}
                <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-500/20 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-blue-300 uppercase tracking-wider block flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-blue-400" />
                    4. When To Tell Earth
                  </span>
                  <p className="text-slate-300 font-sans text-xs">
                    {item.rule.whenToTellEarth || item.rule.whenToContactFlightSurgeon}
                  </p>
                </div>

                {/* Card Footer: Body Map Link & Scientific Citation */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[11px] font-mono">
                  <button
                    onClick={() => onNavigateToBodyMap(item.rule.relatedBodyPartId)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>View on Body Map</span>
                  </button>
                  <span className="text-slate-500 truncate max-w-[220px]" title={item.rule.source}>
                    Source: {item.rule.source}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* SBAR Preview Modal */}
      {sbarModalOpen && (
        <Modal
          isOpen={sbarModalOpen}
          onClose={() => setSbarModalOpen(false)}
          title="Clinical SBAR Medical Telemetry Packet (NASA EIMO 2023)"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs font-mono">
            <pre className="p-4 rounded-xl bg-space-950 border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {sbarReport}
            </pre>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400">Honest local summary packet export.</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopySbar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-900 border border-slate-700 text-slate-200 hover:text-cyan-300"
                >
                  {copiedSbar ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSbar ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleExportSbar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Challenge Resources Modal */}
      <NasaResourcesModal isOpen={resourcesModalOpen} onClose={() => setResourcesModalOpen(false)} />
    </div>
  );
};
