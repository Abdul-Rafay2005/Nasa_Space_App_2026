/**
 * Aegis Health — Telemetry Store Singleton & React Hooks
 * Compliant with PLAN.md Section 4.1
 */

import { useSyncExternalStore, useEffect, useState } from 'react';
import { TelemetryController } from '../services/telemetry/TelemetryController';
import { TelemetrySnapshot } from '../types/telemetry';

// Global Singleton Telemetry Controller
export const telemetryController = new TelemetryController();

// Automatically start simulation on initialization
telemetryController.start();

/**
 * Hook to consume live snapshot updates
 */
export function useTelemetrySnapshot(): TelemetrySnapshot {
  return useSyncExternalStore(
    (onStoreChange) => telemetryController.subscribeSnapshot(onStoreChange),
    () => telemetryController.getSnapshot()
  );
}

/**
 * Hook to listen for synchronized cardiac beat pulses
 */
export function useHeartbeatSync(callback: (bpm: number) => void): void {
  useEffect(() => {
    return telemetryController.subscribeBeat(callback);
  }, [callback]);
}

/**
 * Hook to access and control simulation scenarios and sources
 */
export function useTelemetryControls() {
  const [currentScenario, setCurrentScenario] = useState<string>(telemetryController.getScenarioId());

  const setScenario = (scenarioId: string) => {
    telemetryController.setScenario(scenarioId);
    setCurrentScenario(scenarioId);
  };

  return {
    currentScenario,
    setScenario,
    start: () => telemetryController.start(),
    stop: () => telemetryController.stop(),
    ringBuffer: telemetryController.getRingBuffer(),
  };
}
