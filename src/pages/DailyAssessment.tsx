/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Daily Health Assessment Form Page
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { AssessmentInput } from '../components/forms/AssessmentInput';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  AssessmentFormValues,
  DailyAssessmentRecord,
  MoodType,
  AstronautProfile,
  ParsedAssessmentValues,
} from '../types/health';
import { MOOD_OPTIONS } from '../config/thresholds';
import { evaluateAllIndicators, calculateOverallHealth } from '../services/healthStatus';
import {
  ClipboardPlus,
  HeartPulse,
  Gauge,
  Droplet,
  Thermometer,
  Moon,
  Smile,
  RotateCcw,
  Send,
  CheckCircle,
} from 'lucide-react';

interface DailyAssessmentProps {
  profile: AstronautProfile;
  onSubmitSuccess: (record: DailyAssessmentRecord) => void;
  onNavigateToDashboard: () => void;
}

export const DailyAssessment: React.FC<DailyAssessmentProps> = ({
  profile,
  onSubmitSuccess,
  onNavigateToDashboard,
}) => {
  // Form State
  const initialValues: AssessmentFormValues = {
    heartRate: '',
    systolic: '',
    diastolic: '',
    bloodSugar: '',
    bodyTemperature: '',
    sleepDuration: '',
    mood: 'good',
    notes: '',
  };

  const [formValues, setFormValues] = useState<AssessmentFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successFeedback, setSuccessFeedback] = useState<DailyAssessmentRecord | null>(null);

  // Quick Demo Prefill (Very useful for user testing & demonstrations)
  const handlePrefillNominal = () => {
    setFormValues({
      heartRate: '68',
      systolic: '118',
      diastolic: '76',
      bloodSugar: '92',
      bodyTemperature: '36.8',
      sleepDuration: '7.5',
      mood: 'excellent',
      notes: 'Nominal physiological status. Completed morning cycle ergometer session with zero anomalies.',
    });
    setErrors({});
  };

  const handlePrefillWarning = () => {
    setFormValues({
      heartRate: '96',
      systolic: '136',
      diastolic: '88',
      bloodSugar: '124',
      bodyTemperature: '37.6',
      sleepDuration: '5.8',
      mood: 'fatigued',
      notes: 'Mild fatigue following prolonged spacewalk preparation. Heart rate elevated post-exercise.',
    });
    setErrors({});
  };

  const handlePrefillCritical = () => {
    setFormValues({
      heartRate: '118',
      systolic: '152',
      diastolic: '96',
      bloodSugar: '148',
      bodyTemperature: '38.4',
      sleepDuration: '4.2',
      mood: 'disoriented',
      notes: 'Vestibular disorientation and acute core temperature spike. Possible viral prodrome or severe sleep deficit.',
    });
    setErrors({});
  };

  // Validation Logic
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Heart Rate
    const hr = parseFloat(formValues.heartRate);
    if (!formValues.heartRate || isNaN(hr)) {
      newErrors.heartRate = 'Heart rate is required (BPM).';
    } else if (hr < 30 || hr > 220) {
      newErrors.heartRate = 'Enter a valid physiological heart rate (30 – 220 BPM).';
    }

    // 2. Blood Pressure (Systolic & Diastolic)
    const sys = parseFloat(formValues.systolic);
    if (!formValues.systolic || isNaN(sys)) {
      newErrors.systolic = 'Systolic pressure is required (mmHg).';
    } else if (sys < 60 || sys > 260) {
      newErrors.systolic = 'Systolic pressure must be between 60 and 260 mmHg.';
    }

    const dia = parseFloat(formValues.diastolic);
    if (!formValues.diastolic || isNaN(dia)) {
      newErrors.diastolic = 'Diastolic pressure is required (mmHg).';
    } else if (dia < 35 || dia > 160) {
      newErrors.diastolic = 'Diastolic pressure must be between 35 and 160 mmHg.';
    } else if (sys && dia >= sys) {
      newErrors.diastolic = 'Diastolic must be lower than systolic pressure.';
    }

    // 3. Blood Sugar
    const sugar = parseFloat(formValues.bloodSugar);
    if (!formValues.bloodSugar || isNaN(sugar)) {
      newErrors.bloodSugar = 'Blood glucose is required (mg/dL).';
    } else if (sugar < 30 || sugar > 600) {
      newErrors.bloodSugar = 'Enter a realistic blood glucose (30 – 600 mg/dL).';
    }

    // 4. Body Temperature
    const temp = parseFloat(formValues.bodyTemperature);
    if (!formValues.bodyTemperature || isNaN(temp)) {
      newErrors.bodyTemperature = 'Core temperature is required (°C).';
    } else if (temp < 32 || temp > 43) {
      newErrors.bodyTemperature = 'Enter a valid core temperature (32.0 – 43.0 °C).';
    }

    // 5. Sleep Duration
    const sleep = parseFloat(formValues.sleepDuration);
    if (!formValues.sleepDuration || isNaN(sleep)) {
      newErrors.sleepDuration = 'Sleep duration is required (hours).';
    } else if (sleep < 0 || sleep > 24) {
      newErrors.sleepDuration = 'Sleep duration must be between 0 and 24 hours.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setFormValues(initialValues);
    setErrors({});
    setSuccessFeedback(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

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

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardPlus className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-sans tracking-wide">
              Daily Health Telemetry Assessment
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Log your 6 vital physiological indicators for Mission Day (Sol) {profile.currentMissionDay}
          </p>
        </div>

        {/* Quick pre-fill tester buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase hidden md:inline">Quick Test:</span>
          <button
            type="button"
            onClick={handlePrefillNominal}
            className="px-2.5 py-1 text-[11px] font-mono rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60 transition-colors"
            title="Prefill all 6 indicators with nominal green readings"
          >
            Nominal
          </button>
          <button
            type="button"
            onClick={handlePrefillWarning}
            className="px-2.5 py-1 text-[11px] font-mono rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 hover:bg-amber-900/60 transition-colors"
            title="Prefill with warning yellow values"
          >
            Warning
          </button>
          <button
            type="button"
            onClick={handlePrefillCritical}
            className="px-2.5 py-1 text-[11px] font-mono rounded bg-rose-950/60 text-rose-300 border border-rose-500/30 hover:bg-rose-900/60 transition-colors"
            title="Prefill with urgent red critical values"
          >
            Critical
          </button>
        </div>
      </div>

      {/* Success Banner if submitted */}
      {successFeedback && (
        <div className="p-4 rounded-xl bg-space-900 border border-emerald-500/50 shadow-neon-green/20 animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-400 font-mono font-bold text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>ASSESSMENT RECORDED SUCCESSFULLY</span>
            </div>
            <StatusBadge
              status={successFeedback.overall.status}
              label={successFeedback.overall.statusLabel}
              size="md"
            />
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {successFeedback.overall.summary}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onNavigateToDashboard}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => setSuccessFeedback(null)}
              className="px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-mono"
            >
              Log Another Entry
            </button>
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card
          glow="cyan"
          title="Physiological Indicators"
          subtitle="All 6 required parameters with automatic microgravity triage"
          icon={<HeartPulse className="w-4 h-4" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Heart Rate */}
            <AssessmentInput
              id="heartRate"
              label="1. Resting Heart Rate"
              unit="BPM"
              placeholder="e.g. 65"
              value={formValues.heartRate}
              onChange={(val) => setFormValues({ ...formValues, heartRate: val })}
              error={errors.heartRate}
              min={30}
              max={220}
              description="Measure after 5 min rest. Nominal astronaut range: 55–90 BPM."
              icon={<HeartPulse className="w-4 h-4 text-rose-400" />}
            />

            {/* 2. Blood Pressure (Split Systolic / Diastolic) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 tracking-wide uppercase font-sans">
                  <Gauge className="w-4 h-4 text-blue-400" />
                  <span>2. Blood Pressure</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] font-mono text-cyan-400 bg-space-950 px-2 py-0.5 rounded border border-slate-800">
                  mmHg
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Systolic (e.g. 118)"
                  value={formValues.systolic}
                  onChange={(e) => setFormValues({ ...formValues, systolic: e.target.value })}
                  className="rounded-xl border border-slate-800 bg-space-950/90 px-3 py-2.5 font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="number"
                  placeholder="Diastolic (e.g. 76)"
                  value={formValues.diastolic}
                  onChange={(e) => setFormValues({ ...formValues, diastolic: e.target.value })}
                  className="rounded-xl border border-slate-800 bg-space-950/90 px-3 py-2.5 font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              {(errors.systolic || errors.diastolic) && (
                <p className="text-[11px] text-rose-400 font-mono">
                  {errors.systolic || errors.diastolic}
                </p>
              )}
              <p className="text-[11px] text-slate-400 font-sans">
                Nominal: 95–125 systolic / 60–80 diastolic mmHg.
              </p>
            </div>

            {/* 3. Blood Sugar */}
            <AssessmentInput
              id="bloodSugar"
              label="3. Blood Sugar (Glucose)"
              unit="mg/dL"
              placeholder="e.g. 90"
              value={formValues.bloodSugar}
              onChange={(val) => setFormValues({ ...formValues, bloodSugar: val })}
              error={errors.bloodSugar}
              min={30}
              max={500}
              description="Capillary glucose reading. Target pre-meal range: 70–115 mg/dL."
              icon={<Droplet className="w-4 h-4 text-amber-400" />}
            />

            {/* 4. Body Temperature */}
            <AssessmentInput
              id="bodyTemperature"
              label="4. Core Body Temperature"
              unit="°C"
              placeholder="e.g. 36.8"
              step="0.1"
              value={formValues.bodyTemperature}
              onChange={(val) => setFormValues({ ...formValues, bodyTemperature: val })}
              error={errors.bodyTemperature}
              min={32}
              max={43}
              description="Core reading. Microgravity nominal: 36.3–37.3 °C."
              icon={<Thermometer className="w-4 h-4 text-red-400" />}
            />

            {/* 5. Sleep Duration */}
            <AssessmentInput
              id="sleepDuration"
              label="5. Sleep Duration"
              unit="Hours"
              placeholder="e.g. 7.5"
              step="0.1"
              value={formValues.sleepDuration}
              onChange={(val) => setFormValues({ ...formValues, sleepDuration: val })}
              error={errors.sleepDuration}
              min={0}
              max={24}
              description="Actigraphy log from sleep quarters. Target: 7.0–9.0 hours."
              icon={<Moon className="w-4 h-4 text-indigo-400" />}
            />

            {/* 6. Mood & Psychological Readiness */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 tracking-wide uppercase font-sans">
                <Smile className="w-4 h-4 text-emerald-400" />
                <span>6. Mood & Psychological State</span>
                <span className="text-rose-400">*</span>
              </label>

              <select
                value={formValues.mood}
                onChange={(e) => setFormValues({ ...formValues, mood: e.target.value as MoodType })}
                className="block w-full rounded-xl border border-slate-800 bg-space-950/90 px-3.5 py-2.5 font-mono text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {MOOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-space-900 text-slate-100">
                    {opt.badge} — {opt.label} ({opt.description})
                  </option>
                ))}
              </select>

              <p className="text-[11px] text-slate-400 font-sans">
                Evaluates Space Adaptation Syndrome (SAS), fatigue, and cognitive mission focus.
              </p>
            </div>

          </div>

          {/* Optional Clinical Notes */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200 tracking-wide uppercase font-sans">
              Astronaut Clinical Notes & Mission Observations (Optional)
            </label>
            <textarea
              rows={3}
              value={formValues.notes}
              onChange={(e) => setFormValues({ ...formValues, notes: e.target.value })}
              placeholder="Record any perceived microgravity symptoms, workout details, or environmental anomalies..."
              className="block w-full rounded-xl border border-slate-800 bg-space-950/90 px-3.5 py-2.5 font-sans text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Form Actions */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-space-850 font-mono text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Form</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-neon-cyan/30 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Submit Daily Telemetry</span>
            </button>
          </div>

        </Card>
      </form>

    </div>
  );
};
