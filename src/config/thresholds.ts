/**
 * ============================================================================
 * OFFICIAL CHALLENGE ALIGNED HEALTH & ENVIRONMENTAL THRESHOLDS
 * ============================================================================
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Research Lead: Eman Saleem | Technical Lead: Abdul Rafay | Visualization: Sameen
 * Date: 14 November 2026
 * 
 * Sourced directly from all 5 official challenge resources and NASA technical standards:
 * - NASA Human Research Program (HRP): 5 Hazards of Human Spaceflight
 * - NASA HRP: Risks of Human Spaceflight (Cardiovascular, Hypoxia, Immune, Sleep, SANS, Nutrition)
 * - NASA HRP: Ongoing Research (ARCHeR, Standard Measures, Tempus Pro, EIMO 2023)
 * - Canadian Space Agency (CSA): Monitoring Radiation for Astronaut Health (CANS spectrometer, 30% neutrons)
 * - CSA: Why Do We Conduct Science Experiments in Space?
 * - NASA-STD-3001 Vol 2 & OCHMO TB-004 (CO2 limits) & TB-020 (Radiation limits)
 * - Clinical Guidelines: NEWS2 (Royal College of Physicians), AHA, CDC, NIH MedlinePlus
 * ============================================================================
 */

import { MasterHealthThresholds, MoodOption } from '../types/health';

export const MEDICAL_DISCLAIMER = {
  shortNotice: 'DECISION-SUPPORT PROTOTYPE — NOT A MEDICAL DIAGNOSIS',
  fullNotice: 
    'Aegis Health is an autonomous onboard decision-support prototype designed for the NASA Space Apps Challenge 2026. ' +
    'Thresholds and clinical decision trees are mapped to official NASA Human Research Program (HRP) hazard and risk matrices, ' +
    'NEWS2 clinical bands, and NASA-STD-3001 flight safety limits. All directives are decision support for crew and flight surgeons.',
};

