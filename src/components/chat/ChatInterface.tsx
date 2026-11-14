/**
 * Aegis Health — Dr. Orion AI Flight Surgeon Chat Interface
 * Renders Gemini responses with full markdown support and clean mission UI
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  Download,
  Radio,
  ChevronDown,
  Wifi,
  WifiOff,
  Pill,
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
import { ReferenceCountermeasuresModal } from './ReferenceCountermeasuresModal';
import { MarkdownMessage } from './MarkdownMessage';
import { getGroundLinkState } from '../../stores/groundLinkStore';

interface ChatInterfaceProps {
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
  historyRecords?: DailyAssessmentRecord[];
  isFloating?: boolean;
  onCloseFloating?: () => void;
}

const QUICK_PROMPTS = [
  { emoji: '💊', label: 'Reference Meds', text: 'Which medications and countermeasures are used for each medical issue according to the NASA reference document?' },
  { emoji: '📊', label: 'Health Summary', text: 'Summarize my health status and mission readiness for today' },
  { emoji: '❤️', label: 'Cardiovascular', text: 'Analyze my heart rate and blood pressure compared to my pre-flight baseline' },
  { emoji: '🛡️', label: 'Radiation & CO₂', text: 'What are my current radiation dose and cabin CO2 exposure levels?' },
  { emoji: '🏃', label: 'Countermeasures', text: 'Recommend specific countermeasure exercises and protocols for today' },
  { emoji: '👁️', label: 'SANS Check', text: 'Explain my SANS vision check status and any neuro-ocular risks' },
  { emoji: '😴', label: 'Sleep & Recovery', text: 'How is my sleep affecting my recovery and mission performance?' },
];

function buildWelcomeMessage(profile: AstronautProfile, latestAssessment?: DailyAssessmentRecord): string {
  const score = latestAssessment?.overall.score ?? 95;
  const status = latestAssessment?.overall.status ?? 'GREEN';
  const vitals = latestAssessment?.values;
  const statusIcon = status === 'GREEN' ? '✅' : status === 'YELLOW' ? '⚠️' : '🚨';

  return `## Welcome, ${profile.rank} ${profile.name}

I am **Dr. Orion**, your Aegis AI Flight Surgeon aboard **${profile.spacecraft}**.

I have full access to your Sol **${profile.currentMissionDay}** biomedical telemetry:

| Indicator | Today's Reading | Status |
|-----------|----------------|--------|
| Health Score | **${score}/100** | ${statusIcon} ${status} |
| Heart Rate | **${vitals?.heartRate ?? 72} BPM** | vs baseline ${profile.restingHeartRateBaseline} BPM |
| Blood Pressure | **${vitals?.systolic ?? 118}/${vitals?.diastolic ?? 76} mmHg** | vs baseline ${profile.bloodPressureBaseline.systolic}/${profile.bloodPressureBaseline.diastolic} |
| Sleep | **${vitals?.sleepDuration ?? 7.5}h** | ${(vitals?.sleepDuration ?? 7.5) >= 7 ? '✅ Adequate' : '⚠️ Below target'} |
| Cabin CO₂ | **2.8 mmHg** | ✅ Nominal |
| Radiation Dose | **142 mSv** | ✅ Within career limit |

Ask me anything about your vitals, recovery protocols, countermeasure exercises, or spaceflight health risks.`;
}

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
    return [{
      id: 'welcome-0',
      sender: 'assistant',
      text: buildWelcomeMessage(profile, latestAssessment),
      timestamp: new Date().toISOString(),
      modelUsed: 'Dr. Orion System',
      suggestions: ['Summarize my health status and mission readiness for today', 'Analyze my heart rate and blood pressure compared to my pre-flight baseline', 'Recommend specific countermeasure exercises and protocols for today'],
    }];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  // Track model — refreshed after key save
  const [activeModel, setActiveModel] = useState(() => getGeminiModel());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const groundState = getGroundLinkState();

  // Persist and scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    saveChatHistory(messages);
  }, [messages]);

  const refreshKeyState = useCallback(() => {
    setActiveModel(getGeminiModel());
  }, []);

  const handleSend = useCallback(async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputPrompt('');
    setIsGenerating(true);

    try {
      // sendGeminiChatMessage reads API key fresh from localStorage each time
      const aiResponse = await sendGeminiChatMessage(
        prompt,
        profile,
        latestAssessment,
        historyRecords,
        nextMessages
      );
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error('[ChatInterface] Unexpected error:', err);
    } finally {
      setIsGenerating(false);
      // Re-focus input after response
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputPrompt, isGenerating, messages, profile, latestAssessment, historyRecords]);

  const handleClearHistory = () => {
    if (window.confirm('Reset Dr. Orion consultation session?')) {
      localStorage.removeItem('aegis_chat_history_v1');
      setMessages([{
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: buildWelcomeMessage(profile, latestAssessment),
        timestamp: new Date().toISOString(),
        modelUsed: 'Dr. Orion System',
        suggestions: QUICK_PROMPTS.slice(0, 3).map(p => p.text),
      }]);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2500);
  };

  const handleExport = () => {
    const lines = [
      `AEGIS HEALTH — DR. ORION AI CONSULTATION RECORD`,
      `Astronaut: ${profile.rank} ${profile.name} (${profile.callSign})`,
      `Mission: ${profile.missionName} | Sol ${profile.currentMissionDay}`,
      `Generated: ${new Date().toISOString()}`,
      `Health Score: ${latestAssessment?.overall.score ?? 95}/100`,
      ``,
      ...messages.map((m) => {
        const who = m.sender === 'user' ? `[${profile.callSign}]` : '[Dr. Orion AI]';
        return `${new Date(m.timestamp).toLocaleTimeString()} ${who}\n${m.text}\n`;
      }),
      ``,
      `Note: Operational decision-support prototype. All data is simulated demonstration telemetry.`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aegis_Consultation_Sol${profile.currentMissionDay}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasApiKey = Boolean(getGeminiApiKey());

  return (
    <div className={`flex flex-col bg-[#060b18] rounded-2xl border border-white/10 shadow-2xl overflow-hidden ${isFloating ? 'h-full' : 'h-full'}`}>

      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0a0f24]/80 backdrop-blur-xl shrink-0">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
          <Bot className="w-5 h-5 text-white" />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">Dr. Orion</span>
            <span className="text-xs text-blue-400 font-medium">AI Flight Surgeon</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Telemetry
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {profile.name} • Sol {profile.currentMissionDay} • Score: {latestAssessment?.overall.score ?? 95}/100
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Reference Countermeasures & Medications Table Pill */}
          <button
            type="button"
            onClick={() => setIsMedModalOpen(true)}
            title="Inspect NASA Reference Medications & Countermeasures Table"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition-all"
          >
            <Pill className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Reference Meds</span>
          </button>

          {/* API Key pill — shows model if connected, warning pulse if not */}
          <button
            type="button"
            onClick={() => { setIsKeyModalOpen(true); }}
            title="Configure Gemini API Key"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
              hasApiKey
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 animate-pulse'
            }`}
          >
            {hasApiKey ? <Wifi className="w-3 h-3 text-blue-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
            <span className="hidden sm:inline">{hasApiKey ? activeModel : 'Add API Key'}</span>
          </button>

          <button type="button" onClick={handleExport} title="Export transcript" className="p-1.5 rounded-lg border border-white/8 hover:bg-white/8 text-slate-400 hover:text-white transition-colors">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={handleClearHistory} title="Clear session" className="p-1.5 rounded-lg border border-white/8 hover:bg-white/8 text-slate-400 hover:text-rose-400 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {isFloating && onCloseFloating && (
            <button type="button" onClick={onCloseFloating} title="Close" className="p-1.5 rounded-lg border border-white/8 hover:bg-white/8 text-slate-400 hover:text-white transition-colors ml-0.5">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mars delay banner */}
      {groundState.mode === 'mars_delay' && (
        <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-300 shrink-0">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Mars Delay Mode active (22-min latency) — Dr. Orion running autonomous EIMO 2023 protocol.</span>
        </div>
      )}

      {/* No API key notice */}
      {!hasApiKey && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/25 text-xs text-amber-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Offline Mode:</strong> Add your Gemini API key in <code>.env</code> (<code>VITE_GEMINI_API_KEY=...</code>) to enable live AI reasoning.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsKeyModalOpen(true)}
            className="shrink-0 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-200 font-semibold text-xs transition-colors"
          >
            Details
          </button>
        </div>
      )}

      {/* ── MESSAGES STREAM ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar bubble */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md mt-0.5 ${
                isUser
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  : 'bg-gradient-to-br from-indigo-600 to-blue-700 border border-white/15'
              }`}>
                {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>

              {/* Bubble */}
              <div className={`flex-1 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
                {/* Bubble header label */}
                {!isUser && (
                  <div className="flex items-center gap-2 mb-1.5 pl-0.5">
                    <span className="text-[11px] font-semibold text-blue-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-400" /> Dr. Orion AI
                    </span>
                    {msg.modelUsed && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded-md border border-white/5">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-600">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                <div className={`relative group rounded-2xl px-4 py-3 shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm'
                    : 'bg-[#0d1530]/90 border border-white/8 rounded-tl-sm backdrop-blur-sm'
                }`}>
                  {/* Copy button */}
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="absolute top-2.5 right-2.5 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 text-slate-500 hover:text-white transition-all"
                      title="Copy response"
                    >
                      {copiedMsgId === msg.id
                        ? <Check className="w-3 h-3 text-emerald-400" />
                        : <Copy className="w-3 h-3" />
                      }
                    </button>
                  )}

                  {/* Message content */}
                  {isUser ? (
                    <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                  ) : (
                    <MarkdownMessage content={msg.text} />
                  )}
                </div>

                {/* Suggestion chips attached to message */}
                {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pl-0.5">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(sug)}
                        disabled={isGenerating}
                        className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/25 border border-white/8 hover:border-blue-500/40 text-slate-300 hover:text-blue-200 transition-all disabled:opacity-50 leading-tight text-left"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}

                {/* User timestamp */}
                {isUser && (
                  <span className="text-[10px] text-slate-600 mt-1 mr-0.5 block text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Generating indicator */}
        {isGenerating && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 border border-white/15 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-[#0d1530]/90 border border-white/8 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-400">
                Dr. Orion is analyzing your telemetry{hasApiKey ? ` via ${activeModel}` : ' (offline mode)'}...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── QUICK PROMPT CHIPS ── */}
      <div className="px-4 py-2 border-t border-white/8 bg-[#080c1e]/60 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-2 w-max">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handleSend(p.text)}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-blue-600/25 border border-white/8 hover:border-blue-500/35 whitespace-nowrap transition-all disabled:opacity-50"
            >
              <span>{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── INPUT BAR ── */}
      <div className="px-4 py-3 border-t border-white/8 bg-[#0a0f24]/90 shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask Dr. Orion about your Sol ${profile.currentMissionDay} health, vitals, or countermeasures...`}
            disabled={isGenerating}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isGenerating}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        <p className="text-[10px] text-slate-700 mt-1.5 text-center">
          Decision-support prototype · Demonstration data · Complies with NASA-STD-3001
        </p>
      </div>

      {/* Gemini Key Modal */}
      <GeminiApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeyUpdated={refreshKeyState}
      />

      {/* NASA Reference Countermeasures & Medications Modal */}
      <ReferenceCountermeasuresModal
        isOpen={isMedModalOpen}
        onClose={() => setIsMedModalOpen(false)}
        onAskDrOrion={handleSend}
      />
    </div>
  );
};
