/**
 * Aegis Health — Idempotent Migration from LocalStorage V1 to IndexedDB
 * Conforms to Section 8.2 of PLAN.md
 */

import { getDatabase, PersistedCheckIn } from './database';
import { DailyAssessmentRecord } from '../../types/health';

const ASSESSMENTS_STORAGE_KEY = 'aegis_astronaut_health_records_v1';
const MIGRATION_DONE_KEY = 'aegis_migration_v1_done';

export interface MigrationReport {
  migratedCount: number;
  quarantinedCount: number;
  skippedCount: number;
  success: boolean;
  message: string;
}

export async function runV1Migration(force = false): Promise<MigrationReport> {
  const report: MigrationReport = {
    migratedCount: 0,
    quarantinedCount: 0,
    skippedCount: 0,
    success: true,
    message: ''
  };

  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      report.message = 'Environment does not support localStorage';
      return report;
    }

    if (!force && localStorage.getItem(MIGRATION_DONE_KEY) === 'true') {
      report.message = 'Migration already executed. Skipped.';
      return report;
    }

    const raw = localStorage.getItem(ASSESSMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MIGRATION_DONE_KEY, 'true');
      report.message = 'No legacy records found to migrate.';
      return report;
    }

    let records: unknown;
    try {
      records = JSON.parse(raw);
    } catch {
      report.quarantinedCount++;
      report.success = false;
      report.message = 'Corrupted JSON in legacy storage key.';
      return report;
    }

    if (!Array.isArray(records)) {
      report.quarantinedCount++;
      report.success = false;
      report.message = 'Legacy storage was not an array of records.';
      return report;
    }

    const db = await getDatabase();
    const tx = db.transaction(['check_ins', 'metadata'], 'readwrite');
    const checkInStore = tx.objectStore('check_ins');

    for (const item of records) {
      const rec = item as Partial<DailyAssessmentRecord>;
      if (!rec || !rec.id || typeof rec.missionDay !== 'number') {
        report.quarantinedCount++;
        continue;
      }

      // Map provenance honestly per PLAN.md Section 8.2:
      // isDemonstrationData: true -> 'simulation'
      // false/absent -> 'legacy-unknown' ("Legacy manual / origin unverified")
      const provenanceKind: 'simulation' | 'legacy-unknown' = rec.isDemonstrationData
        ? 'simulation'
        : 'legacy-unknown';

      const entry: PersistedCheckIn = {
        id: rec.id,
        missionDay: rec.missionDay,
        timestamp: rec.timestamp || new Date().toISOString(),
        astronautId: rec.astronautId || 'ASTRO-2026-ALPHA',
        provenanceKind,
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
      };

      checkInStore.put(entry);
      report.migratedCount++;
    }

    const metaStore = tx.objectStore('metadata');
    metaStore.put({
      key: 'v1_migration',
      migratedAt: new Date().toISOString(),
      report
    });

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    localStorage.setItem(MIGRATION_DONE_KEY, 'true');
    report.message = `Successfully migrated ${report.migratedCount} legacy records to IndexedDB.`;
    return report;
  } catch (err) {
    report.success = false;
    report.message = `Migration failed: ${(err as Error).message}`;
    return report;
  }
}

