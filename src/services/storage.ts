/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Storage Service (LocalStorage Prototype)
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 * 
 * Manages assessment records and crew profile in browser LocalStorage.
 * Auto-seeds realistic sample demonstration data if empty.
 */

import { DailyAssessmentRecord, AstronautProfile } from '../types/health';
import { SAMPLE_ASTRONAUT_PROFILE, SAMPLE_ASSESSMENT_HISTORY } from '../data/mockData';

const ASSESSMENTS_STORAGE_KEY = 'aegis_astronaut_health_records_v1';
const PROFILE_STORAGE_KEY = 'aegis_astronaut_profile_v1';

/**
 * Retrieves all stored assessment records (newest first).
 * Automatically seeds sample demonstration data on first launch.
 */
export function getStoredAssessments(): DailyAssessmentRecord[] {
  try {
    const raw = localStorage.getItem(ASSESSMENTS_STORAGE_KEY);
    if (!raw) {
      // Seed with initial realistic demonstration records
      saveAssessmentsToStorage(SAMPLE_ASSESSMENT_HISTORY);
      return SAMPLE_ASSESSMENT_HISTORY;
    }
    const parsed = JSON.parse(raw) as DailyAssessmentRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveAssessmentsToStorage(SAMPLE_ASSESSMENT_HISTORY);
      return SAMPLE_ASSESSMENT_HISTORY;
    }
    return parsed;
  } catch (err) {
    console.error('[Aegis Storage] Failed reading records from LocalStorage:', err);
    return SAMPLE_ASSESSMENT_HISTORY;
  }
}

/**
 * Saves full array of records to LocalStorage
 */
export function saveAssessmentsToStorage(records: DailyAssessmentRecord[]): void {
  try {
    localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('[Aegis Storage] Failed saving records to LocalStorage:', err);
  }
}

/**
 * Adds a new daily assessment record at the top of history
 */
export function saveAssessment(record: DailyAssessmentRecord): DailyAssessmentRecord[] {
  const current = getStoredAssessments();
  const updated = [record, ...current];
  saveAssessmentsToStorage(updated);
  return updated;
}

/**
 * Finds an assessment by unique ID
 */
export function getAssessmentById(id: string): DailyAssessmentRecord | undefined {
  const all = getStoredAssessments();
  return all.find((item) => item.id === id);
}

/**
 * Gets the most recent submitted assessment record
 */
export function getLatestAssessment(): DailyAssessmentRecord | undefined {
  const all = getStoredAssessments();
  return all.length > 0 ? all[0] : undefined;
}

/**
 * Checks if an assessment was completed on the current mission day
 */
export function hasCompletedTodayAssessment(currentMissionDay: number): boolean {
  const latest = getLatestAssessment();
  if (!latest) return false;
  return latest.missionDay === currentMissionDay;
}

/**
 * Retrieves the astronaut profile
 */
export function getAstronautProfile(): AstronautProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(SAMPLE_ASTRONAUT_PROFILE));
      return SAMPLE_ASTRONAUT_PROFILE;
    }
    return JSON.parse(raw) as AstronautProfile;
  } catch (err) {
    console.error('[Aegis Storage] Failed reading profile from LocalStorage:', err);
    return SAMPLE_ASTRONAUT_PROFILE;
  }
}

/**
 * Updates the astronaut profile
 */
export function saveAstronautProfile(profile: AstronautProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('[Aegis Storage] Failed saving profile to LocalStorage:', err);
  }
}

/**
 * Resets storage back to initial sample demonstration data
 */
export function resetToSampleData(): DailyAssessmentRecord[] {
  saveAssessmentsToStorage(SAMPLE_ASSESSMENT_HISTORY);
  saveAstronautProfile(SAMPLE_ASTRONAUT_PROFILE);
  return SAMPLE_ASSESSMENT_HISTORY;
}

/**
 * Completely clears all assessment records (useful for fresh testing)
 */
export function clearAllAssessments(): void {
  localStorage.removeItem(ASSESSMENTS_STORAGE_KEY);
}

