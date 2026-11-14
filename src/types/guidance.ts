/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Flight Surgeon Guidance Engine Types
 * Updated: 14 November 2026 per Official NASA & CSA Research Report (Eman Saleem)
 */

import { HealthStatus, IndicatorResult } from './health';
import { IndicatorKey } from './bodyMap';

export type GuidanceLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface GuidanceRule {
  id: string;
  indicatorId: IndicatorKey;
  level: GuidanceLevel;
  levelLabel: string;
  title: string;
  whatHappened?: string;
  whyItMatters?: string;
  whatToDoNow?: string[];
  whenToTellEarth?: string;
  nasaHazard?: string;
  nasaRisk?: string;
  nasaRiskUrl?: string;
  actions: string[];
  whenToContactFlightSurgeon: string;
  remeasureIntervalHours?: number;
  relatedBodyPartId: string;
  source: string;
  reviewStatus: 'PLACEHOLDER' | 'REVIEWED' | 'APPROVED';
}

export interface ActiveGuidanceItem {
  rule: GuidanceRule;
  indicator: IndicatorResult;
  severityRank: number; // 0 for RED (urgent), 1 for YELLOW (warning), 2 for GREEN (nominal)
}

export interface GuidanceEngineResult {
  overallStatus: HealthStatus;
  overallLabel: string;
  summary: string;
  counts: {
    urgent: number;
    warning: number;
    nominal: number;
    total: number;
  };
  items: ActiveGuidanceItem[];
}
