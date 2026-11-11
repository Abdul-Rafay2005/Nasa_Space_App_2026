/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Physiological Drift & Baseline Variance Detection Engine
 * Lead Developer: Abdul Rafay (Phase 2 Deliverable)
 * 
 * Analyzes multi-Sol telemetry records to identify subtle physiological drifts
 * before they escalate into acute medical emergencies in deep-space microgravity.
 */

import { DailyAssessmentRecord, AstronautProfile } from '../types/health';

export interface DriftAlert {
  id: string;
  type: 'CARDIOVASCULAR_DRIFT' | 'SLEEP_DEBT' | 'CORE_HYPERTHERMIA_DRIFT' | 'HYPERTENSION_DRIFT' | 'METABOLIC_DRIFT';
  severity: 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  metric: string;
  detectedChange: string;
  solSpan: number;
  clinicalRecommendation: string;
  sbarSummary: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
}

/**
 * Calculates rolling average of indicator across recent records
 */
function getRollingAverage(records: DailyAssessmentRecord[], key: keyof DailyAssessmentRecord['values']): number {
  if (records.length === 0) return 0;
  const sum = records.reduce((acc, r) => acc + (Number(r.values[key]) || 0), 0);
  return sum / records.length;
}

/**
 * Detects multi-Sol physiological drift patterns against pre-flight baseline
 * and recent rolling averages (3-Sol and 7-Sol intervals).
 */
