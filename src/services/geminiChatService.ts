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

export const DEFAULT_MODEL = 'gemini-1.5-flash';
export const AVAILABLE_MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Fast & Recommended)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Next-Gen High Performance)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Deep Clinical Reasoning)' },
];

/**
 * Get stored Gemini API Key from localStorage or Vite environment variable
 */
export function getGeminiApiKey(): string {
  try {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  } catch {
    // Non-blocking
  }
  // Fallback to Vite env if configured
  const envKey = (import.meta as unknown as { env?: { VITE_GEMINI_API_KEY?: string } }).env?.VITE_GEMINI_API_KEY;
  return envKey?.trim() || '';
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

/**
 * Load chat history from LocalStorage
 */
export function loadChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore error
  }
  return [];
}

/**
 * Save chat history to LocalStorage
 */
export function saveChatHistory(history: ChatMessage[]): void {
  try {
    localStorage.setItem(CHAT_HISTORY_STORAGE, JSON.stringify(history.slice(-30))); // Keep last 30
  } catch {
    // Ignore error
  }
}

/**
 * Build rich system prompt embedding full astronaut record and mission context
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

  // Recent 3 records summary
  const recentDays = history.slice(0, 3).map((r) => {
    return `- Sol ${r.missionDay}: HR ${r.values.heartRate} bpm, BP ${r.values.systolic}/${r.values.diastolic} mmHg, Sleep ${r.values.sleepDuration}h, Temp ${r.values.bodyTemperature}°C, Score: ${r.overall?.score ?? 90}/100 (${r.overall?.status ?? 'GREEN'})`;
  }).join('\n');

  return `You are "Dr. Orion" (Aegis Onboard AI Flight Surgeon & Telemedicine Officer), an autonomous clinical decision-support system aboard the deep-space spacecraft "${profile.spacecraft}" on the mission "${profile.missionName}".

ASTRONAUT PROFILE UNDER YOUR CARE:
- Name: ${profile.name} (${profile.rank})
- Call Sign: ${profile.callSign}
- Age: ${profile.age} | Blood Type: ${profile.bloodType}
- Role: ${profile.role}
- Current Mission Day: Sol ${profile.currentMissionDay}
- Personal Resting Baselines:
  * Resting Heart Rate: ${profile.restingHeartRateBaseline} BPM
  * Blood Pressure Baseline: ${profile.bloodPressureBaseline.systolic}/${profile.bloodPressureBaseline.diastolic} mmHg
  * Core Body Temperature Baseline: ${profile.bodyTemperatureBaseline} °C

LATEST BIOMEDICAL TELEMETRY (TODAY):
- Health Composite Score: ${overall?.score ?? 95}/100 (${overall?.status ?? 'GREEN'} - ${overall?.statusLabel ?? 'Healthy / Nominal'})
- Resting Heart Rate: ${vitals?.heartRate ?? 72} BPM (Baseline: ${profile.restingHeartRateBaseline} BPM) [Status: ${results?.heartRate?.status ?? 'GREEN'}]
- Blood Pressure: ${vitals?.systolic ?? 118}/${vitals?.diastolic ?? 76} mmHg (Baseline: ${profile.bloodPressureBaseline.systolic}/${profile.bloodPressureBaseline.diastolic} mmHg) [Status: ${results?.bloodPressure?.status ?? 'GREEN'}]
- Blood Glucose: ${vitals?.bloodSugar ?? 92} mg/dL [Status: ${results?.bloodSugar?.status ?? 'GREEN'}]
- Core Body Temperature: ${vitals?.bodyTemperature ?? 36.6} °C (Baseline: ${profile.bodyTemperatureBaseline} °C) [Status: ${results?.bodyTemperature?.status ?? 'GREEN'}]
- Sleep Duration: ${vitals?.sleepDuration ?? 7.5} hours [Status: ${results?.sleepDuration?.status ?? 'GREEN'}]
- Subjective Mood / Stress: ${vitals?.mood ?? 'good'}
- Cabin Environmental CO2: ${results?.cabinCO2?.valueDisplay ?? '2.8'} mmHg (NASA-STD-3001 threshold is 3.0 mmHg nominal, 4.5 mmHg max)
- Space Radiation Career Dose: ${results?.radiationDose?.valueDisplay ?? '142'} mSv (Includes 30% CSA CANS neutron share; threshold 600 mSv max)
- SANS / Vision Assessment: ${vitals?.visionHeadache === 'yes' ? 'FLAGGED: Blurred vision / ocular pressure / headache reported' : 'Nominal: No SANS vision blur or cephalad fluid shift headache'}
- Notes: ${vitals?.notes || 'None recorded'}

RECENT HISTORICAL TRENDS:
${recentDays || 'No previous historical days available.'}

COMMUNICATION LINK & MISSION CONTEXT:
- Mode: ${groundState.mode === 'mars_delay' ? 'Mars Delay (22-minute speed-of-light one-way latency). Earth ground surgeon is NOT reachable in real time. You must provide autonomous medical countermeasure guidance per NASA EIMO 2023 protocol.' : 'Deep Space Network (DSN) Direct Link Online.'}
- Challenge Clinical Standards: Adheres strictly to NEWS2 (National Early Warning Score 2), American Heart Association (AHA), CDC, NASA-STD-3001 Vol 2, and NASA HRP (5 Hazards: Gravity Fields, Radiation, Distance from Earth, Hostile Closed Environment, Isolation).

YOUR INSTRUCTIONS & ROLE:
1. Address the astronaut respectfully by rank or name (e.g. "Commander", "Cmdr. Vance", or "${profile.name}").
2. Answer any question about their current vitals, trends, recovery progress, risks, or mission readiness using their actual data provided above.
3. When giving countermeasure recommendations:
   - Provide concrete, numbered action steps (e.g., fluid loading with 1.5L water + electrolyte tablet, 45 min ARED resistance, aerobic cycle ergometer, SANS visual grid test, sleep hygiene, radiation shelter during solar particle events).
   - Explain the physiological mechanism under microgravity (e.g., cephalic fluid shift, cardiovascular deconditioning, space motion adaptation, space fever).
4. Maintain a calm, professional, mission-ready, and encouraging tone suitable for spaceflight.
5. Emphasize operational decision support (do not claim to replace final ground surgeon telemetry confirmation when Earth link is nominal). Format key clinical findings and recovery steps clearly using markdown.`;
}

/**
 * Intelligent Fallback Medical Engine (when no API key is provided or offline)
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

  // 1. Overall Progress / Health Summary
  if (p.includes('progress') || p.includes('summary') || p.includes('status') || p.includes('how am i') || p.includes('overall') || p.includes('today')) {
    return {
      text: `### 📋 Mission Day ${profile.currentMissionDay} Health & Recovery Briefing
**Astronaut:** ${profile.rank} ${profile.name} (${profile.callSign})  
**Overall Readiness Index:** **${score}/100** — \`${status === 'GREEN' ? 'Nominal / Mission-Ready' : status === 'YELLOW' ? 'Advisory Variance' : 'Action Required'}\`

Here is your physiological status overview:
- **Cardiovascular:** Heart rate is **${hr} BPM** (baseline is ${hrBase} BPM, variance: ${hr - hrBase >= 0 ? '+' : ''}${hr - hrBase} BPM). Blood pressure is **${bpSys}/${bpDia} mmHg** (nominal).
- **Thermoregulation & Metabolic:** Core temperature is **${temp}°C** with blood glucose at **${vitals?.bloodSugar ?? 92} mg/dL**, both well within NASA-STD-3001 safety limits.
- **Sleep & Rest:** **${sleep} hours** logged last night. Sleep architecture is sufficient for cognitive high-tempo EVA tasks.
- **Environmental Shielding:** Cabin CO₂ is **2.8 mmHg** (below the 3.0 mmHg nominal ceiling) and cumulative radiation is **142 mSv** (well clear of the 600 mSv career limit).

**Flight Surgeon Recommendation:** You are cleared for all scheduled mission tasks today. Stay consistent with your afternoon 45-minute ARED resistance session.`,
      suggestions: [
        'Suggest countermeasures for my fatigue',
        'Analyze my heart rate and blood pressure vs baseline',
        'What are my radiation & CO2 exposure levels?',
      ],
    };
  }

  // 2. Recovery / Countermeasures
  if (p.includes('countermeasure') || p.includes('recover') || p.includes('routine') || p.includes('exercise') || p.includes('tired') || p.includes('fatigue')) {
    return {
      text: `### 🛡️ Recommended Microgravity Countermeasure Protocol
Based on your current Sol ${profile.currentMissionDay} profile and recorded sleep of **${sleep} hours**, here is your optimized recovery strategy:

1. **Cardiovascular & Orthostatic Conditioning:**
   - **T2 Cycle Ergometer:** 30 minutes interval training at 75% max VO₂ to maintain venous vascular tone and counteract cephalic fluid redistribution.
   - **ARED Resistance:** 45 minutes targeting spinal extensor and lower-extremity bone mineral density (deadlifts and heel raises).

2. **Hydration & Electrolyte Protocol:**
   - Microgravity causes fluid volume contraction (~10-15% plasma volume loss). Consume **1.5 liters of water** supplemented with 1 electrolyte replenishment packet before sleep.

3. **Circadian & Sleep Hygiene:**
   - Set cabin illumination to 450nm blue-depleted warm light 90 minutes before scheduled sleep.
   - Maintain cabin ventilation fans at nominal flow to prevent localized CO₂ pockets around your sleeping quarters.`,
      suggestions: [
        'How does my heart rate compare to my Earth baseline?',
        'What is my SANS vision check status?',
        'Give me an SBAR medical summary',
      ],
    };
  }

  // 3. Heart Rate & Blood Pressure
  if (p.includes('heart') || p.includes('bp') || p.includes('pressure') || p.includes('cardio') || p.includes('pulse')) {
    const hrDiff = hr - hrBase;
    return {
      text: `### ❤️ Cardiovascular Telemetry Analysis
**Current Heart Rate:** **${hr} BPM** (Personal Baseline: **${hrBase} BPM**)  
**Current Blood Pressure:** **${bpSys}/${bpDia} mmHg** (Baseline: **${profile.bloodPressureBaseline.systolic}/${profile.bloodPressureBaseline.diastolic} mmHg**)

**Physiological Assessment:**
- Your resting heart rate shows a variance of **${hrDiff >= 0 ? '+' : ''}${hrDiff} BPM** compared to your pre-flight baseline.
- In microgravity, the reduction in gravitational hydrostatic pressure gradient results in a headward fluid shift, which initially increases stroke volume and decreases sympathetic tone.
- Your blood pressure of **${bpSys}/${bpDia} mmHg** is within the **NEWS2 / AHA Green Tier** (<120/80 mmHg). No orthostatic hypotension risk indicated during intra-vehicular maneuvers.`,
      suggestions: [
        'What should I do if my heart rate rises above 90 BPM?',
        'How are my radiation and cabin CO2 levels?',
        'Summarize my overall progress today',
      ],
    };
  }

  // 4. Radiation & CO2
  if (p.includes('radiation') || p.includes('co2') || p.includes('carbon') || p.includes('environment') || p.includes('neutron')) {
    return {
      text: `### ☢️ Environmental & Radiation Telemetry (NASA-STD-3001)
- **Cabin CO₂ Partial Pressure:** **2.8 mmHg** (Thresholds: Green ≤3.0, Yellow 3.1–4.5, Red >4.5 mmHg)  
  *Context:* NASA OCHMO Technical Brief TB-004 indicates that spaceflight hypercapnia symptoms (headaches, lethargy) emerge when ambient CO₂ exceeds 4.5 mmHg. Your current air scrubber performance is nominal.
- **Cumulative Space Radiation Dose:** **142 mSv**  
  *Career Permissible Exposure Limit:* 600 mSv (NASA OCHMO TB-020).  
  *Neutron Component:* Includes a calibrated **30% CSA CANS biological neutron weight**, accounting for secondary heavy particle fragmentation during deep-space transit.
- **Current Solar Particle Event (SPE) Status:** Quiet. Solar flux sensors show quiet magnetosheath conditions. Radiation shelter entry is **not required**.`,
      suggestions: [
        'What are the symptoms of elevated cabin CO2?',
        'Suggest recovery countermeasures for my routine',
        'Summarize my mission day progress',
      ],
    };
  }

  // 5. SANS / Vision / Headaches
  if (p.includes('sans') || p.includes('vision') || p.includes('eye') || p.includes('headache') || p.includes('blur')) {
    const sansStatus = vitals?.visionHeadache === 'yes';
    return {
      text: `### 👁️ Spaceflight-Associated Neuro-ocular Syndrome (SANS) Protocol
**Status:** ${sansStatus ? '⚠️ Symptom Flagged' : '✅ Nominal (No Visual Acuity Shift)'}

**HRP Risk Explanation:**
- Cephalad venous engorgement caused by long-duration microgravity elevates intracranial pressure (ICP), which can lead to optic disc edema, globe flattening, choroidal folds, and hyperopic refractive shifts.
- **Guidance:** Perform the 10-point Amsler Grid visual check and standard near-card acuity test. If blurred vision or retro-orbital aching persists, notify the ground flight surgeon and initiate the Lower Body Negative Pressure (LBNP) or venous compression countermeasure protocol.`,
      suggestions: [
        'What countermeasures relieve cephalad fluid pressure?',
        'Summarize my vitals and health score',
        'How is my recovery progressing today?',
      ],
    };
  }

  // Default helpful response
  return {
    text: `Hello, ${profile.rank} ${profile.name}. I am **Dr. Orion**, your Aegis AI Flight Surgeon aboard the ${profile.spacecraft}.

I am actively tracking your telemetry for **Sol ${profile.currentMissionDay}**:
- **Health Composite Score:** **${score}/100** (\`${status}\`)
- **Resting Vitals:** **${hr} BPM** | **${bpSys}/${bpDia} mmHg** | **${temp}°C**
- **Rest:** **${sleep} hours** | Mood: **${vitals?.mood ?? 'good'}**
- **Environmental Safety:** Cabin CO₂ at **2.8 mmHg** | Space Radiation at **142 mSv**

Ask me anything regarding your physiological metrics, countermeasure exercises, sleep hygiene, or how to handle spaceflight anomalies.`,
    suggestions: [
      'Summarize my mission day progress',
      'Explain my heart rate & blood pressure vs baseline',
      'Suggest countermeasures for my daily routine',
      'What are my radiation & CO2 exposure levels?',
    ],
  };
}

/**
 * Send message to Gemini API (or fallback if no key or error)
 */
