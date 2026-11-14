/**
 * Aegis Health — Daily Health Check-in
 * Conforms to Section 10.5 of PLAN.md
 * 
 * 3-Stage Workflow: Capture Biometrics → How You Feel → Review & Save
 * Supports live telemetry capture, manual overrides, provenance tagging, and IndexedDB saving.
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
  Camera,
  Layers,
  ChevronRight,
  ArrowLeft,
  FileCheck,
  Eye,
} from 'lucide-react';
import {
  DailyAssessmentRecord,
  MoodType,
  AstronautProfile,
  ParsedAssessmentValues,
} from '../types/health';
import { MOOD_OPTIONS } from '../config/thresholds';
import { evaluateAllIndicators, calculateOverallHealth } from '../services/healthStatus';
import { useTelemetrySnapshot } from '../stores/telemetryStore';
import { saveCheckInRecord } from '../services/persistence/historyRepository';

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
  const liveSnapshot = useTelemetrySnapshot();

  const [stage, setStage] = useState<'capture' | 'feel' | 'review'>('capture');
  const [capturedFromStream, setCapturedFromStream] = useState(false);
  const [provenanceKind, setProvenanceKind] = useState<'simulation' | 'device' | 'manual'>('manual');

  // Form values
  const [heartRate, setHeartRate] = useState<string>('');
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [bloodSugar, setBloodSugar] = useState<string>('');
  const [bodyTemperature, setBodyTemperature] = useState<string>('');
  const [sleepDuration, setSleepDuration] = useState<string>('7.5');
  const [mood, setMood] = useState<MoodType>('good');
  const [visionHeadache, setVisionHeadache] = useState<'no' | 'yes'>('no');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<DailyAssessmentRecord | null>(null);

  // Capture from live telemetry stream
  const handleCaptureLiveStream = () => {
    const hr = liveSnapshot.heartRate?.value;
    const bp = liveSnapshot.bloodPressure?.value;
    const bs = liveSnapshot.bloodSugar?.value;
    const temp = liveSnapshot.bodyTemperature?.value;

    if (hr) setHeartRate(String(hr));
    if (bp) {
      setSystolic(String(bp.systolic));
      setDiastolic(String(bp.diastolic));
    }
    if (bs) setBloodSugar(String(bs));
    if (temp) setBodyTemperature(String(temp.toFixed(1)));

    setCapturedFromStream(true);
    setProvenanceKind(liveSnapshot.heartRate?.provenance?.kind === 'device' ? 'device' : 'simulation');
    setErrors({});
  };

  // Demo presets
  const handlePreset = (type: 'nominal' | 'warning' | 'critical') => {
    setProvenanceKind('simulation');
    if (type === 'nominal') {
      setHeartRate('72');
      setSystolic('118');
      setDiastolic('76');
      setBloodSugar('92');
      setBodyTemperature('36.6');
      setSleepDuration('7.75');
      setMood('good');
      setNotes('Nominal mission Sol check-in.');
    } else if (type === 'warning') {
      setHeartRate('94');
      setSystolic('134');
      setDiastolic('86');
      setBloodSugar('122');
      setBodyTemperature('37.4');
      setSleepDuration('5.5');
      setMood('fatigued');
      setNotes('Slight fatigue post-exercise.');
    } else {
      setHeartRate('126');
      setSystolic('152');
      setDiastolic('96');
      setBloodSugar('160');
      setBodyTemperature('38.6');
      setSleepDuration('4.0');
      setMood('disoriented');
      setNotes('Significant exertion and thermal elevation.');
    }
    setErrors({});
  };

  const validateStage1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const hrNum = Number(heartRate);
    if (!heartRate || isNaN(hrNum) || hrNum < 30 || hrNum > 220) {
      newErrors.heartRate = 'Enter valid HR (30–220 BPM)';
    }

    const sysNum = Number(systolic);
    const diaNum = Number(diastolic);
    if (!systolic || isNaN(sysNum) || sysNum < 60 || sysNum > 260) {
      newErrors.systolic = 'Enter valid Systolic (60–260)';
    }
    if (!diastolic || isNaN(diaNum) || diaNum < 35 || diaNum > 160) {
      newErrors.diastolic = 'Enter valid Diastolic (35–160)';
    }

    if (!bloodSugar || isNaN(Number(bloodSugar)) || Number(bloodSugar) < 30 || Number(bloodSugar) > 500) {
      newErrors.bloodSugar = 'Enter valid Blood Sugar (30–500 mg/dL)';
    }

    if (!bodyTemperature || isNaN(Number(bodyTemperature)) || Number(bodyTemperature) < 32 || Number(bodyTemperature) > 43) {
      newErrors.bodyTemperature = 'Enter valid Temperature (32–43 °C)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStage1()) {
      setStage('capture');
      return;
    }

    setIsSubmitting(true);
    const parsedValues: ParsedAssessmentValues = {
      heartRate: Number(heartRate),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      bloodSugar: Number(bloodSugar),
      bodyTemperature: Number(bodyTemperature),
      sleepDuration: Number(sleepDuration) || 7.5,
      mood,
      visionHeadache,
      notes: notes.trim() || undefined,
    };

    const results = evaluateAllIndicators(parsedValues, profile);
    const overall = calculateOverallHealth(results);

    const record: DailyAssessmentRecord = {
      id: `REC-SOL-${profile.currentMissionDay}-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      missionDay: profile.currentMissionDay,
      astronautId: profile.id,
      values: parsedValues,
      results,
      overall,
      isDemonstrationData: provenanceKind === 'simulation',
    };

    // Save to unified history repository (IndexedDB + dual write)
    await saveCheckInRecord({
      id: record.id,
      missionDay: record.missionDay,
      timestamp: record.timestamp,
      astronautId: record.astronautId,
      provenanceKind,
      indicators: {
        heartRate: parsedValues.heartRate,
        systolic: parsedValues.systolic,
        diastolic: parsedValues.diastolic,
        bloodSugar: parsedValues.bloodSugar,
        bodyTemperature: parsedValues.bodyTemperature,
        sleepDuration: parsedValues.sleepDuration,
        mood: parsedValues.mood,
      },
      notes: parsedValues.notes,
      completeness: '6/6 indicators verified',
    });

    setIsSubmitting(false);
    setSubmittedRecord(record);
    onSubmitSuccess(record);
  };

  if (submittedRecord) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-space-950/90 border border-emerald-500/40 text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-100 font-sans">Daily Check-in Recorded</h2>
          <p className="text-sm text-slate-300 font-mono">
            Mission Sol {submittedRecord.missionDay} • {submittedRecord.overall.summary}
          </p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-mono bg-space-900 border border-slate-700 text-slate-400">
            Provenance: {provenanceKind === 'simulation' ? '⚡ Simulated stream' : 'Verified manual check-in'}
          </span>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={onNavigateToDashboard}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all"
          >
            Return to Monitor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-sans">Astronaut Daily Health Check-in</h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
            Mission Sol {profile.currentMissionDay} • Guided 3-stage clinical acquisition
          </p>
        </div>

        {/* Stepper pills */}
        <div className="flex items-center gap-1 bg-space-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setStage('capture')}
            className={`px-3 py-1 rounded-lg transition-all ${
              stage === 'capture' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            1. Capture
          </button>
          <span className="text-slate-600">→</span>
          <button
            onClick={() => {
              if (validateStage1()) setStage('feel');
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              stage === 'feel' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            2. Wellbeing
          </button>
          <span className="text-slate-600">→</span>
          <button
            onClick={() => {
              if (validateStage1()) setStage('review');
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              stage === 'review' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            3. Review & Save
          </button>
        </div>
      </div>

      {/* Demo tools collapsible banner */}
      <details className="p-3.5 rounded-xl bg-space-950/80 border border-slate-800/80 text-xs font-mono">
        <summary className="cursor-pointer text-slate-400 hover:text-cyan-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Demo Tools & Preset Scenarios (Click to expand)</span>
        </summary>
        <div className="pt-3 flex flex-wrap items-center gap-2">
          <span className="text-slate-400">Load Preset:</span>
          <button
            type="button"
            onClick={() => handlePreset('nominal')}
            className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
          >
            Nominal
          </button>
          <button
            type="button"
            onClick={() => handlePreset('warning')}
            className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
          >
            Advisory Warning
          </button>
          <button
            type="button"
            onClick={() => handlePreset('critical')}
            className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
          >
            Critical Alert
          </button>
        </div>
      </details>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STAGE 1: CAPTURE READINGS */}
        {stage === 'capture' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-space-900/60 border border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans">Live Stream Capture</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Snapshot biometrics directly from the current telemetry stream without manual entry.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCaptureLiveStream}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-sm shrink-0"
              >
                Capture from Live Stream
              </button>
            </div>

            {capturedFromStream && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Telemetry captured at {new Date().toLocaleTimeString()}. Review values below or edit to override.</span>
              </div>
            )}

            {/* Vital Signs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Heart Rate */}
              <div className={`p-4 rounded-xl bg-space-950/80 border ${errors.heartRate ? 'border-rose-500' : 'border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2 text-rose-400">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">Resting Heart Rate</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="72"
                    className="w-full bg-transparent text-2xl font-bold font-mono text-slate-100 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-slate-400">BPM</span>
                </div>
                {errors.heartRate && <p className="text-[11px] text-rose-400 font-mono mt-1">{errors.heartRate}</p>}
              </div>

              {/* Blood Pressure */}
              <div className={`p-4 rounded-xl bg-space-950/80 border ${(errors.systolic || errors.diastolic) ? 'border-rose-500' : 'border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <Gauge className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">Blood Pressure</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    placeholder="118"
                    className="w-20 bg-transparent text-2xl font-bold font-mono text-slate-100 focus:outline-none"
                  />
                  <span className="text-slate-400 text-xl font-mono">/</span>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    placeholder="76"
                    className="w-20 bg-transparent text-2xl font-bold font-mono text-slate-100 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-slate-400">mmHg</span>
                </div>
                {(errors.systolic || errors.diastolic) && (
                  <p className="text-[11px] text-rose-400 font-mono mt-1">{errors.systolic || errors.diastolic}</p>
                )}
              </div>

              {/* Blood Sugar */}
              <div className={`p-4 rounded-xl bg-space-950/80 border ${errors.bloodSugar ? 'border-rose-500' : 'border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2 text-amber-400">
                  <Droplets className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">Blood Sugar (Glucose)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                    placeholder="92"
                    className="w-full bg-transparent text-2xl font-bold font-mono text-slate-100 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-slate-400">mg/dL</span>
                </div>
                {errors.bloodSugar && <p className="text-[11px] text-rose-400 font-mono mt-1">{errors.bloodSugar}</p>}
              </div>

              {/* Temperature */}
              <div className={`p-4 rounded-xl bg-space-950/80 border ${errors.bodyTemperature ? 'border-rose-500' : 'border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2 text-orange-400">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">Core Body Temperature</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={bodyTemperature}
                    onChange={(e) => setBodyTemperature(e.target.value)}
                    placeholder="36.6"
                    className="w-full bg-transparent text-2xl font-bold font-mono text-slate-100 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-slate-400">°C</span>
                </div>
                {errors.bodyTemperature && (
                  <p className="text-[11px] text-rose-400 font-mono mt-1">{errors.bodyTemperature}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  if (validateStage1()) setStage('feel');
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-sm"
              >
                <span>Continue to Wellbeing</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: HOW YOU FEEL */}
        {stage === 'feel' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-space-950/80 border border-slate-800 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-200 font-sans mb-2">
                  <Smile className="w-4 h-4 text-emerald-400" />
                  Subjective Readiness & Mood State
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {MOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMood(opt.value)}
                      className={`p-3 rounded-xl border text-left font-mono transition-all ${
                        mood === opt.value
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200'
                          : 'bg-space-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{opt.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep Duration */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-200 font-sans mb-1">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  Restorative Sleep Duration (Hours)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(e.target.value)}
                  placeholder="7.5"
                  className="w-32 px-3 py-2 rounded-xl bg-space-900 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* SANS Vision & Headache Check (NASA HRP Protocol) */}
              <div className="p-3.5 rounded-xl bg-space-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-200 font-sans">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    Vision & Headache Check (NASA SANS Protocol)
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                    Hazard: Hostile/Gravity
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Did you experience blurred vision, visual acuity changes, or persistent headache today?
                </p>
                <div className="flex gap-2 pt-1 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setVisionHeadache('no')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all ${
                      visionHeadache === 'no'
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                        : 'bg-space-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    No (Nominal Acuity)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisionHeadache('yes')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all ${
                      visionHeadache === 'yes'
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'bg-space-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Yes (Acuity Blur / Headache Observed)
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-200 font-sans mb-1">
                  Operational & Physiological Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record symptoms, EVA exertion, countermeasures, or mission activities..."
                  className="w-full p-3 rounded-xl bg-space-900 border border-slate-800 text-slate-100 font-sans text-xs focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStage('capture')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-space-900 border border-slate-800 text-slate-300 font-mono text-xs hover:bg-space-850"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Capture</span>
              </button>
              <button
                type="button"
                onClick={() => setStage('review')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-sm"
              >
                <span>Proceed to Review</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: REVIEW & SAVE */}
        {stage === 'review' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-space-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <FileCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 font-sans">Verification Summary</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-space-900/60 border border-slate-850">
                  <span className="text-[10px] text-slate-400 block">HEART RATE</span>
                  <span className="text-slate-100 font-bold">{heartRate} BPM</span>
                </div>
                <div className="p-2.5 rounded bg-space-900/60 border border-slate-850">
                  <span className="text-[10px] text-slate-400 block">BLOOD PRESSURE</span>
                  <span className="text-slate-100 font-bold">{systolic}/{diastolic} mmHg</span>
                </div>
                <div className="p-2.5 rounded bg-space-900/60 border border-slate-850">
                  <span className="text-[10px] text-slate-400 block">GLUCOSE</span>
                  <span className="text-slate-100 font-bold">{bloodSugar} mg/dL</span>
                </div>
                <div className="p-2.5 rounded bg-space-900/60 border border-slate-850">
                  <span className="text-[10px] text-slate-400 block">TEMPERATURE</span>
                  <span className="text-slate-100 font-bold">{bodyTemperature} °C</span>
                </div>
                <div className="p-2.5 rounded bg-space-900/60 border border-slate-850">
                  <span className="text-[10px] text-slate-400 block">SLEEP</span>
                  <span className="text-slate-100 font-bold">{sleepDuration} Hours</span>
                </div>
                <div className="p-2.5 rounded bg-space-900/60 border border-slate-850">
                  <span className="text-[10px] text-slate-400 block">MOOD</span>
                  <span className="text-slate-100 font-bold capitalize">{mood}</span>
                </div>
                <div className="p-2.5 rounded bg-space-900/60 border border-slate-850">
                  <span className="text-[10px] text-slate-400 block">SANS / VISION</span>
                  <span className={`font-bold ${visionHeadache === 'yes' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {visionHeadache === 'yes' ? '⚠ Blurring / Headache' : '✓ Nominal'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-space-900/40 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div>Provenance Tag: <span className="text-cyan-300 font-bold">{provenanceKind.toUpperCase()}</span></div>
                <div>Astronaut ID: <span className="text-slate-200">{profile.id}</span></div>
                <div>Storage Engine: <span className="text-slate-200">IndexedDB AegisHealthDB + Dual-Write Fallback</span></div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStage('feel')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-space-900 border border-slate-800 text-slate-300 font-mono text-xs hover:bg-space-850"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-950/40"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Recording...' : 'Commit Check-in Record'}</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
