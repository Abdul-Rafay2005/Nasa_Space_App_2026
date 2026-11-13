/**
 * Aegis Health — High-Performance Bounded Ring Buffer for Waveform Samples
 * Compliant with PLAN.md Section 7.4 & Section 2.1
 */

export interface SamplePoint {
  index: number;
  timeMs: number;
  value: number; // amplitude
  isGap?: boolean;
}

export class WaveformRingBuffer {
  private buffer: Float32Array;
  private timeBuffer: Float64Array;
  private gapBuffer: Uint8Array;
  private capacity: number;
  private writePointer: number = 0;
  private count: number = 0;
  private sampleCounter: number = 0;

  constructor(capacity: number = 7500) {
    this.capacity = capacity;
    this.buffer = new Float32Array(capacity);
    this.timeBuffer = new Float64Array(capacity);
    this.gapBuffer = new Uint8Array(capacity);
  }

  public push(value: number, timeMs: number, isGap: boolean = false): void {
    const idx = this.writePointer;
    this.buffer[idx] = value;
    this.timeBuffer[idx] = timeMs;
    this.gapBuffer[idx] = isGap ? 1 : 0;

    this.writePointer = (this.writePointer + 1) % this.capacity;
    if (this.count < this.capacity) {
      this.count++;
    }
    this.sampleCounter++;
  }

  public pushBatch(values: number[], startTimeMs: number, sampleIntervalMs: number, isGap: boolean = false): void {
    for (let i = 0; i < values.length; i++) {
      this.push(values[i], startTimeMs + i * sampleIntervalMs, isGap);
    }
  }

  public insertGap(gapDurationMs: number, startTimeMs: number): void {
    this.push(0, startTimeMs, true);
    this.push(0, startTimeMs + gapDurationMs, true);
  }

  public clear(): void {
    this.writePointer = 0;
    this.count = 0;
    this.sampleCounter = 0;
    this.buffer.fill(0);
    this.timeBuffer.fill(0);
    this.gapBuffer.fill(0);
  }

  public getCount(): number {
    return this.count;
  }

  public getCapacity(): number {
    return this.capacity;
  }

  /**
   * Retrieves the most recent N samples in chronological order.
   */
  public getRecent(maxSamples: number): { values: Float32Array; times: Float64Array; gaps: Uint8Array; length: number } {
    const n = Math.min(this.count, maxSamples);
    const outValues = new Float32Array(n);
    const outTimes = new Float64Array(n);
    const outGaps = new Uint8Array(n);

    const startIdx = (this.writePointer - n + this.capacity) % this.capacity;

    for (let i = 0; i < n; i++) {
      const bufIdx = (startIdx + i) % this.capacity;
      outValues[i] = this.buffer[bufIdx];
      outTimes[i] = this.timeBuffer[bufIdx];
      outGaps[i] = this.gapBuffer[bufIdx];
    }

    return { values: outValues, times: outTimes, gaps: outGaps, length: n };
  }
}

