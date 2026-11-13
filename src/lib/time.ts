/**
 * Aegis Health — Time Utilities
 * Compliant with PLAN.md Section 5.4
 */

export function getNowIsoUtc(): string {
  return new Date().toISOString();
}

export function formatUtcTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toTimeString().split(' ')[0] + ' UTC';
  } catch {
    return '00:00:00 UTC';
  }
}

export function getAgeInSeconds(isoString: string | null): number | null {
  if (!isoString) return null;
  try {
    const elapsedMs = Date.now() - new Date(isoString).getTime();
    return Math.max(0, Math.floor(elapsedMs / 1000));
  } catch {
    return null;
  }
}

export function formatAge(seconds: number | null): string {
  if (seconds === null) return 'No data';
  if (seconds < 2) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

