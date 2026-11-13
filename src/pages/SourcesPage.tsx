/**
 * Aegis Health — Sources & Settings Management Page
 * Compliant with PLAN.md Section 10.10
 */

import React, { useState } from 'react';
import { useTelemetryControls, useTelemetrySnapshot, telemetryController } from '../stores/telemetryStore';
import { WebSocketSource } from '../services/telemetry/adapters/WebSocketSource';
import { SimulationSource } from '../services/telemetry/adapters/SimulationSource';
import { DEMO_SCENARIOS } from '../config/demoScenarios';
import { formatAge } from '../lib/time';
import {
  Radio,
  Cpu,
  SlidersHorizontal,
  Server,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const SourcesPage: React.FC = () => {
  const { currentScenario, setScenario } = useTelemetryControls();
  const snapshot = useTelemetrySnapshot();
  const [gatewayUrl, setGatewayUrl] = useState('ws://localhost:8787/telemetry');
  const [activeMode, setActiveMode] = useState<'simulation' | 'gateway'>(
    snapshot.sourceDescriptor?.kind === 'device' ? 'gateway' : 'simulation'
  );

  const handleSwitchToSimulation = async () => {
    setActiveMode('simulation');
    await telemetryController.switchToSource(new SimulationSource(2026, 'resting'));
  };

  const handleSwitchToGateway = async () => {
    setActiveMode('gateway');
    await telemetryController.switchToSource(new WebSocketSource(gatewayUrl));
  };

  const hrAge = snapshot.heartRate.ageSeconds;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12 select-none font-sans">
      {/* Page Header */}
      <div className="p-6 rounded-3xl bg-[#0c142c]/90 border border-[#1b2752] shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs mb-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>TELEMETRY INGESTION ARCHITECTURE</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Telemetry Sources & Configuration</h1>
            <p className="text-sm text-slate-300 mt-1">
              Select between the in-browser physiological simulation or live hardware streaming via the Aegis Telemetry Gateway.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#070b1a] border border-[#1b2752]">
            <button
              onClick={handleSwitchToSimulation}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeMode === 'simulation'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>SIMULATION</span>
            </button>

            <button
              onClick={handleSwitchToGateway}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeMode === 'gateway'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>HARDWARE GATEWAY</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Source Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-[#0c142c]/80 border border-[#1b2752] space-y-3">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
            SOURCE STATUS
          </span>
          <div className="flex items-center gap-3">
            <span
              className={`w-3.5 h-3.5 rounded-full ${
                snapshot.sourceState === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : snapshot.sourceState === 'connecting' || snapshot.sourceState === 'reconnecting'
                  ? 'bg-amber-400 animate-spin'
                  : 'bg-rose-500'
              }`}
            />
            <h3 className="text-lg font-bold text-white capitalize">{snapshot.sourceState}</h3>
          </div>
          <p className="text-xs text-slate-400">
            Active Provider: <strong className="text-slate-200">{snapshot.sourceDescriptor?.label}</strong>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#0c142c]/80 border border-[#1b2752] space-y-3">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
            INGESTION CADENCE
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono">250</span>
            <span className="text-xs text-slate-400">Hz (Samples / sec)</span>
          </div>
          <p className="text-xs text-slate-400">
            Last accepted reading: <strong className="text-emerald-400 font-mono">{formatAge(hrAge)}</strong>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#0c142c]/80 border border-[#1b2752] space-y-3">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
            BUFFER RETENTION
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono">30</span>
            <span className="text-xs text-slate-400">Seconds (7,500 samples)</span>
          </div>
          <p className="text-xs text-slate-400">Hardware-accelerated Ring Buffer</p>
        </div>
      </div>

      {/* Mode Configurations */}
      {activeMode === 'simulation' ? (
        <div className="p-6 rounded-3xl bg-[#0c142c]/80 border border-[#1b2752] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Demonstration Scenarios</h2>
            </div>
            <span className="text-xs font-mono text-cyan-300">Deterministic Seed: 2026</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(DEMO_SCENARIOS).map((sc) => {
              const isSelected = sc.id === currentScenario;
              return (
                <button
                  key={sc.id}
                  onClick={() => setScenario(sc.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-600/20 border-cyan-400 text-white shadow-lg shadow-cyan-900/30'
                      : 'bg-[#070b1a] border-[#1b2752] text-slate-400 hover:text-white hover:bg-[#111c3d]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-white">{sc.name}</span>
                    <span className="text-xs font-mono text-cyan-400">{sc.targetBpm} BPM</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{sc.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-[#0c142c]/80 border border-[#1b2752] space-y-4">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Aegis Telemetry Gateway Connection</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={gatewayUrl}
              onChange={(e) => setGatewayUrl(e.target.value)}
              className="flex-1 w-full px-4 py-2.5 rounded-xl bg-[#070b1a] border border-[#1b2752] text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              placeholder="ws://localhost:8787/telemetry"
            />
            <button
              onClick={handleSwitchToGateway}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold font-mono tracking-wider hover:from-blue-500 hover:to-cyan-500 transition-all shrink-0"
            >
              CONNECT STREAM
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#070b1a] border border-[#1b2752] text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold">
              <Info className="w-4 h-4" />
              <span>How to run the local Gateway:</span>
            </div>
            <p className="font-mono text-[11px] text-slate-400">
              1. Open terminal: <code className="text-cyan-300">cd gateway && node src/server.js</code>
              <br />
              2. Run streaming test publisher: <code className="text-cyan-300">node src/publishers/demoPublisher.js</code>
            </p>
          </div>
        </div>
      )}

      {/* Disclaimers & Mission Integrity */}
      <div className="p-4 rounded-2xl bg-[#0c142c]/70 border border-[#1b2752] flex items-center gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
        <p>
          <strong className="text-slate-200">Truthful Telemetry Assurance:</strong> Aegis Health never fabricates flatlines or fills gaps during sensor disconnects. Real-time acquisition states adhere strictly to Section 3.4 of PLAN.md.
        </p>
      </div>
    </div>
  );
};
