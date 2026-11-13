/**
 * Aegis Health — Telemetry Configuration & Freshness Policies
 * Compliant with PLAN.md Section 5.5 and Section 8.4
 */

export const TELEMETRY_CONFIG = {
  // Waveform ring buffer configuration
  waveform: {
    defaultSampleRateHz: 250,
    bufferDurationSeconds: 30, // 30 seconds buffer
    maxBufferSize: 250 * 30,   // 7,500 samples
    chunkDurationMs: 40,       // 10 samples per 40ms chunk
    displayWindowSeconds: 8,   // 8-second viewing window
  },

  // Freshness thresholds (in seconds)
  freshness: {
    heartRate: 5,        // Stale if no reading within 5 seconds
    bloodPressure: 900,  // Stale after 15 minutes
    bloodSugar: 900,     // Stale after 15 minutes
    bodyTemperature: 30, // Stale after 30 seconds
    sleepDuration: 86400,// Valid for current mission day
    mood: 86400,         // Valid for current mission day
  },

  // Connection and reconnection policies
  reconnection: {
    initialDelayMs: 1000,
    maxDelayMs: 15000,
    backoffMultiplier: 2,
    maxRetries: 5,
  },

  // Continuous physiological threshold ranges
  thresholds: {
    heartRate: {
      unit: 'bpm',
      green: { min: 55, max: 90 },
      yellowLow: { min: 45, max: 54.99 },
      yellowHigh: { min: 90.01, max: 110 },
      criticalLow: 45,
      criticalHigh: 110,
    },
    systolic: {
      unit: 'mmHg',
      green: { min: 90, max: 125 },
      yellowLow: { min: 80, max: 89.99 },
      yellowHigh: { min: 125.01, max: 140 },
      criticalLow: 80,
      criticalHigh: 140,
    },
    diastolic: {
      unit: 'mmHg',
      green: { min: 60, max: 85 },
      yellowLow: { min: 50, max: 59.99 },
      yellowHigh: { min: 85.01, max: 95 },
      criticalLow: 50,
      criticalHigh: 95,
    },
    bloodSugar: {
      unit: 'mg/dL',
      green: { min: 70, max: 115 },
      yellowLow: { min: 60, max: 69.99 },
      yellowHigh: { min: 115.01, max: 145 },
      criticalLow: 60,
      criticalHigh: 145,
    },
    bodyTemperature: {
      unit: 'degC',
      green: { min: 36.1, max: 37.3 },
      yellowLow: { min: 35.5, max: 36.09 },
      yellowHigh: { min: 37.31, max: 38.0 },
      criticalLow: 35.5,
      criticalHigh: 38.0,
    },
  },
} as const;

