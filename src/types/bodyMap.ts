/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Interactive Body Map Types
 * Second Developer: Sameen (Phase 1/2 Visualization Engine)
 */

import { HealthStatus } from './health';

export type IndicatorKey =
  | 'heartRate'
  | 'bloodPressure'
  | 'bloodSugar'
  | 'bodyTemperature'
  | 'sleepDuration'
  | 'mood';

/** System grouping for sidebar chip display */
export type BodySystem =
  | 'Neurological'
  | 'Cardiovascular'
  | 'Pulmonary'
  | 'Metabolic'
  | 'Gastrointestinal'
  | 'Renal'
  | 'Musculoskeletal'
  | 'Integumentary';

/** Raw definition from bodyParts.json — bilateral:true auto-generates -left / -right */
export interface BodyPartDefinition {
  id: string;
  name: string;
  system: BodySystem;
  bilateral: boolean;
  regionName: string;
  shortFunction: string;
  linkedIndicators: IndicatorKey[];
  source: string;
  reviewStatus: 'placeholder' | 'reviewed' | 'approved';
  description: string;
  countermeasures: string;
}

/** Resolved part after bilateral expansion — id may be "femur-left" etc. */
export interface ResolvedBodyPart {
  id: string;               // e.g. "femur-left"
  baseId: string;           // e.g. "femur" (matches hotspot base)
  displayName: string;      // e.g. "Left Femur (Thigh)"
  side: 'left' | 'right' | 'none';
  definition: BodyPartDefinition;
}

/** Hotspot from bodyHotspots.json */
export interface BodyHotspot {
  id: string;               // e.g. "femur-right"  or  "heart"
  shape: 'ellipse' | 'polygon';
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  points?: string;          // for polygon, space-separated "x,y x,y ..."
  label: string;
}

/** Evaluated state for one resolved part */
export interface BodyPartEvaluation {
  resolvedPart: ResolvedBodyPart;
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

/** Callout annotation overlay (Image 1 HUD style) */
export interface BodyCallout {
  id: string;
  targetPartId: string;
  code: string;
  title: string;
  subtitle: string;
  targetX: number;
  targetY: number;
  labelX: number;
  labelY: number;
  align: 'left' | 'right';
}

/** Layer visibility state for the digital twin */
export interface HoloLayersState {
  surface: boolean;
  skeleton: boolean;
  organs: boolean;
  landmarks: boolean;
}

/** Legacy alias kept so BodyMapPage.tsx continues to compile */
export type BodyPartId = string;
