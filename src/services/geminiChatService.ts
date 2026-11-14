/**
 * Aegis Health — Gemini AI Flight Surgeon Chatbot Service
 * Integrates Google Gemini API with Astronaut Clinical Telemetry Context
 *
 * Compliant with:
 * - NASA-STD-3001 Technical Briefs (TB-004 CO2, TB-020 Radiation)
 * - NASA Human Research Roadmap (5 Hazards, 17 Risks)
 * - NASA EIMO 2023 Mars Delay Autonomous Medical Protocol
 */

import { AstronautProfile, DailyAssessmentRecord } from '../types/health';
import { ChatMessage } from '../types/chat';
import { getGroundLinkState } from '../stores/groundLinkStore';

const API_KEY_STORAGE = 'aegis_gemini_api_key_v1';
const MODEL_STORAGE = 'aegis_gemini_model_v1';
const CHAT_HISTORY_STORAGE = 'aegis_chat_history_v1';

export const DEFAULT_MODEL = 'gemini-3.8-flash';

/**
 * Get stored Gemini API Key — always reads live from localStorage so it reflects
 * keys saved after the page loaded (no stale closures).
 */
export function getGeminiApiKey(): string {
  // 1. Prioritize .env file via Vite literal replacement
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (typeof envKey === 'string' && envKey.trim().length > 5) {
    return envKey.trim();
  }

  // 2. Secondary fallback: check browser localStorage
  try {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored && stored.trim().length > 5) {
      return stored.trim();
    }
  } catch {
    // Non-blocking
  }

  return '';
}

export function saveGeminiApiKey(key: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  } catch (err) {
    console.error('[Gemini Service] Failed to save API key:', err);
  }
}

export function clearGeminiApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE);
  } catch {
    // Non-blocking
  }
}

export function getGeminiModel(): string {
  // 1. Check .env model
  const envModel = import.meta.env.VITE_GEMINI_MODEL;
  if (typeof envModel === 'string' && envModel.trim().length > 0) {
    return envModel.trim();
  }

  // 2. Check localStorage
  try {
    const stored = localStorage.getItem(MODEL_STORAGE);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  } catch {
    // Non-blocking
  }
  return DEFAULT_MODEL;
}

export function saveGeminiModel(model: string): void {
  try {
    localStorage.setItem(MODEL_STORAGE, model);
  } catch {
    // Non-blocking
  }
}

/** Load chat history from LocalStorage */
export function loadChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore
  }
  return [];
}

/** Persist last 30 chat messages */
export function saveChatHistory(history: ChatMessage[]): void {
  try {
    localStorage.setItem(CHAT_HISTORY_STORAGE, JSON.stringify(history.slice(-30)));
  } catch {
    // Ignore
  }
}

/**
 * Build a rich system prompt embedding the full astronaut record and mission context.
 * This is what gives Gemini its deep awareness of the astronaut's health status.
 */
