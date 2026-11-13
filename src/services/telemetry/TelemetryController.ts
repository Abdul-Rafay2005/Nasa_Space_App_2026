/**
 * Aegis Health — Telemetry Controller
 * Compliant with PLAN.md Section 4.1 & Section 6.1
 */

import { TelemetrySource, TelemetryStreamEvent } from './TelemetrySource';
import { SimulationSource } from './adapters/SimulationSource';
import { WaveformRingBuffer } from '../../lib/ringBuffer';
import { TelemetrySnapshot, SourceState, Quality } from '../../types/telemetry';
import { evaluateMetricFreshness, evaluateOverallStatus, classifyHeartRate } from './freshness';
import { getNowIsoUtc } from '../../lib/time';

export class TelemetryController {
  private activeSource: TelemetrySource;
  private ringBuffer: WaveformRingBuffer;
  private unsubscribeSource: (() => void) | null = null;
  private snapshotListeners: Set<() => void> = new Set();
  private beatListeners: Set<(bpm: number) => void> = new Set();
  private cachedSnapshot: TelemetrySnapshot;

  constructor() {
    this.ringBuffer = new WaveformRingBuffer(7500); // 30 seconds at 250 Hz
    this.activeSource = new SimulationSource(2026, 'resting');

    this.cachedSnapshot = {
      timestamp: getNowIsoUtc(),
      sourceState: 'idle',
      activeSourceId: 'simulated-local-source',
      sourceDescriptor: this.activeSource.getDescriptor(),
      heartRate: { metric: 'heartRate', value: null, unit: 'bpm', availability: 'missing', quality: 'unknown', measuredAt: null, ageSeconds: null, provenance: null },
      bloodPressure: { metric: 'bloodPressure', value: null, unit: 'mmHg', availability: 'missing', quality: 'unknown', measuredAt: null, ageSeconds: null, provenance: null },
      bloodSugar: { metric: 'bloodSugar', value: null, unit: 'mg/dL', availability: 'missing', quality: 'unknown', measuredAt: null, ageSeconds: null, provenance: null },
      bodyTemperature: { metric: 'bodyTemperature', value: null, unit: 'degC', availability: 'missing', quality: 'unknown', measuredAt: null, ageSeconds: null, provenance: null },
      sleepDuration: { metric: 'sleepDuration', value: null, unit: 'h', availability: 'missing', quality: 'unknown', measuredAt: null, ageSeconds: null, provenance: null },
      mood: { metric: 'mood', value: null, unit: 'category', availability: 'missing', quality: 'unknown', measuredAt: null, ageSeconds: null, provenance: null },
      overallStatus: 'UNKNOWN',
      completeness: { availableCount: 0, totalCount: 6 },
    };

    this.attachSource(this.activeSource);
  }

  public getRingBuffer(): WaveformRingBuffer {
    return this.ringBuffer;
  }

  public getSnapshot(): TelemetrySnapshot {
    return this.cachedSnapshot;
  }

  public subscribeSnapshot(listener: () => void): () => void {
    this.snapshotListeners.add(listener);
    return () => this.snapshotListeners.delete(listener);
  }

  public subscribeBeat(listener: (bpm: number) => void): () => void {
    this.beatListeners.add(listener);
    return () => this.beatListeners.delete(listener);
  }

  public async start(): Promise<void> {
    await this.activeSource.connect();
  }

  public async stop(): Promise<void> {
    await this.activeSource.disconnect('User stopped');
  }

  public setScenario(scenarioId: string): void {
    if ('setScenario' in this.activeSource && typeof (this.activeSource as any).setScenario === 'function') {
      (this.activeSource as any).setScenario(scenarioId);
    }
  }

  public getScenarioId(): string {
    if ('getScenarioId' in this.activeSource && typeof (this.activeSource as any).getScenarioId === 'function') {
      return (this.activeSource as any).getScenarioId();
    }
    return 'resting';
  }

  public async switchToSource(newSource: TelemetrySource): Promise<void> {
    if (this.activeSource) {
      await this.activeSource.disconnect('Switching source');
      this.activeSource.dispose();
    }
    this.ringBuffer.clear();
    this.attachSource(newSource);
    await newSource.connect();
  }

  private attachSource(source: TelemetrySource): void {
    this.activeSource = source;
    if (this.unsubscribeSource) {
      this.unsubscribeSource();
    }

    this.unsubscribeSource = source.subscribe((event: TelemetryStreamEvent) => {
      this.handleStreamEvent(event);
    });
  }

