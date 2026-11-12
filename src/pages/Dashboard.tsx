/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Master Dashboard — Redesigned Layout v3
 * Lead Developer: Abdul Rafay | Visualization: Sameen | UI: Abdullah
 */

import React, { useState } from 'react';
import { AstronautProfile, DailyAssessmentRecord } from '../types/health';
import { AssessmentDetailModal } from '../components/health/AssessmentDetailModal';
import { analyzePhysiologicalDrift, DriftAlert } from '../services/driftDetection';
import {
  Heart, Droplets, Thermometer, Moon, ChevronRight, CheckCircle,
  AlertTriangle, Gauge, Radio, FileText, TrendingUp, ShieldCheck,
  CalendarCheck, Sparkles, Activity, Zap, Globe, ArrowUpRight,
  BarChart2, Bell, User, X,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
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

/* ─── small reusable components ─────────────────────────────────────────── */

const StatusDot = ({ status }: { status: string }) => (
  <span className={`w-2 h-2 rounded-full inline-block ${
    status === 'GREEN' ? 'bg-emerald-400' :
    status === 'RED'   ? 'bg-rose-400 animate-pulse' :
                         'bg-amber-400'
  }`} />
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">{children}</span>
);

/* ─── Main Dashboard ─────────────────────────────────────────────────────── */

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
  const [trendMetric, setTrendMetric] = useState<'heartRate' | 'bloodPressure' | 'temperature'>('heartRate');

  const driftAlerts = analyzePhysiologicalDrift(historyRecords, profile);

  const v = latestAssessment?.values || {
    heartRate: 72, systolic: 118, diastolic: 76,
    bloodSugar: 92, bodyTemperature: 36.6,
    sleepDuration: 7.75, mood: 'good' as const,
  };

  const score     = latestAssessment?.overall.score ?? 95;
  const isHealthy = !latestAssessment || latestAssessment.overall.status === 'GREEN';

  const hrStatus    = latestAssessment?.results.heartRate.status    || 'GREEN';
  const bpStatus    = latestAssessment?.results.heartRate.status    || 'GREEN';
  const sugarStatus = latestAssessment?.results.bloodSugar.status   || 'GREEN';
  const tempStatus  = latestAssessment?.results.bodyTemperature.status || 'GREEN';
  const sleepStatus = latestAssessment?.results.sleepDuration?.status  || 'GREEN';

  const trendData = [
    { time: '12AM', heartRate: 66, bloodPressure: 88,  temperature: 36.3 },
    { time: '3AM',  heartRate: 62, bloodPressure: 84,  temperature: 36.2 },
    { time: '6AM',  heartRate: 70, bloodPressure: 92,  temperature: 36.4 },
    { time: '9AM',  heartRate: 78, bloodPressure: 102, temperature: 36.6 },
    { time: '12PM', heartRate: 84, bloodPressure: 110, temperature: 36.8 },
    { time: '3PM',  heartRate: 80, bloodPressure: 106, temperature: 36.7 },
    { time: '6PM',  heartRate: 76, bloodPressure: 100, temperature: 36.6 },
    { time: '9PM',  heartRate: 72, bloodPressure: 96,  temperature: 36.5 },
  ];

  const [routineTasks, setRoutineTasks] = useState([
    { id: '1', label: 'Daily vitals log',       time: '09:00', done: true  },
    { id: '2', label: 'Hydration (2.5 L target)', time: '10:30', done: true  },
    { id: '3', label: 'CEVIS ergometer 30 min',  time: '14:00', done: false },
    { id: '4', label: 'Sleep chamber 8+ hrs',    time: '22:00', done: false },
  ]);
  const toggleTask = (id: string) =>
    setRoutineTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const donePct = Math.round((routineTasks.filter((t) => t.done).length / routineTasks.length) * 100);

  // vitals data for cards
  const vitals = [
    { label: 'Heart Rate',      value: v.heartRate,      unit: 'bpm',   icon: Heart,       color: 'text-rose-400',   bg: 'bg-rose-500/10',    border: 'border-rose-500/20',   hover: 'hover:border-rose-500/50',    status: hrStatus,    part: 'heart' },
    { label: 'Blood Pressure',  value: `${v.systolic}/${v.diastolic}`, unit: 'mmHg', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', hover: 'hover:border-blue-500/50', status: bpStatus, part: 'heart' },
    { label: 'Blood Glucose',   value: v.bloodSugar,     unit: 'mg/dL', icon: Gauge,       color: 'text-purple-400', bg: 'bg-purple-500/10',  border: 'border-purple-500/20', hover: 'hover:border-purple-500/50',  status: sugarStatus, part: 'metabolic' },
    { label: 'Body Temp',       value: v.bodyTemperature, unit: '°C',   icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/10',  border: 'border-orange-500/20', hover: 'hover:border-orange-500/50',  status: tempStatus,  part: 'spine' },
    { label: 'Sleep Duration',  value: v.sleepDuration,  unit: 'hrs',   icon: Moon,        color: 'text-indigo-400', bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20', hover: 'hover:border-indigo-500/50',  status: sleepStatus, part: 'brain' },
  ];

  const quickNav = [
    { label: 'Body Map',      icon: Activity,     color: 'from-cyan-600 to-blue-700',   fn: () => onNavigateToBodyMap() },
    { label: 'Analytics',     icon: BarChart2,    color: 'from-purple-600 to-indigo-700', fn: onNavigateToAnalytics },
    { label: 'Guidance',      icon: ShieldCheck,  color: 'from-emerald-600 to-teal-700', fn: onNavigateToGuidance },
    { label: 'Routine',       icon: CalendarCheck,color: 'from-amber-600 to-orange-700', fn: onNavigateToRoutine },
    { label: 'Overview',      icon: User,         color: 'from-rose-600 to-pink-700',    fn: onNavigateToOverview },
    { label: 'Assessment',    icon: Zap,          color: 'from-blue-600 to-cyan-700',    fn: onNavigateToAssessment },
  ];

  const metricColor = {
    heartRate:    { stroke: '#f43f5e', fill: '#f43f5e22', label: 'Heart Rate (bpm)'    },
    bloodPressure:{ stroke: '#3b82f6', fill: '#3b82f622', label: 'Systolic (mmHg)'     },
    temperature:  { stroke: '#f97316', fill: '#f9731622', label: 'Body Temp (°C)'      },
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12 select-none">

      {/* ═══════════════════════════════════════════════════════════════════
          ROW 1 — Hero Header: Greeting + Mission Status + CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#080e24] via-[#0c163e] to-[#09112e] border border-blue-500/25 shadow-2xl px-6 py-5">
        {/* Background glow blobs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 left-20 w-48 h-48 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Greeting */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                TELEMETRY ACTIVE • SOL {profile.currentMissionDay}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">{profile.name}</span>
            </h1>
            <p className="text-sm text-slate-400 font-sans">
              {profile.role} · {profile.spacecraft} · Mission Day {profile.currentMissionDay}
            </p>
          </div>

          {/* Center: Health score ring */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#142045" strokeWidth="9" />
                <circle cx="50" cy="50" r="40" fill="none"
                  stroke={score >= 85 ? '#10b981' : score >= 65 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="9"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white leading-none">{score}</span>
                <span className="text-[9px] text-slate-400 font-mono">/100</span>
              </div>
            </div>
            <div className="space-y-1">
              <SectionLabel>Health Score</SectionLabel>
              <div className={`flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono ${
                isHealthy
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}>
                <CheckCircle className="w-3.5 h-3.5" />
                {isHealthy ? 'All Systems Nominal' : 'Caution Advised'}
              </div>
              <p className="text-xs text-slate-400">
                {latestAssessment ? latestAssessment.overall.summary : 'Log your daily assessment to sync.'}
              </p>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={onNavigateToAssessment}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold font-mono tracking-wider shadow-lg shadow-cyan-900/40 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              LOG DAILY VITALS
            </button>
            <button
              onClick={onNavigateToAnalytics}
              className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
            >
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              View Trends
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          DRIFT ALERTS BANNER (Phase 2 — only shown when active)
      ═══════════════════════════════════════════════════════════════════ */}
      {driftAlerts.length > 0 && (
        <div className="rounded-2xl bg-amber-500/8 border border-amber-500/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-amber-300 font-mono">
                Multi-Sol Drift Detected — {driftAlerts.length} Active Alert{driftAlerts.length > 1 ? 's' : ''}
              </h3>
            </div>
            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25">
              PHASE 2 DRIFT ENGINE
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {driftAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-black/30 border border-amber-500/15">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{alert.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{alert.description}</p>
                  <p className="text-[10px] text-amber-300 mt-1 font-mono">{alert.detectedChange} · {alert.solSpan} Sols</p>
                </div>
                <button
                  onClick={() => setSelectedSbarAlert(alert)}
                  className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 font-semibold mt-0.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">SBAR</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          ROW 2 — Vital Signs (5 cards, full-width)
      ═══════════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white font-sans">Vital Signs</h2>
          </div>
          <button onClick={onNavigateToOverview} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            Full Overview <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {vitals.map(({ label, value, unit, icon: Icon, color, bg, border, hover, status, part }) => (
            <div
              key={label}
              onClick={() => latestAssessment ? setModalRecord(latestAssessment) : onNavigateToBodyMap(part)}
              className={`p-4 rounded-2xl bg-[#070b1a] border ${border} ${hover} cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group flex flex-col gap-3`}
            >
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-0.5">{label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white leading-none">{value}</span>
                  <span className="text-[10px] text-slate-500">{unit}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <StatusDot status={status} />
                  <span className={`text-[10px] font-semibold ${
                    status === 'GREEN' ? 'text-emerald-400' : status === 'RED' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {status === 'GREEN' ? 'Normal' : status === 'RED' ? 'Alert' : 'Watch'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ROW 3 — Trend Chart (left) | Mission Routine (right)
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">

        {/* ── Trend Chart (lg:col-span-4) ───────────────────────────────── */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0c132c]/80 border border-[#1b2752] p-5 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">24-Hour Biometric Trend</h2>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#070b1a] border border-[#1b2752]">
              {(['heartRate', 'bloodPressure', 'temperature'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setTrendMetric(m)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    trendMetric === m
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'heartRate' ? 'HR' : m === 'bloodPressure' ? 'BP' : 'TEMP'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricColor[trendMetric].stroke} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={metricColor[trendMetric].stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0c132c', border: '1px solid #1b2752', borderRadius: 12, fontSize: 11 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: metricColor[trendMetric].stroke }}
                />
                <Area
                  type="monotone"
                  dataKey={trendMetric}
                  stroke={metricColor[trendMetric].stroke}
                  strokeWidth={2.5}
                  fill="url(#metricGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: metricColor[trendMetric].stroke, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#1b2752]">
            <span className="text-[11px] text-slate-400 font-mono">{metricColor[trendMetric].label}</span>
            <button
              onClick={onNavigateToAnalytics}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
            >
              Full Analytics <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ── Mission Routine Checklist (lg:col-span-3) ────────────────── */}
        <div className="lg:col-span-3 rounded-2xl bg-[#0c132c]/80 border border-[#1b2752] p-5 shadow-xl backdrop-blur-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Mission Routine</h2>
            </div>
            <button onClick={onNavigateToRoutine} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              Full Plan <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Daily Compliance</span>
              <span className="text-emerald-400 font-bold font-mono">{donePct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#070b1a] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
                style={{ width: `${donePct}%` }}
              />
            </div>
          </div>

          {/* Task list */}
          <div className="flex flex-col gap-2 flex-1">
            {routineTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  task.done
                    ? 'bg-emerald-500/8 border-emerald-500/20'
                    : 'bg-[#070b1a] border-[#1b2752] hover:border-cyan-500/30'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  task.done
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-slate-500 bg-transparent'
                }`}>
                  {task.done && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.label}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">{task.time}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ROW 4 — Quick Nav tiles (6 modules)
      ═══════════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Quick Navigation</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickNav.map(({ label, icon: Icon, color, fn }) => (
            <button
              key={label}
              onClick={fn}
              className={`group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br ${color} hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-lg text-left`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
              <div className="relative z-10 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{label}</p>
                  <ArrowUpRight className="w-3 h-3 text-white/60 mt-0.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ROW 5 — Physiological Status Summary + Recent Alerts
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Physiological triage summary */}
        <div className="rounded-2xl bg-[#0c132c]/80 border border-[#1b2752] p-5 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Physiological Triage</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Nominal', count: vitals.filter(x => x.status === 'GREEN').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { label: 'Caution', count: vitals.filter(x => x.status === 'YELLOW').length, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { label: 'Urgent',  count: vitals.filter(x => x.status === 'RED').length, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
            ].map(({ label, count, color, bg, border }) => (
              <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
                <p className={`text-3xl font-black ${color}`}>{count}</p>
                <p className={`text-[11px] font-semibold ${color} mt-0.5`}>{label}</p>
              </div>
            ))}
          </div>

          <div className={`p-3.5 rounded-xl border text-xs font-sans ${
            isHealthy
              ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-300'
              : 'bg-amber-500/8 border-amber-500/20 text-amber-300'
          }`}>
            <div className="flex items-center gap-1.5 mb-1 font-bold">
              {isHealthy ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {isHealthy ? 'Flight Surgeon Advisory: All Nominal' : 'Surgeon Advisory: Monitor Required'}
            </div>
            <p className="text-slate-300 leading-relaxed">
              {isHealthy
                ? 'Maintain standard 2.5-hr aerobic/resistive countermeasure exercise and sleep hygiene protocols.'
                : latestAssessment?.overall.summary}
            </p>
          </div>

          <button
            onClick={onNavigateToGuidance}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/8 text-cyan-300 text-xs font-bold font-mono hover:bg-cyan-500/15 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            Flight Surgeon Guidance Engine
          </button>
        </div>

        {/* Mission + ECG status */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0c132c] via-[#0e1738] to-[#14204c] border border-blue-500/25 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Mission Overview</h2>
          </div>

          {/* ECG live strip */}
          <div className="h-14 w-full">
            <svg viewBox="0 0 320 42" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <filter id="ecg-glow-dash">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <linearGradient id="ecgLine" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="50%"  stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <polyline
                points="0,21 50,21 60,10 70,34 80,12 90,26 100,21 170,21 180,6 190,38 200,8 210,30 220,21 320,21"
                fill="none" stroke="url(#ecgLine)" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                filter="url(#ecg-glow-dash)"
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Mission Day',    value: `SOL ${profile.currentMissionDay}`, color: 'text-cyan-300' },
              { label: 'Bio-Telemetry',  value: '100%',      color: 'text-emerald-400' },
              { label: 'Deep Space Comms', value: '18 min delay', color: 'text-blue-300' },
              { label: 'Mission Status', value: 'NOMINAL',   color: 'text-emerald-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 rounded-xl bg-black/25 border border-white/8">
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{label}</p>
                <p className={`text-sm font-bold ${color} mt-0.5`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/8 border border-blue-500/20 text-xs text-slate-300">
            <Bell className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            Deep Space Gateway & Mars Orbit Analog. Autonomous health monitoring active.
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SBAR MODAL (Phase 2)
      ═══════════════════════════════════════════════════════════════════ */}
      {selectedSbarAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#0b1228] border border-cyan-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1b2752] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Flight Surgeon SBAR
                </h3>
              </div>
              <button onClick={() => setSelectedSbarAlert(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              {[
                { key: 'S – SITUATION',    value: selectedSbarAlert.sbarSummary.situation,     color: 'blue' },
                { key: 'B – BACKGROUND',   value: selectedSbarAlert.sbarSummary.background,    color: 'purple' },
                { key: 'A – ASSESSMENT',   value: selectedSbarAlert.sbarSummary.assessment,    color: 'amber' },
                { key: 'R – RECOMMENDATION', value: selectedSbarAlert.sbarSummary.recommendation, color: 'emerald' },
              ].map(({ key, value, color }) => (
                <div key={key} className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                  <strong className={`text-${color}-300 font-mono block mb-1`}>{key}:</strong>
                  <p className="text-slate-300 leading-relaxed">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1b2752]">
              <button onClick={() => setSelectedSbarAlert(null)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-mono hover:bg-white/10 transition-all">
                Close
              </button>
              <button
                onClick={() => {
                  alert('SBAR Telemetry Packet uplinked to Flight Control via Deep Space Network (DSN).');
                  setSelectedSbarAlert(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold tracking-wider shadow-lg shadow-cyan-900/40 transition-all"
              >
                Transmit SBAR Uplink
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessment detail modal */}
      <AssessmentDetailModal
        record={modalRecord}
        isOpen={!!modalRecord}
        onClose={() => setModalRecord(null)}
      />
    </div>
  );
};
