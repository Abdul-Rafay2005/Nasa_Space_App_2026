/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Unified Notification & Alert Store
 *
 * Provides a shared data source for header notifications and Guidance & Alerts.
 * Tracks read/unread state in LocalStorage and dynamically derives alerts from
 * flight rules, physiological drift analysis, and daily mission check-ins.
 */

import { useState, useEffect, useCallback } from 'react';
import { getStoredAssessments, getAstronautProfile, hasCompletedTodayAssessment } from '../services/storage';
import { analyzePhysiologicalDrift } from '../services/driftDetection';
import { getGuidance } from '../lib/guidanceEngine';
import rawGuidanceRules from '../data/guidanceRules.json';
import { GuidanceRule } from '../types/guidance';

const guidanceRulesData = rawGuidanceRules as GuidanceRule[];

export interface NotificationItem {
  id: string;
  ruleId?: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  relativeTime: string;
  timestamp: number;
  isRead: boolean;
  hazard?: string;
  risk?: string;
}

const READ_STORAGE_KEY = 'aegis_notifications_read_v1';

function getStoredReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function persistReadIds(set: Set<string>): void {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Non-blocking
  }
}

let activeReadIds = getStoredReadIds();
const listeners = new Set<() => void>();

function notifyAll(): void {
  listeners.forEach((l) => l());
}

/**
 * Computes all active notifications from existing app data:
 * 1. Multi-Sol Physiological Drift alerts
 * 2. Evaluated Guidance alerts from latest check-in
 * 3. Daily Telemetry Check-in reminder (if not completed today)
 */
export function getActiveNotifications(): NotificationItem[] {
  const records = getStoredAssessments();
  const profile = getAstronautProfile();
  const latestAssessment = records.length > 0 ? records[0] : undefined;
  const items: NotificationItem[] = [];

  // 1. Physiological Drift Alerts (Cardiovascular, Sleep, Core Temp, Hypertension)
  const driftAlerts = analyzePhysiologicalDrift(records, profile);
  for (const drift of driftAlerts) {
    const id = `drift-${drift.type}`;
    items.push({
      id,
      ruleId: drift.id,
      severity: drift.severity === 'CRITICAL' ? 'critical' : 'warning',
      title: drift.title,
      message: drift.description,
      relativeTime: '8 min ago',
      timestamp: Date.now() - 8 * 60 * 1000,
      isRead: activeReadIds.has(id),
      hazard: 'Cardiovascular Deconditioning',
      risk: drift.metric,
    });
  }

  // 2. Clinical Guidance Rules (Sub-nominal and Urgent physiological indicators)
  if (latestAssessment?.results) {
    const guidance = getGuidance(latestAssessment.results, guidanceRulesData);
    const alertItems = guidance.items.filter(
      (item) => item.rule.level === 'RED' || item.rule.level === 'YELLOW'
    );

    for (const item of alertItems) {
      const id = `guidance-${item.rule.indicatorId}-${item.rule.level.toLowerCase()}`;
      items.push({
        id,
        ruleId: item.rule.id,
        severity: item.rule.level === 'RED' ? 'critical' : 'warning',
        title: item.rule.title,
        message:
          item.rule.whatHappened ||
          item.indicator.reason ||
          item.rule.whyItMatters ||
          'Sub-nominal telemetry variance detected.',
        relativeTime: '18 min ago',
        timestamp: Date.now() - 18 * 60 * 1000,
        isRead: activeReadIds.has(id) || activeReadIds.has(item.rule.id),
        hazard: item.rule.nasaHazard,
        risk: item.rule.nasaRisk,
      });
    }
  }

  // 3. Informational Check-in Reminder
  const isCompleted = hasCompletedTodayAssessment(profile.currentMissionDay);
  if (!isCompleted) {
    const checkinId = `checkin-sol-${profile.currentMissionDay}`;
    items.push({
      id: checkinId,
      severity: 'info',
      title: 'Sol Health Check-in Pending',
      message: `Mission Day ${profile.currentMissionDay} routine self-assessment is scheduled for onboard review.`,
      relativeTime: '45 min ago',
      timestamp: Date.now() - 45 * 60 * 1000,
      isRead: activeReadIds.has(checkinId),
      hazard: 'Mission Routine',
      risk: 'Operations & Fatigue Protocol',
    });
  }

  // Sort: unread first, then critical > warning > info, then newest
  const severityScore = { critical: 0, warning: 1, info: 2 };
  return items.sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    const diff = severityScore[a.severity] - severityScore[b.severity];
    if (diff !== 0) return diff;
    return b.timestamp - a.timestamp;
  });
}

export function markNotificationAsRead(id: string): void {
  activeReadIds.add(id);
  persistReadIds(activeReadIds);
  notifyAll();
}

export function markNotificationAsReadByRuleId(ruleId: string): void {
  activeReadIds.add(ruleId);
  // Also check if any notification corresponds to this ruleId
  const current = getActiveNotifications();
  for (const n of current) {
    if (n.ruleId === ruleId || n.id.includes(ruleId)) {
      activeReadIds.add(n.id);
    }
  }
  persistReadIds(activeReadIds);
  notifyAll();
}

export function markAllNotificationsAsRead(): void {
  const current = getActiveNotifications();
  for (const item of current) {
    activeReadIds.add(item.id);
    if (item.ruleId) activeReadIds.add(item.ruleId);
  }
  persistReadIds(activeReadIds);
  notifyAll();
}

/**
 * Hook to consume notification list, unread count, and mutation methods
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getActiveNotifications());

  const update = useCallback(() => {
    setNotifications(getActiveNotifications());
  }, []);

  useEffect(() => {
    listeners.add(update);
    // Listen for storage changes from other components/tabs
    window.addEventListener('storage', update);
    return () => {
      listeners.delete(update);
      window.removeEventListener('storage', update);
    };
  }, [update]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    refresh: update,
  };
}