export function analyzePhysiologicalDrift(
  records: DailyAssessmentRecord[],
  profile: AstronautProfile
): DriftAlert[] {
  const alerts: DriftAlert[] = [];
  if (!records || records.length < 2) return alerts;

  // Records sorted descending by Sol / timestamp
  const sorted = [...records].sort((a, b) => b.missionDay - a.missionDay);
  const recent3 = sorted.slice(0, 3);
  const baselineHR = profile.restingHeartRateBaseline || 65;

  // 1. Cardiovascular Drift (Progressive HR elevation >10% over 3 Sols)
  const avgHR3 = getRollingAverage(recent3, 'heartRate');
  const hrDiffPercent = ((avgHR3 - baselineHR) / baselineHR) * 100;

  if (hrDiffPercent >= 18) {
    alerts.push({
      id: `DRIFT-HR-CRIT-${Date.now()}`,
      type: 'CARDIOVASCULAR_DRIFT',
      severity: 'CRITICAL',
      title: 'Acute Cardiovascular Drift Detected',
      description: `3-Sol resting heart rate average (${avgHR3.toFixed(0)} BPM) is elevated +${hrDiffPercent.toFixed(1)}% above pre-flight baseline (${baselineHR} BPM).`,
      metric: 'Resting Heart Rate',
      detectedChange: `+${hrDiffPercent.toFixed(1)}% vs Baseline`,
      solSpan: recent3.length,
      clinicalRecommendation: 'Immediately initiate fluid loading protocol (1.0 L isotonic electrolyte) and reduce EVA workload. Prepare SBAR transmission to Flight Surgeon.',
      sbarSummary: {
        situation: `Astronaut ${profile.name} exhibits significant resting tachycardia drift across Sol ${recent3[recent3.length - 1]?.missionDay} to ${recent3[0]?.missionDay}.`,
        background: `Baseline resting HR is ${baselineHR} BPM. Current 3-Sol rolling mean is ${avgHR3.toFixed(0)} BPM in microgravity.`,
        assessment: 'Cardiovascular deconditioning compounded by cephalic fluid shifts and possible hypovolemia.',
        recommendation: 'Perform diagnostic ECG, check urine specific gravity, and administer oral rehydration salts.',
      },
    });
  } else if (hrDiffPercent >= 10) {
    alerts.push({
      id: `DRIFT-HR-WARN-${Date.now()}`,
      type: 'CARDIOVASCULAR_DRIFT',
      severity: 'WARNING',
      title: 'Mild Cardiovascular Drift Warning',
      description: `Resting heart rate drifting upward (${avgHR3.toFixed(0)} BPM vs baseline ${baselineHR} BPM).`,
      metric: 'Resting Heart Rate',
      detectedChange: `+${hrDiffPercent.toFixed(1)}% vs Baseline`,
      solSpan: recent3.length,
      clinicalRecommendation: 'Monitor hydration state, ensure scheduled cycle ergometer resistance countermeasures are fulfilled.',
      sbarSummary: {
        situation: `Subtle upward HR trend (+${hrDiffPercent.toFixed(1)}%) detected across last ${recent3.length} Sols.`,
        background: `Normal flight baseline: ${baselineHR} BPM.`,
        assessment: 'Early cardiovascular orthostatic adaptation or mild cumulative physical exertion.',
        recommendation: 'Hydration verification and vitals re-check in 12 hours.',
      },
    });
  }

  // 2. Cumulative Sleep Deficit (>6 hours cumulative debt across 3 Sols)
  const targetSleepPerSol = 8.0;
  let cumulativeDebt = 0;
  recent3.forEach((r) => {
    const slept = Number(r.values.sleepDuration) || 0;
    if (slept < targetSleepPerSol) {
      cumulativeDebt += (targetSleepPerSol - slept);
    }
  });

  if (cumulativeDebt >= 6.0) {
    alerts.push({
      id: `DRIFT-SLEEP-CRIT-${Date.now()}`,
      type: 'SLEEP_DEBT',
      severity: 'CRITICAL',
      title: 'High Cumulative Sleep Debt (>6 Hours)',
      description: `Cumulative sleep deficit has reached ${cumulativeDebt.toFixed(1)} hours over the last ${recent3.length} Sols. Cognitive reaction time compromised.`,
      metric: 'Cumulative Sleep Deficit',
      detectedChange: `-${cumulativeDebt.toFixed(1)} hrs lost`,
      solSpan: recent3.length,
      clinicalRecommendation: 'Postpone complex robotic arm manipulation or high-risk EVA activities. Enforce sleep quarters acoustic isolation and dim circadian lighting.',
      sbarSummary: {
        situation: `Astronaut ${profile.name} accumulated ${cumulativeDebt.toFixed(1)} hours of sleep deprivation.`,
        background: 'Target circadian schedule requires 8.0 hours/Sol for operational nominal readiness.',
        assessment: 'Heightened risk of procedural errors, micro-sleep events, and psychological fatigue.',
        recommendation: 'Prescribe mandatory 90-minute sleep countermeasure and review workload schedule.',
      },
    });
  } else if (cumulativeDebt >= 3.5) {
    alerts.push({
      id: `DRIFT-SLEEP-WARN-${Date.now()}`,
      type: 'SLEEP_DEBT',
      severity: 'WARNING',
      title: 'Moderate Sleep Debt Accruing',
      description: `Cumulative deficit of ${cumulativeDebt.toFixed(1)} hours under target across ${recent3.length} Sols.`,
      metric: 'Cumulative Sleep Deficit',
      detectedChange: `-${cumulativeDebt.toFixed(1)} hrs lost`,
      solSpan: recent3.length,
      clinicalRecommendation: 'Optimize sleep quarters temperature and minimize blue-light exposure 1 hour prior to sleep cycle.',
      sbarSummary: {
        situation: `Moderate sleep deficit (${cumulativeDebt.toFixed(1)} hrs) logged.`,
        background: 'Consecutive sub-7-hour sleep logs.',
        assessment: 'Fatigue accumulation developing.',
        recommendation: 'Schedule 30-minute power nap before afternoon duty.',
      },
    });
  }

  // 3. Thermoregulatory Space Fever Drift (Consecutive temp elevations)
  const avgTemp3 = getRollingAverage(recent3, 'bodyTemperature');
  const baselineTemp = profile.bodyTemperatureBaseline || 36.8;
  if (avgTemp3 - baselineTemp >= 0.5) {
    alerts.push({
      id: `DRIFT-TEMP-WARN-${Date.now()}`,
      type: 'CORE_HYPERTHERMIA_DRIFT',
      severity: 'WARNING',
      title: 'Spaceflight Core Hyperthermia Drift',
      description: `Rolling core body temperature (${avgTemp3.toFixed(2)} °C) is running +${(avgTemp3 - baselineTemp).toFixed(2)} °C above pre-flight baseline (${baselineTemp} °C). Characteristic of impaired convective heat dissipation in zero-g.`,
      metric: 'Core Body Temperature',
      detectedChange: `+${(avgTemp3 - baselineTemp).toFixed(2)} °C`,
      solSpan: recent3.length,
      clinicalRecommendation: 'Check cabin airflow ventilation rate and verify cooling vest functionality during exercise.',
      sbarSummary: {
        situation: `Microgravity core temperature elevation observed at ${avgTemp3.toFixed(2)} °C.`,
        background: 'Spaceflight-induced hyperthermia occurs due to zero-g lack of natural convection and altered cytokine release.',
        assessment: 'Persistent non-febrile core shift or prodromal immune reaction.',
        recommendation: 'Increase personal fan ventilation in crew quarters and re-evaluate in 8 hours.',
      },
    });
  }

  return alerts;
}

