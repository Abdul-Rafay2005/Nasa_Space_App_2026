/**
 * Aegis Health — Chat Interface Component
 * Reusable full-featured chat interface powered by Google Gemini API
 * Used in both full page and floating quick drawer
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Key,
  RotateCcw,
  Copy,
  Check,
  Download,
  Radio,
  ChevronDown,
} from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { AstronautProfile, DailyAssessmentRecord } from '../../types/health';
import {
  getGeminiApiKey,
  getGeminiModel,
  sendGeminiChatMessage,
  loadChatHistory,
  saveChatHistory,
} from '../../services/geminiChatService';
import { GeminiApiKeyModal } from './GeminiApiKeyModal';
import { getGroundLinkState } from '../../stores/groundLinkStore';

interface ChatInterfaceProps {
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
  historyRecords?: DailyAssessmentRecord[];
  isFloating?: boolean;
  onCloseFloating?: () => void;
}

const INITIAL_SUGGESTIONS = [
  '📊 Summarize my mission day progress & score',
  '❤️ Analyze my heart rate and BP vs baseline',
  '🛡️ What are my radiation & cabin CO2 risks?',
  '🏃 Suggest countermeasures for my routine',
  '👁️ Check my SANS vision & headache protocol',
  '📡 Advise on autonomous Mars Delay protocol',
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  profile,
  latestAssessment,
  historyRecords = [],
  isFloating = false,
  onCloseFloating,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = loadChatHistory();
    if (saved.length > 0) return saved;

    // Default welcome message
    const score = latestAssessment?.overall.score ?? 95;
    return [
      {
        id: 'welcome-msg',
        sender: 'assistant',
        text: `### 🩺 Greetings, ${profile.rank} ${profile.name}
I am **Dr. Orion**, your Aegis AI Flight Surgeon and Telemedicine Officer. I have full real-time access to your biomedical telemetry for **Sol ${profile.currentMissionDay}**.

**Telemetry Snapshot:**
- **Health Composite Score:** **${score}/100** (\`${latestAssessment?.overall.status ?? 'GREEN'}\`)
- **Resting Heart Rate:** **${latestAssessment?.values.heartRate ?? 72} BPM** (Baseline: ${profile.restingHeartRateBaseline} BPM)
- **Blood Pressure:** **${latestAssessment?.values.systolic ?? 118}/${latestAssessment?.values.diastolic ?? 76} mmHg**
- **Environmental Safety:** Cabin CO₂: **2.8 mmHg** | Space Radiation: **142 mSv**

Ask me anything regarding your physiological status, countermeasure exercises, recovery protocols, or operational spaceflight risks.`,
        timestamp: new Date().toISOString(),
        modelUsed: 'Aegis System Engine',
        suggestions: [
          'How is my cardiovascular recovery progressing?',
          'What are my radiation & CO2 exposure levels?',
          'Suggest countermeasures for my daily routine',
        ],
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(() => Boolean(getGeminiApiKey()));
  const [activeModel, setActiveModel] = useState(() => getGeminiModel());
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const groundState = getGroundLinkState();

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    saveChatHistory(messages);
  }, [messages]);

  // Sync API key state
  const handleKeyUpdated = () => {
    setHasApiKey(Boolean(getGeminiApiKey()));
    setActiveModel(getGeminiModel());
  };

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputPrompt('');
    setIsGenerating(true);

    try {
      const aiResponse = await sendGeminiChatMessage(
        prompt,
        profile,
        latestAssessment,
        historyRecords,
        updated
      );
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error('[ChatInterface] Failed to generate response:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear AI consultation history and restart session?')) {
      localStorage.removeItem('aegis_chat_history_v1');
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          text: `Consultation session restarted. Telemetry for ${profile.rank} ${profile.name} (Sol ${profile.currentMissionDay}) loaded and ready. How may I assist your mission recovery today?`,
          timestamp: new Date().toISOString(),
          suggestions: INITIAL_SUGGESTIONS.slice(0, 3),
        },
      ]);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleExportTranscript = () => {
    const transcript = [
      `=============================================================`,
      `AEGIS HEALTH — AI FLIGHT SURGEON MEDICAL CONSULTATION RECORD`,
      `=============================================================`,
      `Date/Time (UTC): ${new Date().toISOString()}`,
      `Astronaut: ${profile.rank} ${profile.name} (${profile.callSign})`,
      `Mission: ${profile.missionName} | Sol: ${profile.currentMissionDay}`,
      `Spacecraft: ${profile.spacecraft}`,
      `Health Score: ${latestAssessment?.overall.score ?? 95}/100 (${latestAssessment?.overall.status ?? 'GREEN'})`,
      `Ground Comms Mode: ${groundState.mode}`,
      `-------------------------------------------------------------`,
      ``,
      ...messages.map((m) => {
        const who = m.sender === 'user' ? `${profile.callSign} (Astronaut)` : 'Dr. Orion (AI Flight Surgeon)';
        return `[${new Date(m.timestamp).toLocaleTimeString()}] ${who}:\n${m.text}\n`;
      }),
      `=============================================================`,
      `DISCLAIMER: Operational decision-support prototype. Complies with NASA-STD-3001.`,
    ].join('\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aegis_Consultation_Sol_${profile.currentMissionDay}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-col h-full bg-[#070b1a]/95 rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl ${isFloating ? 'max-h-[640px]' : ''}`}>
      {/* Header HUD */}
      <div className="px-4 py-3 border-b border-white/10 bg-slate-900/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-wide truncate">
                Dr. Orion <span className="text-xs font-normal text-blue-400">AI Flight Surgeon</span>
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Telemetry
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {profile.name} • Sol {profile.currentMissionDay} • Score: {latestAssessment?.overall.score ?? 95}/100
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Gemini API Key Status Pill */}
          <button
            type="button"
            onClick={() => setIsKeyModalOpen(true)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              hasApiKey
                ? 'border-blue-500/40 bg-blue-500/15 text-blue-300 hover:bg-blue-500/25'
                : 'border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 animate-pulse'
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-mono text-[11px]">
              {hasApiKey ? activeModel : 'Add Gemini Key'}
            </span>
          </button>

          {/* Export Transcript */}
          <button
            type="button"
            onClick={handleExportTranscript}
            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Export Medical Transcript (.txt)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Clear Session */}
          <button
            type="button"
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-rose-400 transition-colors"
            title="Reset Chat Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Close Floating button if in floating drawer */}
          {isFloating && onCloseFloating && (
            <button
              type="button"
              onClick={onCloseFloating}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-colors ml-1"
              title="Close Chat"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Ground Link Status Bar if Mars Delay active */}
      {groundState.mode === 'mars_delay' && (
        <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Mars Latency Active (22 min delay). Dr. Orion operating in <strong>Autonomous EIMO Protocol</strong> mode.</span>
          </div>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-blue-500 to-cyan-500 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-blue-700 text-white border border-white/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed transition-all shadow-lg ${
                  isUser
                    ? 'bg-blue-600/90 text-white rounded-tr-none'
                    : 'bg-slate-900/80 text-slate-200 border border-white/10 rounded-tl-none backdrop-blur-md'
                }`}
              >
                {/* Header label for AI */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10 text-[11px] text-slate-400">
                    <span className="font-semibold text-blue-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-400" /> Dr. Orion AI
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy Response"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Body Content - Markdown formatted */}
                <div className="prose prose-invert prose-xs max-w-none space-y-2 whitespace-pre-wrap">
                  {msg.text}
                </div>

                {/* Suggestions Pills attached to AI message */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-white/10 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(sug)}
                        disabled={isGenerating}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/20 text-blue-300 transition-all text-left"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isGenerating && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-700 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-900/80 border border-white/10 text-slate-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span>Dr. Orion is evaluating biomedical telemetry with Gemini AI...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips (above input) */}
      <div className="px-4 py-2 border-t border-white/10 bg-slate-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-400" /> Prompts:
        </span>
        {INITIAL_SUGGESTIONS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            disabled={isGenerating}
            className="px-2.5 py-1 rounded-lg text-[11px] text-slate-300 hover:text-white bg-slate-800/80 hover:bg-blue-600/30 border border-white/10 hover:border-blue-500/30 whitespace-nowrap transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-white/10 bg-slate-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask Dr. Orion about vitals, recovery, countermeasures, or mission day ${profile.currentMissionDay}...`}
            disabled={isGenerating}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isGenerating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

      {/* Gemini API Key Modal */}
      <GeminiApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeyUpdated={handleKeyUpdated}
      />
    </div>
  );
};
