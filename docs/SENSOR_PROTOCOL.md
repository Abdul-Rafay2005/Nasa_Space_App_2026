# Aegis Health — Hardware Sensor Protocol Specification

Compliant with Section 6.4 of `PLAN.md`.

## Overview
This document specifies the line-delimited JSON serial streaming protocol for compatible hardware biotelemetry devices (e.g., Arduino, ESP32, Raspberry Pi, or medical-analog microcontrollers).

## Serial Configuration
- **Baud Rate:** 115200 (default)
- **Data Bits:** 8
- **Parity:** None
- **Stop Bits:** 1
- **Framing:** Newline-delimited (`\n` or `\r\n`)

## Message Types

### 1. High-Frequency Electrocardiographic Waveform Chunk
Transmitted every 40 ms containing 10 samples (250 Hz effective rate):
```json
{
  "type": "waveform",
  "chunk": {
    "schemaVersion": 1,
    "id": "wf-10023",
    "sessionId": "ses-hw-01",
    "streamId": "stream-ecg-ch1",
    "astronautId": "astro-alex-vance",
    "sequence": 104,
    "type": "waveform",
    "signal": "ecg",
    "channelLabel": "Lead II",
    "unit": "mV",
    "sampleRateHz": 250,
    "startSampleIndex": 1040,
    "samples": [0.01, 0.02, 0.05, 0.12, 0.45, 1.12, 0.85, 0.20, -0.15, -0.05],
    "measuredAt": "2026-11-13T12:00:00.040Z",
    "quality": "good",
    "context": "rest"
  }
}
```

### 2. Scalar Biometric Measurement
Transmitted at 1 Hz or on spot reading acquisition:
```json
{
  "type": "measurement",
  "measurement": {
    "schemaVersion": 1,
    "id": "meas-hr-552",
    "sessionId": "ses-hw-01",
    "streamId": "stream-hr",
    "astronautId": "astro-alex-vance",
    "sequence": 55,
    "type": "measurement",
    "metric": "heartRate",
    "value": 72,
    "unit": "bpm",
    "measuredAt": "2026-11-13T12:00:01.000Z",
    "quality": "good",
    "context": "rest"
  }
}
```
