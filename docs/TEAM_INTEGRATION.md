# Team Integration Guide — Phase 2 Hand-off
**NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software**  
**Lead Developer:** Abdul Rafay (Phase 1 Architect)  
**Assigned Developer:** Sameen (Phase 2 Visualizations & Engines)  

---

## 1. Overview for Sameen

Hi Sameen! As Lead Developer, I have architected the Phase 1 application so you can smoothly plug in your assigned features without needing to restructure or rewrite existing code. 

All core TypeScript data types, state persistence mechanisms, and placeholder canvases are already in place.

Your assigned responsibilities for Phase 2 are:
1. **Dynamic Health Trend Charts**
2. **Interactive Human Body Visualization**
3. **Flight Surgeon Guidance Engine**
4. **Mission Routine & Countermeasure Features**

---

## 2. Core Data Contracts Ready for Use

### A. Daily Assessment Records
All historical and real-time assessments adhere to `DailyAssessmentRecord` defined in `src/types/health.ts`:

```typescript
export interface DailyAssessmentRecord {
  id: string;
  timestamp: string; // ISO 8601
  missionDay: number; // Sol / Flight Day number
  astronautId: string;
  values: {
    heartRate: number; // BPM
    systolic: number; // mmHg
    diastolic: number; // mmHg
    bloodSugar: number; // mg/dL
    bodyTemperature: number; // °C
    sleepDuration: number; // Hours
    mood: 'excellent' | 'good' | 'fatigued' | 'stressed' | 'disoriented';
    notes?: string;
  };
  results: {
    heartRate: IndicatorResult;
    bloodPressure: IndicatorResult;
    bloodSugar: IndicatorResult;
    bodyTemperature: IndicatorResult;
    sleepDuration: IndicatorResult;
    mood: IndicatorResult;
  };
  overall: OverallHealthResult;
}
```

### B. Accessing & Modifying Telemetry Data
Import the storage service directly in your components:

```typescript
import { getStoredAssessments, getLatestAssessment, saveAssessment } from '../services/storage';

// Fetch all historical logs (sorted newest first)
const history = getStoredAssessments();

// Fetch latest logged record
const latest = getLatestAssessment();
```

---

## 3. Implementation Blueprint for Your Features

### Feature 1: Dynamic Health Trend Charts
- **Library Installed:** `recharts` is already installed and listed in `package.json`.
- **Target Page:** `src/pages/Placeholders.tsx` has a canvas ready at route `'analytics'`. You can create `src/components/analytics/HealthTrendChart.tsx` and mount it directly.
- **Data Shape for Recharts:**
  ```typescript
  const chartData = history.map(rec => ({
    sol: `Sol ${rec.missionDay}`,
    heartRate: rec.values.heartRate,
    systolic: rec.values.systolic,
    diastolic: rec.values.diastolic,
    bloodSugar: rec.values.bloodSugar,
    temperature: rec.values.bodyTemperature,
    sleep: rec.values.sleepDuration,
  })).reverse();
  ```

### Feature 2: Interactive Human Body Visualization
- **Target Page:** Currently routed via `'body-map'` in `Sidebar.tsx`.
- **Integration Point:** Drive organ heatmaps by mapping indicator statuses:
  - **Cardiovascular System (Heart & Arteries):** Driven by `results.heartRate.status` and `results.bloodPressure.status`.
  - **Metabolic / Endocrine (Pancreas / Liver):** Driven by `results.bloodSugar.status`.
  - **Thermoregulatory (Full Body Glow):** Driven by `results.bodyTemperature.status`.
  - **Neurological / Vestibular (Head & Sensory):** Driven by `results.mood.status` (detecting Space Adaptation Syndrome).
- **Styling:** Use Tailwind CSS neon glow filters: `shadow-neon-green`, `shadow-neon-yellow`, `shadow-neon-red`.

### Feature 3: Flight Surgeon Guidance Engine
- **Target Page:** Routed via `'guidance'` in `Sidebar.tsx`.
- **Integration Point:** `src/services/healthStatus.ts` already returns an `overall.recommendationSnippet` and indicator-level `reason` strings.
- **Extension:** You can build a rule-based engine in `src/services/guidanceEngine.ts` that takes `DailyAssessmentRecord` and generates:
  - Aerobic / resistive exercise countermeasure adjustments.
  - Hydration and electrolyte prescription protocols.
  - Restorative sleep hygiene alerts.

### Feature 4: Mission Routine & Countermeasure Features
- **Target Page:** Routed via `'routine'` in `Sidebar.tsx`.
- **Integration Point:** Tie daily exercise compliance (e.g. ARED resistive workouts and T2 treadmill logs) to `missionDay` from `profile.currentMissionDay`.

---

## 4. UI Design Consistency

Please follow the mission-control dark space aesthetic already implemented:
- **Backgrounds:** `bg-space-950` (#060913), `bg-space-900` (#0a0e1a), `bg-space-850` (#0e1526).
- **Cards:** Wrap your widgets in `<Card glow="cyan" title="..." subtitle="...">...</Card>` from `src/components/common/Card.tsx`.
- **Badges:** Use `<StatusBadge status={status} label={label} />` from `src/components/common/StatusBadge.tsx` for accessible, color-blind safe status indicators.
- **Borders & Accents:** Cyan neon accents (`border-cyan-500/30`, `text-cyan-400`).

Feel free to reach out to me (Abdul Rafay) if you have any questions or need additional service endpoints!
