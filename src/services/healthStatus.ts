/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Health Status Calculation Engine
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 * 
 * Clean separation of business logic and health calculation from UI components.
 * Configured dynamically using provisional thresholds in src/config/thresholds.ts
 */

import { PROVISIONAL_DEMO_THRESHOLDS } from '../config/thresholds';
import {
  HealthStatus,
  IndicatorResult,
  MoodType,
  OverallHealthResult,
  ParsedAssessmentValues,
  AstronautProfile,
} from '../types/health';

/**
 * Evaluates Resting Heart Rate (BPM)
 */
export function evaluateHeartRate(
  bpm: number,
  baseline?: number
): IndicatorResult {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.heartRate;
  let status: HealthStatus = 'GREEN';
  let statusLabel = 'Normal (Nominal)';
  let reason = `Heart rate of ${bpm} BPM is within the optimal resting range (${cfg.green.min}–${cfg.green.max} BPM).`;

  if (bpm <= cfg.redCriticalLow) {
    status = 'RED';
    statusLabel = 'Urgent Attention';
    reason = `Marked bradycardia (${bpm} BPM ≤ ${cfg.redCriticalLow} BPM). Elevated risk of perfusion compromise in microgravity.`;
  } else if (bpm >= cfg.redCriticalHigh) {
    status = 'RED';
    statusLabel = 'Urgent Attention';
    reason = `Marked tachycardia (${bpm} BPM ≥ ${cfg.redCriticalHigh} BPM). Severe resting elevation; verify cardiovascular telemetry.`;
  } else if (cfg.yellowLow && bpm >= cfg.yellowLow.min && bpm <= cfg.yellowLow.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Low)';
    reason = `Mild bradycardia (${bpm} BPM). Below nominal ${cfg.green.min} BPM threshold; monitor for orthostatic symptoms.`;
  } else if (cfg.yellowHigh && bpm >= cfg.yellowHigh.min && bpm <= cfg.yellowHigh.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Elevated)';
    reason = `Mild tachycardia (${bpm} BPM). Above nominal ${cfg.green.max} BPM threshold; check hydration and stress levels.`;
  }

  let deviationPercent: number | undefined;
  if (baseline && baseline > 0) {
    deviationPercent = Math.round(((bpm - baseline) / baseline) * 100);
  }

  return {
    indicatorId: 'heartRate',
    displayName: 'Heart Rate',
    valueDisplay: `${bpm}`,
    numericValue: bpm,
    unit: 'BPM',
    status,
    statusLabel,
    reason,
    nominalRangeLabel: `${cfg.green.min}–${cfg.green.max} BPM`,
    baselineNominal: baseline ? `${baseline} BPM` : undefined,
    deviationPercent,
    criticality: status === 'RED' ? 'high' : status === 'YELLOW' ? 'medium' : 'low',
  };
}

/**
 * Evaluates Blood Pressure (Systolic / Diastolic in mmHg)
 */
