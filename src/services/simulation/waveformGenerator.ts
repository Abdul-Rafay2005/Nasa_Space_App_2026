/**
 * Aegis Health — Real-time Synthetic Electrocardiographic Signal Generator
 * Compliant with PLAN.md Section 7.2
 */

import templateFixture from '../../data/waveforms/synthetic-resting-v1.json';
import { SeededRandom } from './seededRandom';
import { DemoScenario, DEMO_SCENARIOS } from '../../config/demoScenarios';

export interface GeneratedChunk {
  samples: number[];
  startTimeMs: number;
  sampleRateHz: number;
  isGap: boolean;
  beatDetected: boolean;
  currentBpm: number;
}

export class WaveformGenerator {
  private rng: SeededRandom;
  private scenario: DemoScenario;
  private sampleRateHz: number = 250;
  private currentBpm: number = 72;
  private targetBpm: number = 72;
  private sampleIndex: number = 0;
  private templateSamples: number[];
  private templateCount: number;

  // Phase tracker within current beat cycle [0, 1)
  private beatPhase: number = 0;

  constructor(seed: number = 2026, initialScenarioId: string = 'resting') {
    this.rng = new SeededRandom(seed);
    this.scenario = DEMO_SCENARIOS[initialScenarioId] || DEMO_SCENARIOS.resting;
    this.templateSamples = templateFixture.samples;
    this.templateCount = this.templateSamples.length;
    this.currentBpm = this.scenario.targetBpm;
    this.targetBpm = this.scenario.targetBpm;
  }

  public setScenario(scenarioId: string): void {
    if (DEMO_SCENARIOS[scenarioId]) {
      this.scenario = DEMO_SCENARIOS[scenarioId];
      this.targetBpm = this.scenario.targetBpm;
    }
  }

  public getScenario(): DemoScenario {
    return this.scenario;
  }

  public getCurrentBpm(): number {
    return Math.round(this.currentBpm);
  }

  /**
   * Generates next N samples (typically 10 samples for 40ms chunk at 250 Hz)
   */
  public generateNextChunk(chunkSize: number = 10, currentTimeMs: number = Date.now()): GeneratedChunk {
    if (this.scenario.dropoutActive) {
      this.sampleIndex += chunkSize;
      return {
        samples: new Array(chunkSize).fill(0),
        startTimeMs: currentTimeMs,
        sampleRateHz: this.sampleRateHz,
        isGap: true,
        beatDetected: false,
        currentBpm: this.currentBpm,
      };
    }

    // Smoothly transition currentBpm toward targetBpm
    const bpmDelta = (this.targetBpm - this.currentBpm);
    const maxChange = (this.scenario.rateOfChangeBpmPerSec * chunkSize) / this.sampleRateHz;
    if (Math.abs(bpmDelta) > maxChange) {
      this.currentBpm += Math.sign(bpmDelta) * maxChange;
    } else {
      this.currentBpm = this.targetBpm;
    }

    const chunkSamples: number[] = [];
    let beatDetected = false;
    const dtSeconds = 1 / this.sampleRateHz;

    for (let i = 0; i < chunkSize; i++) {
      // Small physiological respiratory sinus arrhythmia modulation (±2%)
      const naturalJitter = this.rng.nextGaussian(0, this.scenario.amplitudeVariation * 0.5);
      const effectiveBpm = this.currentBpm * (1 + naturalJitter * 0.02);
      const beatDurationSec = 60 / effectiveBpm;

      const prevPhase = this.beatPhase;
      this.beatPhase += dtSeconds / beatDurationSec;

      // Trigger beat event near R-peak (approx phase 0.44)
      if (prevPhase < 0.44 && this.beatPhase >= 0.44) {
        beatDetected = true;
      }

      // Wrap phase at end of cardiac cycle
      if (this.beatPhase >= 1.0) {
        this.beatPhase -= 1.0;
      }

      // Map phase to template sample with linear interpolation
      const templatePos = this.beatPhase * (this.templateCount - 1);
      const idxLow = Math.floor(templatePos);
      const idxHigh = Math.min(this.templateCount - 1, idxLow + 1);
      const frac = templatePos - idxLow;

      const baseVal = this.templateSamples[idxLow] * (1 - frac) + this.templateSamples[idxHigh] * frac;

      // Amplitude scaling + noise injection
      const amplitudeMod = 1.0 + this.rng.nextGaussian(0, this.scenario.amplitudeVariation);
      const noise = this.rng.nextGaussian(0, this.scenario.noiseLevel * 0.15);

      const finalSample = Math.max(-1.5, Math.min(2.5, baseVal * amplitudeMod + noise));
      chunkSamples.push(finalSample);
      this.sampleIndex++;
    }

    return {
      samples: chunkSamples,
      startTimeMs: currentTimeMs,
      sampleRateHz: this.sampleRateHz,
      isGap: false,
      beatDetected,
      currentBpm: Math.round(this.currentBpm),
    };
  }

  public reset(seed?: number): void {
    if (seed !== undefined) {
      this.rng = new SeededRandom(seed);
    }
    this.beatPhase = 0;
    this.sampleIndex = 0;
    this.currentBpm = this.scenario.targetBpm;
    this.targetBpm = this.scenario.targetBpm;
  }
}
