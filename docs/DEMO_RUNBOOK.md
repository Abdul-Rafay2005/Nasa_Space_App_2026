# Aegis Health — Judge Demonstration Runbook

## Overview
This runbook guides evaluators and judges through the runtime features of Aegis Health for the NASA Space Apps Challenge 2026.

---

## 1. Quick Launch
- **Web Interface**: `http://localhost:3002/` (or deployed Vercel URL)
- **Default Mode**: `Demo · simulated signals` running automatically in-browser. No manual form submission, backend server, or hardware required for judging.

---

## 2. Step-by-Step Evaluation Flow

### Step 1: Live Monitor & 250 Hz Canvas Waveform (`#/monitor`)
1. Observe the mint-green medical heartbeat waveform moving continuously across the screen at 60 FPS.
2. Note that the displayed BPM (e.g. 72 BPM) updates in real-time from the interval between R-wave peaks in the waveform.
3. Test **Pause Display**: click `Pause`. Notice that the visual trace and displayed vitals freeze with `Display paused · monitoring continues`, while internal telemetry collection proceeds. Click `Resume` to return to the live edge.
4. Test **Scenarios**:
   - Open the Scenario dropdown on the waveform card.
   - Select `Gradual elevation`: watch the target HR smoothly rise toward 98 BPM, transitioning into a yellow advisory state.
   - Select `Recovery`: watch HR gradually return to nominal baseline.
   - Select `Signal dropout`: observe an honest 5-second telemetry gap with `Signal interrupted` indicator, rather than a fabricated flatline.

### Step 2: Interactive Body Map & Digital Twin (`#/body`)
1. Click **Body Overview** in the navigation.
2. Observe the clean 2D anatomical schematic loaded by default with organ indicators and telemetry callouts.
3. Click on the **Heart** or **Brain** callout to view linked biometrics and NASA countermeasures.
4. Click **3D TWIN (360°)**: interact with the Three.js holographic twin by dragging to rotate 360°, zooming in/out, and observing the real-time cardiac pulse synchronized to the active heart rate.

### Step 3: Longitudinal Physiological Trends (`#/trends`)
1. Click **Trends & Analytics** in the navigation.
2. Switch between metrics: **Heart Rate**, **Blood Pressure**, **Glucose**, **Temperature**, **Sleep**, and **Mood**.
3. Toggle time ranges (`15m`, `1h`, `24h`, `7d`, `ALL`) to see calibrated time-series data plotted against clinical green/yellow/red threshold bands.
4. Click **Table** to inspect the accessible, tabular data view.
5. Click the **Baselines** tab to view astronaut baseline comparisons for resting vitals.

### Step 4: Guided 3-Stage Check-in (`#/check-in`)
1. Click **Health Check-in** in the navigation.
2. Click **Capture from Live Stream**: observe all current vital signs automatically snapshot from the telemetry stream.
3. Proceed to **Wellbeing**: select subjective readiness mood and restorative sleep duration.
4. Proceed to **Review & Save**: verify the provenance tag (`SIMULATION` or `DEVICE`) and commit the record to IndexedDB.

### Step 5: Clinical Guidance & SBAR Medical Packet (`#/alerts`)
1. Click **Guidance & Alerts** in the navigation.
2. Review evidence-based clinical protocols with interactive countermeasure checklists.
3. Click **Preview SBAR Packet** to review the structured Situation-Background-Assessment-Recommendation medical report, with one-click clipboard copying and text file download.

### Step 6: Telemetry Sources & Hardware Bridge (`#/sources`)
1. Click **Settings / Sources**.
2. Review the active simulation engine statistics (sample rate, chunks received, buffer occupancy).
3. Notice the **Hardware / Network Gateway** connection option (`ws://localhost:8787/telemetry`) backed by the documented protocol in `docs/SENSOR_PROTOCOL.md`.

