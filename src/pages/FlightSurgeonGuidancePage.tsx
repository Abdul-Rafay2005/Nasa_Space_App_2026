/**
 * Aegis Health — Flight Surgeon Guidance & Clinical Decision Support
 * Conforms to Section 10.6 of PLAN.md
 * 
 * Provides evidence-based clinical decision support protocols, interactive checklists,
 * local SBAR medical summary generation, and local alert incident acknowledgement.
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
        const actionsText = item.rule.actions.join(' ').toLowerCase();
        return indName.includes(q) || title.includes(q) || actionsText.includes(q);
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

1. SITUATION:
Observed vital deviations: ${situations || 'All active indicators nominal.'}

2. BACKGROUND:
Astronaut resting baselines:
- Heart Rate: ${profile.restingHeartRateBaseline} BPM
- Blood Pressure: ${profile.bloodPressureBaseline.systolic}/${profile.bloodPressureBaseline.diastolic} mmHg
- Body Temperature: ${profile.bodyTemperatureBaseline.toFixed(1)} °C
Latest Assessment ID: ${latestAssessment?.id || 'STREAM-CURRENT'}

3. ASSESSMENT:
Primary clinical advisory: ${guidanceResult.items[0]?.rule.title || 'Nominal adaptation status'}
Observation: ${guidanceResult.items[0]?.indicator.reason || 'Normal spaceflight physiological response.'}

4. RECOMMENDATIONS:
${guidanceResult.items.flatMap((i) => i.rule.actions).map((a, idx) => `[ ] ${idx + 1}. ${a}`).join('\n')}

Notice: Operational decision-support prototype. Requires flight surgeon authorization.
==================================================`;
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
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-sans tracking-wide flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-cyan-400" />
              Flight Surgeon Guidance Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-3xl">
              Evidence-based clinical decision support rules calibrated for microgravity countermeasure protocols.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSbarModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-space-950/90 border border-slate-800 text-xs font-mono text-cyan-300 hover:bg-space-850 transition-colors"
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
            placeholder="Search guidance rules, protocols, or actions..."
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

      {/* Guidance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isAcknowledged = acknowledgedRules[item.rule.id];
          return (
            <Card
              key={item.rule.id}
              glow={item.rule.level === 'RED' ? 'red' : item.rule.level === 'YELLOW' ? 'yellow' : 'green'}
              title={item.rule.title}
              subtitle={`${item.indicator.displayName} • ${item.indicator.valueDisplay}`}
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
              <div className="space-y-4 text-xs font-sans">
                {/* Observation reason */}
                <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-space-950/60 p-2.5 rounded-lg border border-slate-850">
                  {item.indicator.reason}
                </p>

                {/* Primary Action Checklist */}
                <div>
                  <h4 className="font-bold text-slate-200 mb-2 font-mono uppercase text-[11px]">Recommended Countermeasures:</h4>
                  <div className="space-y-1.5">
                    {item.rule.actions.map((act, idx) => {
                      const checked = checkedActions[`${item.rule.id}-${idx}`];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleAction(item.rule.id, idx)}
                          className="flex items-start gap-2 p-2 rounded-lg bg-space-900/40 hover:bg-space-900/80 cursor-pointer transition-colors"
                        >
                          {checked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                          )}
                          <span className={checked ? 'line-through text-slate-500' : 'text-slate-200'}>
                            {act}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Body map link & Evidence Disclosure */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[11px] font-mono">
                  <button
                    onClick={() => onNavigateToBodyMap(item.rule.relatedBodyPartId)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>View on Body Map</span>
                  </button>
                  <span className="text-slate-500">Source: {item.rule.source}</span>
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
          title="Clinical SBAR Medical Telemetry Packet"
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
    </div>
  );
};
