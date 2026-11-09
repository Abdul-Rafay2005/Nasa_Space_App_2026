/**
 * ============================================================================
 * PROVISIONAL DEMONSTRATION HEALTH THRESHOLDS
 * ============================================================================
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * 
 * NOTICE FOR MEDICAL RESEARCHER (EMAN):
 * These values are strictly PROVISIONAL DEMONSTRATION THRESHOLDS created by Lead
 * Developer Abdul Rafay for Phase 1 architectural prototyping and system testing.
 * 
 * They DO NOT constitute official NASA Space Flight Medical Operations (SFMO) 
 * standards or flight surgeon clinical criteria.
 * 
 * Eman: Replace these provisional values with your literature-backed medical
 * criteria, NASA Human Research Program (HRP) evidence books, or spaceflight
 * analog references.
 * ============================================================================
 */

import { MasterHealthThresholds, MoodOption } from '../types/health';

export const MEDICAL_DISCLAIMER = {
  shortNotice: 'PROTOTYPE APPLICATION — NOT FOR CLINICAL DIAGNOSIS',
  fullNotice: 
    'Aegis Health Monitoring System is an engineering prototype designed for the NASA Space Apps Challenge 2026. ' +
    'The calculated statuses, alerts, and baseline comparisons represent provisional demonstration thresholds and do ' +
    'not replace certified NASA Flight Surgeons, mission flight rules, or certified spaceflight medical hardware.',
};

export const PROVISIONAL_DEMO_THRESHOLDS: MasterHealthThresholds = {
  version: '1.0.0-PROVISIONAL-DEMO',
  lastUpdated: '2026-11-10',
  curator: 'Abdul Rafay (Placeholder for Eman — Medical Lead)',
  isDemonstrationPrototype: true,

  // 1. HEART RATE (Resting BPM)
  // Normal resting astronaut heart rate in microgravity often fluctuates with fluid redistribution
  heartRate: {
    name: 'Heart Rate',
    unit: 'BPM',
    green: { min: 55, max: 90 }, // Nominal resting range
    yellowLow: { min: 45, max: 54 }, // Mild bradycardia
    yellowHigh: { min: 91, max: 110 }, // Mild resting tachycardia
    redCriticalLow: 44, // Severe bradycardia requiring check
    redCriticalHigh: 111, // Severe resting tachycardia / arrhythmia alert
    description: 'Resting pulse recorded after 5 minutes of seated or tethered stability.',
    medicalContext: 'Provisional baseline demonstration: Spaceflight cephalad fluid shift alters autonomic cardiac regulation.',
  },

  // 2. BLOOD PRESSURE (Systolic / Diastolic in mmHg)
  bloodPressure: {
    name: 'Blood Pressure',
    unit: 'mmHg',
    systolic: {
      green: { min: 95, max: 125 },
      yellowLow: { min: 85, max: 94 },
      yellowHigh: { min: 126, max: 140 },
      redCriticalLow: 84,
      redCriticalHigh: 141,
    },
    diastolic: {
      green: { min: 60, max: 80 },
      yellowLow: { min: 50, max: 59 },
      yellowHigh: { min: 81, max: 90 },
      redCriticalLow: 49,
      redCriticalHigh: 91,
    },
    description: 'Arm cuff arterial pressure measurement taken at heart level.',
    medicalContext: 'Provisional baseline demonstration: Arterial remodeling occurs in microgravity; monitoring is essential.',
  },

  // 3. BLOOD SUGAR (Fasting or Post-Meal mg/dL)
  bloodSugar: {
    name: 'Blood Sugar (Glucose)',
    unit: 'mg/dL',
    green: { min: 70, max: 115 }, // Nominal fasting / pre-meal range
    yellowLow: { min: 60, max: 69 }, // Mild hypoglycemia risk
    yellowHigh: { min: 116, max: 140 }, // Mild glycemic elevation
    redCriticalLow: 59, // Hypoglycemic emergency threshold
    redCriticalHigh: 141, // Significant hyperglycemia
    description: 'Capillary blood glucose reading via telemetry glucometer.',
    medicalContext: 'Provisional baseline demonstration: Insulin sensitivity shifts during long-duration confinement and caloric stress.',
  },

  // 4. BODY TEMPERATURE (Core Temperature °C)
  // Astronauts frequently experience "space fever" (elevated core temp due to impaired convective cooling)
  bodyTemperature: {
    name: 'Core Body Temperature',
    unit: '°C',
    green: { min: 36.3, max: 37.3 }, // Nominal human core range
    yellowLow: { min: 35.5, max: 36.2 }, // Mild hypothermia warning
    yellowHigh: { min: 37.4, max: 38.0 }, // Mild elevated temp / space exercise thermoregulation
    redCriticalLow: 35.4, // Hypothermic alert
    redCriticalHigh: 38.1, // Pyrexia / infection warning
    description: 'Tympanic or sensor patch core temperature reading.',
    medicalContext: 'Provisional baseline demonstration: Sweating evaporation is reduced in microgravity, impacting thermal regulation.',
  },

  // 5. SLEEP DURATION (Hours)
  sleepDuration: {
    name: 'Sleep Duration',
    unit: 'Hours',
    green: { min: 7.0, max: 9.0 }, // Optimal crew restorative sleep
    yellowLow: { min: 5.5, max: 6.9 }, // Mild sleep restriction
    yellowHigh: { min: 9.1, max: 11.0 }, // Extended sleep / hypersomnia
    redCriticalLow: 5.4, // Severe cognitive impairment risk (< 5.5 hrs)
    redCriticalHigh: 11.1, // Excessive lethargy alert
    description: 'Sleep period logged via crew actigraphy wristband.',
    medicalContext: 'Provisional baseline demonstration: Circadian disruption from 16 sunrises/day impairs neurobehavioral alertness.',
  },

  // 6. MOOD & PSYCHOLOGICAL READINESS
  moodMap: {
    excellent: {
      status: 'GREEN',
      description: 'Optimal psychological resilience, alert, and mission-focused.',
    },
    good: {
      status: 'GREEN',
      description: 'Nominal operational morale and cognitive engagement.',
    },
    fatigued: {
      status: 'YELLOW',
      description: 'Elevated cognitive exhaustion or physical exertion detected.',
    },
    stressed: {
      status: 'YELLOW',
      description: 'Acute psychological tension or environmental mission stressors present.',
    },
    disoriented: {
      status: 'RED',
      description: 'Space Adaptation Syndrome (SAS) symptoms or spatial neuro-vestibular distress.',
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

