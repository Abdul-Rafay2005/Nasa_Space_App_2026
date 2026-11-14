/**
 * Aegis Health — Gemini API Key Configuration Modal
 * Any valid Gemini API key works. Any model name is accepted (free text + presets).
 */

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import {
  Key,
  Check,
  AlertCircle,
  ExternalLink,
  Cpu,
  Trash2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  getGeminiApiKey,
  saveGeminiApiKey,
  clearGeminiApiKey,
  getGeminiModel,
  saveGeminiModel,
  DEFAULT_MODEL,
} from '../../services/geminiChatService';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

const PRESET_MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', badge: 'Recommended' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', badge: 'Fast' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', badge: 'Deep reasoning' },
  { id: 'gemini-2.0-flash-thinking-exp', label: 'Gemini 2.0 Flash Thinking (Exp)', badge: 'Experimental' },
  { id: 'gemini-exp-1206', label: 'Gemini Exp 1206', badge: 'Experimental' },
];

export const GeminiApiKeyModal: React.FC<GeminiApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [apiKey, setApiKey] = useState(() => getGeminiApiKey());
  const [modelInput, setModelInput] = useState(() => getGeminiModel());
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleSave = () => {
    saveGeminiApiKey(apiKey.trim());
    saveGeminiModel(modelInput.trim() || DEFAULT_MODEL);
    onKeyUpdated?.();
    onClose();
  };

  const handleClear = () => {
    clearGeminiApiKey();
    setApiKey('');
    setTestStatus('idle');
    setTestMessage('');
    onKeyUpdated?.();
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key to test.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Contacting Gemini API...');

    // Test with the selected model, then try flash as fallback
    const modelsToTest = [modelInput.trim() || DEFAULT_MODEL, 'gemini-1.5-flash', 'gemini-2.0-flash'];
    for (const m of modelsToTest) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Reply: OK' }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        });

        if (res.ok) {
          setTestStatus('success');
          setTestMessage(`✅ API key is valid! Model "${m}" responded successfully.`);
          return;
        } else {
          const err = await res.json().catch(() => null);
          if (err?.error?.message?.includes('not found') || res.status === 404) {
            // Try next model
            continue;
          }
          setTestStatus('error');
          setTestMessage(err?.error?.message || `HTTP ${res.status} — key may be invalid or quota exhausted`);
          return;
        }
      } catch (e: unknown) {
        setTestStatus('error');
        setTestMessage(e instanceof Error ? e.message : 'Network error when testing key');
        return;
      }
    }
    setTestStatus('error');
    setTestMessage('All test models failed. Check your API key and network connection.');
  };

  const selectedPreset = PRESET_MODELS.find(m => m.id === modelInput);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gemini AI Configuration"
      subtitle="Enter your Google Gemini API key to enable live AI reasoning"
      maxWidth="md"
    >
      <div className="space-y-5 text-sm text-slate-300">
        {/* Info Banner */}
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-blue-200">
              {import.meta.env.VITE_GEMINI_API_KEY ? '✅ Key loaded from .env file' : 'Store in .env file (Recommended)'}
            </p>
            <p className="text-slate-400">
              Add <code className="text-cyan-300 font-mono">VITE_GEMINI_API_KEY=your_key</code> to your <code className="text-cyan-300 font-mono">.env</code> file in the project folder. Vite will load it automatically without needing any web input.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 pt-1"
            >
              Get Free API Key at aistudio.google.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Gemini API Key
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Key className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setTestStatus('idle'); }}
              placeholder="AIzaSy..."
              autoComplete="off"
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-white/10 bg-slate-900/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-2 flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2"
                title="Clear API Key"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" /> Gemini Model
            </label>
            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-[11px] text-slate-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              {showCustomInput ? 'Use Preset' : 'Enter Custom Model Name'}
            </button>
          </div>

          {showCustomInput ? (
            <input
              type="text"
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
              placeholder="e.g. gemini-2.0-flash or gemini-1.5-pro"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-900/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
          ) : (
            <div className="grid grid-cols-1 gap-1.5">
              {PRESET_MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModelInput(m.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    modelInput === m.id
                      ? 'border-blue-500 bg-blue-600/20 text-white'
                      : 'border-white/8 bg-slate-900/50 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-medium font-mono">{m.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    modelInput === m.id
                      ? 'bg-blue-500/40 text-blue-200'
                      : 'bg-slate-700/60 text-slate-400'
                  }`}>
                    {m.badge}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!showCustomInput && selectedPreset && (
            <p className="text-[11px] text-slate-500 pl-1">
              Selected: <span className="text-blue-300 font-mono">{modelInput}</span> — {selectedPreset.label}
            </p>
          )}
          {!showCustomInput && !selectedPreset && modelInput && (
            <p className="text-[11px] text-amber-400 pl-1">
              Custom model: <span className="font-mono">{modelInput}</span>
            </p>
          )}
        </div>

        {/* Test Status Banner */}
        {testStatus !== 'idle' && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
            testStatus === 'testing' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
            : testStatus === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}>
            {testStatus === 'testing' && <span className="animate-spin text-base">⌛</span>}
            {testStatus === 'success' && <Check className="w-4 h-4 shrink-0 mt-0.5" />}
            {testStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <span className="leading-snug">{testMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testStatus === 'testing' || !apiKey.trim()}
            className="px-3.5 py-2 rounded-xl border border-white/10 bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {testStatus === 'testing' ? (
              <><span className="animate-spin text-xs">⌛</span> Testing...</>
            ) : (
              'Test Connection'
            )}
          </button>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