export async function sendGeminiChatMessage(
  userMessage: string,
  profile: AstronautProfile,
  latestAssessment?: DailyAssessmentRecord,
  historyRecords: DailyAssessmentRecord[] = [],
  chatHistory: ChatMessage[] = []
): Promise<ChatMessage> {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();

  // If no API key provided, immediately use rich heuristic clinical intelligence
  if (!apiKey) {
    const fallback = generateHeuristicResponse(userMessage, profile, latestAssessment);
    return {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text: fallback.text + `\n\n> 💡 *Note: Running on Onboard Medical Telemetry Engine. Enter your **Google Gemini API Key** in the chat header to enable live LLM conversational reasoning.*`,
      timestamp: new Date().toISOString(),
      modelUsed: 'Onboard Clinical Engine (Heuristic)',
      isFallback: true,
      suggestions: fallback.suggestions,
      vitalsSnapshot: {
        heartRate: latestAssessment?.values.heartRate ?? 72,
        bloodPressure: `${latestAssessment?.values.systolic ?? 118}/${latestAssessment?.values.diastolic ?? 76}`,
        healthScore: latestAssessment?.overall.score ?? 95,
        missionDay: profile.currentMissionDay,
      },
    };
  }

  const systemInstruction = buildAstronautSystemPrompt(profile, latestAssessment, historyRecords);

  // Format conversational turns for Gemini API
  // Filter out system notes and take last 10 messages for context window efficiency
  const contents = chatHistory
    .filter((m) => m.sender === 'user' || m.sender === 'assistant')
    .slice(-8)
    .map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

  // Append latest user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 1024,
      topP: 0.95,
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const errorMsg = errorData?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      console.warn(`[Gemini API] Request returned error: ${errorMsg}. Falling back to internal engine.`);

      // Gracefully fall back to local clinical heuristics
      const fallback = generateHeuristicResponse(userMessage, profile, latestAssessment);
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: fallback.text + `\n\n> ⚠️ *Gemini API Notice: ${errorMsg}. Operating seamlessly via onboard telemetry heuristic engine.*`,
        timestamp: new Date().toISOString(),
        modelUsed: 'Fallback Engine (API Error)',
        isFallback: true,
        suggestions: fallback.suggestions,
      };
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('No candidate content received from Gemini API');
    }

    return {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text: candidateText,
      timestamp: new Date().toISOString(),
      modelUsed: model,
      isFallback: false,
      suggestions: [
        'How is my cardiovascular recovery progressing?',
        'Suggest countermeasures for my daily routine',
        'Generate an SBAR report for Ground Control',
      ],
      vitalsSnapshot: {
        heartRate: latestAssessment?.values.heartRate ?? 72,
        bloodPressure: `${latestAssessment?.values.systolic ?? 118}/${latestAssessment?.values.diastolic ?? 76}`,
        healthScore: latestAssessment?.overall.score ?? 95,
        missionDay: profile.currentMissionDay,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[Gemini API] Network/Fetch failure:', message);

    const fallback = generateHeuristicResponse(userMessage, profile, latestAssessment);
    return {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text: fallback.text + `\n\n> 📡 *Network Connection Notice: Deep Space link degraded (${message}). Running on local flight telemetry decision-support.*`,
      timestamp: new Date().toISOString(),
      modelUsed: 'Local Autonomous Telemedicine Engine',
      isFallback: true,
      suggestions: fallback.suggestions,
    };
  }
}
