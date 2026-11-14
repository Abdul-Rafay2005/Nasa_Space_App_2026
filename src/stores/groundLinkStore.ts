/**
 * Aegis Health — Ground Communication Link State & Mars Delay Mode
 * Conforms to Section 3 of Hackathon Research Report (NASA EIMO 2023 & Tempus Pro)
 */

import { useState, useEffect } from 'react';

export interface GroundLinkState {
  isEarthConnected: boolean;
  delayMinutes: number;
  mode: 'direct' | 'mars_delay' | 'blackout';
  offlineSince: string | null;
  queuedTelemetryCount: number;
  lastSyncTime: string | null;
}

const STORAGE_KEY = 'aegis_ground_link_state_v1';

let globalState: GroundLinkState = {
  isEarthConnected: true,
  delayMinutes: 0,
  mode: 'direct',
  offlineSince: null,
  queuedTelemetryCount: 0,
  lastSyncTime: new Date().toISOString(),
};

const listeners = new Set<(state: GroundLinkState) => void>();

function notify() {
  listeners.forEach((l) => l({ ...globalState }));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  } catch {
    // Non-blocking
  }
}

export function setGroundLinkMode(mode: 'direct' | 'mars_delay' | 'blackout') {
  if (mode === 'direct') {
    globalState = {
      ...globalState,
      isEarthConnected: true,
      delayMinutes: 0,
      mode: 'direct',
      offlineSince: null,
      queuedTelemetryCount: 0,
      lastSyncTime: new Date().toISOString(),
    };
  } else if (mode === 'mars_delay') {
    globalState = {
      ...globalState,
      isEarthConnected: false,
      delayMinutes: 22,
      mode: 'mars_delay',
      offlineSince: globalState.offlineSince || new Date().toISOString(),
      queuedTelemetryCount: globalState.queuedTelemetryCount + 1,
    };
  } else {
    globalState = {
      ...globalState,
      isEarthConnected: false,
      delayMinutes: 999,
      mode: 'blackout',
      offlineSince: globalState.offlineSince || new Date().toISOString(),
      queuedTelemetryCount: globalState.queuedTelemetryCount + 1,
    };
  }
  notify();
}

export function useGroundLink(): [GroundLinkState, (mode: 'direct' | 'mars_delay' | 'blackout') => void] {
  const [state, setState] = useState<GroundLinkState>(globalState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return [state, setGroundLinkMode];
}
