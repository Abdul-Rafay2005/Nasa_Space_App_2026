/**
 * Aegis Health — Stable Alert Incident Engine
 * Conforms to Section 8.5 of PLAN.md
 */

import { AlertIncident } from '../types/session';
import { EvaluatedCurrentSnapshot } from './currentHealth';
import { saveAlertIncident } from './persistence/historyRepository';

interface ActiveIncidentTracker {
  incident: AlertIncident;
  dwellStartMs: number;
  dwellRequiredMs: number;
}

const activeIncidents = new Map<string, ActiveIncidentTracker>();
let lastEvaluatedTimeMs = 0;

export function evaluateAlertIncidents(
  snapshot: EvaluatedCurrentSnapshot,
  sessionId: string,
  onIncidentTriggered?: (incident: AlertIncident) => void
): AlertIncident[] {
  const now = Date.now();
  // Rate limit alert evaluation to once per second
  if (now - lastEvaluatedTimeMs < 1000) {
    return Array.from(activeIncidents.values()).map((t) => t.incident);
  }
  lastEvaluatedTimeMs = now;

  const currentIssues = snapshot.indicators.filter((i) => i.status === 'RED' || i.status === 'YELLOW');

  // Check new/active issues
  for (const issue of currentIssues) {
    const key = `ALERT:${issue.indicatorId}`;
    const severity = issue.status === 'RED' ? 'CRITICAL' : 'WARNING';
    // 10s dwell for warning, 0s for critical
    const dwellRequiredMs = severity === 'CRITICAL' ? 0 : 10000;

    let tracker = activeIncidents.get(key);
    if (!tracker) {
      const incident: AlertIncident = {
        id: `inc-${issue.indicatorId}-${Math.floor(now / 10000)}`,
        ruleId: `RULE_THRESHOLD_${issue.indicatorId.toUpperCase()}`,
        ruleVersion: '1.0.0',
        sessionId,
        metric: issue.indicatorId,
        severity,
        observedValue: issue.valueDisplay,
        thresholdValue: issue.nominalRangeLabel,
        triggeredAt: new Date(now).toISOString(),
        summary: issue.reason,
        recommendation: `Assess astronaut state for ${issue.displayName}. Verify telemetry and initiate protocol.`
      };

      tracker = {
        incident,
        dwellStartMs: now,
        dwellRequiredMs
      };
      activeIncidents.set(key, tracker);
    } else {
      // Update values
      tracker.incident.observedValue = issue.valueDisplay;
    }

    if (now - tracker.dwellStartMs >= tracker.dwellRequiredMs) {
      if (onIncidentTriggered && !tracker.incident.acknowledgedAt) {
        onIncidentTriggered(tracker.incident);
      }
      saveAlertIncident(tracker.incident);
    }
  }

  // Check for resolved issues
  for (const [key, tracker] of activeIncidents.entries()) {
    const stillActive = currentIssues.some((i) => `ALERT:${i.indicatorId}` === key);
    if (!stillActive) {
      tracker.incident.resolvedAt = new Date(now).toISOString();
      saveAlertIncident(tracker.incident);
      activeIncidents.delete(key);
    }
  }

  return Array.from(activeIncidents.values()).map((t) => t.incident);
}

export function acknowledgeIncident(id: string): void {
  for (const tracker of activeIncidents.values()) {
    if (tracker.incident.id === id) {
      tracker.incident.acknowledgedAt = new Date().toISOString();
      saveAlertIncident(tracker.incident);
      break;
    }
  }
}
