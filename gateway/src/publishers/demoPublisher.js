/**
 * Aegis Health — Streaming Network Test Publisher
 * Compliant with PLAN.md Section 6.3 & 6.4
 */

import { WebSocket } from 'ws';

const GATEWAY_URL = process.env.GATEWAY_URL || 'ws://localhost:8787/publish';
console.log(`[Publisher] Connecting to Gateway at ${GATEWAY_URL}...`);

const ws = new WebSocket(GATEWAY_URL);

ws.on('open', () => {
  console.log('[Publisher] Connected to Gateway. Starting live telemetry broadcast...');
  let seq = 0;
  let bpm = 74;

  // Broadcast waveform chunks every 40ms (250 Hz)
  setInterval(() => {
    const nowIso = new Date().toISOString();
    const samples = [];
    for (let i = 0; i < 10; i++) {
      // Clean synthetic heartbeat pulse
      const t = (seq * 10 + i) % 250;
      let val = 0;
      if (t >= 80 && t < 100) {
        val = Math.sin(((t - 80) / 20) * Math.PI) * 1.15; // R peak
      } else if (t >= 140 && t < 170) {
        val = Math.sin(((t - 140) / 30) * Math.PI) * 0.25; // T wave
      }
      samples.push(val);
    }

    const chunkMsg = {
      type: 'waveform',
      chunk: {
        schemaVersion: 1,
        id: `chunk-${seq++}`,
        sessionId: 'gateway-live-session',
        streamId: 'stream-hardware-ecg',
        astronautId: 'astro-alex-vance',
        sequence: seq,
        type: 'waveform',
        signal: 'ecg',
        channelLabel: 'Hardware Lead II',
        unit: 'mV',
        sampleRateHz: 250,
        startSampleIndex: seq * 10,
        samples,
        measuredAt: nowIso,
        receivedAt: nowIso,
        quality: 'good',
        context: 'rest',
        provenance: { kind: 'device', sourceId: 'hardware-serial-stream' },
      },
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(chunkMsg));
    }
  }, 40);

  // Broadcast scalar measurements every 1 second
  setInterval(() => {
    const nowIso = new Date().toISOString();
    bpm = 72 + Math.floor(Math.sin(Date.now() / 5000) * 4);

    const hrMsg = {
      type: 'measurement',
      measurement: {
        schemaVersion: 1,
        id: `meas-hr-${Date.now()}`,
        sessionId: 'gateway-live-session',
        streamId: 'stream-hardware-hr',
        astronautId: 'astro-alex-vance',
        sequence: seq++,
        type: 'measurement',
        metric: 'heartRate',
        value: bpm,
        unit: 'bpm',
        measuredAt: nowIso,
        receivedAt: nowIso,
        quality: 'good',
        context: 'rest',
        provenance: { kind: 'device', sourceId: 'hardware-serial-stream' },
      },
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(hrMsg));
    }
  }, 1000);
});

ws.on('error', (err) => {
  console.error('[Publisher] Gateway connection error:', err.message);
});
