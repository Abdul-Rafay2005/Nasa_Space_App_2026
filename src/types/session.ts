/**
 * Aegis Health — Telemetry Sessions & Alert Incident Contracts
 * Defined in accordance with Section 5 of PLAN.md
 */

import { SourceKind, SourceDescriptor } from './telemetry';

export interface TelemetrySession {
  sessionId: string;
  astronautId: string;
  sourceId: string;
  sourceKind: SourceKind;
  startedAt: string;
  endedAt?: string;
  scenarioId?: string;
  seed?: number;
  descriptor: SourceDescriptor;
}

export interface TelemetryEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  type: 'source_state' | 'gap_detected' | 'quality_degraded' | 'scenario_changed' | 'alert_incident';
  summary: string;
  details?: Record<string, unknown>;
}

export interface AlertIncident {
  id: string;
  ruleId: string;
  ruleVersion: string;
  sessionId: string;
  metric: string;
  severity: 'WARNING' | 'CRITICAL';
  observedValue: string;
  thresholdValue: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  summary: string;
  recommendation: string;
}
