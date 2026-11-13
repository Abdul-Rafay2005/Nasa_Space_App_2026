/**
 * Aegis Health — In-Browser Telemetry Simulation Adapter
 * Compliant with PLAN.md Section 6.2 & Section 7
 */

import { TelemetrySource, TelemetryEventListener } from '../TelemetrySource';
import { SourceDescriptor, SourceState, Measurement, WaveformChunk } from '../../../types/telemetry';
import { WaveformGenerator } from '../../simulation/waveformGenerator';
import { DEMO_SCENARIOS } from '../../../config/demoScenarios';
import { getNowIsoUtc } from '../../../lib/time';

export class SimulationSource implements TelemetrySource {
  private descriptor: SourceDescriptor;
  private state: SourceState = 'idle';
  private generator: WaveformGenerator;
  private listeners: Set<TelemetryEventListener> = new Set();
  private timerId: number | null = null;
  private scalarTimerId: number | null = null;
  private sequence: number = 0;
  private currentScenarioId: string = 'resting';
  private sessionId: string;
  private seed: number;

  constructor(seed: number = 2026, initialScenarioId: string = 'resting') {
    this.seed = seed;
    this.currentScenarioId = initialScenarioId;
    this.sessionId = `sim-session-${Date.now()}`;
    this.generator = new WaveformGenerator(seed, initialScenarioId);

    this.descriptor = {
      id: 'simulated-local-source',
      label: 'Demo · Simulated Signals',
      kind: 'simulation',
      capabilities: {
        waveform: true,
        heartRate: true,
        bloodPressure: true,
        bloodSugar: true,
        bodyTemperature: true,
        sleepDuration: true,
        mood: true,
      },
      sampleRateHz: 250,
      simulationMetadata: {
        scenarioId: initialScenarioId,
        seed,
      },
    };
  }

  public getDescriptor(): SourceDescriptor {
    return {
      ...this.descriptor,
      simulationMetadata: {
        scenarioId: this.currentScenarioId,
        seed: this.seed,
      },
    };
  }

  public getState(): SourceState {
    return this.state;
  }

  public async connect(): Promise<void> {
    if (this.state === 'connected') return;

    this.state = 'connecting';
    this.notify({ type: 'state', state: this.state });

    // Fast asynchronous handshake
    await new Promise((r) => setTimeout(r, 60));

    this.state = 'connected';
    this.notify({ type: 'state', state: this.state });
    this.notify({ type: 'descriptor', descriptor: this.getDescriptor() });

    this.startStreaming();
  }

  public async disconnect(reason?: string): Promise<void> {
    this.stopStreaming();
    this.state = 'disconnected';
    this.notify({ type: 'state', state: this.state, error: reason });
  }