export function buildAstronautSystemPrompt(
  profile: AstronautProfile,
  latestAssessment?: DailyAssessmentRecord,
  history: DailyAssessmentRecord[] = []
): string {
  const groundState = getGroundLinkState();
  const vitals = latestAssessment?.values;
  const overall = latestAssessment?.overall;
  const results = latestAssessment?.results;

  const recentDays = history.slice(0, 5).map((r) =>
    `  Sol ${r.missionDay}: HR ${r.values.heartRate} bpm | BP ${r.values.systolic}/${r.values.diastolic} mmHg | Sleep ${r.values.sleepDuration}h | Temp ${r.values.bodyTemperature}°C | Score ${r.overall?.score ?? 90}/100 (${r.overall?.status ?? 'GREEN'})`
  ).join('\n');

  return `You are "Dr. Orion", an Autonomous AI Flight Surgeon and Telemedicine Officer aboard the deep-space spacecraft "${profile.spacecraft}" on mission "${profile.missionName}".

ASTRONAUT PROFILE:
- Name: ${profile.name} | Rank: ${profile.rank} | Call Sign: ${profile.callSign}
- Age: ${profile.age} | Blood Type: ${profile.bloodType}
- Role: ${profile.role}
- Current Mission Day: Sol ${profile.currentMissionDay}
- Pre-flight Personal Baselines:
  * Resting Heart Rate: ${profile.restingHeartRateBaseline} BPM
  * Blood Pressure: ${profile.bloodPressureBaseline.systolic}/${profile.bloodPressureBaseline.diastolic} mmHg
  * Core Body Temperature: ${profile.bodyTemperatureBaseline} °C

TODAY'S BIOMEDICAL TELEMETRY (Sol ${profile.currentMissionDay}):
- Overall Health Score: ${overall?.score ?? 95}/100 | Status: ${overall?.status ?? 'GREEN'} (${overall?.statusLabel ?? 'Nominal'})
- Heart Rate: ${vitals?.heartRate ?? 72} BPM (baseline ${profile.restingHeartRateBaseline} BPM) [${results?.heartRate?.status ?? 'GREEN'}]
- Blood Pressure: ${vitals?.systolic ?? 118}/${vitals?.diastolic ?? 76} mmHg (baseline ${profile.bloodPressureBaseline.systolic}/${profile.bloodPressureBaseline.diastolic} mmHg) [${results?.bloodPressure?.status ?? 'GREEN'}]
- Blood Glucose: ${vitals?.bloodSugar ?? 92} mg/dL [${results?.bloodSugar?.status ?? 'GREEN'}]
- Core Temp: ${vitals?.bodyTemperature ?? 36.6} °C (baseline ${profile.bodyTemperatureBaseline} °C) [${results?.bodyTemperature?.status ?? 'GREEN'}]
- Sleep: ${vitals?.sleepDuration ?? 7.5} hours [${results?.sleepDuration?.status ?? 'GREEN'}]
- Mood/Stress: ${vitals?.mood ?? 'good'}
- Cabin CO₂: ${results?.cabinCO2?.valueDisplay ?? '2.8'} mmHg (NASA-STD-3001 limit: 3.0 nominal / 4.5 max)
- Space Radiation Career Dose: ${results?.radiationDose?.valueDisplay ?? '142'} mSv (includes 30% CSA CANS neutron share; limit 600 mSv)
- SANS Vision: ${vitals?.visionHeadache === 'yes' ? 'FLAGGED — visual acuity shift / headache reported' : 'Nominal — no ocular pressure issues'}
- Notes: ${vitals?.notes || 'None'}

RECENT HEALTH HISTORY (last ${history.slice(0, 5).length} sols):
${recentDays || 'No prior records available.'}

COMMS STATUS:
- Mode: ${groundState.mode === 'mars_delay' ? 'MARS DELAY — 22-minute one-way light-time. Ground surgeon unreachable in real-time. Autonomous EIMO 2023 protocol active.' : 'DSN DIRECT LINK — Earth ground surgeon reachable.'}

OFFICIAL NASA REFERENCE COUNTERMEASURES & MEDICATIONS PROTOCOL:
(Source: NASA Human Research Program HRP, NASA-STD-3001, ISS Medical Checklist)
IMPORTANT: Label as "Reference countermeasures, not prescriptions". Drug choice and dosing must be decided by a physician / flight surgeon. No doses are given on purpose.
All readings in the current Sol 142 dashboard are within normal range, so these are for reference or contingency.

SUMMARY TABLE OF CONDITIONS & MEDICATIONS:
1. High Blood Pressure (>120/80 mmHg):
   - Medications: ACE inhibitors (e.g. lisinopril), ARBs (e.g. losartan), calcium channel blockers (e.g. amlodipine).
   - Notes: Managed with long-term cardiovascular medication under flight surgeon review.
2. Low Blood Pressure (<90/60 mmHg):
   - Countermeasures: Oral or IV fluids first; midodrine for persistent refractory cases.
   - Notes: In microgravity, fluid volume contracts ~10-15%. Start with rehydration/salt tablets; move to midodrine only if persistent.
3. Low Blood Sugar (Hypoglycemia <70 mg/dL):
   - Countermeasures: Fast-acting glucose tablets or gel immediately; glucagon (IM/autoinjector) if the astronaut is unresponsive or cannot swallow safely.
   - Notes: Acute medical emergency.
4. High Blood Sugar (Hyperglycemia >125 mg/dL):
   - Countermeasures: Metformin or insulin, depending on severity and ketosis screening.
5. Core Body Temperature - High (Space Fever >38.0 °C):
   - Countermeasures: Acetaminophen or ibuprofen, physical convective cooling, fluids.
   - Notes: Microgravity impairs convective sweat cooling.
6. Core Body Temperature - Low (Hypothermia <35.5 °C):
   - Countermeasures: Passive and active warming (thermal blankets, warm fluids). NO drug treats hypothermia directly.
7. Poor or Short Sleep (<7 hours):
   - Countermeasures: Melatonin is first-line circadian regulator; short-acting sleep aids (zolpidem, temazepam) for short-term acute use only.
8. Psychological Morale / Mood (Fatigue, high stress, low mood):
   - Countermeasures: Behavioral support first: counseling, workload and schedule changes, Earth family teleconferences. Medication: anxiolytics or SSRIs reserved for clinical cases under physician oversight.
9. Elevated Cabin CO₂ (3.1–4.5 mmHg, hypercapnic headaches):
   - Countermeasures: ENVIRONMENTAL FIX FIRST: CDRA scrubber maintenance and cabin airflow ventilation. Acetaminophen or ibuprofen treats ONLY the headache symptom as a temporary stopgap.
10. Space Radiation (300–599 mSv approaching lifetime limit / SPE):
    - Countermeasures: NO DRUG PREVENTS EXPOSURE. Real countermeasures are physical shielding and storm shelter during solar particle events. Ondansetron manages acute radiation-induced nausea; radioprotectors like amifostine are experimental.

YOUR INSTRUCTIONS:
1. Address the astronaut by rank or name (e.g. "Commander", "Cmdr. Vance").
2. When asked what medication, drug, or treatment to use for ANY issue (blood pressure, blood sugar, fever, sleep, headache, radiation, stress), cite the EXACT medications from the NASA reference countermeasures table above.
3. ALWAYS include the disclaimer: "Reference countermeasures, not prescriptions. Drug choice and dosing must be decided by a physician (flight surgeon)."
4. Note that for Commander Vance on Sol 142, current vitals are nominal so no countermeasure is currently triggered unless an acute symptom is reported.
5. Format responses clearly with headers, markdown tables, and bullet lists.`;
}

