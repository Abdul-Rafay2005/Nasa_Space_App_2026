/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Master Dashboard Page — Live Runtime Telemetry & Waveform Experience
 * Compliant with PLAN.md Section 1, 7, and 10.1
 */

import React, { useState } from 'react';
import { AstronautProfile, DailyAssessmentRecord } from '../types/health';
import { AssessmentDetailModal } from '../components/health/AssessmentDetailModal';
import { analyzePhysiologicalDrift, DriftAlert } from '../services/driftDetection';
import { LiveWaveform } from '../components/telemetry/LiveWaveform';
import { useTelemetrySnapshot } from '../stores/telemetryStore';
import { useGroundLink } from '../stores/groundLinkStore';
import { NasaResourcesModal } from '../components/common/NasaResourcesModal';
import {
  Heart,
  Droplets,
  Box,
  Thermometer,
  Moon,
  CheckCircle,
  Bell,
  FileText,
  X,
  ArrowRight,
  Radio,
  BookOpen,
  Wind,
  Shield,
  Activity,
  Bot,
} from 'lucide-react';

interface DashboardProps {
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
  historyRecords: DailyAssessmentRecord[];
  isCompletedToday: boolean;
  onNavigateToAssessment: () => void;
  onNavigateToHistory: () => void;
  onNavigateToOverview: () => void;
  onNavigateToBodyMap: (partId?: string) => void;
  onNavigateToAnalytics: () => void;
  onNavigateToGuidance: () => void;
  onNavigateToRoutine: () => void;
  onNavigateToAiDoctor?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  latestAssessment,
  historyRecords,
  isCompletedToday: _isCompletedToday,
  onNavigateToAssessment: _onNavigateToAssessment,
  onNavigateToHistory: _onNavigateToHistory,
  onNavigateToOverview,
  onNavigateToBodyMap: _onNavigateToBodyMap,
  onNavigateToAnalytics: _onNavigateToAnalytics,
  onNavigateToGuidance,
  onNavigateToRoutine: _onNavigateToRoutine,
  onNavigateToAiDoctor,
}) => {
  const [modalRecord, setModalRecord] = useState<DailyAssessmentRecord | null>(null);
  const [selectedSbarAlert, setSelectedSbarAlert] = useState<DriftAlert | null>(null);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [resourcesModalOpen, setResourcesModalOpen] = useState<boolean>(false);

  // Ground Link State (NASA EIMO 2023 Mars Delay & Earth Signal Off mode)
  const [groundLink, setGroundLinkMode] = useGroundLink();

  // Live real-time telemetry stream from shared Telemetry Store
  const snapshot = useTelemetrySnapshot();

  const driftAlerts = analyzePhysiologicalDrift(historyRecords, profile);

  // Live heart rate from the running 250 Hz simulation or device
  const liveHr = snapshot.heartRate.value ?? latestAssessment?.values.heartRate ?? 72;
  const liveBp = snapshot.bloodPressure.value ?? {
    systolic: latestAssessment?.values.systolic ?? 118,
    diastolic: latestAssessment?.values.diastolic ?? 76,
  };
  const liveSugar = snapshot.bloodSugar.value ?? latestAssessment?.values.bloodSugar ?? 92;
  const liveTemp = snapshot.bodyTemperature.value ?? latestAssessment?.values.bodyTemperature ?? 36.6;
  const liveSleep = snapshot.sleepDuration.value ?? latestAssessment?.values.sleepDuration ?? 7.75;

  const score = latestAssessment?.overall.score ?? (snapshot.overallStatus === 'GREEN' ? 95 : 88);
  const isHealthy = snapshot.overallStatus === 'GREEN';

  // Format sleep duration to "7h 45m"
  const sleepHours = Math.floor(liveSleep);
  const sleepMins = Math.round((liveSleep % 1) * 60);
  const sleepDisplay = `${sleepHours}h ${sleepMins > 0 ? `${sleepMins}m` : '00m'}`;

  return (
    <div className="relative min-h-screen space-y-6 animate-fade-in pb-16 select-none overflow-hidden">

      {/* ── 1. Top Greeting Header (Exact 01_dashboard.png + NASA EIMO Controls) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight flex items-center gap-2">
            Hello, Astronaut! <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-0.5">
            Here's your health overview for today • Onboard Autonomous Decision Support
          </p>
        </div>

        {/* Right Header Badges: Ground Link Mode + Mission Day + NASA Resources */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ground Link Selector (NASA EIMO 2023 Mars Delay Feature) */}
          <div className="flex items-center bg-[#0b132c]/90 p-0.5 rounded-full border border-cyan-500/30 text-[11px] font-mono shadow-lg backdrop-blur-md">
            <button
              onClick={() => setGroundLinkMode('direct')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                groundLink.mode === 'direct'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Real-time Deep Space Network Earth Uplink Active"
            >
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>DSN Online</span>
            </button>
            <button
              onClick={() => setGroundLinkMode('mars_delay')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                groundLink.mode === 'mars_delay'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Simulates Mars 22-min speed-of-light comm delay (NASA EIMO 2023 protocol)"
            >
              <Radio className="w-3 h-3 text-amber-400" />
              <span>Mars Delay (22m)</span>
            </button>
          </div>

          {/* NASA Official Resources Modal Trigger */}
          <button
            onClick={() => setResourcesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0b132c]/90 border border-cyan-500/40 text-xs font-mono text-cyan-300 hover:bg-space-850 transition-colors shadow-lg backdrop-blur-md"
            title="Inspect 5 Official NASA & CSA Challenge Resources"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">NASA Resources</span>
          </button>

          {/* AI Flight Surgeon Trigger */}
          {onNavigateToAiDoctor && (
            <button
              onClick={onNavigateToAiDoctor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/40 text-xs font-semibold text-blue-200 hover:from-blue-600/50 hover:to-indigo-600/50 transition-all shadow-lg backdrop-blur-md"
              title="Consult Dr. Orion (AI Doctor powered by Gemini)"
            >
              <Bot className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Dr. Orion AI</span>
            </button>
          )}

          {/* Mission Day Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b132c]/90 border border-cyan-500/30 text-white font-sans text-xs font-semibold shadow-lg backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span>Mission Day {profile.currentMissionDay || 48}</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setShowAlertModal(true)}
            className="relative w-9 h-9 rounded-full bg-[#0b132c]/90 border border-cyan-500/30 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-400 transition-all shadow-lg backdrop-blur-md"
            title="Mission Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {driftAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0b132c]" />
            )}
          </button>
        </div>
      </div>

      {/* Mars Earth-Independent Autonomous Mode Banner (When Delay Enabled) */}
      {groundLink.mode === 'mars_delay' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xl animate-fade-in backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span>
              <strong>MARS AUTONOMOUS MODE ACTIVE:</strong> Speed-of-light Earth comm delay is ~22 minutes (NASA EIMO 2023). All clinical guidance & SBAR decisions are operating 100% onboard.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] shrink-0">
            Local IndexedDB Buffered ({groundLink.queuedTelemetryCount} packets)
          </span>
        </div>
      )}

      {/* ── 2. Top Row: 3 Hero Cards (Health Score | Overall Status | Astronaut) ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">

        {/* ── Card 1: Health Score Circular Ring (md:col-span-3) ──────────── */}
        <div className="md:col-span-3 p-6 rounded-3xl bg-[#0c142c]/85 border border-[#1b2752] flex flex-col items-center justify-center gap-3 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

          {/* Glowing Circular Progress Ring */}
          <div className="relative w-36 h-36 flex items-center justify-center my-1">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="scoreRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <filter id="scoreGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#131c38" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#scoreRingGrad)"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                strokeLinecap="round"
                filter="url(#scoreGlow)"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white tracking-tight leading-none">{score}</span>
              <span className="text-xs text-slate-400 font-semibold mt-1">/100</span>
            </div>
          </div>

          <div className="text-center relative z-10">
            <h3 className="text-base font-bold text-white font-sans tracking-wide">Health Score</h3>
            <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 mt-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHealthy ? 'Excellent!' : 'Good'}</span>
            </p>
          </div>
        </div>

        {/* ── Card 2: Overall Status with Glowing ECG (md:col-span-5) ─────── */}
        <div className="md:col-span-5 p-6 rounded-3xl bg-[#0c142c]/85 border border-[#1b2752] flex flex-col justify-between gap-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <h3 className="text-base font-bold text-white font-sans tracking-wide">
              Overall Status
            </h3>

            {/* Status Pill Badge */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-sans">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHealthy ? 'Healthy' : 'Caution'}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-sans">
              {isHealthy ? 'All systems are nominal' : latestAssessment?.overall.summary || 'Resting cardiovascular elevation'}
            </p>
          </div>

          {/* Glowing Green ECG Pulse Line (matches 01_dashboard.png) */}
          <div className="w-full h-16 relative flex items-center z-10 my-1">
            <svg viewBox="0 0 320 44" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <filter id="ecgGlowNeon">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="ecgPulseColor" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="45%" stopColor="#10b981" />
                  <stop offset="55%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <polyline
                points="0,22 45,22 55,22 65,9 75,35 85,13 95,27 105,22 170,22 180,6 190,39 200,10 210,31 220,22 320,22"
                fill="none"
                stroke="url(#ecgPulseColor)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#ecgGlowNeon)"
              />
            </svg>
          </div>
        </div>

        {/* ── Card 3: Astronaut Hero Card (md:col-span-4) ──────────────────── */}
        {/* Featuring the user's uploaded 2nd image (/astronaut.jpg) */}
        <div className="md:col-span-4 rounded-3xl bg-[#0c142c]/85 border border-blue-500/30 overflow-hidden shadow-2xl relative flex items-center justify-center min-h-[230px] group">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/60 via-transparent to-transparent z-10 pointer-events-none" />

          {/* User's Astronaut Image */}
          <img
            src="/astronaut.jpg"
            alt="Astronaut in Deep Space"
            className="w-full h-full object-cover object-top max-h-[250px] group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#080d22] via-[#080d22]/70 to-transparent z-10 pointer-events-none" />

          <div className="absolute bottom-3 left-3.5 right-3.5 z-20 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#080d22]/80 border border-blue-500/30 text-cyan-300 backdrop-blur-md">
              ORION CREW • {profile.name}
            </span>
          </div>
        </div>

      </div>

      {/* ── 3. Live Hospital-Monitor Waveform Stream (PLAN.md Section 7 & 10) ── */}
      <div className="w-full">
        <LiveWaveform />
      </div>

      {/* ── 4. Middle Row: Vital Signs (Left) & Recent Alerts (Right) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Left: Vital Signs Card (lg:col-span-8) ──────────────────────── */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0c142c]/85 border border-[#1b2752] shadow-2xl backdrop-blur-xl space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white font-sans tracking-wide">
                Vital Signs
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                STREAM SYNC ACTIVE
              </span>
            </div>
            <button
              onClick={onNavigateToOverview}
              className="text-xs text-blue-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5 Sub-cards in a Clean Row (Exact 01_dashboard.png) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">

            {/* 1. Heart Rate (Live updating) */}
            <div
              onClick={() => latestAssessment && setModalRecord(latestAssessment)}
              className="p-4 rounded-2xl bg-[#070b1a] border border-[#172242] hover:border-rose-500/50 cursor-pointer transition-all flex flex-col justify-between group hover:scale-[1.02]"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center mb-3">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white font-mono">{liveHr}</span>
                  <span className="text-xs text-slate-400 font-medium">bpm</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">Heart Rate</p>
              </div>
            </div>

            {/* 2. Blood Pressure */}
            <div
              onClick={() => latestAssessment && setModalRecord(latestAssessment)}
              className="p-4 rounded-2xl bg-[#070b1a] border border-[#172242] hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col justify-between group hover:scale-[1.02]"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-3">
                <Droplets className="w-5 h-5 text-cyan-400 fill-cyan-400" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-white font-mono">{liveBp.systolic}/{liveBp.diastolic}</span>
                  <span className="text-[10px] text-slate-400 font-medium">mmHg</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">Blood Pressure</p>
              </div>
            </div>

            {/* 3. Blood Sugar */}
            <div
              onClick={() => latestAssessment && setModalRecord(latestAssessment)}
              className="p-4 rounded-2xl bg-[#070b1a] border border-[#172242] hover:border-purple-500/50 cursor-pointer transition-all flex flex-col justify-between group hover:scale-[1.02]"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                <Box className="w-5 h-5 text-purple-400 fill-purple-400/40" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white font-mono">{liveSugar}</span>
                  <span className="text-xs text-slate-400 font-medium">mg/dL</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">Blood Sugar</p>
              </div>
            </div>

            {/* 4. Temperature (Live subtle drift) */}
            <div
              onClick={() => latestAssessment && setModalRecord(latestAssessment)}
              className="p-4 rounded-2xl bg-[#070b1a] border border-[#172242] hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between group hover:scale-[1.02]"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                <Thermometer className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white font-mono">{liveTemp}</span>
                  <span className="text-xs text-slate-400 font-medium">°C</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">Temperature</p>
              </div>
            </div>

            {/* 5. Sleep */}
            <div
              onClick={() => latestAssessment && setModalRecord(latestAssessment)}
              className="p-4 rounded-2xl bg-[#070b1a] border border-[#172242] hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col justify-between group hover:scale-[1.02]"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3">
                <Moon className="w-5 h-5 text-indigo-400 fill-indigo-400" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-white font-mono">{sleepDisplay}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">Sleep</p>
              </div>
            </div>

          </div>

          {/* Environmental Hazards & Space Radiation Strip (NASA-STD-3001 & CSA CANS) */}
          <div className="mt-4 pt-3.5 border-t border-[#172242] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-[#070b1a]/90 border border-[#172242] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Cabin CO2 (1-hr Avg)</span>
                  <span className="text-sm font-black font-mono text-slate-100">2.8 <span className="text-xs text-slate-400 font-normal">mmHg</span></span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                ≤3.0 Nominal
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#070b1a]/90 border border-[#172242] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Career Radiation</span>
                  <span className="text-sm font-black font-mono text-slate-100">142 <span className="text-xs text-slate-400 font-normal">mSv</span></span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-indigo-500/15 border border-indigo-500/30 text-indigo-300" title="CSA CANS autonomous spectrometer: ~30% neutron fraction">
                30% Neutrons (CSA)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#070b1a]/90 border border-[#172242] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Blood Oxygen (SpO2)</span>
                  <span className="text-sm font-black font-mono text-slate-100">98 <span className="text-xs text-slate-400 font-normal">%</span></span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                NEWS2 Nominal
              </span>
            </div>
          </div>
        </div>

        {/* ── Right: Recent Alerts Card (lg:col-span-4) ────────────────────── */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0c142c]/85 border border-[#1b2752] shadow-2xl backdrop-blur-xl flex flex-col justify-between space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white font-sans tracking-wide">
              Recent Alerts
            </h2>
            <button
              onClick={onNavigateToGuidance}
              className="text-xs text-blue-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert Status (Exact 01_dashboard.png layout) */}
          <div className="flex items-center gap-4 py-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-sans">
                {driftAlerts.length > 0 ? 'Drift Observed' : 'All good!'}
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                {driftAlerts.length > 0 ? `${driftAlerts.length} flight rule advisory` : 'No new alerts'}
              </p>
            </div>
          </div>

          {/* SBAR / Guidance Action Button if Drift detected */}
          {driftAlerts.length > 0 ? (
            <button
              onClick={() => setSelectedSbarAlert(driftAlerts[0])}
              className="w-full py-2.5 px-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/25 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Review Flight Surgeon SBAR</span>
            </button>
          ) : (
            <div className="pt-2 border-t border-[#1b2752]/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Telemetry Uplink: Active</span>
              <span className="text-emerald-400">DSN SYNC 100%</span>
            </div>
          )}
        </div>

      </div>

      {/* ── 5. Bottom Callout & Earth Horizon Curve (Exact 01_dashboard.png) ── */}
      <div className="relative pt-6 pb-4 flex flex-col items-center justify-center overflow-hidden">
        {/* Glowing Earth atmosphere curvature in the background */}
        <div className="absolute -bottom-48 w-[800px] sm:w-[1200px] h-[340px] rounded-[100%] bg-gradient-to-t from-blue-600/30 via-cyan-500/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-56 w-[900px] sm:w-[1400px] h-[340px] rounded-[100%] border-t-2 border-cyan-400/30 shadow-[0_-15px_40px_rgba(6,182,212,0.25)] pointer-events-none" />

        {/* Callout Quote */}
        <p className="relative z-10 text-xs sm:text-sm font-semibold text-slate-300 font-sans flex items-center gap-2">
          <span>🚀</span>
          <span>Stay healthy. Stay mission-ready.</span>
        </p>
      </div>

      {/* ── 6. Flight Surgeon SBAR Communication Modal (Abdul Rafay Phase 2) ── */}
      {selectedSbarAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#0b1228] border border-cyan-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1b2752] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Flight Surgeon SBAR Telemetry Packet
                </h3>
              </div>
              <button
                onClick={() => setSelectedSbarAlert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <strong className="text-blue-300 font-mono block mb-1">S — SITUATION:</strong>
                <p className="text-slate-300 leading-relaxed">{selectedSbarAlert.sbarSummary.situation}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <strong className="text-purple-300 font-mono block mb-1">B — BACKGROUND:</strong>
                <p className="text-slate-300 leading-relaxed">{selectedSbarAlert.sbarSummary.background}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <strong className="text-amber-300 font-mono block mb-1">A — ASSESSMENT:</strong>
                <p className="text-slate-300 leading-relaxed">{selectedSbarAlert.sbarSummary.assessment}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <strong className="text-emerald-300 font-mono block mb-1">R — RECOMMENDATION:</strong>
                <p className="text-slate-300 leading-relaxed">{selectedSbarAlert.sbarSummary.recommendation}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1b2752]">
              <button
                onClick={() => setSelectedSbarAlert(null)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-mono hover:bg-white/10 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('SBAR Telemetry Packet transmitted to Flight Control via Deep Space Network (DSN).');
                  setSelectedSbarAlert(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold tracking-wider shadow-lg shadow-cyan-900/40"
              >
                Transmit SBAR Uplink
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Notification Center Modal ─────────────────────────────────── */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0b1228] border border-cyan-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1b2752] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Mission Notifications
                </h3>
              </div>
              <button
                onClick={() => setShowAlertModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {driftAlerts.length > 0 ? (
                driftAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">{alert.title}</span>
                      <span className="text-[10px] font-mono text-amber-400">{alert.detectedChange}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{alert.description}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-white">All Telemetry Nominal</p>
                  <p className="text-xs text-slate-400">No active biometric flight rule violations.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAlertModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-mono text-xs font-bold"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* ── 8. Assessment Detail Modal ───────────────────────────────────── */}
      <AssessmentDetailModal
        record={modalRecord}
        isOpen={!!modalRecord}
        onClose={() => setModalRecord(null)}
      />

      {/* ── 9. Official Challenge Resources Modal ───────────────────────── */}
      <NasaResourcesModal
        isOpen={resourcesModalOpen}
        onClose={() => setResourcesModalOpen(false)}
      />

    </div>
  );
};
