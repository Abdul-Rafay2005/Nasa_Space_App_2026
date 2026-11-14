/**
 * Aegis Health — Gemini API Key Configuration Modal
 * Allows entering and testing Google Gemini API Key and selecting model
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
} from 'lucide-react';
import {
  getGeminiApiKey,
  saveGeminiApiKey,
  clearGeminiApiKey,
  getGeminiModel,
  saveGeminiModel,
  AVAILABLE_MODELS,
} from '../../services/geminiChatService';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export const GeminiApiKeyModal: React.FC<GeminiApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [apiKey, setApiKey] = useState(() => getGeminiApiKey());
  const [selectedModel, setSelectedModel] = useState(() => getGeminiModel());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleSave = () => {
    saveGeminiApiKey(apiKey.trim());
    saveGeminiModel(selectedModel);
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
    setTestMessage('Contacting Google Gemini API...');

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with exactly: OK' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      });

      if (res.ok) {
        setTestStatus('success');
        setTestMessage('Connection successful! Gemini API key is valid.');
      } else {
        const err = await res.json().catch(() => null);
        setTestStatus('error');
        setTestMessage(err?.error?.message || `HTTP ${res.status}: Validation failed`);
      }
    } catch (e: unknown) {
      setTestStatus('error');
      setTestMessage(e instanceof Error ? e.message : 'Network failure when testing key');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Gemini AI Configuration"
      subtitle="Connect your Gemini API Key to enable real-time conversational clinical reasoning"
      maxWidth="md"
    >
      <div className="space-y-5 text-sm text-slate-300">
        {/* Banner with AI Studio Link */}
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 backdrop-blur-md flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-blue-300">Google Gemini API</p>
            <p>
              Get a free API key from Google AI Studio. Your key is stored locally in your browser and never leaves your client.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 pt-1"
            >
              Get Free Gemini API Key <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Gemini API Key
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Key className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestStatus('idle');
              }}
              placeholder="AIzaSy..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-white/10 bg-slate-900/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-2 px-2 my-auto text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                title="Clear Key"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Select Gemini Model
          </label>
          <div className="grid grid-cols-1 gap-2">
            {AVAILABLE_MODELS.map((m) => (
              <label
                key={m.id}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedModel === m.id
                    ? 'border-blue-500 bg-blue-600/20 text-white'
                    : 'border-white/10 bg-slate-900/50 text-slate-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="geminiModel"
                    value={m.id}
                    checked={selectedModel === m.id}
                    onChange={() => setSelectedModel(m.id)}
                    className="accent-blue-500"
                  />
                  <span className="text-xs font-medium">{m.name}</span>
                </div>
                {selectedModel === m.id && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 font-mono">
                    Active
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Validation / Test Status Banner */}
        {testStatus !== 'idle' && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              testStatus === 'testing'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                : testStatus === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            }`}
          >
            {testStatus === 'testing' && <span className="animate-spin mr-1">⌛</span>}
            {testStatus === 'success' && <Check className="w-4 h-4 shrink-0" />}
            {testStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{testMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testStatus === 'testing' || !apiKey.trim()}
            className="px-3.5 py-2 rounded-xl border border-white/10 bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 transition-colors disabled:opacity-50"
          >
            {testStatus === 'testing' ? 'Testing Key...' : 'Test Connection'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