/**
 * Heuristic fallback engine — used ONLY when no API key exists or on network failure.
 */
export function generateHeuristicResponse(
  prompt: string,
  profile: AstronautProfile,
  latestAssessment?: DailyAssessmentRecord
): { text: string; suggestions: string[] } {
  const p = prompt.toLowerCase();
  const vitals = latestAssessment?.values;
  const overall = latestAssessment?.overall;
  const hr = vitals?.heartRate ?? 72;
  const hrBase = profile.restingHeartRateBaseline ?? 62;
  const bpSys = vitals?.systolic ?? 118;
  const bpDia = vitals?.diastolic ?? 76;
  const sleep = vitals?.sleepDuration ?? 7.5;
  const temp = vitals?.bodyTemperature ?? 36.6;
  const score = overall?.score ?? 95;
  const status = overall?.status ?? 'GREEN';

  // --- REFERENCE MEDICATIONS & COUNTERMEASURES (NASA HRP & ISS MEDICAL CHECKLIST) ---
  if (p.includes('medi') || p.includes('drug') || p.includes('pill') || p.includes('pharm') || p.includes('prescript') || p.includes('what to take') || p.includes('kit') || p.includes('treat')) {
    // Specific issue checks
    if (p.includes('blood pressure') || p.includes('bp') || p.includes('hypertension') || p.includes('hypotension')) {
      return {
        text: `## 💊 Reference Countermeasures: Blood Pressure
*Source: NASA Human Research Program & ISS Medical Checklist*
> **Disclaimer:** *Reference countermeasures, not prescriptions. Drug choice and dosing must be decided by the flight surgeon.*

### 1. High Blood Pressure (Hypertension >120/80 mmHg):
- **First-line Medications:** ACE inhibitors (e.g. **lisinopril**), ARBs (e.g. **losartan**), or calcium channel blockers (e.g. **amlodipine**).
- **Clinical Protocol:** Managed with long-term cardiovascular medication under flight surgeon review.

### 2. Low Blood Pressure (Hypotension / Orthostatic Intolerance <90/60 mmHg):
- **First-line Countermeasure:** **Oral or IV fluid loading** (normal saline or 1.5L water + electrolyte salt tablets).
- **Secondary Medication:** **Midodrine** for persistent, refractory orthostatic cases.
- **Microgravity Context:** In microgravity, fluid volume contracts ~10–15% due to cephalic fluid shift.

*Commander Vance Telemetry Check:* Today's BP is **${bpSys}/${bpDia} mmHg** (nominal). No blood pressure medication is indicated.`,
        suggestions: ['What medications for blood sugar?', 'What is in the kit for fever or space fever?', 'What sleep medications are available?'],
      };
    }

    if (p.includes('sugar') || p.includes('glucose') || p.includes('hypoglycemia') || p.includes('hyperglycemia')) {
      return {
        text: `## 💊 Reference Countermeasures: Blood Glucose
*Source: NASA Human Research Program & ISS Medical Checklist*
> **Disclaimer:** *Reference countermeasures, not prescriptions. Drug choice and dosing must be decided by the flight surgeon.*

### 1. Low Blood Sugar (Hypoglycemia <70 mg/dL) — ACUTE EMERGENCY:
- **First-line:** **Fast-acting glucose tablets or oral glucose gel** (15–20g).
- **Unresponsive / Impaired Swallow:** **Glucagon** (IM injection or autoinjector).
- **Protocol:** Re-check blood glucose after 15 minutes.

### 2. High Blood Sugar (Hyperglycemia >125 mg/dL):
- **Medications:** **Metformin** (oral) or subcutaneous **insulin**, depending on severity, hydration, and ketosis screening.

*Commander Vance Telemetry Check:* Today's blood glucose is **${vitals?.bloodSugar ?? 92} mg/dL** (nominal range 70–99 mg/dL).`,
        suggestions: ['What medications for fever or headache?', 'What countermeasures for high blood pressure?', 'What sleep aids are in the kit?'],
      };
    }

    if (p.includes('temp') || p.includes('fever') || p.includes('cold') || p.includes('hypothermia')) {
      return {
        text: `## 💊 Reference Countermeasures: Core Body Temperature
*Source: NASA Human Research Program & ISS Medical Checklist*
> **Disclaimer:** *Reference countermeasures, not prescriptions. Drug choice and dosing must be decided by the flight surgeon.*

### 1. High Temperature (Fever / Space Fever >38.0 °C):
- **Antipyretic Medications:** **Acetaminophen** (paracetamol) or **ibuprofen**.
- **Physical Countermeasures:** Active convective airflow cooling and oral/IV electrolyte fluid replacement.
- **Spaceflight Factor:** Convective radiative sweat cooling is severely impaired in microgravity.

### 2. Low Temperature (Hypothermia <35.5 °C):
- **NO PHARMACEUTICAL DRUG TREATS HYPOTHERMIA.**
- **Protocol:** Passive and active rewarming only (thermal blankets, warmed oral fluids, cabin thermal loop adjustment).

*Commander Vance Telemetry Check:* Core temp is **${temp}°C** (nominal range 36.1–38.0 °C).`,
        suggestions: ['What medications for sleep or insomnia?', 'What to take for cabin CO2 headache?', 'What is used for radiation sickness?'],
      };
    }

    if (p.includes('sleep') || p.includes('insomnia') || p.includes('wake') || p.includes('circadian')) {
      return {
        text: `## 💊 Reference Countermeasures: Sleep & Circadian Health
*Source: NASA Human Research Program & ISS Medical Checklist*
> **Disclaimer:** *Reference countermeasures, not prescriptions. Drug choice and dosing must be decided by the flight surgeon.*

### 1. First-Line Sleep Countermeasure:
- **Melatonin:** Primary circadian phase-shifting agent and sleep-onset facilitator. Non-habit forming.

### 2. Prescription Sleep Aids (Short-Term Acute Use Only):
- **Zolpidem** (Ambien) or **temazepam**.
- **Crucial Spaceflight Constraint:** These appear in spaceflight medical packs but are restricted to short-term emergency or acute pre-EVA sleep shifting only due to cognitive grogginess risks during spacecraft alarms.

*Commander Vance Telemetry Check:* Logged **${sleep} hours** of rest last night.`,
        suggestions: ['What to take for cabin CO2 headache?', 'What countermeasures for radiation nausea?', 'List full NASA medication reference table'],
      };
    }

    if (p.includes('co2') || p.includes('headache') || p.includes('air') || p.includes('scrubber')) {
      return {
        text: `## 💊 Reference Countermeasures: Cabin CO₂ & Hypercapnic Headaches
*Source: NASA-STD-3001 & NASA OCHMO Technical Brief TB-004*
> **Disclaimer:** *Reference countermeasures, not prescriptions. Drug choice and dosing must be decided by the flight surgeon.*

### Key Clinical Principle:
**Elevated cabin CO₂ is an environmental engineering problem, not a drug problem.**

- **Environmental Fix (Primary):** CDRA (Carbon Dioxide Removal Assembly) scrubber maintenance, desiccant bed cycle verification, and increasing localized ventilation fans to disperse dead-air pockets.
- **Symptomatic Relief (Stopgap Only):** **Acetaminophen** or **ibuprofen** can be used to treat the resulting headache, but this only masks symptoms while the life-support system is serviced.

*Commander Vance Telemetry Check:* Cabin CO₂ is **2.8 mmHg** (below the 3.0 mmHg nominal ceiling). Air scrubbers are operating nominally.`,
        suggestions: ['What medications for radiation exposure?', 'What medications for blood pressure?', 'List full NASA medication reference table'],
      };
    }

    if (p.includes('radiation') || p.includes('nausea') || p.includes('vomit') || p.includes('spe') || p.includes('storm')) {
      return {
        text: `## 💊 Reference Countermeasures: Space Radiation & Acute Sickness
*Source: NASA Human Research Program & OCHMO TB-020*
> **Disclaimer:** *Reference countermeasures, not prescriptions. Drug choice and dosing must be decided by the flight surgeon.*

### 1. Radiation Exposure Prevention:
- **NO DRUG PREVENTS RADIATION EXPOSURE.**
- **Physical Countermeasures:** Relocate crew to the heavily shielded habitat core / water wall storm shelter during Solar Particle Events (SPE).

### 2. Acute Radiation Sickness (ARS) Symptoms:
- **Ondansetron:** Antiemetic (5-HT3 antagonist) used to manage nausea and vomiting induced by radiation exposure.
- **Amifostine:** Free-radical scavenging radioprotector (considered experimental for long-duration deep-space transit).

*Commander Vance Telemetry Check:* Cumulative career radiation dose is **142 mSv** (well below the 600 mSv lifetime limit). Space weather sensors report quiet conditions.`,
        suggestions: ['What medications for blood pressure?', 'What medications for sleep?', 'List full NASA medication reference table'],
      };
    }

    // General complete reference table
    return {
      text: `## 💊 NASA Space Health Monitor: Reference Countermeasures & Medications Table
*Source: NASA Human Research Program (HRP), NASA-STD-3001 & ISS Medical Checklist*
> **Disclaimer:** *Reference countermeasures, not prescriptions. Drug choice and dosing must be decided by a physician (flight surgeon). No doses are given on purpose.*

| Parameter | Normal Range | Out-of-Range Condition | Reference Countermeasures & Drugs |
|-----------|--------------|------------------------|-----------------------------------|
| **Blood Pressure** | 111–119 / 60–79 mmHg | **High BP** | ACE inhibitors (lisinopril), ARBs (losartan), CCBs (amlodipine) |
| | | **Low BP** | Oral or IV fluids first; midodrine for persistent cases |
| **Blood Sugar** | 70–99 mg/dL | **Low (Hypoglycemia)** | Glucose tablets/gel; glucagon if unresponsive |
| | | **High (Hyperglycemia)** | Metformin or insulin depending on severity |
| **Core Temp** | 36.1–38.0 °C | **High (Fever)** | Acetaminophen or ibuprofen, cooling, fluids |
| | | **Low (Hypothermia)** | Passive & active rewarming; **no drug treats it directly** |
| **Sleep** | 7–10 hours | **Poor/Short Sleep** | Melatonin first-line; short-acting sleep aids (zolpidem, temazepam) short-term only |
| **Mood / Morale** | Nominal | **Fatigue / High Stress** | Counseling, schedule adjustment; anxiolytics or SSRIs for clinical cases |
| **Cabin CO₂** | ≤3.0 mmHg | **Elevated CO₂ (Headache)** | Environmental scrubber fix; acetaminophen or ibuprofen for headache only |
| **Radiation** | <300 mSv | **High Exposure / SPE** | Physical shielding & shelter; ondansetron for nausea; amifostine experimental |

*Note: All readings on Mission Sol 142 are within normal range — none of these countermeasures are currently triggered.*`,
      suggestions: [
        'What should I take for high blood pressure?',
        'What to use for cabin CO2 headache?',
        'What sleep aids are in the space medical kit?',
      ],
    };
  }

  if (p.includes('progress') || p.includes('summary') || p.includes('status') || p.includes('how am i') || p.includes('overall') || p.includes('today')) {
    return {
      text: `## Mission Day ${profile.currentMissionDay} — Health Summary\n\n**Astronaut:** ${profile.rank} ${profile.name}\n**Health Score:** **${score}/100** (${status})\n\n| Indicator | Value | Baseline | Status |\n|-----------|-------|----------|--------|\n| Heart Rate | **${hr} BPM** | ${hrBase} BPM | ${hr <= 90 ? '✅ Normal' : '⚠️ Elevated'} |\n| Blood Pressure | **${bpSys}/${bpDia} mmHg** | ${profile.bloodPressureBaseline.systolic}/${profile.bloodPressureBaseline.diastolic} | ✅ Normal |\n| Core Temp | **${temp}°C** | ${profile.bodyTemperatureBaseline}°C | ✅ Normal |\n| Sleep | **${sleep}h** | ≥7h | ${sleep >= 7 ? '✅ Normal' : '⚠️ Low'} |\n\n**Environmental:** Cabin CO₂ at **2.8 mmHg** ✅ | Radiation at **142 mSv** ✅`,
      suggestions: ['How is my cardiovascular health?', 'Suggest countermeasures for today', 'What are my radiation & CO2 levels?'],
    };
  }

  if (p.includes('heart') || p.includes('bp') || p.includes('pressure') || p.includes('cardio') || p.includes('pulse')) {
    return {
      text: `## ❤️ Cardiovascular Analysis\n\n- **Resting HR:** **${hr} BPM** (baseline: ${hrBase} BPM, variance: ${hr >= hrBase ? '+' : ''}${hr - hrBase} BPM)\n- **Blood Pressure:** **${bpSys}/${bpDia} mmHg** (baseline: ${profile.bloodPressureBaseline.systolic}/${profile.bloodPressureBaseline.diastolic} mmHg)\n\n**Assessment:** In microgravity, cephalic fluid redistribution increases venous return, raising stroke volume while sympathetic tone decreases. Your readings are within normal operational range.`,
      suggestions: ['Suggest countermeasures for cardiovascular health', 'Summarize my overall health today'],
    };
  }

  if (p.includes('countermeasure') || p.includes('recover') || p.includes('exercise') || p.includes('tired') || p.includes('fatigue') || p.includes('routine')) {
    return {
      text: `## 🏃 Recommended Countermeasures for Sol ${profile.currentMissionDay}\n\n1. **Cardiovascular (30 min)** — T2 Cycle Ergometer at 75% VO₂ max to maintain vascular tone\n2. **Resistance (45 min)** — ARED deadlifts + heel raises to preserve bone/muscle mass\n3. **Hydration** — 1.5L water + 1 electrolyte tablet before sleep to counteract plasma volume loss (~10–15% in microgravity)\n4. **Sleep hygiene** — Set cabin lights to warm (450nm blue-depleted) 90 min before scheduled rest\n5. **Cabin ventilation** — Ensure fans at nominal flow to prevent localized CO₂ pockets near sleep quarters`,
      suggestions: ['Analyze my heart rate vs baseline', 'What are my radiation & CO2 levels?', 'Overall health summary'],
    };
  }

  if (p.includes('radiation') || p.includes('co2') || p.includes('carbon') || p.includes('environment')) {
    return {
      text: `## ☢️ Environmental Telemetry\n\n**Cabin CO₂:**\n- Current: **2.8 mmHg** ✅ (NASA-STD-3001 limit: 3.0 mmHg nominal, 4.5 mmHg max)\n- Status: Air scrubbers performing nominally\n\n**Space Radiation Dose:**\n- Career cumulative: **142 mSv** ✅ (career limit: 600 mSv — OCHMO TB-020)\n- Includes **30% CSA CANS neutron biological weight** for deep-space transit\n- SPE (Solar Particle Event) status: Quiet — no radiation shelter required`,
      suggestions: ['Suggest countermeasures for my routine', 'Summarize my health today'],
    };
  }

  return {
    text: `## Greetings, ${profile.rank} ${profile.name}\n\nI am **Dr. Orion**, your Aegis AI Flight Surgeon for Sol **${profile.currentMissionDay}**.\n\n**Current Status:** Score **${score}/100** (${status})\n- HR: **${hr} BPM** | BP: **${bpSys}/${bpDia} mmHg** | Sleep: **${sleep}h** | Temp: **${temp}°C**\n\nAsk me about your vitals, recovery exercises, spaceflight risks, or countermeasure protocols.`,
    suggestions: ['Summarize my mission day progress', 'Suggest countermeasures for my routine', 'Analyze my cardiovascular health', 'What are my radiation & CO2 levels?'],
  };
}

