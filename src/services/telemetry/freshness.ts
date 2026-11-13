/**
 * Aegis Health — Freshness & Physiological Evaluation
 * Compliant with PLAN.md Section 5.5 & 8.4
 */

import { TELEMETRY_CONFIG } from '../../config/telemetry';
import { CurrentMetricState, Availability, Quality } from '../../types/telemetry';
import { getAgeInSeconds } from '../../lib/time';

export function evaluateMetricFreshness<T>(
  metricKey: keyof typeof TELEMETRY_CONFIG.freshness,
  state: CurrentMetricState<T>
): CurrentMetricState<T> {
  if (state.value === null || state.measuredAt === null) {
    return {
      ...state,
      availability: 'missing',
      ageSeconds: null,
    };
  }

  const age = getAgeInSeconds(state.measuredAt);
  const maxAllowedAge = TELEMETRY_CONFIG.freshness[metricKey];

  let availability: Availability = 'fresh';
  if (age === null) {
    availability = 'missing';
  } else if (age > maxAllowedAge) {
    availability = 'stale';
  }

  return {
    ...state,
    availability,
    ageSeconds: age,
  };
}

export function evaluateOverallStatus(
  hrStatus: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN',
  bpStatus: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN',
  availableCount: number
): 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN' {
  if (availableCount === 0) return 'UNKNOWN';
  if (hrStatus === 'RED' || bpStatus === 'RED') return 'RED';
  if (hrStatus === 'YELLOW' || bpStatus === 'YELLOW') return 'YELLOW';
  if (hrStatus === 'GREEN') return 'GREEN';
  return 'UNKNOWN';
}

export function classifyHeartRate(bpm: number | null, quality: Quality): 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN' {
  if (bpm === null || quality === 'invalid') return 'UNKNOWN';
  const { green, yellowLow, yellowHigh, criticalLow, criticalHigh } = TELEMETRY_CONFIG.thresholds.heartRate;

  if (bpm < criticalLow || bpm > criticalHigh) return 'RED';
  if ((bpm >= yellowLow.min && bpm <= yellowLow.max) || (bpm >= yellowHigh.min && bpm <= yellowHigh.max)) {
    return 'YELLOW';
  }
  if (bpm >= green.min && bpm <= green.max) return 'GREEN';
  return 'UNKNOWN';
}

