/**
 * Aegis Health — IndexedDB Storage Tier
 * Conforms to Section 8 of PLAN.md
 */

export interface PersistedTelemetrySummary {
  id?: number;
  metric: string;
  sourceId: string;
  sessionId: string;
  timestamp: string; // ISO UTC
  min: number;
  max: number;
  mean: number;
  last: number;
  count: number;
  unit: string;
  provenanceKind: string;
}

export interface PersistedCheckIn {
  id: string;
  missionDay: number;
  timestamp: string;
  capturedAt?: string;
  astronautId: string;
  provenanceKind: 'simulation' | 'device' | 'manual' | 'legacy-unknown';
  indicators: {
    heartRate?: number;
    systolic?: number;
    diastolic?: number;
    bloodSugar?: number;
    bodyTemperature?: number;
    sleepDuration?: number;
    mood?: string;
  };
  overrides?: string[];
  notes?: string;
  completeness: string;
}

const DB_NAME = 'AegisHealthDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDatabase(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Telemetry Summaries (1-second & 1-minute aggregates)
      if (!db.objectStoreNames.contains('telemetry_summaries')) {
        const summaryStore = db.createObjectStore('telemetry_summaries', { keyPath: 'id', autoIncrement: true });
        summaryStore.createIndex('metric', 'metric', { unique: false });
        summaryStore.createIndex('timestamp', 'timestamp', { unique: false });
        summaryStore.createIndex('metric_timestamp', ['metric', 'timestamp'], { unique: false });
      }

      // Check-ins (Daily assessments)
      if (!db.objectStoreNames.contains('check_ins')) {
        const checkInStore = db.createObjectStore('check_ins', { keyPath: 'id' });
        checkInStore.createIndex('missionDay', 'missionDay', { unique: false });
        checkInStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Alert Incidents
      if (!db.objectStoreNames.contains('alert_incidents')) {
        const incidentStore = db.createObjectStore('alert_incidents', { keyPath: 'id' });
        incidentStore.createIndex('severity', 'severity', { unique: false });
        incidentStore.createIndex('triggeredAt', 'triggeredAt', { unique: false });
      }

      // Migration & storage metadata
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn('[IndexedDB] Database upgrade blocked by another active tab.');
    };
  });

  return dbPromise;
}
