/**
 * Aegis Health — Gateway Wire Protocol Constants
 * Compliant with PLAN.md Section 6.3
 */

export const PROTOCOL_VERSION = 1;
export const DEFAULT_PORT = 8787;

export interface IngressMessage {
  type: 'waveform' | 'measurement' | 'heartbeat' | 'subscribe' | 'descriptor';
  [key: string]: unknown;
}

