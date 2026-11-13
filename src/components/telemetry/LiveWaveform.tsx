/**
 * Aegis Health — Live Interactive Waveform Card
 * Compliant with PLAN.md Section 7.5 & Section 10.1
 */

import React, { useState } from 'react';
import { WaveformCanvas } from './WaveformCanvas';
import { useTelemetryControls, useTelemetrySnapshot } from '../../stores/telemetryStore';
import { DEMO_SCENARIOS } from '../../config/demoScenarios';
import {
  Play,
  Pause,
  Activity,
  SlidersHorizontal,
  AlertCircle,
} from 'lucide-react';

export const LiveWaveform: React.FC = () => {
  const { ringBuffer, currentScenario, setScenario } = useTelemetryControls();
  const snapshot = useTelemetrySnapshot();
  const [isPaused, setIsPaused] = useState(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  const hrVal = snapshot.heartRate.value;
  const hrQuality = snapshot.heartRate.quality;
  const activeScenario = DEMO_SCENARIOS[currentScenario] || DEMO_SCENARIOS.resting;

  return (
    <div className="w-full rounded-3xl bg-[#0c142c]/90 border border-[#1b2752] p-5 shadow-2xl backdrop-blur-xl space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white font-sans tracking-wide">
                Live Heartbeat Stream
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300">
                250 Hz · Lead II
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Simulated Electrocardiographic Waveform · {activeScenario.name}
            </p>
          </div>
        </div>

        {/* Live Synchronized BPM Display & Pause Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#070b1a] border border-[#1b2752]">
            <span className="text-2xl font-black text-white font-mono leading-none">
              {hrVal !== null ? hrVal : '—'}
            </span>
            <span className="text-xs text-slate-400 font-medium">BPM</span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-[#1b2752]'
            }`}
            title={isPaused ? 'Resume display' : 'Pause display'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          <button
            onClick={() => setShowScenarioMenu(!showScenarioMenu)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all"
            title="Demonstration Scenarios"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>SCENARIOS</span>
          </button>
        </div>
      </div>

      {/* Scenario Selection Drawer (collapsible) */}
      {showScenarioMenu && (
        <div className="p-3.5 rounded-2xl bg-[#070b1a] border border-cyan-500/30 space-y-2 animate-fade-in font-sans">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
            Select Demonstration Scenario:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {Object.values(DEMO_SCENARIOS).map((sc) => {
              const isActive = sc.id === currentScenario;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    setScenario(sc.id);
                    setShowScenarioMenu(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-cyan-600/30 border-cyan-400 text-white font-bold shadow-md shadow-cyan-900/40'
                      : 'bg-[#0c142c] border-[#1b2752] text-slate-400 hover:text-slate-200 hover:bg-[#131d3d]'
                  }`}
                >
                  <span className="text-xs block leading-tight">{sc.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    {sc.targetBpm} BPM
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hospital Monitor Canvas Waveform */}
      <div className="relative border border-[#1b2752] rounded-2xl overflow-hidden shadow-inner">
        <WaveformCanvas
          ringBuffer={ringBuffer}
          isPaused={isPaused}
          sampleRateHz={250}
          windowDurationSeconds={8}
          color={hrQuality === 'degraded' ? '#f59e0b' : '#10b981'}
          height={160}
        />

        {/* Paused Overlay Indicator */}
        {isPaused && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold backdrop-blur-md">
            DISPLAY PAUSED · MONITORING CONTINUES
          </div>
        )}

        {/* Quality / Dropout Warning Overlay */}
        {activeScenario.dropoutActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>SIGNAL INTERRUPTED · TRUE ZERO-FABRICATION GAP</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 pt-1 border-t border-[#1b2752]/60">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Source: {snapshot.sourceDescriptor?.label || 'Simulation'}</span>
        </span>
        <span className="text-slate-500">
          Sample Buffer: 30s Ring Capacity (7,500 points) · 8s Screen Window
        </span>
      </div>
    </div>
  );
};
