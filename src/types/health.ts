/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Health Type Definitions
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 * 
 * Note for Team Members:
 * - Sameen: Use DailyAssessmentRecord and IndicatorResult for the charts, body map, and guidance engine.
 * - Eman: Use HealthThresholdConfig and ThresholdRange when supplying verified flight surgeon values.
 */

export type HealthStatus = 'GREEN' | 'YELLOW' | 'RED';

export type MoodType = 'excellent' | 'good' | 'fatigued' | 'stressed' | 'disoriented';

export interface MoodOption {
  value: MoodType;
  label: string;
  description: string;
  defaultStatus: HealthStatus;
  badge: string;
}

export interface AssessmentFormValues {
  heartRate: string; // BPM
  systolic: string; // mmHg
  diastolic: string; // mmHg
  bloodSugar: string; // mg/dL
  bodyTemperature: string; // °C
  sleepDuration: string; // Hours
  mood: MoodType;
  notes?: string;
}

export interface ParsedAssessmentValues {
  heartRate: number;
  systolic: number;
  diastolic: number;
  bloodSugar: number;
  bodyTemperature: number;
  sleepDuration: number;
  mood: MoodType;
  notes?: string;
}

export interface IndicatorResult {
  indicatorId: 'heartRate' | 'bloodPressure' | 'bloodSugar' | 'bodyTemperature' | 'sleepDuration' | 'mood';
  displayName: string;
  valueDisplay: string;
  numericValue?: number;
  secondaryValue?: number; // e.g. diastolic for blood pressure
  unit: string;
  status: HealthStatus;
  statusLabel: string;
  reason: string;
  nominalRangeLabel: string;
  baselineNominal?: string;
  deviationPercent?: number;
  criticality: 'low' | 'medium' | 'high';
}

export interface OverallHealthResult {
  status: HealthStatus;
  statusLabel: string;
  summary: string;
  alertTitle: string;
  normalCount: number;
  warningCount: number;
  urgentCount: number;
  score: number; // 0 - 100 health composite index
  recommendationSnippet: string;
}

export interface DailyAssessmentRecord {
  id: string;
  timestamp: string; // ISO 8601
  missionDay: number;
  astronautId: string;
  values: ParsedAssessmentValues;
  results: {
    heartRate: IndicatorResult;
    bloodPressure: IndicatorResult;
    bloodSugar: IndicatorResult;
    bodyTemperature: IndicatorResult;
    sleepDuration: IndicatorResult;
    mood: IndicatorResult;
  };
  overall: OverallHealthResult;
  isDemonstrationData?: boolean;
}

export interface AstronautProfile {
  id: string;
  name: string;
  callSign: string;
  rank: string;
  role: string;
  missionName: string;
  spacecraft: string;
  currentMissionDay: number;
  age: number;
  bloodType: string;
  restingHeartRateBaseline: number; // BPM
  bloodPressureBaseline: { systolic: number; diastolic: number };
  bodyTemperatureBaseline: number; // °C
  avatarUrl?: string;
}

export interface ThresholdBoundary {
  min: number;
  max: number;
}

export interface IndicatorThresholdSet {
  name: string;
  unit: string;
  green: ThresholdBoundary;
  yellowLow?: ThresholdBoundary;
  yellowHigh?: ThresholdBoundary;
  redCriticalLow: number;
  redCriticalHigh: number;
  description: string;
  medicalContext: string;
}

export interface BloodPressureThresholdSet {
  name: string;
  unit: string;
  systolic: {
    green: ThresholdBoundary;
    yellowLow?: ThresholdBoundary;
    yellowHigh?: ThresholdBoundary;
    redCriticalLow: number;
    redCriticalHigh: number;
  };
  diastolic: {
    green: ThresholdBoundary;
    yellowLow?: ThresholdBoundary;
    yellowHigh?: ThresholdBoundary;
    redCriticalLow: number;
    redCriticalHigh: number;
  };
  description: string;
  medicalContext: string;
}

export interface MasterHealthThresholds {
  version: string;
  lastUpdated: string;
  curator: string;
  isDemonstrationPrototype: boolean;
  heartRate: IndicatorThresholdSet;
  bloodPressure: BloodPressureThresholdSet;
  bloodSugar: IndicatorThresholdSet;
  bodyTemperature: IndicatorThresholdSet;
  sleepDuration: IndicatorThresholdSet;
  moodMap: Record<MoodType, { status: HealthStatus; description: string }>;
}

