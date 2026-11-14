# Aegis Health — Visual Design System Specification

## 1. Overview and Aesthetic Principles

The Aegis Health visual language is built for operational mission readiness. It reflects the quiet precision of aerospace mission control instrumentation and high-reliability cockpit interfaces:
- **Restrained dark palette**: Deep graphite backgrounds (`#090C12`, `#121722`) rather than pure neon or oversaturated gaming aesthetics.
- **Purposeful motion**: Subtle transitions (80–240ms) following `cubic-bezier(0.2, 0.8, 0.2, 1)` that never distract or cause disorientation. Full support for `prefers-reduced-motion`.
- **Typographic precision**: Tabular numerical displays for changing readings, monospaced metadata for timestamps and provenance tags, and high-legibility system typography.
- **Colorblind-safe non-visual reliance**: Every triage status communicates through distinct geometric markers (Circle = Nominal, Triangle = Warning, Diamond = Critical).

---

## 2. Design Tokens (`src/styles/tokens.css`)

### Color Surfaces & Tones
| Token | Hex Value | Purpose |
|---|---|---|
| `--surface-app` | `#090C12` | Root application background |
| `--surface-panel` | `#121722` | Cards, primary containers, telemetry panels |
| `--surface-raised` | `#1A2230` | Active tabs, hovered controls, interactive drawers |
| `--border-subtle` | `#2C384A` | Structural borders and dividers |
| `--text-primary` | `#F4F7FB` | Primary headings, numeric vital readings |
| `--text-secondary` | `#AAB7C9` | Secondary captions, units, and timestamps |
| `--accent` | `#80AEFF` | Focus rings, interactive highlights, primary actions |
| `--signal` | `#72E2BE` | Medical waveform trace (mint green hospital monitor) |

### Status Envelopes
| Status | Token | Value | Accessible Symbol | Meaning |
|---|---|---|---|---|
| Nominal | `--status-nominal` | `#10B981` | ● (Circle) | Within microgravity adaptation bounds |
| Warning | `--status-warning` | `#F59E0B` | ▲ (Triangle) | Mild adaptation drift, monitoring advised |
| Critical | `--status-critical` | `#EF4444` | ◆ (Diamond) | Exceeds flight thresholds, action required |
| Awaiting | `--status-unknown` | `#AAB7C9` | ◌ (Hollow) | Sensor stream disconnected or warming up |

---

## 3. Component Hierarchy

1. **Monitor (Live Dashboard)**: 60 FPS HTML5 Canvas waveform trace with lead-head glow, tabular BPM readout, live vital cards with freshness timers, and astronaut operational status.
2. **Interactive Body Map**: Clean 2D SVG schematic with anatomical system callouts by default; 3D holographic digital twin with 360° drag rotation and WebGL lifecycle management.
3. **Longitudinal Trends**: Recharts multi-interval explorer (`15m`, `1h`, `24h`, `7d`, `All`), dynamic threshold reference areas, and accessible data table toggles.
4. **Daily Check-in**: 3-stage guided flow (Capture Biometrics → Wellbeing → Review & Save) with live stream snapshot button.
5. **Guidance & Alerts**: Clinical decision-support rules, interactive countermeasure checklists, local incident acknowledgement, and honest SBAR summary packet exports.

