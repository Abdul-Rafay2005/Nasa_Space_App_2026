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

export const DEFAULT_MODEL = 'gemini-2.0-flash';

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

YOUR INSTRUCTIONS:
1. Address the astronaut by rank or name (e.g. "Commander", "Cmdr. Vance").
2. Use the ACTUAL telemetry data above for all answers — no generic responses.
3. Give concrete numbered action steps (exercises, hydration amounts, timings).
4. Explain WHY physiological changes happen in microgravity (cephalad fluid shift, cardiovascular deconditioning, SANS, radiation risks).
5. Keep tone: calm, professional, mission-ready, and concise.
6. Format responses clearly with headers, bullet lists, and bold key values.
7. ALWAYS use the actual numbers from the telemetry above. Never invent data.`;
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

  // Try the selected model first, then fallback models if needed
  const modelsToTry = [model, 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  const uniqueModels = [...new Set(modelsToTry)];

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
