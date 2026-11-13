# Aegis Health — Telemetry Architecture Specification

Compliant with Section 4 and Section 15.2 of `PLAN.md`.

## Architectural Topology

```text
[ Browser Simulation Worker ] ──┐
                                ├──> [ TelemetryController ] ──> [ WaveformRingBuffer (7500) ] ──> [ Canvas 2D (60 FPS) ]
[ Hardware Device / COM Port ] ──┤           │
               │                │           └──> [ Immutable Snapshots (1 Hz) ] ───> [ React UI Views ]
               v                │
[ Gateway: ws://*:8787 ] ───────┘
```

## Core Components
1. **WaveformRingBuffer (`src/lib/ringBuffer.ts`)**:
   - `Float32Array` ring buffer holding 30 seconds of high-resolution waveform data (7,500 samples at 250 Hz).
   - Tracks isoelectric gaps, discontinuities, and quality tags without fabricating lines across missing data.

2. **TelemetryController (`src/services/telemetry/TelemetryController.ts`)**:
   - Central ingestion coordinator decoupling high-frequency 250 Hz data ingestion from React renders.
   - Broadcasts synchronized cardiac beat events for UI pulse animations.

3. **Adapters (`SimulationSource` & `WebSocketSource`)**:
   - `SimulationSource`: 100% in-browser offline simulation streaming 10-sample chunks every 40 ms with RR interval modulation.
   - `WebSocketSource`: Connects to local or remote WebSocket telemetry gateways (`ws://localhost:8787/telemetry`) with automatic reconnect backoff.