export function evaluateBloodPressure(
  systolic: number,
  diastolic: number,
  baseline?: { systolic: number; diastolic: number }
): IndicatorResult {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.bloodPressure;
  let status: HealthStatus = 'GREEN';
  let statusLabel = 'Normal (Nominal)';
  let reason = `Blood pressure ${systolic}/${diastolic} mmHg is within nominal operational boundaries (Sys: ${cfg.systolic.green.min}–${cfg.systolic.green.max}, Dia: ${cfg.diastolic.green.min}–${cfg.diastolic.green.max} mmHg).`;

  // Check critical RED first
  if (systolic >= cfg.systolic.redCriticalHigh || diastolic >= cfg.diastolic.redCriticalHigh) {
    status = 'RED';
    statusLabel = 'Urgent Attention (High)';
    reason = `Critical hypertensive crisis reading (${systolic}/${diastolic} mmHg). Immediate flight surgeon consultation recommended.`;
  } else if (systolic <= cfg.systolic.redCriticalLow || diastolic <= cfg.diastolic.redCriticalLow) {
    status = 'RED';
    statusLabel = 'Urgent Attention (Hypotension)';
    reason = `Severe hypotension (${systolic}/${diastolic} mmHg). High risk of orthostatic syncope during spacewalk/operations.`;
  } else if (
    (cfg.systolic.yellowHigh && systolic >= cfg.systolic.yellowHigh.min && systolic <= cfg.systolic.yellowHigh.max) ||
    (cfg.diastolic.yellowHigh && diastolic >= cfg.diastolic.yellowHigh.min && diastolic <= cfg.diastolic.yellowHigh.max)
  ) {
    status = 'YELLOW';
    statusLabel = 'Warning (Elevated)';
    reason = `Pre-hypertensive reading (${systolic}/${diastolic} mmHg). Systolic or diastolic exceeds standard target; recheck after 15 min rest.`;
  } else if (
    (cfg.systolic.yellowLow && systolic >= cfg.systolic.yellowLow.min && systolic <= cfg.systolic.yellowLow.max) ||
    (cfg.diastolic.yellowLow && diastolic >= cfg.diastolic.yellowLow.min && diastolic <= cfg.diastolic.yellowLow.max)
  ) {
    status = 'YELLOW';
    statusLabel = 'Warning (Low)';
    reason = `Borderline low blood pressure (${systolic}/${diastolic} mmHg). Monitor for lightheadedness during posture shifts.`;
  }

  return {
    indicatorId: 'bloodPressure',
    displayName: 'Blood Pressure',
    valueDisplay: `${systolic}/${diastolic}`,
    numericValue: systolic,
    secondaryValue: diastolic,
    unit: 'mmHg',
    status,
    statusLabel,
    reason,
    nominalRangeLabel: `${cfg.systolic.green.min}–${cfg.systolic.green.max} / ${cfg.diastolic.green.min}–${cfg.diastolic.green.max} mmHg`,
    baselineNominal: baseline ? `${baseline.systolic}/${baseline.diastolic} mmHg` : undefined,
    criticality: status === 'RED' ? 'high' : status === 'YELLOW' ? 'medium' : 'low',
  };
}

/**
 * Evaluates Blood Sugar (mg/dL)
 */
export function evaluateBloodSugar(glucose: number): IndicatorResult {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.bloodSugar;
  let status: HealthStatus = 'GREEN';
  let statusLabel = 'Normal (Euglycemia)';
  let reason = `Blood glucose of ${glucose} mg/dL is within the target metabolic window (${cfg.green.min}–${cfg.green.max} mg/dL).`;

  if (glucose <= cfg.redCriticalLow) {
    status = 'RED';
    statusLabel = 'Urgent Attention (Hypoglycemia)';
    reason = `Severe hypoglycemia (${glucose} mg/dL ≤ ${cfg.redCriticalLow} mg/dL). Rapid oral carbohydrate intake and flight surgeon notification required.`;
  } else if (glucose >= cfg.redCriticalHigh) {
    status = 'RED';
    statusLabel = 'Urgent Attention (Hyperglycemia)';
    reason = `Marked hyperglycemia (${glucose} mg/dL ≥ ${cfg.redCriticalHigh} mg/dL). Assess nutrition log and insulin counter-measures.`;
  } else if (cfg.yellowLow && glucose >= cfg.yellowLow.min && glucose <= cfg.yellowLow.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Low Sugar)';
    reason = `Borderline low glucose (${glucose} mg/dL). Crew member should consume a balanced caloric ration before duty.`;
  } else if (cfg.yellowHigh && glucose >= cfg.yellowHigh.min && glucose <= cfg.yellowHigh.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Elevated Sugar)';
    reason = `Mildly elevated glucose (${glucose} mg/dL). Re-evaluate post-prandial timeline and hydration.`;
  }

  return {
    indicatorId: 'bloodSugar',
    displayName: 'Blood Sugar (Glucose)',
    valueDisplay: `${glucose}`,
    numericValue: glucose,
    unit: 'mg/dL',
    status,
    statusLabel,
    reason,
    nominalRangeLabel: `${cfg.green.min}–${cfg.green.max} mg/dL`,
    criticality: status === 'RED' ? 'high' : status === 'YELLOW' ? 'medium' : 'low',
  };
}

/**
 * Evaluates Core Body Temperature (°C)
 */
