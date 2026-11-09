/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Fictional Sample / Demonstration Records
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 * 
 * IMPORTANT: All profiles and assessment readings below are FICTIONAL DEMONSTRATION
 * DATA created for UI testing, baseline comparison, and prototype validation.
 */

import { AstronautProfile, DailyAssessmentRecord } from '../types/health';
import { evaluateAllIndicators, calculateOverallHealth } from '../services/healthStatus';

export const SAMPLE_ASTRONAUT_PROFILE: AstronautProfile = {
  id: 'ASTRO-7704',
  name: 'Cmdr. Alex Vance',
  callSign: 'ORION-LEAD',
  rank: 'Commander / Senior Pilot',
  role: 'Mission Commander & Lead Flight Specialist',
  missionName: 'Artemis VII — Deep Space Habitat Mars Transit Analog',
  spacecraft: 'Aegis Deep-Space Transit Habitat (DSH-04)',
  currentMissionDay: 142,
  age: 39,
  bloodType: 'O-Negative',
  restingHeartRateBaseline: 62, // BPM
  bloodPressureBaseline: {
    systolic: 116,
    diastolic: 74,
  },
  bodyTemperatureBaseline: 36.8, // °C
};

// Generates an assessment record with evaluated results
function createSampleRecord(
  id: string,
  missionDay: number,
  timestampISO: string,
  raw: {
    heartRate: number;
    systolic: number;
    diastolic: number;
    bloodSugar: number;
    bodyTemperature: number;
    sleepDuration: number;
    mood: 'excellent' | 'good' | 'fatigued' | 'stressed' | 'disoriented';
    notes?: string;
  }
): DailyAssessmentRecord {
  const parsed = {
    heartRate: raw.heartRate,
    systolic: raw.systolic,
    diastolic: raw.diastolic,
    bloodSugar: raw.bloodSugar,
    bodyTemperature: raw.bodyTemperature,
    sleepDuration: raw.sleepDuration,
    mood: raw.mood,
    notes: raw.notes,
  };

  const results = evaluateAllIndicators(parsed, SAMPLE_ASTRONAUT_PROFILE);
  const overall = calculateOverallHealth(results);

  return {
    id,
    timestamp: timestampISO,
    missionDay,
    astronautId: SAMPLE_ASTRONAUT_PROFILE.id,
    values: parsed,
    results,
    overall,
    isDemonstrationData: true,
  };
}

// 4 realistic demonstration historical logs
export const SAMPLE_ASSESSMENT_HISTORY: DailyAssessmentRecord[] = [
  createSampleRecord(
    'REC-DEMO-004',
    141,
    '2026-11-09T08:30:00.000Z',
    {
      heartRate: 64,
      systolic: 118,
      diastolic: 76,
      bloodSugar: 88,
      bodyTemperature: 36.7,
      sleepDuration: 7.8,
      mood: 'excellent',
      notes: 'Completed 2.5 hours of T2 treadmill and ARED resistive exercises. Hydration electrolyte balance nominal.',
    }
  ),
  createSampleRecord(
    'REC-DEMO-003',
    140,
    '2026-11-08T09:15:00.000Z',
    {
      heartRate: 74,
      systolic: 124,
      diastolic: 82,
      bloodSugar: 104,
      bodyTemperature: 37.1,
      sleepDuration: 6.4,
      mood: 'fatigued',
      notes: 'Docking teleoperation simulation with cargo resupply vehicle lasted 4 hours past scheduled downtime. Slight fatigue.',
    }
  ),
  createSampleRecord(
    'REC-DEMO-002',
    139,
    '2026-11-07T07:45:00.000Z',
    {
      heartRate: 68,
      systolic: 120,
      diastolic: 78,
      bloodSugar: 92,
      bodyTemperature: 36.9,
      sleepDuration: 7.2,
      mood: 'good',
      notes: 'Nominal maintenance shift on environmental control and life support system (ECLSS) air scrubbers.',
    }
  ),
  createSampleRecord(
    'REC-DEMO-001',
    138,
    '2026-11-06T08:00:00.000Z',
    {
      heartRate: 98,
      systolic: 134,
      diastolic: 86,
      bloodSugar: 118,
      bodyTemperature: 37.5,
      sleepDuration: 5.1,
      mood: 'stressed',
      notes: 'Post-EVA suit depressurization debrief. High physical exertion and delayed sleep cycle due to minor telemetry glitch.',
    }
  ),
];

