/**
 * Aegis Health — AI Flight Surgeon Chatbot Types
 * Compliant with NASA HRP Guidelines and Gemini Integration
 */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string; // ISO 8601
  modelUsed?: string;
  isFallback?: boolean;
  suggestions?: string[];
  vitalsSnapshot?: {
    heartRate?: number;
    bloodPressure?: string;
    bloodSugar?: number;
    bodyTemperature?: number;
    sleepDuration?: number;
    mood?: string;
    cabinCO2?: number;
    radiationDose?: number;
    healthScore?: number;
    missionDay?: number;
  };
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
}