export function evaluateBodyTemperature(
  temp: number,
  baseline?: number
): IndicatorResult {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.bodyTemperature;
  let status: HealthStatus = 'GREEN';
  let statusLabel = 'Normal (Normothermia)';
  let reason = `Core body temperature ${temp.toFixed(1)}°C is nominal (${cfg.green.min}–${cfg.green.max}°C).`;

  if (temp <= cfg.redCriticalLow) {
    status = 'RED';
    statusLabel = 'Urgent Attention (Hypothermia)';
    reason = `Critical hypothermia risk (${temp.toFixed(1)}°C ≤ ${cfg.redCriticalLow}°C). Thermal blanket countermeasure and suit inspection required.`;
  } else if (temp >= cfg.redCriticalHigh) {
    status = 'RED';
    statusLabel = 'Urgent Attention (Hyperthermia/Fever)';
    reason = `Pyrexia / elevated core fever (${temp.toFixed(1)}°C ≥ ${cfg.redCriticalHigh}°C). Suspected infection or microgravity thermoregulatory failure.`;
  } else if (cfg.yellowLow && temp >= cfg.yellowLow.min && temp <= cfg.yellowLow.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Sub-nominal Temp)';
    reason = `Sub-optimal body temperature (${temp.toFixed(1)}°C). Adjust crew quarters ventilation and thermal layers.`;
  } else if (cfg.yellowHigh && temp >= cfg.yellowHigh.min && temp <= cfg.yellowHigh.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Elevated / Space Fever)';
    reason = `Mild thermal elevation (${temp.toFixed(1)}°C). Microgravity convective cooling impairment; hydrate and decrease exercise load.`;
  }

  return {
    indicatorId: 'bodyTemperature',
    displayName: 'Core Body Temperature',
    valueDisplay: `${temp.toFixed(1)}`,
    numericValue: temp,
    unit: '°C',
    status,
    statusLabel,
    reason,
    nominalRangeLabel: `${cfg.green.min}–${cfg.green.max} °C`,
    baselineNominal: baseline ? `${baseline.toFixed(1)} °C` : undefined,
    criticality: status === 'RED' ? 'high' : status === 'YELLOW' ? 'medium' : 'low',
  };
}

/**
 * Evaluates Sleep Duration (Hours)
 */
export function evaluateSleepDuration(hours: number): IndicatorResult {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.sleepDuration;
  let status: HealthStatus = 'GREEN';
  let statusLabel = 'Normal (Restorative)';
  let reason = `Logged sleep of ${hours.toFixed(1)} hours meets the required restorative cycle (${cfg.green.min}–${cfg.green.max} hrs).`;

  if (hours <= cfg.redCriticalLow) {
    status = 'RED';
    statusLabel = 'Urgent Attention (Acute Sleep Debt)';
    reason = `Severe sleep restriction (${hours.toFixed(1)} hrs ≤ ${cfg.redCriticalLow} hrs). Significant neurobehavioral and reaction-time impairment risk.`;
  } else if (hours >= cfg.redCriticalHigh) {
    status = 'RED';
    statusLabel = 'Urgent Attention (Hypersomnia)';
    reason = `Unusually prolonged sleep period (${hours.toFixed(1)} hrs ≥ ${cfg.redCriticalHigh} hrs). Screen for chronic fatigue or metabolic distress.`;
  } else if (cfg.yellowLow && hours >= cfg.yellowLow.min && hours <= cfg.yellowLow.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Sleep Deficit)';
    reason = `Sub-target sleep duration (${hours.toFixed(1)} hrs). Crew member should schedule a 30-min restorative rest period.`;
  } else if (cfg.yellowHigh && hours >= cfg.yellowHigh.min && hours <= cfg.yellowHigh.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Extended Sleep)';
    reason = `Extended rest cycle (${hours.toFixed(1)} hrs). May reflect compensatory recovery from previous heavy mission EVA.`;
  }

  return {
    indicatorId: 'sleepDuration',
    displayName: 'Sleep Duration',
    valueDisplay: `${hours.toFixed(1)}`,
    numericValue: hours,
    unit: 'Hours',
    status,
    statusLabel,
    reason,
    nominalRangeLabel: `${cfg.green.min}–${cfg.green.max} Hours`,
    criticality: status === 'RED' ? 'high' : status === 'YELLOW' ? 'medium' : 'low',
  };
}

/**
 * Evaluates Mood & Psychological Readiness
 */
export function evaluateMood(mood: MoodType): IndicatorResult {
  const moodEntry = PROVISIONAL_DEMO_THRESHOLDS.moodMap[mood] || {
    status: 'GREEN',
    description: 'Operational status nominal.',
  };

  const statusLabels: Record<HealthStatus, string> = {
    GREEN: 'Normal (Resilient)',
    YELLOW: 'Warning (Fatigued/Stressed)',
    RED: 'Urgent Attention (Disoriented)',
  };

  const displayTitles: Record<MoodType, string> = {
    excellent: 'Optimal / Energized',
    good: 'Nominal / Stable',
    fatigued: 'Fatigued / Drained',
    stressed: 'High Stress / Tense',
    disoriented: 'Disoriented / SAS Symptoms',
  };

  return {
    indicatorId: 'mood',
    displayName: 'Psychological Readiness & Mood',
    valueDisplay: displayTitles[mood] || mood,
    unit: 'Scale',
    status: moodEntry.status,
    statusLabel: statusLabels[moodEntry.status],
    reason: moodEntry.description,
    nominalRangeLabel: 'Optimal or Nominal',
    criticality: moodEntry.status === 'RED' ? 'high' : moodEntry.status === 'YELLOW' ? 'medium' : 'low',
  };
}