export const PROVISIONAL_DEMO_THRESHOLDS: MasterHealthThresholds = {
  version: '2.0.0-NASA-HRP-RESEARCH-ALIGNED',
  lastUpdated: '2026-11-14',
  curator: 'Eman Saleem (Research Lead) & Abdul Rafay (Technical Lead)',
  isDemonstrationPrototype: true,

  // 1. RESTING HEART RATE (BPM)
  // Hazard: Gravity Fields | Risk: Cardiovascular Adaptations | NEWS2 + MedlinePlus
  heartRate: {
    name: 'Resting Heart Rate',
    unit: 'BPM',
    green: { min: 51, max: 90 }, // NEWS2 score 0
    yellowLow: { min: 41, max: 50 }, // NEWS2 score 1-2 (mild bradycardia)
    yellowHigh: { min: 91, max: 130 }, // NEWS2 score 1-2 (mild tachycardia)
    redCriticalLow: 40, // NEWS2 score 3 (<=40)
    redCriticalHigh: 131, // NEWS2 score 3 (>=131 marked tachycardia)
    nasaHazard: 'Gravity Fields',
    nasaRisk: 'Cardiovascular Adaptations',
    basis: 'NEWS2 bands (score 0 = green, 1-2 = yellow, 3 = red). MedlinePlus normal resting = 60-100 BPM.',
    description: 'Resting pulse recorded after seated or tethered stabilization in microgravity.',
    medicalContext: 'Microgravity cephalad fluid redistribution and cardiovascular deconditioning alter autonomic cardiac regulation.',
  },

  // 2. BLOOD PRESSURE (Systolic / Diastolic in mmHg)
  // Hazard: Gravity Fields | Risk: Cardiovascular Adaptations | NEWS2 + AHA
  bloodPressure: {
    name: 'Blood Pressure',
    unit: 'mmHg',
    systolic: {
      green: { min: 111, max: 119 }, // AHA optimal arterial pressure
      yellowLow: { min: 91, max: 110 }, // Low-normal / mild hypotension
      yellowHigh: { min: 120, max: 180 }, // AHA elevated to stage 2 hypertension
      redCriticalLow: 90, // NEWS2 score 3 (<=90 severe hypotension / shock risk)
      redCriticalHigh: 181, // AHA hypertensive crisis (>180)
    },
    diastolic: {
      green: { min: 60, max: 79 }, // AHA nominal resting diastolic
      yellowLow: { min: 50, max: 59 }, // Low-normal diastolic
      yellowHigh: { min: 80, max: 120 }, // AHA stage 1-2 diastolic elevation
      redCriticalLow: 49, // Severe diastolic drop
      redCriticalHigh: 121, // AHA hypertensive crisis (>120)
    },
    nasaHazard: 'Gravity Fields',
    nasaRisk: 'Cardiovascular Adaptations',
    basis: 'Low side: NEWS2 (<=90 = score 3). High side: American Heart Association (120+ elevated, >180 crisis). MedlinePlus normal from 60.',
    description: 'Arterial blood pressure monitoring for cephalad fluid shift and orthostatic regulation.',
    medicalContext: 'Vascular remodeling and baroreceptor resetting occur during long-duration spaceflight.',
  },

  // 3. FASTING BLOOD SUGAR (mg/dL)
  // Hazard: Distance from Earth | Risk: Inadequate Food and Nutrition | CDC
  bloodSugar: {
    name: 'Fasting Blood Sugar (Glucose)',
    unit: 'mg/dL',
    green: { min: 70, max: 99 }, // CDC normal fasting euglycemia
    yellowLow: { min: 54, max: 69 }, // CDC mild hypoglycemia warning
    yellowHigh: { min: 100, max: 125 }, // CDC prediabetes range
    redCriticalLow: 53, // CDC severe hypoglycemia (<54)
    redCriticalHigh: 126, // CDC diabetes threshold (>=126)
    nasaHazard: 'Distance from Earth',
    nasaRisk: 'Inadequate Food and Nutrition',
    basis: 'CDC Diabetes Testing (normal <=99, prediabetes 100-125, diabetes >=126); CDC Hypoglycemia (<70, severe <54).',
    description: 'Capillary blood glucose monitoring nutritional adequacy and insulin sensitivity.',
    medicalContext: 'Deep space dietary rations and microgravity physical inactivity can alter glycemic regulation.',
  },

  // 4. CORE BODY TEMPERATURE (°C)
  // Hazard: Hostile/Closed Environment | Risk: Altered Immune System Responses | NEWS2 + MedlinePlus
  bodyTemperature: {
    name: 'Core Body Temperature',
    unit: '°C',
    green: { min: 36.1, max: 38.0 }, // Nominal human core temperature in space
    yellowLow: { min: 35.1, max: 36.0 }, // Mild hypothermia
    yellowHigh: { min: 38.1, max: 39.0 }, // Low-grade pyrexia / Space Fever
    redCriticalLow: 35.0, // Hypothermia alert (<=35.0)
    redCriticalHigh: 39.1, // Pyrexia / infection threshold (NEWS2 scores 2 at 39.1+; team marks red)
    nasaHazard: 'Hostile/Closed Environment',
    nasaRisk: 'Altered Immune System Responses',
    basis: 'NEWS2 bands (39.1+ scores 2 in NEWS2; team marks red). MedlinePlus normal = 36.5-37.3°C.',
    description: 'Core body temperature monitoring for Space Fever and immunological dysregulation.',
    medicalContext: 'Astronauts experience impaired convective heat dissipation; immune system reactivation makes fever critical.',
  },

  // 5. RESTORATIVE SLEEP DURATION (Hours)
  // Hazard: Isolation & Confinement | Risk: Inadequate Sleep and Irregular Schedules | CDC + NASA Lancet Study
  sleepDuration: {
    name: 'Sleep Restorative Duration',
    unit: 'Hours',
    green: { min: 7.0, max: 10.0 }, // CDC healthy adult target (7+ hours)
    yellowLow: { min: 6.0, max: 6.9 }, // Mild sleep debt (astronaut average ~6h)
    redCriticalLow: 5.9, // Cumulative fatigue risk (<6h for 3 nights is team red rule)
    redCriticalHigh: 12.0,
    nasaHazard: 'Isolation & Confinement',
    nasaRisk: 'Inadequate Sleep and Irregular Schedules',
    basis: 'CDC: healthy adult sleep = 7+ h. NASA schedules 8.5 h; astronauts averaged ~6 h (NASA-funded Lancet study). 3-night red rule is TEAM CHOICE.',
    description: 'Sleep duration logged via crew actigraphy wristband (NASA ARCHeR protocol).',
    medicalContext: '16 daily orbital sunsets and acoustic spacecraft noise induce circadian desynchrony and cognitive fatigue.',
  },

  // 6. CABIN ENVIRONMENTAL CO2 (mmHg 1-hour average)
  // Hazard: Hostile/Closed Environment | Risk: Hypoxia (closed air) | NASA-STD-3001 & OCHMO TB-004
  cabinCO2: {
    name: 'Cabin Carbon Dioxide (CO2)',
    unit: 'mmHg',
    green: { min: 0.0, max: 3.0 }, // NASA-STD-3001 Volume 2 [V2 6004] limit = 3.0 mmHg
    yellowHigh: { min: 3.1, max: 4.5 }, // OCHMO TB-004: headaches reported at 2.8-4.5 mmHg
    redCriticalLow: 0.0,
    redCriticalHigh: 4.6, // OCHMO TB-004: severe fatigue, nausea, and cognitive decline (>4.5 mmHg)
    nasaHazard: 'Hostile/Closed Environment',
    nasaRisk: 'Hypoxia (closed-environment air)',
    basis: 'NASA-STD-3001 Volume 2 [V2 6004] limit = 3 mmHg (1-hr avg). OCHMO TB-004: headaches at 2.8-4.5 mmHg; fatigue, poor sleep >4.5.',
    description: 'Atmospheric partial pressure of CO2 measured continuously by ECLSS life support sensors.',
    medicalContext: 'CO2 pocket formation in microgravity triggers neurovascular hypercapnia and spatial disorientation.',
  },

  // 7. CAREER CUMULATIVE SPACE RADIATION (mSv)
  // Hazard: Space Radiation | Risk: Radiation-Induced Cancers | NASA OCHMO TB-020 & CSA CANS
  radiationDose: {
    name: 'Career Cumulative Radiation',
    unit: 'mSv',
    green: { min: 0, max: 299 }, // Nominal mission career accumulation
    yellowHigh: { min: 300, max: 599 }, // 300 mSv = 50% of NASA lifetime career threshold (TEAM CHOICE)
    redCriticalLow: 0,
    redCriticalHigh: 600, // NASA OCHMO TB-020 career astronaut limit (600 mSv)
    neutronSharePercent: 30, // CSA: Monitoring Radiation: neutrons are ~30% of ISS dose and biologically destructive
    nasaHazard: 'Space Radiation',
    nasaRisk: 'Radiation-Induced Cancers',
    basis: 'NASA limit: career < 600 mSv (red). 300 mSv (50% limit) yellow line is TEAM CHOICE. CSA: Monitoring Radiation for Astronaut Health (CANS autonomous neutron spectrometer).',
    description: 'Total ionizing radiation exposure with biological neutron weighting fraction.',
    medicalContext: 'Galactic cosmic rays (GCR) and solar particle events (SPE) increase lifetime cancer and degenerative tissue risks.',
  },

  // 8. MOOD & BEHAVIORAL HEALTH
  // Hazard: Isolation & Confinement | Risk: Behavioral Conditions | NASA HRP
  moodMap: {
    excellent: {
      status: 'GREEN',
      description: 'Optimal psychological resilience, high operational readiness.',
    },
    good: {
      status: 'GREEN',
      description: 'Nominal morale, cognitive sharpness, and stable interpersonal cohesion.',
    },
    fatigued: {
      status: 'YELLOW',
      description: 'Cumulative sleep debt or heavy timeline workload strain.',
    },
    stressed: {
      status: 'YELLOW',
      description: 'High mission pressure, operational anomalies, or confinement stress.',
    },
    disoriented: {
      status: 'RED',
      description: 'Space Adaptation Syndrome (SAS), neurovestibular disruption, or acute disorientation.',
    },
  },
};

export const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 'excellent',
    label: 'Optimal / Energized',
    description: 'High morale, clear focus, ready for EVA/ops',
    defaultStatus: 'GREEN',
    badge: '⚡ Peak State',
  },
  {
    value: 'good',
    label: 'Good / Nominal',
    description: 'Standard operational readiness and steady mood',
    defaultStatus: 'GREEN',
    badge: '✓ Nominal',
  },
  {
    value: 'fatigued',
    label: 'Fatigued / Drained',
    description: 'Physical or cognitive weariness from heavy schedule',
    defaultStatus: 'YELLOW',
    badge: '⚠ Fatigue Alert',
  },
  {
    value: 'stressed',
    label: 'High Stress / Tense',
    description: 'Elevated mental strain or mission timeline pressure',
    defaultStatus: 'YELLOW',
    badge: '⚠ Stress Warning',
  },
  {
    value: 'disoriented',
    label: 'Disoriented / SAS Symptoms',
    description: 'Vestibular disturbance, dizziness, nausea, or confusion',
    defaultStatus: 'RED',
    badge: '🚨 Urgent Attention',
  },
];
