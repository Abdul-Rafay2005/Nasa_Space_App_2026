/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Health Status Calculation Engine
 * Updated: 14 November 2026 per Official NASA & CSA Research Report (Eman Saleem)
 * 
 * Clean separation of business logic and health calculation from UI components.
 * Configured dynamically using thresholds aligned with NASA Human Research Program (HRP)
 * 5 Hazards, 17 Spaceflight Risks, NEWS2, and NASA-STD-3001.
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
 * Hazard: Gravity Fields | Risk: Cardiovascular Adaptations | NEWS2 + MedlinePlus
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
    statusLabel = 'Urgent Attention (Bradycardia)';
    reason = `Marked bradycardia (${bpm} BPM ≤ ${cfg.redCriticalLow} BPM). Elevated risk of cerebral hypoperfusion and cardiac deconditioning.`;
  } else if (bpm >= cfg.redCriticalHigh) {
    status = 'RED';
    statusLabel = 'Urgent Attention (Tachycardia)';
    reason = `Marked resting tachycardia (${bpm} BPM ≥ ${cfg.redCriticalHigh} BPM). Severe resting elevation; verify cardiovascular telemetry and hydration.`;
  } else if (cfg.yellowLow && bpm >= cfg.yellowLow.min && bpm <= cfg.yellowLow.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Low Resting Rate)';
    reason = `Mild bradycardia (${bpm} BPM). Below nominal ${cfg.green.min} BPM threshold; monitor for orthostatic symptoms during posture shifts.`;
  } else if (cfg.yellowHigh && bpm >= cfg.yellowHigh.min && bpm <= cfg.yellowHigh.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Elevated Rate)';
    reason = `Mild tachycardia (${bpm} BPM). Above nominal ${cfg.green.max} BPM threshold; check for workload exertion, hypercapnia, or dehydration.`;
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
    nasaHazard: cfg.nasaHazard,
    nasaRisk: cfg.nasaRisk,
    sourceCitation: cfg.basis,
  };
}

/**
 * Evaluates Blood Pressure (Systolic / Diastolic in mmHg)
 * Hazard: Gravity Fields | Risk: Cardiovascular Adaptations | NEWS2 + AHA
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
    statusLabel = 'Urgent Attention (Hypertensive Crisis)';
    reason = `Critical hypertensive reading (${systolic}/${diastolic} mmHg > 180/120). Immediate flight surgeon consultation and rest recommended.`;
  } else if (systolic <= cfg.systolic.redCriticalLow || diastolic <= cfg.diastolic.redCriticalLow) {
    status = 'RED';
    statusLabel = 'Urgent Attention (Severe Hypotension)';
    reason = `Severe hypotension (${systolic}/${diastolic} mmHg ≤ 90 mmHg systolic). High risk of orthostatic syncope during spacewalk/operations.`;
  } else if (
    (cfg.systolic.yellowHigh && systolic >= cfg.systolic.yellowHigh.min && systolic <= cfg.systolic.yellowHigh.max) ||
    (cfg.diastolic.yellowHigh && diastolic >= cfg.diastolic.yellowHigh.min && diastolic <= cfg.diastolic.yellowHigh.max)
  ) {
    status = 'YELLOW';
    statusLabel = 'Warning (Elevated Arterial Pressure)';
    reason = `Elevated blood pressure (${systolic}/${diastolic} mmHg). Pre-hypertensive range per AHA guidelines; recheck after 15 min quiet rest.`;
  } else if (
    (cfg.systolic.yellowLow && systolic >= cfg.systolic.yellowLow.min && systolic <= cfg.systolic.yellowLow.max) ||
    (cfg.diastolic.yellowLow && diastolic >= cfg.diastolic.yellowLow.min && diastolic <= cfg.diastolic.yellowLow.max)
  ) {
    status = 'YELLOW';
    statusLabel = 'Warning (Low Arterial Pressure)';
    reason = `Borderline low blood pressure (${systolic}/${diastolic} mmHg). Monitor for lightheadedness during rapid microgravity posture shifts.`;
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
    nasaHazard: cfg.nasaHazard,
    nasaRisk: cfg.nasaRisk,
    sourceCitation: cfg.basis,
  };
}

/**
 * Evaluates Fasting Blood Sugar (mg/dL)
 * Hazard: Distance from Earth | Risk: Inadequate Food and Nutrition | CDC
 */
