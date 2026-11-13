/**
 * Aegis Health — Telemetry Source Interface
 * Compliant with PLAN.md Section 6.1
 */

import { SourceDescriptor, SourceState, Measurement, WaveformChunk } from '../../types/telemetry';

export type TelemetryEventListener = (event: TelemetryStreamEvent) => void;

export type TelemetryStreamEvent =
  | { type: 'state'; state: SourceState; error?: string }
  | { type: 'descriptor'; descriptor: SourceDescriptor }
  | { type: 'measurement'; measurement: Measurement }
  | { type: 'waveform'; chunk: WaveformChunk }
  | { type: 'beat'; bpm: number; intervalMs: number };

export interface TelemetrySource {
  getDescriptor(): SourceDescriptor;
  getState(): SourceState;
  connect(config?: Record<string, unknown>): Promise<void>;
  disconnect(reason?: string): Promise<void>;
  subscribe(listener: TelemetryEventListener): () => void;
  dispose(): void;
}

