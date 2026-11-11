/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Daily Health Check-in Page — Phase 2 UI (matches Abdullah's design image 02)
 * Lead Developer: Abdul Rafay
 */

import React, { useState } from 'react';
import {
  Heart,
  Gauge,
  Droplets,
  Thermometer,
  Moon,
  Smile,
  CheckCircle,
  RotateCcw,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import {
  AssessmentFormValues,
  DailyAssessmentRecord,
  MoodType,
  AstronautProfile,
  ParsedAssessmentValues,
} from '../types/health';
import { MOOD_OPTIONS } from '../config/thresholds';
import { evaluateAllIndicators, calculateOverallHealth } from '../services/healthStatus';

interface DailyAssessmentProps {
  profile: AstronautProfile;
  onSubmitSuccess: (record: DailyAssessmentRecord) => void;
  onNavigateToDashboard: () => void;
}

/* ── Reusable vital input card ───────────────────────────────────────── */
interface VitalInputProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: string;
  min?: number;
  max?: number;
  error?: string;
  type?: string;
}
const VitalInput: React.FC<VitalInputProps> = ({
  icon, iconBg, label, unit, value, onChange,
  placeholder, step, min, max, error, type = 'number',
}) => (
  <div className={`p-4 rounded-2xl bg-[#111827] border transition-all ${error ? 'border-red-500/40' : 'border-white/5 hover:border-blue-500/20'}`}>
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <span className="text-sm font-semibold text-white">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        className="flex-1 bg-transparent text-2xl font-bold text-white placeholder-slate-600 outline-none focus:outline-none w-full"
        style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
      />
      <span className="text-xs text-slate-400 shrink-0">{unit}</span>
    </div>
    {error && (
      <p className="mt-1 text-[11px] text-red-400 font-mono">{error}</p>
    )}
  </div>
);

/* ── Main component ──────────────────────────────────────────────────── */
export const DailyAssessment: React.FC<DailyAssessmentProps> = ({
  profile,
  onSubmitSuccess,
  onNavigateToDashboard,
}) => {
  const initialValues: AssessmentFormValues = {
    heartRate: '', systolic: '', diastolic: '',
    bloodSugar: '', bodyTemperature: '', sleepDuration: '',
    mood: 'good', notes: '',
  };
  const [formValues, setFormValues] = useState<AssessmentFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successFeedback, setSuccessFeedback] = useState<DailyAssessmentRecord | null>(null);

  /* quick prefills */
  const handlePrefillNominal = () => {
    setFormValues({ heartRate: '72', systolic: '118', diastolic: '76', bloodSugar: '92', bodyTemperature: '36.6', sleepDuration: '7.75', mood: 'good', notes: '' });
    setErrors({});
  };
  const handlePrefillWarning = () => {
    setFormValues({ heartRate: '96', systolic: '136', diastolic: '88', bloodSugar: '124', bodyTemperature: '37.6', sleepDuration: '5.8', mood: 'fatigued', notes: '' });
    setErrors({});
  };
  const handlePrefillCritical = () => {
    setFormValues({ heartRate: '118', systolic: '152', diastolic: '96', bloodSugar: '148', bodyTemperature: '38.4', sleepDuration: '4.2', mood: 'disoriented', notes: '' });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const hr = parseFloat(formValues.heartRate);
    if (!formValues.heartRate || isNaN(hr) || hr < 30 || hr > 220) newErrors.heartRate = 'Enter valid heart rate (30–220 BPM)';
    const sys = parseFloat(formValues.systolic);
    if (!formValues.systolic || isNaN(sys) || sys < 60 || sys > 260) newErrors.systolic = 'Enter valid systolic (60–260 mmHg)';
    const dia = parseFloat(formValues.diastolic);
    if (!formValues.diastolic || isNaN(dia) || dia < 35 || dia > 160) newErrors.diastolic = 'Enter valid diastolic (35–160 mmHg)';
    else if (!isNaN(sys) && dia >= sys) newErrors.diastolic = 'Diastolic must be less than systolic';
    const sugar = parseFloat(formValues.bloodSugar);
    if (!formValues.bloodSugar || isNaN(sugar) || sugar < 30 || sugar > 600) newErrors.bloodSugar = 'Enter valid glucose (30–600 mg/dL)';
    const temp = parseFloat(formValues.bodyTemperature);
    if (!formValues.bodyTemperature || isNaN(temp) || temp < 32 || temp > 43) newErrors.bodyTemperature = 'Enter valid temperature (32–43 °C)';
    const sleep = parseFloat(formValues.sleepDuration);
    if (!formValues.sleepDuration || isNaN(sleep) || sleep < 0 || sleep > 24) newErrors.sleepDuration = 'Enter valid sleep (0–24 hours)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const parsed: ParsedAssessmentValues = {
      heartRate: parseFloat(formValues.heartRate),
      systolic: parseFloat(formValues.systolic),
      diastolic: parseFloat(formValues.diastolic),
      bloodSugar: parseFloat(formValues.bloodSugar),
      bodyTemperature: parseFloat(formValues.bodyTemperature),
      sleepDuration: parseFloat(formValues.sleepDuration),
      mood: formValues.mood,
      notes: formValues.notes?.trim() || undefined,
    };
    const evaluatedResults = evaluateAllIndicators(parsed, profile);
    const overall = calculateOverallHealth(evaluatedResults);
    const newRecord: DailyAssessmentRecord = {
      id: `REC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      missionDay: profile.currentMissionDay,
      astronautId: profile.id,
      values: parsed,
      results: evaluatedResults,
      overall,
      isDemonstrationData: false,
    };
    setSuccessFeedback(newRecord);
    onSubmitSuccess(newRecord);
  };

  /* ── Success screen ───────────────────────────────────────────────── */
  if (successFeedback) {
    const statusColor = successFeedback.overall.status === 'GREEN' ? 'text-green-400' : successFeedback.overall.status === 'RED' ? 'text-red-400' : 'text-yellow-400';
    const statusBg = successFeedback.overall.status === 'GREEN' ? 'bg-green-500/15 border-green-500/30' : successFeedback.overall.status === 'RED' ? 'bg-red-500/15 border-red-500/30' : 'bg-yellow-500/15 border-yellow-500/30';
    return (
      <div className="max-w-lg mx-auto text-center animate-fade-in py-12 space-y-6">
        <div className={`inline-flex flex-col items-center gap-3 p-8 rounded-2xl border ${statusBg}`}>
          <CheckCircle className={`w-14 h-14 ${statusColor}`} />
          <h2 className="text-xl font-bold text-white">Check-in Recorded!</h2>
          <div className={`px-4 py-1.5 rounded-full font-semibold text-sm ${statusColor} border ${statusBg}`}>
            {successFeedback.overall.statusLabel}
          </div>
          <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
            {successFeedback.overall.summary}
          </p>
          <p className="text-xs text-slate-400 italic">{successFeedback.overall.recommendationSnippet}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onNavigateToDashboard}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => { setSuccessFeedback(null); setFormValues(initialValues); setErrors({}); }}
            className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm border border-white/10 transition-all"
          >
            Log Another
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ─────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Health Check-in</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Enter your health readings for Sol {profile.currentMissionDay}
          </p>
        </div>
        {/* Quick test prefills */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">Quick test:</span>
          <button onClick={handlePrefillNominal} className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-green-500/15 text-green-300 border border-green-500/20 hover:bg-green-500/25 transition-colors">Nominal</button>
          <button onClick={handlePrefillWarning} className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-yellow-500/15 text-yellow-300 border border-yellow-500/20 hover:bg-yellow-500/25 transition-colors">Warning</button>
          <button onClick={handlePrefillCritical} className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-red-500/15 text-red-300 border border-red-500/20 hover:bg-red-500/25 transition-colors">Critical</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Top decorative hero */}
        <div className="p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-blue-900/20 via-indigo-900/10 to-transparent flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-400/10 border-2 border-green-400/30 flex items-center justify-center shrink-0">
            <Heart className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Take a moment to update your health data</h2>
            <p className="text-sm text-slate-400">Fill in all 6 vital signs below — the system will evaluate them automatically.</p>
          </div>
          <div className="sm:ml-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] text-amber-300 font-mono">Research Demo</span>
            </div>
          </div>
        </div>

        {/* Vitals grid: 3 across on large, 2 on medium, 1 on small */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Heart Rate */}
          <VitalInput
            icon={<Heart className="w-4 h-4 text-red-400" />}
            iconBg="bg-red-400/10"
            label="Heart Rate"
            unit="bpm"
            value={formValues.heartRate}
            onChange={(v) => setFormValues({ ...formValues, heartRate: v })}
            placeholder="72"
            min={30} max={220}
            error={errors.heartRate}
          />

          {/* Blood Pressure — special dual input */}
          <div className={`p-4 rounded-2xl bg-[#111827] border transition-all ${(errors.systolic || errors.diastolic) ? 'border-red-500/40' : 'border-white/5 hover:border-blue-500/20'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-400/10">
                <Gauge className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-white">Blood Pressure</span>
            </div>
            <div className="flex items-baseline gap-2">
              <input
                type="number"
                value={formValues.systolic}
                onChange={(e) => setFormValues({ ...formValues, systolic: e.target.value })}
                placeholder="118"
                min={60} max={260}
                className="w-16 bg-transparent text-2xl font-bold text-white placeholder-slate-600 outline-none"
                style={{ WebkitAppearance: 'none' }}
              />
              <span className="text-slate-400 text-lg">/</span>
              <input
                type="number"
                value={formValues.diastolic}
                onChange={(e) => setFormValues({ ...formValues, diastolic: e.target.value })}
                placeholder="76"
                min={35} max={160}
                className="w-16 bg-transparent text-2xl font-bold text-white placeholder-slate-600 outline-none"
                style={{ WebkitAppearance: 'none' }}
              />
              <span className="text-xs text-slate-400">mmHg</span>
            </div>
            {(errors.systolic || errors.diastolic) && (
              <p className="mt-1 text-[11px] text-red-400 font-mono">{errors.systolic || errors.diastolic}</p>
            )}
          </div>

          {/* Blood Sugar */}
          <VitalInput
            icon={<Droplets className="w-4 h-4 text-purple-400" />}
            iconBg="bg-purple-400/10"
            label="Blood Sugar"
            unit="mg/dL"
            value={formValues.bloodSugar}
            onChange={(v) => setFormValues({ ...formValues, bloodSugar: v })}
            placeholder="92"
            min={30} max={600}
            error={errors.bloodSugar}
          />

          {/* Temperature */}
          <VitalInput
            icon={<Thermometer className="w-4 h-4 text-orange-400" />}
            iconBg="bg-orange-400/10"
            label="Temperature"
            unit="°C"
            value={formValues.bodyTemperature}
            onChange={(v) => setFormValues({ ...formValues, bodyTemperature: v })}
            placeholder="36.6"
            step="0.1"
            min={32} max={43}
            error={errors.bodyTemperature}
          />

          {/* Sleep */}
          <VitalInput
            icon={<Moon className="w-4 h-4 text-indigo-400" />}
            iconBg="bg-indigo-400/10"
            label="Sleep Duration"
            unit="hours"
            value={formValues.sleepDuration}
            onChange={(v) => setFormValues({ ...formValues, sleepDuration: v })}
            placeholder="7.75"
            step="0.25"
            min={0} max={24}
            error={errors.sleepDuration}
          />

          {/* Mood */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-white/5 hover:border-blue-500/20 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-yellow-400/10">
                <Smile className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-sm font-semibold text-white">Mood</span>
            </div>
            <div className="relative">
              <select
                value={formValues.mood}
                onChange={(e) => setFormValues({ ...formValues, mood: e.target.value as MoodType })}
                className="w-full bg-transparent text-lg font-bold text-white outline-none appearance-none cursor-pointer pr-6"
              >
                {MOOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#111827] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-white/5">
          <label className="block text-sm font-semibold text-white mb-2">
            Notes <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={3}
            value={formValues.notes}
            onChange={(e) => setFormValues({ ...formValues, notes: e.target.value })}
            placeholder="Any notes about your health, symptoms, or mission activities..."
            className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => { setFormValues(initialValues); setErrors({}); }}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-sm font-medium transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Form
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-900/40 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            Submit Check-in
          </button>
        </div>
      </form>
    </div>
  );
};