  private handleStreamEvent(event: TelemetryStreamEvent): void {
    switch (event.type) {
      case 'state':
        this.updateSnapshotState(event.state);
        break;
      case 'descriptor':
        this.cachedSnapshot = {
          ...this.cachedSnapshot,
          sourceDescriptor: event.descriptor,
        };
        this.emitSnapshotChange();
        break;
      case 'waveform':
        this.ringBuffer.pushBatch(
          event.chunk.samples,
          new Date(event.chunk.measuredAt).getTime(),
          1000 / event.chunk.sampleRateHz,
          event.chunk.quality === 'invalid'
        );
        break;
      case 'beat':
        this.beatListeners.forEach((l) => l(event.bpm));
        break;
      case 'measurement':
        this.applyMeasurement(event.measurement);
        break;
    }
  }

  private updateSnapshotState(state: SourceState): void {
    this.cachedSnapshot = {
      ...this.cachedSnapshot,
      sourceState: state,
    };
    this.emitSnapshotChange();
  }

  private applyMeasurement(m: any): void {
    const metric = m.metric;
    const nowIso = getNowIsoUtc();

    let updatedMetrics = { ...this.cachedSnapshot };

    if (metric === 'heartRate') {
      updatedMetrics.heartRate = evaluateMetricFreshness('heartRate', {
        metric: 'heartRate',
        value: m.value,
        unit: m.unit,
        availability: 'fresh',
        quality: m.quality as Quality,
        measuredAt: m.measuredAt,
        ageSeconds: 0,
        provenance: m.provenance,
      });
    } else if (metric === 'bloodPressure') {
      updatedMetrics.bloodPressure = evaluateMetricFreshness('bloodPressure', {
        metric: 'bloodPressure',
        value: { systolic: m.systolic, diastolic: m.diastolic },
        unit: m.unit,
        availability: 'fresh',
        quality: m.quality as Quality,
        measuredAt: m.measuredAt,
        ageSeconds: 0,
        provenance: m.provenance,
      });
    } else if (metric === 'bloodSugar') {
      updatedMetrics.bloodSugar = evaluateMetricFreshness('bloodSugar', {
        metric: 'bloodSugar',
        value: m.value,
        unit: m.unit,
        availability: 'fresh',
        quality: m.quality as Quality,
        measuredAt: m.measuredAt,
        ageSeconds: 0,
        provenance: m.provenance,
      });
    } else if (metric === 'bodyTemperature') {
      updatedMetrics.bodyTemperature = evaluateMetricFreshness('bodyTemperature', {
        metric: 'bodyTemperature',
        value: m.value,
        unit: m.unit,
        availability: 'fresh',
        quality: m.quality as Quality,
        measuredAt: m.measuredAt,
        ageSeconds: 0,
        provenance: m.provenance,
      });
    } else if (metric === 'sleepDuration') {
      updatedMetrics.sleepDuration = evaluateMetricFreshness('sleepDuration', {
        metric: 'sleepDuration',
        value: m.value,
        unit: m.unit,
        availability: 'fresh',
        quality: m.quality as Quality,
        measuredAt: m.measuredAt,
        ageSeconds: 0,
        provenance: m.provenance,
      });
    } else if (metric === 'mood') {
      updatedMetrics.mood = evaluateMetricFreshness('mood', {
        metric: 'mood',
        value: m.value,
        unit: m.unit,
        availability: 'fresh',
        quality: m.quality as Quality,
        measuredAt: m.measuredAt,
        ageSeconds: 0,
        provenance: m.provenance,
      });
    }

    // Count available
    const availableCount = [
      updatedMetrics.heartRate.value !== null,
      updatedMetrics.bloodPressure.value !== null,
      updatedMetrics.bloodSugar.value !== null,
      updatedMetrics.bodyTemperature.value !== null,
      updatedMetrics.sleepDuration.value !== null,
      updatedMetrics.mood.value !== null,
    ].filter(Boolean).length;

    const hrClass = classifyHeartRate(updatedMetrics.heartRate.value, updatedMetrics.heartRate.quality);
    const overall = evaluateOverallStatus(hrClass, 'GREEN', availableCount);

    this.cachedSnapshot = {
      ...updatedMetrics,
      timestamp: nowIso,
      overallStatus: overall,
      completeness: { availableCount, totalCount: 6 },
    };

    this.emitSnapshotChange();
  }

  private emitSnapshotChange(): void {
    this.snapshotListeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in snapshot listener:', err);
      }
    });
  }
}