  public subscribe(listener: TelemetryEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public setScenario(scenarioId: string): void {
    if (DEMO_SCENARIOS[scenarioId]) {
      this.currentScenarioId = scenarioId;
      this.generator.setScenario(scenarioId);
      this.notify({ type: 'descriptor', descriptor: this.getDescriptor() });
    }
  }

  public getScenarioId(): string {
    return this.currentScenarioId;
  }

  public dispose(): void {
    this.disconnect('Disposed');
    this.listeners.clear();
  }

  private notify(event: any): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in telemetry listener:', err);
      }
    });
  }

  private startStreaming(): void {
    if (this.timerId !== null) return;

    let lastBeatBroadcastTime = 0;

    // 40 ms timer generating 10 samples per tick (250 Hz)
    this.timerId = window.setInterval(() => {
      const nowMs = Date.now();
      const chunk = this.generator.generateNextChunk(10, nowMs);

      const waveformChunk: WaveformChunk = {
        schemaVersion: 1,
        id: `wf-${this.sequence}`,
        sessionId: this.sessionId,
        streamId: 'stream-ecg-sim',
        astronautId: 'astro-alex-vance',
        sequence: this.sequence++,
        type: 'waveform',
        signal: 'ecg',
        channelLabel: 'Lead II (Simulated)',
        unit: 'a.u.',
        sampleRateHz: 250,
        startSampleIndex: this.sequence * 10,
        samples: chunk.samples,
        measuredAt: new Date(nowMs).toISOString(),
        receivedAt: new Date(nowMs).toISOString(),
        quality: this.currentScenarioId === 'artifact' ? 'degraded' : chunk.isGap ? 'invalid' : 'good',
        context: 'rest',
        provenance: {
          kind: 'simulation',
          sourceId: this.descriptor.id,
          fixtureId: 'synthetic-resting-v1',
          seed: this.seed,
          scenarioId: this.currentScenarioId,
        },
      };

      this.notify({ type: 'waveform', chunk: waveformChunk });

      if (chunk.beatDetected) {
        this.notify({ type: 'beat', bpm: chunk.currentBpm, intervalMs: Math.round((60 / chunk.currentBpm) * 1000) });
      }

      // Publish Heart Rate measurement at most once every second
      if (!chunk.isGap && nowMs - lastBeatBroadcastTime >= 950) {
        lastBeatBroadcastTime = nowMs;
        const hrMeasurement: Measurement = {
          schemaVersion: 1,
          id: `meas-hr-${this.sequence}`,
          sessionId: this.sessionId,
          streamId: 'stream-hr-sim',
          astronautId: 'astro-alex-vance',
          sequence: this.sequence++,
          type: 'measurement',
          metric: 'heartRate',
          value: chunk.currentBpm,
          unit: 'bpm',
          measuredAt: new Date(nowMs).toISOString(),
          receivedAt: new Date(nowMs).toISOString(),
          quality: this.currentScenarioId === 'artifact' ? 'degraded' : 'good',
          context: 'rest',
          provenance: {
            kind: 'simulation',
            sourceId: this.descriptor.id,
            seed: this.seed,
            scenarioId: this.currentScenarioId,
          },
        };
        this.notify({ type: 'measurement', measurement: hrMeasurement });
      }
    }, 40);

    // Initial broadcast of scalar measurements
    this.broadcastInitialScalars();

    // Periodic check for scalar measurements
    this.scalarTimerId = window.setInterval(() => {
      this.broadcastPeriodicScalars();
    }, 5000);
  }

  private stopStreaming(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.scalarTimerId !== null) {
      clearInterval(this.scalarTimerId);
      this.scalarTimerId = null;
    }
  }

  private broadcastInitialScalars(): void {
    const nowIso = getNowIsoUtc();

    const bpMeasurement: Measurement = {
      schemaVersion: 1,
      id: `meas-bp-${this.sequence++}`,
      sessionId: this.sessionId,
      streamId: 'stream-bp-sim',
      astronautId: 'astro-alex-vance',
      sequence: this.sequence++,
      type: 'measurement',
      metric: 'bloodPressure',
      systolic: 118,
      diastolic: 76,
      unit: 'mmHg',
      measuredAt: nowIso,
      receivedAt: nowIso,
      quality: 'good',
      context: 'rest',
      provenance: { kind: 'simulation', sourceId: this.descriptor.id },
    };
    this.notify({ type: 'measurement', measurement: bpMeasurement });

    const sugarMeasurement: Measurement = {
      schemaVersion: 1,
      id: `meas-sugar-${this.sequence++}`,
      sessionId: this.sessionId,
      streamId: 'stream-sugar-sim',
      astronautId: 'astro-alex-vance',
      sequence: this.sequence++,
      type: 'measurement',
      metric: 'bloodSugar',
      value: 92,
      unit: 'mg/dL',
      measuredAt: nowIso,
      receivedAt: nowIso,
      quality: 'good',
      context: 'rest',
      provenance: { kind: 'simulation', sourceId: this.descriptor.id },
    };
    this.notify({ type: 'measurement', measurement: sugarMeasurement });

    const tempMeasurement: Measurement = {
      schemaVersion: 1,
      id: `meas-temp-${this.sequence++}`,
      sessionId: this.sessionId,
      streamId: 'stream-temp-sim',
      astronautId: 'astro-alex-vance',
      sequence: this.sequence++,
      type: 'measurement',
      metric: 'bodyTemperature',
      value: 36.6,
      unit: 'degC',
      site: 'core',
      measuredAt: nowIso,
      receivedAt: nowIso,
      quality: 'good',
      context: 'rest',
      provenance: { kind: 'simulation', sourceId: this.descriptor.id },
    };
    this.notify({ type: 'measurement', measurement: tempMeasurement });

    const sleepMeasurement: Measurement = {
      schemaVersion: 1,
      id: `meas-sleep-${this.sequence++}`,
      sessionId: this.sessionId,
      streamId: 'stream-sleep-sim',
      astronautId: 'astro-alex-vance',
      sequence: this.sequence++,
      type: 'measurement',
      metric: 'sleepDuration',
      value: 7.75, // 7h 45m
      unit: 'h',
      periodStart: nowIso,
      periodEnd: nowIso,
      measuredAt: nowIso,
      receivedAt: nowIso,
      quality: 'good',
      context: 'rest',
      provenance: { kind: 'simulation', sourceId: this.descriptor.id },
    };
    this.notify({ type: 'measurement', measurement: sleepMeasurement });

    const moodMeasurement: Measurement = {
      schemaVersion: 1,
      id: `meas-mood-${this.sequence++}`,
      sessionId: this.sessionId,
      streamId: 'stream-mood-sim',
      astronautId: 'astro-alex-vance',
      sequence: this.sequence++,
      type: 'measurement',
      metric: 'mood',
      value: 'good',
      unit: 'category',
      measuredAt: nowIso,
      receivedAt: nowIso,
      quality: 'good',
      context: 'rest',
      provenance: { kind: 'simulation', sourceId: this.descriptor.id },
    };
    this.notify({ type: 'measurement', measurement: moodMeasurement });
  }

  private broadcastPeriodicScalars(): void {
    if (this.currentScenarioId === 'dropout') return;
    const nowIso = getNowIsoUtc();

    // Subtle drift in temperature (±0.05 °C)
    const tempOffset = (Math.random() - 0.5) * 0.1;
    const tempVal = Math.round((36.6 + tempOffset) * 10) / 10;

    const tempMeasurement: Measurement = {
      schemaVersion: 1,
      id: `meas-temp-${this.sequence++}`,
      sessionId: this.sessionId,
      streamId: 'stream-temp-sim',
      astronautId: 'astro-alex-vance',
      sequence: this.sequence++,
      type: 'measurement',
      metric: 'bodyTemperature',
      value: tempVal,
      unit: 'degC',
      site: 'core',
      measuredAt: nowIso,
      receivedAt: nowIso,
      quality: 'good',
      context: 'rest',
      provenance: { kind: 'simulation', sourceId: this.descriptor.id },
    };
    this.notify({ type: 'measurement', measurement: tempMeasurement });
  }
}