/**
 * Evaluates all 6 health indicators together
 */
export function evaluateAllIndicators(
  values: ParsedAssessmentValues,
  profile?: AstronautProfile
): {
  heartRate: IndicatorResult;
  bloodPressure: IndicatorResult;
  bloodSugar: IndicatorResult;
  bodyTemperature: IndicatorResult;
  sleepDuration: IndicatorResult;
  mood: IndicatorResult;
} {
  return {
    heartRate: evaluateHeartRate(values.heartRate, profile?.restingHeartRateBaseline),
    bloodPressure: evaluateBloodPressure(
      values.systolic,
      values.diastolic,
      profile?.bloodPressureBaseline
    ),
    bloodSugar: evaluateBloodSugar(values.bloodSugar),
    bodyTemperature: evaluateBodyTemperature(
      values.bodyTemperature,
      profile?.bodyTemperatureBaseline
    ),
    sleepDuration: evaluateSleepDuration(values.sleepDuration),
    mood: evaluateMood(values.mood),
  };
}

/**
 * Calculates Overall Health Status from individual indicator results
 * Following strict triage hierarchy:
 * 1. Any RED indicator -> Overall RED
 * 2. Any YELLOW indicator (and 0 RED) -> Overall YELLOW
 * 3. All GREEN indicators -> Overall GREEN
 */
export function calculateOverallHealth(
  results: Record<string, IndicatorResult>
): OverallHealthResult {
  const list = Object.values(results);
  let redCount = 0;
  let yellowCount = 0;
  let greenCount = 0;

  list.forEach((r) => {
    if (r.status === 'RED') redCount++;
    else if (r.status === 'YELLOW') yellowCount++;
    else greenCount++;
  });

  // Calculate composite score (out of 100)
  // Each green contributes ~16.66 pts, yellow 9 pts, red 2 pts
  const score = Math.max(
    10,
    Math.round(((greenCount * 16.66) + (yellowCount * 8.5) + (redCount * 1.5)))
  );

  if (redCount > 0) {
    const criticalItems = list
      .filter((r) => r.status === 'RED')
      .map((r) => r.displayName)
      .join(', ');

    return {
      status: 'RED',
      statusLabel: 'Urgent Attention Required',
      alertTitle: 'Critical Telemetry Advisory',
      summary: `${redCount} physiological indicator${redCount > 1 ? 's are' : ' is'} in critical status (${criticalItems}). Crew flight surgeon review and countermeasure intervention advised.`,
      normalCount: greenCount,
      warningCount: yellowCount,
      urgentCount: redCount,
      score,
      recommendationSnippet: 'Initiate telemetry re-check, notify Mission Control flight surgeon console, and suspend high-exertion tasks.',
    };
  }

  if (yellowCount > 0) {
    const warningItems = list
      .filter((r) => r.status === 'YELLOW')
      .map((r) => r.displayName)
      .join(', ');

    return {
      status: 'YELLOW',
      statusLabel: 'Operational Warning / Monitoring',
      alertTitle: 'Sub-nominal Indicator Alert',
      summary: `${yellowCount} indicator${yellowCount > 1 ? 's show' : ' shows'} minor departure from nominal baseline (${warningItems}). Enhanced telemetry monitoring active.`,
      normalCount: greenCount,
      warningCount: yellowCount,
      urgentCount: 0,
      score,
      recommendationSnippet: 'Hydrate, log restorative downtime, and repeat assessment within 4 mission hours.',
    };
  }

  return {
    status: 'GREEN',
    statusLabel: 'Nominal Mission Flight Readiness',
    alertTitle: 'All Telemetry Stable',
    summary: 'All 6 vital physiological indicators are within optimal microgravity operational thresholds. Crew member cleared for standard flight duties.',
    normalCount: greenCount,
    warningCount: 0,
    urgentCount: 0,
    score: 98,
    recommendationSnippet: 'Maintain standard hydration, daily 2.5-hour countermeasure aerobic/resistive exercise, and sleep hygiene.',
  };
}

