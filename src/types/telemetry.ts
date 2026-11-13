/**
 * Aegis Health — Runtime Telemetry Data Contracts
 * Defined in accordance with Section 5 of PLAN.md
 */

export type SourceKind = 'simulation' | 'device' | 'manual' | 'recorded' | 'legacy-unknown';
export type SignalKind = 'ecg' | 'ppg';
export type Quality = 'good' | 'degraded' | 'invalid' | 'unknown';
export type Availability = 'fresh' | 'stale' | 'missing' | 'unsupported';
export type ActivityContext = 'rest' | 'exercise' | 'recovery' | 'unknown';
export type SourceState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'disconnected' | 'unsupported';

export type MoodType = 'excellent' | 'good' | 'fair' | 'poor';

export interface Provenance {
  kind: SourceKind;
  sourceId: string;
  deviceId?: string;
  fixtureId?: string;
  fixtureVersion?: string;
  seed?: number;
  scenarioId?: string;
  derivedFrom?: string[];
}

export interface Envelope {
  schemaVersion: 1;
  id: string;
  sessionId: string;
  streamId: string;
  astronautId: string;
  sequence: number;
  measuredAt: string; // ISO UTC acquisition timestamp
  receivedAt: string; // Set by receiving application
  quality: Quality;
  context: ActivityContext;
  provenance: Provenance;
}

export type MeasurementPayload =
  | { metric: 'heartRate'; value: number; unit: 'bpm' }
  | { metric: 'bloodPressure'; systolic: number; diastolic: number; unit: 'mmHg' }
  | { metric: 'bloodSugar'; value: number; unit: 'mg/dL'; contextLabel?: string }
  | { metric: 'bodyTemperature'; value: number; unit: 'degC'; site: 'core' | 'skin' | 'other' | 'unknown' }
  | { metric: 'sleepDuration'; value: number; unit: 'h'; periodStart: string; periodEnd: string }
  | { metric: 'mood'; value: MoodType; unit: 'category' };

export type Measurement = Envelope & { type: 'measurement' } & MeasurementPayload;

export interface WaveformChunk extends Envelope {
  type: 'waveform';
  signal: SignalKind;
  channelLabel: string;
  unit: 'mV' | 'a.u.';
  sampleRateHz: number;
  startSampleIndex: number;
  samples: number[]; // Float32 sample array or number array
}

export interface SourceDescriptor {
  id: string;
  label: string;
  kind: SourceKind;
  capabilities: {
    waveform: boolean;
    heartRate: boolean;
    bloodPressure: boolean;
    bloodSugar: boolean;
    bodyTemperature: boolean;
    sleepDuration: boolean;
    mood: boolean;
  };
  sampleRateHz?: number;
  deviceMetadata?: {
    model?: string;
    firmware?: string;
    port?: string;
  };
  simulationMetadata?: {
    scenarioId: string;
    seed: number;
  };
}

export interface CurrentMetricState<T = number | string | { systolic: number; diastolic: number }> {
  metric: string;
  value: T | null;
  unit: string;
  availability: Availability;
  quality: Quality;
  measuredAt: string | null;
  ageSeconds: number | null;
  provenance: Provenance | null;
  reason?: string;
}

export interface TelemetrySnapshot {
  timestamp: string;
  sourceState: SourceState;
  activeSourceId: string;
  sourceDescriptor: SourceDescriptor | null;
  heartRate: CurrentMetricState<number>;
  bloodPressure: CurrentMetricState<{ systolic: number; diastolic: number }>;
  bloodSugar: CurrentMetricState<number>;
  bodyTemperature: CurrentMetricState<number>;
  sleepDuration: CurrentMetricState<number>;
  mood: CurrentMetricState<MoodType>;
  overallStatus: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  completeness: {
    availableCount: number;
    totalCount: number;
  };
}