export function evaluateBloodSugar(glucose: number): IndicatorResult {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.bloodSugar;
  let status: HealthStatus = 'GREEN';
  let statusLabel = 'Normal (Euglycemia)';
  let reason = `Blood glucose of ${glucose} mg/dL is within the target metabolic window (${cfg.green.min}–${cfg.green.max} mg/dL).`;

  if (glucose <= cfg.redCriticalLow) {
    status = 'RED';
    statusLabel = 'Urgent Attention (Severe Hypoglycemia)';
    reason = `Severe hypoglycemia (${glucose} mg/dL < 54 mg/dL per CDC). Immediate oral carbohydrate ration and flight surgeon contact required.`;
  } else if (glucose >= cfg.redCriticalHigh) {
    status = 'RED';
    statusLabel = 'Urgent Attention (Hyperglycemia)';
    reason = `Marked hyperglycemia (${glucose} mg/dL ≥ 126 mg/dL diabetes threshold). Review station dietary intake and hydration.`;
  } else if (cfg.yellowLow && glucose >= cfg.yellowLow.min && glucose <= cfg.yellowLow.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Mild Hypoglycemia)';
    reason = `Borderline low glucose (${glucose} mg/dL). Crew member should consume a balanced caloric snack before mission duty.`;
  } else if (cfg.yellowHigh && glucose >= cfg.yellowHigh.min && glucose <= cfg.yellowHigh.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Impaired Fasting Glucose)';
    reason = `Mildly elevated glucose (${glucose} mg/dL). Prediabetes range (100–125 mg/dL); re-evaluate post-prandial timeline.`;
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
    nasaHazard: cfg.nasaHazard,
    nasaRisk: cfg.nasaRisk,
    sourceCitation: cfg.basis,
  };
}

/**
 * Evaluates Core Body Temperature (°C)
 * Hazard: Hostile/Closed Environment | Risk: Altered Immune System Responses | NEWS2 + MedlinePlus
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
    reason = `Severe hypothermia reading (${temp.toFixed(1)}°C ≤ ${cfg.redCriticalLow}°C). Risk of shivering thermogenesis failure and metabolic depression.`;
  } else if (temp >= cfg.redCriticalHigh) {
    status = 'RED';
    statusLabel = 'Urgent Attention (High Fever / Space Fever)';
    reason = `High fever (${temp.toFixed(1)}°C ≥ 39.1°C per NEWS2). Immune reactivation or infection risk; initiate isolation protocol and contact surgeon.`;
  } else if (cfg.yellowLow && temp >= cfg.yellowLow.min && temp <= cfg.yellowLow.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Mild Sub-Normal Temp)';
    reason = `Slightly low core temperature (${temp.toFixed(1)}°C). Check spacecraft thermal suit settings and ambient cabin airflow.`;
  } else if (cfg.yellowHigh && temp >= cfg.yellowHigh.min && temp <= cfg.yellowHigh.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Elevated / Space Fever)';
    reason = `Elevated temperature (${temp.toFixed(1)}°C). Reflects microgravity convective cooling impairment ("Space Fever") or post-exercise thermal load.`;
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
    nasaHazard: cfg.nasaHazard,
    nasaRisk: cfg.nasaRisk,
    sourceCitation: cfg.basis,
  };
}

/**
 * Evaluates Sleep Duration (Hours)
 * Hazard: Isolation & Confinement | Risk: Inadequate Sleep and Irregular Schedules | CDC + Lancet Study
 */
export function evaluateSleepDuration(hours: number): IndicatorResult {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.sleepDuration;
  let status: HealthStatus = 'GREEN';
  let statusLabel = 'Normal (Restorative)';
  let reason = `Logged sleep of ${hours.toFixed(1)} hours meets the restorative target (7+ hours per CDC guidelines).`;

  if (hours <= cfg.redCriticalLow) {
    status = 'RED';
    statusLabel = 'Urgent Attention (Severe Sleep Debt)';
    reason = `Sleep under 6 hours (${hours.toFixed(1)} hrs < 6.0 hrs). Persistent acute sleep restriction impairs operational safety and psychomotor alertness.`;
  } else if (hours >= (cfg.redCriticalHigh ?? 12.0)) {
    status = 'YELLOW';
    statusLabel = 'Warning (Prolonged Rest)';
    reason = `Extended rest cycle (${hours.toFixed(1)} hrs). May reflect compensatory rebound recovery from heavy EVA fatigue.`;
  } else if (cfg.yellowLow && hours >= cfg.yellowLow.min && hours <= cfg.yellowLow.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Sub-Optimal Sleep)';
    reason = `Sub-target sleep duration (${hours.toFixed(1)} hrs; astronaut mission average ~6.0 hrs). Schedule a 30-min restorative rest period.`;
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
    nasaHazard: cfg.nasaHazard,
    nasaRisk: cfg.nasaRisk,
    sourceCitation: cfg.basis,
  };
}

/**
 * Evaluates Cabin Environmental CO2 (mmHg)
 * Hazard: Hostile/Closed Environment | Risk: Hypoxia (closed-environment air) | NASA-STD-3001 & OCHMO TB-004
 */
