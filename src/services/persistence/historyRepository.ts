/**
 * Aegis Health — Unified History Repository
 * Interacts with IndexedDB storage tier and provides export and query primitives.
 * Conforms to Section 8.1, 8.2 and 10.7 of PLAN.md
 */

import { getDatabase, PersistedCheckIn, PersistedTelemetrySummary } from './database';
import { AlertIncident } from '../../types/session';
import { getStoredAssessments, saveAssessmentsToStorage, getAstronautProfile } from '../storage';
import { DailyAssessmentRecord } from '../../types/health';
import { evaluateAllIndicators, calculateOverallHealth } from '../healthStatus';

export interface HistoryExportEnvelope {
  schemaVersion: 1;
  exportedAt: string;
  source: 'Aegis Health Mission Telemetry';
  astronautId: string;
  checkIns: PersistedCheckIn[];
  telemetrySummaries: PersistedTelemetrySummary[];
  alertIncidents: AlertIncident[];
}

export async function getAllCheckIns(): Promise<PersistedCheckIn[]> {
  try {
    const db = await getDatabase();
    const tx = db.transaction('check_ins', 'readonly');
    const store = tx.objectStore('check_ins');
    const req = store.getAll();

    return await new Promise<PersistedCheckIn[]>((resolve, reject) => {
      req.onsuccess = () => {
        const results = req.result as PersistedCheckIn[];
        // Sort newest first
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[HistoryRepository] IndexedDB read failed, falling back to LocalStorage:', err);
    // Fallback to legacy LocalStorage
    const legacy = getStoredAssessments();
    return legacy.map((rec) => ({
      id: rec.id,
      missionDay: rec.missionDay,
      timestamp: rec.timestamp,
      astronautId: rec.astronautId,
      provenanceKind: rec.isDemonstrationData ? 'simulation' : 'legacy-unknown',
      indicators: {
        heartRate: rec.values?.heartRate,
        systolic: rec.values?.systolic,
        diastolic: rec.values?.diastolic,
        bloodSugar: rec.values?.bloodSugar,
        bodyTemperature: rec.values?.bodyTemperature,
        sleepDuration: rec.values?.sleepDuration,
        mood: rec.values?.mood
      },
      notes: rec.values?.notes,
      completeness: 'full-legacy'
    }));
  }
}

export async function saveCheckInRecord(record: PersistedCheckIn): Promise<void> {
  try {
    const db = await getDatabase();
    const tx = db.transaction('check_ins', 'readwrite');
    tx.objectStore('check_ins').put(record);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[HistoryRepository] Failed saving to IndexedDB, saving to LocalStorage fallback:', err);
  }

  // Also maintain dual-write to LocalStorage for backwards compatibility with existing legacy components
  try {
    const parsedValues = {
      heartRate: record.indicators.heartRate ?? 72,
      systolic: record.indicators.systolic ?? 120,
      diastolic: record.indicators.diastolic ?? 80,
      bloodSugar: record.indicators.bloodSugar ?? 90,
      bodyTemperature: record.indicators.bodyTemperature ?? 36.6,
      sleepDuration: record.indicators.sleepDuration ?? 7.5,
      mood: (record.indicators.mood as any) ?? 'good',
      notes: record.notes
    };
    const profile = getAstronautProfile();
    const results = evaluateAllIndicators(parsedValues, profile);
    const overall = calculateOverallHealth(results);

    const legacyRec: DailyAssessmentRecord = {
      id: record.id,
      missionDay: record.missionDay,
      timestamp: record.timestamp,
      astronautId: record.astronautId,
      isDemonstrationData: record.provenanceKind === 'simulation',
      values: parsedValues,
      results,
      overall
    };
    const current = getStoredAssessments();
    saveAssessmentsToStorage([legacyRec, ...current]);
  } catch {
    // Non-blocking
  }
}

export async function saveTelemetrySummary(summary: PersistedTelemetrySummary): Promise<void> {
  try {
    const db = await getDatabase();
    const tx = db.transaction('telemetry_summaries', 'readwrite');
    tx.objectStore('telemetry_summaries').add(summary);
  } catch (err) {
    console.warn('[HistoryRepository] Failed saving telemetry summary:', err);
  }
}

export async function getTelemetrySummaries(metric?: string, limit = 100): Promise<PersistedTelemetrySummary[]> {
  try {
    const db = await getDatabase();
    const tx = db.transaction('telemetry_summaries', 'readonly');
    const store = tx.objectStore('telemetry_summaries');
    const req = metric ? store.index('metric').getAll(metric) : store.getAll();

    return await new Promise<PersistedTelemetrySummary[]>((resolve, reject) => {
      req.onsuccess = () => {
        let results = req.result as PersistedTelemetrySummary[];
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (limit > 0) results = results.slice(0, limit);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function getAllAlertIncidents(): Promise<AlertIncident[]> {
  try {
    const db = await getDatabase();
    const tx = db.transaction('alert_incidents', 'readonly');
    const store = tx.objectStore('alert_incidents');
    const req = store.getAll();

    return await new Promise<AlertIncident[]>((resolve, reject) => {
      req.onsuccess = () => {
        const results = req.result as AlertIncident[];
        results.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function saveAlertIncident(incident: AlertIncident): Promise<void> {
  try {
    const db = await getDatabase();
    const tx = db.transaction('alert_incidents', 'readwrite');
    tx.objectStore('alert_incidents').put(incident);
  } catch (err) {
    console.warn('[HistoryRepository] Failed saving alert incident:', err);
  }
}

export async function exportHistoryEnvelope(astronautId: string): Promise<HistoryExportEnvelope> {
  const [checkIns, summaries, incidents] = await Promise.all([
    getAllCheckIns(),
    getTelemetrySummaries(undefined, 500),
    getAllAlertIncidents()
  ]);

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    source: 'Aegis Health Mission Telemetry',
    astronautId,
    checkIns,
    telemetrySummaries: summaries,
    alertIncidents: incidents
  };
}

export function downloadJsonFile(filename: string, data: unknown): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
