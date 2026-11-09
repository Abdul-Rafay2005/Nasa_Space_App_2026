/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Form Input Component with Validation & Guidance
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AssessmentInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  unit: string;
  placeholder?: string;
  description?: string;
  error?: string;
  required?: boolean;
  type?: 'text' | 'number';
  min?: number;
  max?: number;
  step?: string | number;
  icon?: React.ReactNode;
}

export const AssessmentInput: React.FC<AssessmentInputProps> = ({
  id,
  label,
  value,
  onChange,
  unit,
  placeholder,
  description,
  error,
  required = true,
  type = 'number',
  min,
  max,
  step = 'any',
  icon,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 tracking-wide uppercase font-sans"
        >
          {icon && <span className="text-cyan-400">{icon}</span>}
          <span>{label}</span>
          {required && <span className="text-rose-400">*</span>}
        </label>
        <span className="text-[11px] font-mono text-cyan-400 bg-space-950 px-2 py-0.5 rounded border border-slate-800">
          {unit}
        </span>
      </div>

      <div className="relative rounded-xl shadow-sm">
        <input
          id={id}
          type={type}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-xl border bg-space-950/90 px-3.5 py-2.5 font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
            error
              ? 'border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50 shadow-neon-red/20'
              : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
          }`}
        />
      </div>

      {description && !error && (
        <p className="text-[11px] text-slate-400 leading-normal font-sans">
          {description}
        </p>
      )}

      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-400 font-mono">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
