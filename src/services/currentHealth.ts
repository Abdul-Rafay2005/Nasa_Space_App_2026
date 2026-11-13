/**
 * Aegis Health — Partial Snapshot & Truthful Current Health Evaluator
 * Conforms to Section 8.4 of PLAN.md
 */

import { IndicatorResult, HealthStatus, AstronautProfile } from '../types/health';
import { CurrentMetricState } from '../types/telemetry';
import {
  evaluateHeartRate,
  evaluateBloodPressure,
  evaluateBloodSugar,
  evaluateBodyTemperature,
  evaluateSleepDuration,
  evaluateMood
} from './healthStatus';

export interface EvaluatedCurrentSnapshot {
  timestamp: string;
  overallStatus: HealthStatus | 'AWAITING_DATA';
  statusLabel: string;
  summary: string;
  indicators: IndicatorResult[];
  availableCount: number;
  totalIndicators: number;
  prototypeScore?: number;
}

export function evaluateCurrentTelemetry(
  metrics: {
    heartRate?: CurrentMetricState<number>;
    bloodPressure?: CurrentMetricState<{ systolic: number; diastolic: number }>;
    bloodSugar?: CurrentMetricState<number>;
    bodyTemperature?: CurrentMetricState<number>;
    sleepDuration?: CurrentMetricState<number>;
    mood?: CurrentMetricState<string>;
  },
  profile?: AstronautProfile
): EvaluatedCurrentSnapshot {
  const indicators: IndicatorResult[] = [];

  // Heart Rate
  if (metrics.heartRate && metrics.heartRate.availability === 'fresh' && typeof metrics.heartRate.value === 'number') {
    indicators.push(evaluateHeartRate(metrics.heartRate.value, profile?.restingHeartRateBaseline));
  }

  // Blood Pressure
  if (metrics.bloodPressure && metrics.bloodPressure.availability === 'fresh' && metrics.bloodPressure.value) {
    const { systolic, diastolic } = metrics.bloodPressure.value;
    indicators.push(
      evaluateBloodPressure(
        systolic,
        diastolic,
        profile?.bloodPressureBaseline
      )
    );
  }

  // Blood Sugar
  if (metrics.bloodSugar && metrics.bloodSugar.availability === 'fresh' && typeof metrics.bloodSugar.value === 'number') {
    indicators.push(evaluateBloodSugar(metrics.bloodSugar.value));
  }

  // Body Temperature
  if (metrics.bodyTemperature && metrics.bodyTemperature.availability === 'fresh' && typeof metrics.bodyTemperature.value === 'number') {
    indicators.push(evaluateBodyTemperature(metrics.bodyTemperature.value, profile?.bodyTemperatureBaseline));
  }

  // Sleep Duration
  if (metrics.sleepDuration && metrics.sleepDuration.availability === 'fresh' && typeof metrics.sleepDuration.value === 'number') {
    indicators.push(evaluateSleepDuration(metrics.sleepDuration.value));
  }

  // Mood
  if (metrics.mood && metrics.mood.availability === 'fresh' && typeof metrics.mood.value === 'string') {
    indicators.push(evaluateMood(metrics.mood.value as any));
  }

  const availableCount = indicators.length;
  const totalIndicators = 6;

  if (availableCount === 0) {
    return {
      timestamp: new Date().toISOString(),
      overallStatus: 'AWAITING_DATA',
      statusLabel: 'Awaiting Telemetry',
      summary: 'No fresh sensor or manual telemetry stream currently connected.',
      indicators: [],
      availableCount: 0,
      totalIndicators
    };
  }

  // RED-over-YELLOW precedence per PLAN.md
  let overallStatus: HealthStatus = 'GREEN';
  let statusLabel = 'Nominal';
  let summary = `All ${availableCount} available indicators are within nominal limits.`;

  const redCount = indicators.filter((i) => i.status === 'RED').length;
  const yellowCount = indicators.filter((i) => i.status === 'YELLOW').length;

  if (redCount > 0) {
    overallStatus = 'RED';
    statusLabel = 'Critical Attention';
    summary = `${redCount} vital sign(s) outside critical boundaries. Immediate review required.`;
  } else if (yellowCount > 0) {
    overallStatus = 'YELLOW';
    statusLabel = 'Advisory Warning';
    summary = `${yellowCount} indicator(s) slightly outside target thresholds. Monitoring advised.`;
  }

  // Prototype score (only calculated when data is available)
  const baseScore = 100 - redCount * 25 - yellowCount * 8;
  const prototypeScore = Math.max(40, Math.min(100, baseScore));

  return {
    timestamp: new Date().toISOString(),
    overallStatus,
    statusLabel,
    summary,
    indicators,
    availableCount,
    totalIndicators,
    prototypeScore
  };
}