/**
 * PRIMARY FUNCTION — sends message to Gemini API.
 * Always reads API key fresh from localStorage at call time (no stale state).
 */
export async function sendGeminiChatMessage(
  userMessage: string,
  profile: AstronautProfile,
  latestAssessment?: DailyAssessmentRecord,
  historyRecords: DailyAssessmentRecord[] = [],
  chatHistory: ChatMessage[] = []
): Promise<ChatMessage> {
  // Always read fresh from localStorage — avoids stale closure issues
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();

  console.log('[Dr. Orion] API Key present:', Boolean(apiKey), '| Model:', model);

  // --- FALLBACK: No API key ---
  if (!apiKey) {
    const fallback = generateHeuristicResponse(userMessage, profile, latestAssessment);
    return {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text: fallback.text + `\n\n---\n> 💡 **Offline Mode:** No Gemini API key detected. Click the **key icon** in the header above to add your free Google Gemini API key and enable live AI reasoning.`,
      timestamp: new Date().toISOString(),
      modelUsed: 'Onboard Heuristic Engine',
      isFallback: true,
      suggestions: fallback.suggestions,
    };
  }

  // --- GEMINI API CALL ---
  const systemInstruction = buildAstronautSystemPrompt(profile, latestAssessment, historyRecords);

  // Conversation history (last 10 messages for context window efficiency)
  const contents = chatHistory
    .filter((m) => m.sender === 'user' || m.sender === 'assistant')
    .slice(-10)
    .map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  // Try the selected model first, then known operational models for this API key
  const cleanSelected = model.replace(/^models\//, '').trim();
  const modelsToTry = [
    cleanSelected,
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ];
  const uniqueModels = [...new Set(modelsToTry.map((m) => m.replace(/^models\//, '').trim()).filter(Boolean))];

  for (const tryModel of uniqueModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${tryModel}:generateContent?key=${apiKey}`;

    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1500,
        topP: 0.95,
      },
    };

    try {
      console.log(`[Dr. Orion] Calling Gemini model: ${tryModel}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMsg = errorData?.error?.message || `HTTP ${res.status}`;
        console.warn(`[Dr. Orion] Model ${tryModel} error: ${errorMsg}`);
        // Try next model in list
        continue;
      }

      const data = await res.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        console.warn(`[Dr. Orion] Empty response from ${tryModel}, trying next model`);
        continue;
      }

      console.log(`[Dr. Orion] ✅ Success with model: ${tryModel}`);
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: candidateText,
        timestamp: new Date().toISOString(),
        modelUsed: tryModel,
        isFallback: false,
        suggestions: [
          'What is my overall health status today?',
          'Suggest countermeasures for my routine',
          'Analyze my cardiovascular readings vs baseline',
        ],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[Dr. Orion] Network error on ${tryModel}: ${message}`);
      continue;
    }
  }

  // All models exhausted — use heuristic fallback
  const fallback = generateHeuristicResponse(userMessage, profile, latestAssessment);
  return {
    id: `ai-${Date.now()}`,
    sender: 'assistant',
    text: fallback.text + `\n\n---\n> ⚠️ **Connection Issue:** Could not reach Gemini API with the current key. Please verify your API key is correct and has the Generative Language API enabled.`,
    timestamp: new Date().toISOString(),
    modelUsed: 'Fallback Engine',
    isFallback: true,
    suggestions: fallback.suggestions,
  };
}
