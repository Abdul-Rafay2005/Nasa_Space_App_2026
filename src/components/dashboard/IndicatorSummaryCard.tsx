/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Health Indicator Telemetry Summary Card
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React from 'react';
import { IndicatorResult } from '../../types/health';
import { StatusBadge } from '../common/StatusBadge';
import {
  HeartPulse,
  Gauge,
  Droplet,
  Thermometer,
  Moon,
  Smile,
  Info,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface IndicatorSummaryCardProps {
  indicator: IndicatorResult;
  onClickDetail?: () => void;
}

export const IndicatorSummaryCard: React.FC<IndicatorSummaryCardProps> = ({
  indicator,
  onClickDetail,
}) => {
  const getIcon = () => {
    switch (indicator.indicatorId) {
      case 'heartRate':
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case 'bloodPressure':
        return <Gauge className="w-5 h-5 text-blue-400" />;
      case 'bloodSugar':
        return <Droplet className="w-5 h-5 text-amber-400" />;
      case 'bodyTemperature':
        return <Thermometer className="w-5 h-5 text-red-400" />;
      case 'sleepDuration':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'mood':
        return <Smile className="w-5 h-5 text-emerald-400" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const borderGlow =
    indicator.status === 'RED'
      ? 'border-rose-500/50 shadow-neon-red/20'
      : indicator.status === 'YELLOW'
      ? 'border-amber-500/40 shadow-neon-yellow/20'
      : 'border-slate-800 hover:border-cyan-500/40';

  return (
    <div
      onClick={onClickDetail}
      className={`group relative flex flex-col justify-between rounded-xl bg-space-900/90 border p-4 backdrop-blur-md transition-all duration-200 cursor-pointer ${borderGlow}`}
    >
      {/* Top Header: Icon, Name & Status Badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-space-950 border border-slate-800">
              {getIcon()}
            </div>
            <div>
              <h4 className="font-sans font-semibold text-xs tracking-wider text-slate-200 uppercase">
                {indicator.displayName}
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                Target: {indicator.nominalRangeLabel}
              </span>
            </div>
          </div>
          <StatusBadge status={indicator.status} label={indicator.statusLabel} size="sm" />
        </div>

        {/* Central Metric Value Display */}
        <div className="my-2 flex items-baseline gap-2">
          <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            {indicator.valueDisplay}
          </span>
          <span className="font-mono text-xs text-cyan-400 font-medium uppercase">
            {indicator.unit}
          </span>

          {/* Deviation from Baseline if applicable */}
          {indicator.deviationPercent !== undefined && (
            <div className="ml-auto flex items-center gap-1 font-mono text-[11px]">
              {indicator.deviationPercent > 0 ? (
                <span className="text-amber-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />+{indicator.deviationPercent}%
                </span>
              ) : indicator.deviationPercent < 0 ? (
                <span className="text-cyan-400 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" />{indicator.deviationPercent}%
                </span>
              ) : (
                <span className="text-slate-400">Baseline</span>
              )}
            </div>
          )}
        </div>

        {/* Status Explanation / Clinical Reasoning */}
        <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-2 mt-1">
          {indicator.reason}
        </p>
      </div>

      {/* Footer Baseline Info & Click prompt */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        {indicator.baselineNominal ? (
          <span>Base: <strong className="text-slate-300">{indicator.baselineNominal}</strong></span>
        ) : (
          <span>Telemetry active</span>
        )}
        <span className="text-cyan-400/80 group-hover:text-cyan-300 transition-colors">
          Inspect →
        </span>
      </div>
    </div>
  );
};