export function evaluateCabinCO2(co2mmHg: number): IndicatorResult {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.cabinCO2 || {
    green: { min: 0.0, max: 3.0 },
    yellowHigh: { min: 3.1, max: 4.5 },
    redCriticalHigh: 4.6,
    nasaHazard: 'Hostile/Closed Environment',
    nasaRisk: 'Hypoxia (closed-environment air)',
    basis: 'NASA-STD-3001 Volume 2 [V2 6004] limit = 3 mmHg. OCHMO TB-004: headaches 2.8-4.5 mmHg; fatigue, poor sleep >4.5 mmHg',
  };

  let status: HealthStatus = 'GREEN';
  let statusLabel = 'Nominal Atmosphere';
  let reason = `Cabin CO2 partial pressure of ${co2mmHg.toFixed(1)} mmHg meets NASA-STD-3001 limit (≤ 3.0 mmHg).`;

  if (co2mmHg >= cfg.redCriticalHigh) {
    status = 'RED';
    statusLabel = 'Urgent Atmospheric Warning (Severe CO2)';
    reason = `Cabin CO2 is ${co2mmHg.toFixed(1)} mmHg (> 4.5 mmHg per OCHMO TB-004). High risk of hypercapnia, severe headaches, and cognitive impairment.`;
  } else if (cfg.yellowHigh && co2mmHg >= cfg.yellowHigh.min && co2mmHg <= cfg.yellowHigh.max) {
    status = 'YELLOW';
    statusLabel = 'Advisory Warning (Elevated CO2)';
    reason = `Cabin CO2 is ${co2mmHg.toFixed(1)} mmHg (3.1–4.5 mmHg). NASA flight surgeons report headaches and sleep disruption at this concentration.`;
  }

  return {
    indicatorId: 'cabinCO2',
    displayName: 'Cabin CO2 (1-hr Avg)',
    valueDisplay: `${co2mmHg.toFixed(1)}`,
    numericValue: co2mmHg,
    unit: 'mmHg',
    status,
    statusLabel,
    reason,
    nominalRangeLabel: '≤ 3.0 mmHg',
    criticality: status === 'RED' ? 'high' : status === 'YELLOW' ? 'medium' : 'low',
    nasaHazard: cfg.nasaHazard,
    nasaRisk: cfg.nasaRisk,
    sourceCitation: cfg.basis,
  };
}

/**
 * Evaluates Career Cumulative Radiation (mSv)
 * Hazard: Space Radiation | Risk: Radiation-Induced Cancers | NASA OCHMO TB-020 & CSA CANS
 */
export function evaluateRadiationDose(mSv: number): IndicatorResult {
  const cfg = PROVISIONAL_DEMO_THRESHOLDS.radiationDose || {
    green: { min: 0, max: 299 },
    yellowHigh: { min: 300, max: 599 },
    redCriticalHigh: 600,
    neutronSharePercent: 30,
    nasaHazard: 'Space Radiation',
    nasaRisk: 'Radiation-Induced Cancers',
    basis: 'NASA OCHMO TB-020 career limit <600 mSv. CSA: Monitoring Radiation for Astronaut Health (CANS spectrometer, 30% neutron fraction)',
  };

  let status: HealthStatus = 'GREEN';
  let statusLabel = 'Nominal Exposure';
  let reason = `Cumulative career radiation dose of ${mSv} mSv is within NASA safe career envelope (< 300 mSv).`;

  if (mSv >= cfg.redCriticalHigh) {
    status = 'RED';
    statusLabel = 'Urgent Radiation Cap Exceeded';
    reason = `Career dose of ${mSv} mSv exceeds the NASA lifetime career limit (600 mSv per OCHMO TB-020). Crew member disqualified from further space radiation exposure.`;
  } else if (cfg.yellowHigh && mSv >= cfg.yellowHigh.min && mSv <= cfg.yellowHigh.max) {
    status = 'YELLOW';
    statusLabel = 'Warning (Approaching Career Limit)';
    reason = `Cumulative dose of ${mSv} mSv has passed 50% of NASA career limit (300–599 mSv). Review solar particle shelter and planned EVAs.`;
  }

  return {
    indicatorId: 'radiationDose',
    displayName: 'Career Cumulative Radiation',
    valueDisplay: `${mSv}`,
    numericValue: mSv,
    unit: 'mSv',
    status,
    statusLabel,
    reason,
    nominalRangeLabel: '< 300 mSv',
    criticality: status === 'RED' ? 'high' : status === 'YELLOW' ? 'medium' : 'low',
    nasaHazard: cfg.nasaHazard,
    nasaRisk: cfg.nasaRisk,
    sourceCitation: cfg.basis,
  };
}

/**
 * Evaluates Mood & Psychological Readiness
 * Hazard: Isolation & Confinement | Risk: Behavioral Conditions | NASA HRP
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
    nasaHazard: 'Isolation & Confinement',
    nasaRisk: 'Behavioral Conditions and Psychiatric Disorders',
    sourceCitation: 'NASA HRP Behavioral Health & Performance',
  };
}

/**
 * Evaluates all health indicators together
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
    summary: 'All vital physiological indicators are within optimal microgravity operational thresholds. Crew member cleared for standard flight duties.',
    normalCount: greenCount,
    warningCount: 0,
    urgentCount: 0,
    score: 98,
    recommendationSnippet: 'Maintain standard hydration, daily 2.5-hour countermeasure aerobic/resistive exercise, and sleep hygiene.',
  };
}
