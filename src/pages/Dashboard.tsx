/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Master Dashboard Page — Exact Concept Mockup (01_dashboard.png & 08_dashboard_full_concept.png)
 * Integrated with: Full Phase 1 & Phase 2 Engines (Sameen & Abdul Rafay)
 */

import React, { useState } from 'react';
import { AstronautProfile, DailyAssessmentRecord } from '../types/health';
import { AssessmentDetailModal } from '../components/health/AssessmentDetailModal';
import { analyzePhysiologicalDrift, DriftAlert } from '../services/driftDetection';
import { HumanDigitalTwin3D } from '../components/body/HumanDigitalTwin3D';
import {
  Heart,
  Droplets,
  Thermometer,
  Moon,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Gauge,
  Radio,
  FileText,
  User,
  TrendingUp,
  ShieldCheck,
  CalendarCheck,
  Sparkles,
  Info,
  Globe,
  Bot,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

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
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  latestAssessment,
  historyRecords,
  isCompletedToday: _isCompletedToday,
  onNavigateToAssessment,
  onNavigateToHistory: _onNavigateToHistory,
  onNavigateToOverview,
  onNavigateToBodyMap,
  onNavigateToAnalytics,
  onNavigateToGuidance,
  onNavigateToRoutine,
}) => {
  const [modalRecord, setModalRecord] = useState<DailyAssessmentRecord | null>(null);
  const [selectedSbarAlert, setSelectedSbarAlert] = useState<DriftAlert | null>(null);
  const [trendRange, setTrendRange] = useState<'1D' | '1W' | '1M' | '3M'>('1D');

  const driftAlerts = analyzePhysiologicalDrift(historyRecords, profile);

  // Indicators
  const v = latestAssessment?.values || {
    heartRate: 72,
    systolic: 118,
    diastolic: 76,
    bloodSugar: 92,
    bodyTemperature: 36.6,
    sleepDuration: 7.75,
    mood: 'good' as const,
  };

  const score = latestAssessment?.overall.score ?? 95;
  const isHealthy = !latestAssessment || latestAssessment.overall.status === 'GREEN';

  // Sample Recharts curve matching 08_dashboard_full_concept.png
  const trendChartData = [
    { time: '12AM', heartRate: 68, bloodPressure: 90, temperature: 56 },
    { time: '6AM', heartRate: 78, bloodPressure: 98, temperature: 62 },
    { time: '12PM', heartRate: 85, bloodPressure: 108, temperature: 68 },
    { time: '6PM', heartRate: 74, bloodPressure: 100, temperature: 60 },
    { time: '12AM', heartRate: 76, bloodPressure: 104, temperature: 62 },
  ];

  // Routine Checklist State
  const [routineTasks, setRoutineTasks] = useState([
    { id: '1', title: 'Check vitals (Daily)', time: 'Completed • 9:00 AM', done: true },
    { id: '2', title: 'Drink water', time: 'Completed • 10:30 AM', done: true },
    { id: '3', title: 'Take a short walk', time: 'Pending • 2:00 PM', done: false },
    { id: '4', title: 'Sleep 7+ hours', time: 'Pending • Tonight', done: false },
  ]);

  const toggleRoutine = (id: string) => {
    setRoutineTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const completedCount = routineTasks.filter((t) => t.done).length;
  const routinePct = Math.round((completedCount / routineTasks.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in pb-12 select-none">

      {/* ── 1. Top Greeting Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight flex items-center gap-2">
            Hello, Astronaut! <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Here's your health overview for today • Mission Day {profile.currentMissionDay}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToAssessment}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold font-mono tracking-wider shadow-lg shadow-blue-900/40 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>DAILY CHECK-IN</span>
          </button>
        </div>
      </div>

      {/* ── 2. Top Row: 3 Hero Cards (Score, Overall Status, Astronaut) ─ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Card 1: Circular Health Score Ring (md:col-span-3) */}
        <div className="md:col-span-3 p-5 rounded-2xl bg-[#0c132c]/80 border border-[#1b2752] flex flex-col items-center justify-center gap-3 relative overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#142045" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white tracking-tight">{score}</span>
              <span className="text-xs text-slate-400 font-semibold">/100</span>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-bold text-white">Health Score</h3>
            <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Excellent! ↑ +2%</span>
            </p>
          </div>
        </div>

        {/* Card 2: Overall Status with Glowing ECG (md:col-span-5) */}
        <div className="md:col-span-5 p-5 rounded-2xl bg-[#0c132c]/80 border border-[#1b2752] flex flex-col justify-between gap-4 relative overflow-hidden backdrop-blur-xl shadow-xl">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Overall Status
            </span>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{isHealthy ? 'Healthy' : 'Caution Advised'}</span>
              </div>
              <span className="text-xs font-medium text-slate-300">
                {isHealthy ? 'All systems are nominal' : latestAssessment?.overall.summary}
              </span>
            </div>
          </div>

          {/* Glowing Green ECG Pulse Line (matches 01_dashboard.png) */}
          <div className="w-full h-12 relative flex items-center">
            <svg viewBox="0 0 300 40" className="w-full h-full" preserveAspectRatio="none">
              <polyline
                points="0,20 40,20 50,8 60,32 70,12 80,24 90,20 160,20 170,5 180,35 190,10 200,28 210,20 300,20"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Perfusion Status: OPTIMAL</span>
            <span className="text-emerald-400 font-bold">BIO-TELEMETRY 100%</span>
          </div>
        </div>

        {/* Card 3: Astronaut Hero Artwork (md:col-span-4) */}
        <div className="md:col-span-4 rounded-2xl bg-gradient-to-tr from-[#080e24] via-[#0d163d] to-[#121f54] border border-blue-500/30 p-5 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[160px]">
          {/* Subtle star particle highlights */}
          <div className="absolute top-2 right-4 text-cyan-300 opacity-70 animate-pulse">✦</div>
          <div className="absolute bottom-6 right-12 text-blue-300 opacity-50">★</div>
          <div className="absolute top-10 left-16 text-white opacity-40">✦</div>

          {/* Floating Earth curvature in background */}
          <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-gradient-to-t from-blue-600/40 via-cyan-500/20 to-transparent blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase px-2 py-0.5 rounded bg-blue-900/40 border border-blue-500/30">
              MISSION ANALOG
            </span>
            <span className="text-xs text-slate-300 font-mono">SOL {profile.currentMissionDay}</span>
          </div>

          <div className="relative z-10 pt-4">
            <h4 className="text-lg font-extrabold text-white font-sans">{profile.name}</h4>
            <p className="text-xs text-cyan-400 font-medium">{profile.role}</p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Spacecraft: <span className="text-slate-200">{profile.spacecraft}</span>
            </p>
          </div>
        </div>

      </div>

      {/* ── 3. Multi-Sol Physiological Drift Alert Banner (Abdul Rafay Phase 2) ── */}
      {driftAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-amber-300 font-sans">
                Multi-Sol Physiological Drift Alerts ({driftAlerts.length} Active)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
              Phase 2 Telemetry Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {driftAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-black/40 border border-amber-500/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{alert.title}</span>
                  <span className="text-[10px] font-mono text-amber-300 px-1.5 py-0.5 rounded bg-amber-400/10">
                    {alert.detectedChange}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">Span: {alert.solSpan} Sols</span>
                  <button
                    onClick={() => setSelectedSbarAlert(alert)}
                    className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Flight Surgeon SBAR Packet</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Middle Row: 5 Vital Signs Cards + Recent Alerts ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Vital Signs (lg:col-span-8) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0c132c]/80 border border-[#1b2752] space-y-3 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white font-sans">Vital Signs</h2>
            <button
              onClick={onNavigateToOverview}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors font-medium"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">

            {/* Heart Rate */}
            <div
              onClick={() => latestAssessment && setModalRecord(latestAssessment)}
              className="p-3.5 rounded-xl bg-[#070b1a] border border-red-500/20 hover:border-red-500/50 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mb-2">
                <Heart className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Heart Rate</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-black text-white">{v.heartRate}</span>
                  <span className="text-[10px] text-slate-400">bpm</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Normal</span>
                </div>
              </div>
            </div>

            {/* Blood Pressure */}
            <div
              onClick={() => latestAssessment && setModalRecord(latestAssessment)}
              className="p-3.5 rounded-xl bg-[#070b1a] border border-blue-500/20 hover:border-blue-500/50 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                <Droplets className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Blood Pressure</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-black text-white">{v.systolic}/{v.diastolic}</span>
                  <span className="text-[10px] text-slate-400">mmHg</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Normal</span>
                </div>
              </div>
            </div>

            {/* Blood Sugar */}
            <div
              onClick={() => latestAssessment && setModalRecord(latestAssessment)}
              className="p-3.5 rounded-xl bg-[#070b1a] border border-purple-500/20 hover:border-purple-500/50 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
                <Gauge className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Blood Sugar</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-black text-white">{v.bloodSugar}</span>
                  <span className="text-[10px] text-slate-400">mg/dL</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Normal</span>
                </div>
              </div>
            </div>

            {/* Temperature */}
            <div
              onClick={() => latestAssessment && setModalRecord(latestAssessment)}
              className="p-3.5 rounded-xl bg-[#070b1a] border border-orange-500/20 hover:border-orange-500/50 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center mb-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Temperature</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-black text-white">{v.bodyTemperature}</span>
                  <span className="text-[10px] text-slate-400">°C</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Normal</span>
                </div>
              </div>
            </div>

            {/* Sleep */}
            <div
              onClick={() => latestAssessment && setModalRecord(latestAssessment)}
              className="p-3.5 rounded-xl bg-[#070b1a] border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-2">
                <Moon className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Sleep</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-black text-white">{Math.floor(v.sleepDuration)}h {Math.round((v.sleepDuration % 1) * 60)}m</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Good</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Recent Alerts (lg:col-span-4) (matches 01_dashboard.png) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0c132c]/80 border border-[#1b2752] flex flex-col justify-between backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white font-sans">Recent Alerts</h2>
            <button
              onClick={onNavigateToGuidance}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors font-medium"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-2 shadow-lg shadow-emerald-950/40">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="text-base font-extrabold text-white">All good!</h4>
            <p className="text-xs text-slate-400 mt-0.5">No urgent alarms at this time</p>
          </div>

          <div className="pt-2 border-t border-[#1b2752] text-center">
            <span className="text-[11px] text-cyan-400 font-mono">
              Telemetry Surveillance: ACTIVE
            </span>
          </div>
        </div>

      </div>

      {/* ── 5. Full Phase 1 / Phase 2 Tri-Column Suite (matches 08_dashboard_full_concept.png) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* 5A. Your Body Overview (lg:col-span-4) -> Interactive 3D Digital Twin with 360° Drag */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0c132c]/80 border border-[#1b2752] flex flex-col justify-between backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-sans">Human Digital Twin 3D</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>360° Live WebGL</span>
            </span>
          </div>

          {/* Interactive 3D WebGL Digital Twin (Drag to Rotate 360°) */}
          <div className="relative my-2 rounded-2xl overflow-hidden border border-cyan-500/20 shadow-inner">
            <HumanDigitalTwin3D
              latestAssessment={latestAssessment}
              onSelectOrgan={(partId) => onNavigateToBodyMap(partId)}
              height={260}
            />
          </div>

          <button
            onClick={() => onNavigateToBodyMap()}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <span>FULL SCREEN 3D BODY MAP & TELEMETRY</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5B. Health Trends Chart (lg:col-span-5) -> links to TrendAnalyticsPage */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0c132c]/80 border border-[#1b2752] flex flex-col justify-between backdrop-blur-xl shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white font-sans">Health Trends</h3>
              </div>

              {/* Time Range Selector */}
              <div className="flex items-center gap-1 bg-[#070b1a] p-1 rounded-lg border border-[#1b2752]">
                {(['1D', '1W', '1M', '3M'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTrendRange(r)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                      trendRange === r
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-2 font-mono">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>Heart Rate</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Blood Pressure</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Temperature</span>
              </div>
            </div>

            {/* Recharts Wave Graph */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} domain={[40, 130]} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070b1a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="bloodPressure" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBP)" />
                  <Area type="monotone" dataKey="heartRate" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#colorHR)" />
                  <Area type="monotone" dataKey="temperature" stroke="#a855f7" strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <button
            onClick={onNavigateToAnalytics}
            className="w-full mt-3 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-xs font-bold font-mono tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <span>OPEN DYNAMIC ANALYTICS SUITE</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5C. AI Guidance & Flight Surgeon (lg:col-span-3) -> links to FlightSurgeonGuidancePage */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-[#0c132c]/80 border border-[#1b2752] flex flex-col justify-between backdrop-blur-xl shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-sans">AI Guidance</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Active
              </span>
            </div>

            {/* Astronaut Robot / Assistant Greeting */}
            <div className="p-3 rounded-xl bg-[#070b1a] border border-blue-500/20 space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>You're doing great! Keep up the good work.</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Physiological equilibrium sustained across all 6 core telemetry indicators.
              </p>
            </div>

            {/* Quick Tips */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-300 uppercase font-mono">Quick Tips:</p>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>💧 Stay hydrated (2–3 L/Sol)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>🌙 Target 7+ hours rest</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>🏃 Fulfill ARED countermeasure</span>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToGuidance}
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-blue-600/30 hover:from-emerald-600/50 hover:to-blue-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <span>FLIGHT SURGEON GUIDANCE</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ── 6. Bottom Row: Mission Routine, Alerts Feed, Mission Info ──── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* 6A. Mission Routine (md:col-span-4) */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-[#0c132c]/80 border border-[#1b2752] flex flex-col justify-between backdrop-blur-xl shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-sans">Mission Routine</h3>
              </div>
              <button
                onClick={onNavigateToRoutine}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-3">
              {/* Mini donut ring */}
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#152247" strokeWidth="4" />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 16}
                    strokeDashoffset={2 * Math.PI * 16 * (1 - routinePct / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white font-mono">
                  {routinePct}%
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Daily Progress</p>
                <p className="text-[11px] text-slate-400">{completedCount} of {routineTasks.length} tasks finished</p>
              </div>
            </div>

            {/* Routine Checklist items */}
            <div className="space-y-2">
              {routineTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleRoutine(t.id)}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#070b1a] hover:bg-[#0f1738] border border-white/5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                      {t.done && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-xs ${t.done ? 'line-through text-slate-400' : 'text-slate-200 font-medium'}`}>
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{t.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6B. Alerts & Notifications Feed (md:col-span-4) */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-[#0c132c]/80 border border-[#1b2752] space-y-3 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Alerts & Notifications</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Feed</span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-[#070b1a] border border-emerald-500/20 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-200 font-medium">All readings are within normal range.</p>
                <span className="text-[10px] text-slate-400 font-mono">2h ago</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#070b1a] border border-amber-500/20 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-200 font-medium">Multi-Sol cardiovascular drift monitored.</p>
                <span className="text-[10px] text-slate-400 font-mono">1d ago</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#070b1a] border border-blue-500/20 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-200 font-medium">Next scheduled check-in in 4 hours.</p>
                <span className="text-[10px] text-slate-400 font-mono">Telemetry timer</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6C. Mission Info & Long-Duration Orbit (md:col-span-4) */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-gradient-to-br from-[#0c132c] via-[#0e1738] to-[#14204c] border border-blue-500/30 flex flex-col justify-between backdrop-blur-xl shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-2 text-cyan-400">
              <Globe className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white font-sans">Mission Info</h3>
            </div>
            <h4 className="text-base font-extrabold text-white mt-1">Long-Duration Mission</h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-1 font-sans">
              Deep Space Gateway & Mars Orbit Analog. Keep monitoring your health for an optimal, anomaly-free mission.
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-cyan-300 font-mono">
            <span>🚀 NASA SPACE APPS 2026</span>
            <span className="text-emerald-400">NOMINAL</span>
          </div>
        </div>

      </div>

      {/* ── 7. SBAR Communication Packet Modal (Abdul Rafay Phase 2) ── */}
      {selectedSbarAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#0b1228] border border-cyan-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1b2752] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Flight Surgeon SBAR Communication
                </h3>
              </div>
              <button
                onClick={() => setSelectedSbarAlert(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <strong className="text-blue-300 font-mono block mb-1">S — SITUATION:</strong>
                <p className="text-slate-300">{selectedSbarAlert.sbarSummary.situation}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <strong className="text-purple-300 font-mono block mb-1">B — BACKGROUND:</strong>
                <p className="text-slate-300">{selectedSbarAlert.sbarSummary.background}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <strong className="text-amber-300 font-mono block mb-1">A — ASSESSMENT:</strong>
                <p className="text-slate-300">{selectedSbarAlert.sbarSummary.assessment}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <strong className="text-emerald-300 font-mono block mb-1">R — RECOMMENDATION:</strong>
                <p className="text-slate-300">{selectedSbarAlert.sbarSummary.recommendation}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1b2752]">
              <button
                onClick={() => {
                  alert('SBAR Telemetry Packet successfully uplinked to Flight Control via Deep Space Network (DSN).');
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

      {/* Detail Modal for Selected Assessment */}
      <AssessmentDetailModal
        record={modalRecord}
        isOpen={!!modalRecord}
        onClose={() => setModalRecord(null)}
      />

      {/* Bottom Footer Callout (matches design mockup) */}
      <div className="text-center pt-2">
        <p className="text-xs font-semibold text-slate-400 font-sans tracking-wide">
          🚀 Stay healthy. Stay mission-ready.
        </p>
      </div>

    </div>
  );
};
