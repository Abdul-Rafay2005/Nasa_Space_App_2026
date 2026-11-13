/**
 * Aegis Health — Demonstration Scenarios
 * Compliant with PLAN.md Section 7.3
 */

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  targetBpm: number;
  rateOfChangeBpmPerSec: number;
  noiseLevel: number; // 0.0 to 1.0
  amplitudeVariation: number; // percentage
  dropoutActive: boolean;
  expectedStatus: 'GREEN' | 'YELLOW' | 'RED';
}

export const DEMO_SCENARIOS: Record<string, DemoScenario> = {
  resting: {
    id: 'resting',
    name: 'Nominal Resting',
    description: 'Stable baseline heart rate (72 BPM) with natural physiological sinus arrhythmia.',
    targetBpm: 72,
    rateOfChangeBpmPerSec: 0.5,
    noiseLevel: 0.02,
    amplitudeVariation: 0.04,
    dropoutActive: false,
    expectedStatus: 'GREEN',
  },
  elevation: {
    id: 'elevation',
    name: 'Gradual Elevation',
    description: 'Smooth increase to 98 BPM in resting context, triggering a provisional flight rule advisory.',
    targetBpm: 98,
    rateOfChangeBpmPerSec: 1.2,
    noiseLevel: 0.03,
    amplitudeVariation: 0.05,
    dropoutActive: false,
    expectedStatus: 'YELLOW',
  },
  recovery: {
    id: 'recovery',
    name: 'Cardiovascular Recovery',
    description: 'Orderly return toward nominal 72 BPM resting baseline.',
    targetBpm: 72,
    rateOfChangeBpmPerSec: 1.0,
    noiseLevel: 0.02,
    amplitudeVariation: 0.04,
    dropoutActive: false,
    expectedStatus: 'GREEN',
  },
  artifact: {
    id: 'artifact',
    name: 'Motion Artifact',
    description: 'Simulates electrode displacement or astronaut movement with degraded signal quality.',
    targetBpm: 76,
    rateOfChangeBpmPerSec: 0.8,
    noiseLevel: 0.25,
    amplitudeVariation: 0.15,
    dropoutActive: false,
    expectedStatus: 'GREEN',
  },
  dropout: {
    id: 'dropout',
    name: 'Signal Dropout',
    description: 'Temporary loss of sensor acquisition, demonstrating true gap handling without fabricated flatline.',
    targetBpm: 72,
    rateOfChangeBpmPerSec: 0.5,
    noiseLevel: 0.0,
    amplitudeVariation: 0.0,
    dropoutActive: true,
    expectedStatus: 'GREEN',
  },
};
