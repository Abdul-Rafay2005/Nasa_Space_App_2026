# Aegis Health — Astronaut Physiological Monitoring Software
### NASA Space Apps Challenge 2026 — Phase 1 Prototype

[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/Framework-React%2018-cyan.svg)](https://react.dev/)
[![Build](https://img.shields.io/badge/Build-Vite%205-purple.svg)](https://vitejs.dev/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%203-38bdf8.svg)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Phase%201-Verified%20Complete-emerald.svg)]()

> **Project Mission:** An autonomous, space-mission-control health dashboard designed for astronauts on long-duration deep space exploration missions (e.g. Lunar Gateway, Mars transit). The software empowers astronauts to record daily biometrics, monitor physiological triage statuses through color-coded indicators, compare telemetry against pre-flight baselines, and receive operational health feedback in communication-delayed environments.

---

## 1. Team & Responsibilities

- **Abdul Rafay (Lead Developer & System Architect):** Phase 1 Lead — Tech stack selection, architecture, core pages, 6-indicator assessment form, status calculation engine, LocalStorage persistence, team integration interfaces.
- **Sameen (Visualization & Guidance Engineer):** Phase 2 Lead — Interactive human body map, dynamic trend charts (Recharts), flight surgeon guidance engine, mission routines.
- **Eman (Medical Research Lead):** Physiological threshold curation, spaceflight flight rules, and clinical literature sourcing.
- **Abdullah (UI/UX Design Lead):** Phase 3 Lead — Visual polish, custom iconography, design system refinement.

---

## 2. Features Implemented in Phase 1

### 🚀 Telemetry Dashboard
- Astronaut profile registration (Commander Alex Vance, Flight Day 142, Artemis Deep Space Transit).
- Pre-flight resting biometric baselines (Resting HR 62 BPM, BP 116/74 mmHg, Core Temp 36.8°C).
- Overall physiological status triage banner with composite health index (0–100 score).
- 6 individual vital indicator summary cards with real-time status and medical explanations.
- Daily protocol compliance detector (tracks whether today's assessment is logged or pending).
- Recent telemetry feed displaying chronological history with detailed modal inspection.

### 📝 Daily Health Assessment Form
- Input form for all 6 vital physiological indicators:
  1. **Resting Heart Rate (BPM)**
  2. **Blood Pressure (Systolic / Diastolic in mmHg)**
  3. **Blood Sugar / Glucose (mg/dL)**
  4. **Core Body Temperature (°C)**
  5. **Sleep Duration (Hours)**
  6. **Mood & Psychological Readiness (Scale: Optimal, Nominal, Fatigued, Stressed, Disoriented)**
- Strict input validation and numerical boundaries.
- Explicit units displayed on every input field.
- Helpful microgravity medical context descriptions for each indicator.
- Instant prefill buttons (**Nominal**, **Warning**, **Critical**) for evaluation and rapid jury demonstration.
- Full validation error feedback and instant submission confirmation.

### 🚦 Health Status Calculation Engine (Green / Yellow / Red)
- **GREEN (Nominal):** Within optimal microgravity adaptation boundaries.
- **YELLOW (Warning):** Sub-nominal departure requiring enhanced surveillance.
- **RED (Urgent Attention):** Critical physiological departure requiring immediate intervention.
- Strict medical triage priority: if any vital parameter is RED, overall status is elevated to RED.
- Clear status badges featuring icons and readable text (accessible for color blindness).
- Plain-language explanation for why each indicator received its status.
- **Isolated Configuration:** All threshold limits reside in `src/config/thresholds.ts` for Eman to update without touching UI code.

### 📜 Telemetry History Archive
- LocalStorage persistence with auto-seeding of realistic demonstration records on first launch.
- Chronological table with Mission Sol, UTC timestamp, overall triage, and all 6 vitals.
- Real-time search by Sol number, symptoms, or clinical notes.
- Status dropdown filter (All, Nominal, Warning, Urgent).
- Detailed assessment breakdown modal with baseline comparison.
- "Export Telemetry" feature downloading complete records as JSON.

### 🔍 Health Overview & Baseline Comparison Matrix
- Side-by-side comparison matrix: Pre-Flight Baseline vs. Latest Reading vs. Operational Target.
- Full breakdown of Green, Yellow, and Red numerical thresholds for all 6 indicators.
- Documented configuration notes for medical researchers.

### 🧭 Mission Navigation & Phase 2 Canvases
- Responsive dark space-themed layout with digital UTC clock and Mission Elapsed Time (MET).
- Active Phase 1 navigation (Dashboard, Assessment, History, Overview).
- Planned Phase 2 canvases assigned to Sameen (Interactive Body Map, Dynamic Trend Charts, Mission Routine, Guidance Engine).

---

## 3. Technology Stack

- **Framework:** React 18.3
- **Language:** TypeScript 5.6
- **Build Tool:** Vite 5.4
- **Styling:** Tailwind CSS 3.4 (with customized space dark-mode palette & neon glows)
- **Icons:** Lucide React
- **Charts:** Recharts 2.13 (prepared and configured for Sameen's Phase 2 trends)
- **Storage:** Browser LocalStorage (with seeded mock records and full CRUD)

---

## 4. Project Folder Structure

```
nasa_2026/
├── dist/                      # Production build output
├── docs/                      # Documentation
│   ├── TEAM_INTEGRATION.md    # Integration guide for Sameen (Phase 2)
│   ├── THRESHOLDS_GUIDE.md    # Medical threshold guide for Eman
│   └── PHASE1_COMPLETION_REPORT.md # Comprehensive Phase 1 audit report
├── scripts/                   # Automated build & test runner scripts
│   ├── npm_build.cmd          # Runs production build
│   ├── npm_runner.cmd         # Package runner
│   └── test_engine.mjs        # 35 automated physiological logic checks
├── src/
│   ├── components/
│   │   ├── common/            # Reusable UI widgets
│   │   │   ├── Card.tsx       # Space-cockpit glassmorphism card
│   │   │   ├── Modal.tsx      # Accessible dialog overlay
│   │   │   └── StatusBadge.tsx # Accessible Green/Yellow/Red badge
│   │   ├── dashboard/         # Dashboard widgets
│   │   │   ├── AstronautProfileCard.tsx
│   │   │   ├── OverallHealthCard.tsx
│   │   │   ├── IndicatorSummaryCard.tsx
│   │   │   ├── DailyCompletionStatus.tsx
│   │   │   └── RecentActivityList.tsx
│   │   ├── forms/             # Form inputs
│   │   │   └── AssessmentInput.tsx
│   │   ├── health/            # Health modals & detailed views
│   │   │   └── AssessmentDetailModal.tsx
│   │   └── layout/            # Application chrome
│   │       ├── AppLayout.tsx
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx
│   ├── config/
│   │   └── thresholds.ts      # Provisional demonstration thresholds (for Eman)
│   ├── data/
│   │   └── mockData.ts        # Realistic sample astronaut records
│   ├── pages/
│   │   ├── Dashboard.tsx      # Main telemetry overview
│   │   ├── DailyAssessment.tsx # 6-indicator daily telemetry form
│   │   ├── HealthHistory.tsx  # Archived records log
│   │   ├── HealthOverview.tsx # Baseline comparison & threshold matrix
│   │   └── Placeholders.tsx   # Canvases for Sameen's Phase 2 features
│   ├── services/
│   │   ├── healthStatus.ts    # Physiological calculation engine
│   │   └── storage.ts         # LocalStorage persistence service
│   ├── types/
│   │   └── health.ts          # Core TypeScript interfaces
│   ├── App.tsx                # Master state & routing controller
│   ├── index.css              # Tailwind directives & cockpit scrollbars
│   └── main.tsx               # Application entrypoint
├── index.html                 # HTML shell
├── package.json               # Dependencies & scripts
├── tailwind.config.js         # Space color scheme & custom shadows
├── tsconfig.json              # Strict TypeScript configuration
└── vite.config.ts             # Vite development & build setup
```

---

## 5. Getting Started & Running the Application

### Prerequisites
- Node.js (v18 or v20+)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd nasa_2026

# Install dependencies
npm install
```

### Development Server
```bash
# Start Vite development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Verification
```bash
# Compile TypeScript & bundle production assets
npm run build

# Preview production build
npm run preview
```

### Automated Logic Testing
Run the automated test suite verifying all 35 physiological status checks and triage rules:
```bash
node scripts/test_engine.mjs
```

---

## 6. Medical Disclaimer

> **IMPORTANT NOTICE:**  
> Aegis Health is an engineering prototype developed for the **NASA Space Apps Challenge 2026**. The health indicators, provisional demonstration thresholds, and calculated triage statuses represent simulated engineering models and **do not provide medical diagnosis, clinical advice, or replace certified NASA Flight Surgeons or certified spaceflight medical equipment**.
