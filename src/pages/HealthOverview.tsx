/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Health Overview & Baseline Comparison Page
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React from 'react';
import { AstronautProfile, DailyAssessmentRecord } from '../types/health';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { PROVISIONAL_DEMO_THRESHOLDS } from '../config/thresholds';
import {
  Activity,
  HeartPulse,
  Gauge,
  Droplet,
  Thermometer,
  Moon,
  Smile,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
} from 'lucide-react';

interface HealthOverviewProps {
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
}

export const HealthOverview: React.FC<HealthOverviewProps> = ({
  profile,
  latestAssessment,
}) => {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS;

  // Comparison matrix items
  const baselineMatrix = [
    {
      name: 'Resting Heart Rate',
      unit: 'BPM',
      icon: <HeartPulse className="w-4 h-4 text-rose-400" />,
      baseline: `${profile.restingHeartRateBaseline} BPM`,
      current: latestAssessment ? `${latestAssessment.results.heartRate.valueDisplay} BPM` : 'N/A',
      status: latestAssessment?.results.heartRate.status || 'GREEN',
      statusLabel: latestAssessment?.results.heartRate.statusLabel || 'Nominal',
      nominalGreen: `${cfg.heartRate.green.min}–${cfg.heartRate.green.max} BPM`,
      warningYellow: `${cfg.heartRate.yellowLow?.min}–${cfg.heartRate.yellowLow?.max} & ${cfg.heartRate.yellowHigh?.min}–${cfg.heartRate.yellowHigh?.max} BPM`,
      criticalRed: `≤ ${cfg.heartRate.redCriticalLow} or ≥ ${cfg.heartRate.redCriticalHigh} BPM`,
      clinicalContext: cfg.heartRate.medicalContext,
    },
    {
      name: 'Blood Pressure',
      unit: 'mmHg',
      icon: <Gauge className="w-4 h-4 text-blue-400" />,
      baseline: `${profile.bloodPressureBaseline.systolic}/${profile.bloodPressureBaseline.diastolic} mmHg`,
      current: latestAssessment ? `${latestAssessment.results.bloodPressure.valueDisplay} mmHg` : 'N/A',
      status: latestAssessment?.results.bloodPressure.status || 'GREEN',
      statusLabel: latestAssessment?.results.bloodPressure.statusLabel || 'Nominal',
      nominalGreen: `${cfg.bloodPressure.systolic.green.min}–${cfg.bloodPressure.systolic.green.max} / ${cfg.bloodPressure.diastolic.green.min}–${cfg.bloodPressure.diastolic.green.max} mmHg`,
      warningYellow: '85–94 or 126–140 sys / 50–59 or 81–90 dia mmHg',
      criticalRed: '≤ 84 or ≥ 141 sys / ≤ 49 or ≥ 91 dia mmHg',
      clinicalContext: cfg.bloodPressure.medicalContext,
    },
    {
      name: 'Blood Sugar (Glucose)',
      unit: 'mg/dL',
      icon: <Droplet className="w-4 h-4 text-amber-400" />,
      baseline: '90 mg/dL (Target)',
      current: latestAssessment ? `${latestAssessment.results.bloodSugar.valueDisplay} mg/dL` : 'N/A',
      status: latestAssessment?.results.bloodSugar.status || 'GREEN',
      statusLabel: latestAssessment?.results.bloodSugar.statusLabel || 'Nominal',
      nominalGreen: `${cfg.bloodSugar.green.min}–${cfg.bloodSugar.green.max} mg/dL`,
      warningYellow: `${cfg.bloodSugar.yellowLow?.min}–${cfg.bloodSugar.yellowLow?.max} & ${cfg.bloodSugar.yellowHigh?.min}–${cfg.bloodSugar.yellowHigh?.max} mg/dL`,
      criticalRed: `≤ ${cfg.bloodSugar.redCriticalLow} or ≥ ${cfg.bloodSugar.redCriticalHigh} mg/dL`,
      clinicalContext: cfg.bloodSugar.medicalContext,
    },
    {
      name: 'Core Body Temperature',
      unit: '°C',
      icon: <Thermometer className="w-4 h-4 text-red-400" />,
      baseline: `${profile.bodyTemperatureBaseline.toFixed(1)} °C`,
      current: latestAssessment ? `${latestAssessment.results.bodyTemperature.valueDisplay} °C` : 'N/A',
      status: latestAssessment?.results.bodyTemperature.status || 'GREEN',
      statusLabel: latestAssessment?.results.bodyTemperature.statusLabel || 'Nominal',
      nominalGreen: `${cfg.bodyTemperature.green.min}–${cfg.bodyTemperature.green.max} °C`,
      warningYellow: `${cfg.bodyTemperature.yellowLow?.min}–${cfg.bodyTemperature.yellowLow?.max} & ${cfg.bodyTemperature.yellowHigh?.min}–${cfg.bodyTemperature.yellowHigh?.max} °C`,
      criticalRed: `≤ ${cfg.bodyTemperature.redCriticalLow} or ≥ ${cfg.bodyTemperature.redCriticalHigh} °C`,
      clinicalContext: cfg.bodyTemperature.medicalContext,
    },
    {
      name: 'Sleep Restorative Duration',
      unit: 'Hours',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      baseline: '8.0 Hours (Prescribed)',
      current: latestAssessment ? `${latestAssessment.results.sleepDuration.valueDisplay} Hours` : 'N/A',
      status: latestAssessment?.results.sleepDuration.status || 'GREEN',
      statusLabel: latestAssessment?.results.sleepDuration.statusLabel || 'Nominal',
      nominalGreen: `${cfg.sleepDuration.green.min}–${cfg.sleepDuration.green.max} Hours`,
      warningYellow: `${cfg.sleepDuration.yellowLow?.min}–${cfg.sleepDuration.yellowLow?.max} & ${cfg.sleepDuration.yellowHigh?.min}–${cfg.sleepDuration.yellowHigh?.max} Hours`,
      criticalRed: `≤ ${cfg.sleepDuration.redCriticalLow} or ≥ ${cfg.sleepDuration.redCriticalHigh} Hours`,
      clinicalContext: cfg.sleepDuration.medicalContext,
    },
    {
      name: 'Psychological Morale / Mood',
      unit: 'Scale',
      icon: <Smile className="w-4 h-4 text-emerald-400" />,
      baseline: 'Nominal Resilient',
      current: latestAssessment ? `${latestAssessment.results.mood.valueDisplay}` : 'N/A',
      status: latestAssessment?.results.mood.status || 'GREEN',
      statusLabel: latestAssessment?.results.mood.statusLabel || 'Nominal',
      nominalGreen: 'Optimal / Energized, Nominal / Good',
      warningYellow: 'Fatigued / Drained, High Stress / Tense',
      criticalRed: 'Disoriented / Space Adaptation Syndrome',
      clinicalContext: 'Evaluates cognitive fatigue, sensory disorientation, and team resilience in confinement.',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-sans tracking-wide">
              Health Overview & Baseline Telemetry
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Baseline comparison, active physiological thresholds, and clinical configuration
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl bg-space-900 border border-slate-800">
          <span className="text-slate-400">THRESHOLD ENGINE:</span>
          <span className="text-cyan-300 font-bold">{cfg.version}</span>
        </div>
      </div>

      {/* Medical Researcher Callout for Eman */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 space-y-1.5 font-sans">
        <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold">
          <Info className="w-4 h-4" />
          <span>TEAM HANDOFF: MEDICAL THRESHOLD ARCHITECTURE (FOR EMAN)</span>
        </div>
        <p className="leading-relaxed">
          All threshold limits displayed below are configured in <code className="bg-space-900 px-1.5 py-0.5 rounded text-cyan-300 font-mono">src/config/thresholds.ts</code>.
          To update these provisional demonstration numbers with research-backed NASA Human Research Program (HRP) thresholds,
          simply edit the values in that single file without modifying any UI or calculation logic.
        </p>
      </div>

      {/* 1. Baseline Comparison Matrix */}
      <Card
        glow="cyan"
        title="Crew Baseline vs. Current Reading Variance"
        subtitle={`Telemetry compared against Cmdr. ${profile.name}'s pre-flight biometric baselines`}
        icon={<Sliders className="w-4 h-4" />}
      >
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-space-950/60">
              <tr>
                <th className="py-3 px-3">Indicator</th>
                <th className="py-3 px-3">Pre-Flight Baseline</th>
                <th className="py-3 px-3">Latest Sol Reading</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Nominal Green Target</th>
                <th className="py-3 px-3">Warning Yellow Range</th>
                <th className="py-3 px-3">Urgent Red Boundary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {baselineMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-space-850/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-200">
                    <div className="flex items-center gap-2 font-sans">
                      <span className="p-1 rounded bg-space-900 border border-slate-800">
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">
                    {item.baseline}
                  </td>
                  <td className="py-3 px-3 text-slate-100 font-bold">
                    {item.current}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={item.status} label={item.statusLabel} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-emerald-300">
                    {item.nominalGreen}
                  </td>
                  <td className="py-3 px-3 text-amber-300">
                    {item.warningYellow}
                  </td>
                  <td className="py-3 px-3 text-rose-400">
                    {item.criticalRed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 2. Detailed Physiological Threshold Guide */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono mb-3">
          Microgravity Flight Rules & Threshold Definitions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {baselineMatrix.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-space-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <h4 className="font-sans font-semibold text-xs text-slate-200 uppercase">
                      {item.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-950 text-cyan-300 border border-slate-800">
                    {item.unit}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {item.clinicalContext}
                </p>
              </div>

              {/* Threshold Tiers */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                <div className="flex items-center justify-between bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/20 text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>GREEN (Nominal)</span>
                  </span>
                  <span>{item.nominalGreen}</span>
                </div>

                <div className="flex items-center justify-between bg-amber-950/30 px-2 py-1 rounded border border-amber-500/20 text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>YELLOW (Warning)</span>
                  </span>
                  <span className="truncate ml-2">{item.warningYellow}</span>
                </div>

                <div className="flex items-center justify-between bg-rose-950/30 px-2 py-1 rounded border border-rose-500/20 text-rose-300">
                  <span className="flex items-center gap-1.5">
                    <AlertOctagon className="w-3 h-3 text-rose-400" />
                    <span>RED (Critical)</span>
                  </span>
                  <span>{item.criticalRed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
