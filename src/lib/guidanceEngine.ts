/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Flight Surgeon Guidance Engine Logic
 * Second Developer: Sameen (Phase 2 Clinical Decision Support)
 *
 * Pure typed calculation engine that maps evaluated physiological telemetry readings
 * to data-driven clinical guidance protocols.
 * Separated cleanly from UI components for unit testability and clinical audit.
 */

import { HealthStatus, IndicatorResult } from '../types/health';
import {
  GuidanceRule,
  GuidanceEngineResult,
  ActiveGuidanceItem,
} from '../types/guidance';

/**
 * Maps a HealthStatus to a numerical severity rank for strict sorting.
 * 0 = RED (Urgent - highest priority)
 * 1 = YELLOW (Warning - secondary priority)
 * 2 = GREEN (Nominal - routine self-care)
 */
export function getSeverityRank(status: HealthStatus): number {
  switch (status) {
    case 'RED':
      return 0;
    case 'YELLOW':
      return 1;
    case 'GREEN':
    default:
      return 2;
  }
}

/**
 * Pure typed function: evaluates current telemetry indicators against clinical guidance rules.
 *
 * @param indicators List or map of evaluated telemetry indicator results from the latest check-in.
 * @param rules Array of data-driven guidance rules from src/data/guidanceRules.json.
 * @returns Sorted guidance items (urgent first) along with overall mission status and tally counters.
 */
export function getGuidance(
  indicators: IndicatorResult[] | Record<string, IndicatorResult | undefined> | undefined,
  rules: GuidanceRule[]
): GuidanceEngineResult {
  // Normalize input into an array of IndicatorResult
  let indicatorList: IndicatorResult[] = [];
  if (Array.isArray(indicators)) {
    indicatorList = indicators;
  } else if (indicators && typeof indicators === 'object') {
    indicatorList = Object.values(indicators).filter((item): item is IndicatorResult => Boolean(item));
  }

  // If no indicators supplied (e.g. before initial check-in), return nominal default
  if (indicatorList.length === 0) {
    return {
      overallStatus: 'GREEN',
      overallLabel: 'Telemetry Standby / Awaiting Check-In',
      summary: 'No active telemetry check-in recorded for current sol. Perform daily health assessment to generate personalized guidance.',
      counts: {
        urgent: 0,
        warning: 0,
        nominal: 0,
        total: 0,
      },
      items: [],
    };
  }

  const items: ActiveGuidanceItem[] = [];
  let urgentCount = 0;
  let warningCount = 0;
  let nominalCount = 0;

  for (const ind of indicatorList) {
    const status = ind.status ?? 'GREEN';

    if (status === 'RED') urgentCount++;
    else if (status === 'YELLOW') warningCount++;
    else nominalCount++;

    // Find rule matching indicatorId and status level
    const matchedRule = rules.find(
      (r) => r.indicatorId === ind.indicatorId && r.level === status
    );

    if (matchedRule) {
      items.push({
        rule: matchedRule,
        indicator: ind,
        severityRank: getSeverityRank(status),
      });
    } else {
      // Fallback rule placeholder if specific rule is missing
      items.push({
        rule: {
          id: `${ind.indicatorId}-${status.toLowerCase()}`,
          indicatorId: ind.indicatorId,
          level: status,
          levelLabel: status === 'RED' ? 'Contact Flight Surgeon' : status === 'YELLOW' ? 'Monitor and apply countermeasures' : 'Self-care',
          title: `${ind.displayName} Telemetry Guidance`,
          actions: ['Follow standard orbital clinical guidance protocol.'],
          whenToContactFlightSurgeon: 'Contact flight surgeon if symptoms persist or unexpected deviation occurs.',
          relatedBodyPartId: 'heart',
          source: 'To be confirmed by research team',
          reviewStatus: 'PLACEHOLDER',
        },
        indicator: ind,
        severityRank: getSeverityRank(status),
      });
    }
  }

  // Sort strictly by severity: RED (0) first, then YELLOW (1), then GREEN (2)
  items.sort((a, b) => a.severityRank - b.severityRank);

  // Determine overall status
  let overallStatus: HealthStatus = 'GREEN';
  let overallLabel = 'All Systems Nominal';
  let summary = 'All monitored physiological parameters are within nominal operational thresholds. Routine countermeasure protocols advised.';

  if (urgentCount > 0) {
    overallStatus = 'RED';
    overallLabel = 'Urgent Clinical Action Required';
    summary = `${urgentCount} physiological indicator${urgentCount > 1 ? 's are' : ' is'} in critical departure. Immediate countermeasure implementation and Flight Surgeon communication required.`;
  } else if (warningCount > 0) {
    overallStatus = 'YELLOW';
    overallLabel = 'Operational Advisory / Active Monitoring';
    summary = `${warningCount} indicator${warningCount > 1 ? 's exhibit' : ' exhibits'} sub-nominal variance. Apply targeted countermeasures and verify readings at the designated re-measurement intervals.`;
  }

  return {
    overallStatus,
    overallLabel,
    summary,
    counts: {
      urgent: urgentCount,
      warning: warningCount,
      nominal: nominalCount,
      total: items.length,
    },
    items,
  };
}

