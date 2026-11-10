# Health Threshold Configuration Guide
**NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software**  
**Lead Developer:** Abdul Rafay (Phase 1 Architect)  
**Medical Research Lead:** Eman  

---

## 1. Overview for Eman

Hi Eman! To ensure that our software does not rely on hardcoded clinical numbers in UI components, I have isolated all physiological threshold criteria into a single, dedicated configuration file:

📁 **Location:** `src/config/thresholds.ts`

Currently, this file contains **Provisional Demonstration Thresholds** created solely for software testing and UI demonstrations. Your role is to replace these provisional boundaries with verified, literature-sourced thresholds from NASA's Human Research Program (HRP) Evidence Books, Space Flight Medical Operations (SFMO) Flight Rules, or spaceflight analog studies.

---

## 2. Threshold Architecture

Every vital indicator supports three primary status tiers:
- **GREEN (Nominal):** Normal operational range for an astronaut adapted to microgravity.
- **YELLOW (Warning):** Borderline reading requiring enhanced monitoring or countermeasure adjustments.
- **RED (Urgent Attention):** Critical physiological departure demanding immediate flight surgeon notification.

### Data Structure Schema

```typescript
export interface IndicatorThresholdSet {
  name: string;
  unit: string;
  green: { min: number; max: number };
  yellowLow?: { min: number; max: number };
  yellowHigh?: { min: number; max: number };
  redCriticalLow: number;
  redCriticalHigh: number;
  description: string;
  medicalContext: string;
}
```

---

## 3. How to Update Values

Open `src/config/thresholds.ts` and update the relevant object properties:

### 1. Resting Heart Rate (BPM)
```typescript
heartRate: {
  name: 'Heart Rate',
  unit: 'BPM',
  green: { min: 55, max: 90 },       // Update with your researched nominal min/max
  yellowLow: { min: 45, max: 54 },   // Mild bradycardia range
  yellowHigh: { min: 91, max: 110 },  // Mild tachycardia range
  redCriticalLow: 44,                // Critical bradycardia threshold
  redCriticalHigh: 111,              // Critical tachycardia threshold
  medicalContext: 'Your medical rationale and citation here...',
}
```

### 2. Blood Pressure (mmHg)
Separated into independent systolic and diastolic thresholds to detect isolated systolic hypertension or orthostatic hypotension:
```typescript
bloodPressure: {
  systolic: {
    green: { min: 95, max: 125 },
    yellowLow: { min: 85, max: 94 },
    yellowHigh: { min: 126, max: 140 },
    redCriticalLow: 84,
    redCriticalHigh: 141,
  },
  diastolic: {
    green: { min: 60, max: 80 },
    yellowLow: { min: 50, max: 59 },
    yellowHigh: { min: 81, max: 90 },
    redCriticalLow: 49,
    redCriticalHigh: 91,
  },
  medicalContext: 'Your medical citation here...',
}
```

### 3. Blood Sugar (mg/dL)
Capillary blood glucose monitoring:
```typescript
bloodSugar: {
  green: { min: 70, max: 115 },
  yellowLow: { min: 60, max: 69 },
  yellowHigh: { min: 116, max: 140 },
  redCriticalLow: 59,
  redCriticalHigh: 141,
  medicalContext: 'Your medical citation here...',
}
```

### 4. Core Body Temperature (°C)
Accounting for reduced convective cooling in microgravity ("space fever"):
```typescript
bodyTemperature: {
  green: { min: 36.3, max: 37.3 },
  yellowLow: { min: 35.5, max: 36.2 },
  yellowHigh: { min: 37.4, max: 38.0 },
  redCriticalLow: 35.4,
  redCriticalHigh: 38.1,
  medicalContext: 'Your medical citation here...',
}
```

### 5. Sleep Duration (Hours)
Circadian rhythm and cognitive alertness requirements:
```typescript
sleepDuration: {
  green: { min: 7.0, max: 9.0 },
  yellowLow: { min: 5.5, max: 6.9 },
  yellowHigh: { min: 9.1, max: 11.0 },
  redCriticalLow: 5.4,
  redCriticalHigh: 11.1,
  medicalContext: 'Your medical citation here...',
}
```

### 6. Mood & Psychological Readiness Map
```typescript
moodMap: {
  excellent: { status: 'GREEN', description: 'Optimal readiness' },
  good: { status: 'GREEN', description: 'Nominal morale' },
  fatigued: { status: 'YELLOW', description: 'Physical / cognitive fatigue' },
  stressed: { status: 'YELLOW', description: 'Acute mission stress' },
  disoriented: { status: 'RED', description: 'Space Adaptation Syndrome symptoms' },
}
```

---

## 4. Verification

After updating `src/config/thresholds.ts`, run the automated logic test to verify your new boundaries:

```bash
npm run build
node scripts/test_engine.mjs
```

The UI (`HealthOverview.tsx` and `IndicatorSummaryCard.tsx`) will automatically reflect the updated values across the entire application without touching any frontend code!

