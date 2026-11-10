/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Interactive Body Map Types
 * Second Developer: Sameen (Phase 1/2 Visualization Engine)
 */

import { HealthStatus } from './health';

export type BodyPartId = 'head' | 'chest' | 'lungs' | 'abdomen' | 'arms' | 'legs';

export type IndicatorKey =
  | 'heartRate'
  | 'bloodPressure'
  | 'bloodSugar'
  | 'bodyTemperature'
  | 'sleepDuration'
  | 'mood';

export interface BodyPartDefinition {
  id: BodyPartId;
  name: string;
  regionName: string;
  shortFunction: string;
  linkedIndicators: IndicatorKey[];
  source: string;
  description: string;
  countermeasures: string;
}

export interface BodyPartEvaluation {
  definition: BodyPartDefinition;
  status: HealthStatus;
  statusLabel: string;
  dominantReason: string;
  contributingIndicators: Array<{
    key: IndicatorKey;
    displayName: string;
    valueDisplay: string;
    unit: string;
    status: HealthStatus;
  }>;
}

