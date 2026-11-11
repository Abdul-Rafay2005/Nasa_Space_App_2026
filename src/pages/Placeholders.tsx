/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Phase 2 Pages — Body Overview, Trends & Analytics, Guidance & Alerts, Mission Routine
 * Lead Developer: Abdul Rafay
 * UI Design: Abdullah (Phase 2 Reference Images)
 */

import React, { useState } from 'react';
import {
  Heart,
  Wind,
  Utensils,
  Dumbbell,
  Brain,
  Shield,
  CheckCircle,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Trophy,
  Clock,
  Droplets,
  Moon,
} from 'lucide-react';
import { NavigationPage } from '../components/layout/Sidebar';
import { DailyAssessmentRecord } from '../types/health';
import { SimpleHealthTrendChart } from '../components/charts/SimpleHealthTrendChart';

interface PlaceholderProps {
  pageId: NavigationPage;
  onNavigateToDashboard: () => void;
  records?: DailyAssessmentRecord[];
  latestAssessment?: DailyAssessmentRecord;
}

/* ══════════════════════════════════════════════════════════════════════
   BODY OVERVIEW PAGE
   ══════════════════════════════════════════════════════════════════════ */
const bodySystemItems = [
  {
    id: 'heart',
    label: 'Heart & Circulatory',
    icon: Heart,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-400/10',
    getStatus: (rec?: DailyAssessmentRecord) => rec?.results.heartRate.status ?? 'GREEN',
    getDetail: (rec?: DailyAssessmentRecord) =>
      rec
        ? { title: 'Heart Health', desc: rec.results.heartRate.reason, status: rec.results.heartRate.status, quickInfo: 'A normal resting heart rate is 60–100 bpm.' }
        : { title: 'Heart Health', desc: 'No data yet. Submit a health check-in to see your heart status.', status: 'GREEN' as const, quickInfo: 'A normal resting heart rate is 60–100 bpm.' },
  },
  {
    id: 'respiratory',
    label: 'Respiratory System',
    icon: Wind,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-400/10',
    getStatus: (_rec?: DailyAssessmentRecord) => 'GREEN' as const,
    getDetail: (_rec?: DailyAssessmentRecord) => ({
      title: 'Respiratory Health', desc: 'Respiratory function nominal. Oxygen partial pressure and CO₂ scrubbing within ISS-equivalent habitat limits.', status: 'GREEN' as const, quickInfo: 'Normal SpO₂ at sea-level equivalent is 95–100%.',
    }),
  },
  {
    id: 'digestive',
    label: 'Digestive System',
    icon: Utensils,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-400/10',
    getStatus: (rec?: DailyAssessmentRecord) => rec?.results.bloodSugar.status ?? 'GREEN',
    getDetail: (rec?: DailyAssessmentRecord) => ({
      title: 'Digestive & Metabolic',
      desc: rec ? rec.results.bloodSugar.reason : 'No data yet. Blood glucose monitoring helps track metabolic health.',
      status: rec?.results.bloodSugar.status ?? 'GREEN',
      quickInfo: 'Normal fasting glucose is 70–100 mg/dL.',
    }),
  },
  {
    id: 'musculoskeletal',
    label: 'Musculoskeletal',
    icon: Dumbbell,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-400/10',
    getStatus: (_rec?: DailyAssessmentRecord) => 'GREEN' as const,
    getDetail: (_rec?: DailyAssessmentRecord) => ({
      title: 'Musculoskeletal Health', desc: 'Bone density and muscle mass monitoring. Microgravity causes 1–2% bone loss per month without countermeasures. Daily ARED exercise is critical.', status: 'GREEN' as const, quickInfo: 'Exercise 2.5 hours/day is the NASA countermeasure standard.',
    }),
  },
  {
    id: 'nervous',
    label: 'Nervous System',
    icon: Brain,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-400/10',
    getStatus: (rec?: DailyAssessmentRecord) => rec?.results.mood.status ?? 'GREEN',
    getDetail: (rec?: DailyAssessmentRecord) => ({
      title: 'Neurological & Psychological',
      desc: rec ? `Mood: ${rec.results.mood.reason}` : 'Psychological health monitoring. SAS and cognitive load affect mission performance.',
      status: rec?.results.mood.status ?? 'GREEN',
      quickInfo: 'Sleep, hydration, and social contact protect cognitive function.',
    }),
  },
  {
    id: 'immune',
    label: 'Immune System',
    icon: Shield,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-400/10',
    getStatus: (rec?: DailyAssessmentRecord) => rec?.results.bodyTemperature.status ?? 'GREEN',
    getDetail: (rec?: DailyAssessmentRecord) => ({
      title: 'Immune & Thermoregulatory',
      desc: rec ? rec.results.bodyTemperature.reason : 'Core temperature monitoring helps detect infection and thermoregulatory stress.',
      status: rec?.results.bodyTemperature.status ?? 'GREEN',
      quickInfo: 'Normal core temperature is 36.1–37.2 °C.',
    }),
  },
];

function statusLabel(s: 'GREEN' | 'YELLOW' | 'RED'): string {
  return s === 'GREEN' ? 'Healthy' : s === 'YELLOW' ? 'Normal' : 'Attention';
}
function statusStyle(s: 'GREEN' | 'YELLOW' | 'RED') {
  if (s === 'GREEN') return { text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-500/20' };
  if (s === 'RED')   return { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/20' };
  return { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/20' };
}

const BodyOverviewPage: React.FC<{ latestAssessment?: DailyAssessmentRecord }> = ({ latestAssessment }) => {
  const [selected, setSelected] = useState(bodySystemItems[0]);
  const detail = selected.getDetail(latestAssessment);
  const detailStatus = detail.status;
  const ss = statusStyle(detailStatus);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Interactive Body Overview</h1>
        <p className="text-sm text-slate-400 mt-0.5">Explore your body and check different systems</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Body figure placeholder */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/5 flex flex-col items-center justify-center min-h-64">
          <div className="relative">
            {/* Body outline SVG */}
            <svg viewBox="0 0 80 160" className="w-28 h-auto opacity-70" fill="none">
              {/* Head */}
              <ellipse cx="40" cy="20" rx="14" ry="16" stroke="#06b6d4" strokeWidth="2" />
              {/* Torso */}
              <rect x="22" y="38" width="36" height="52" rx="8" stroke="#06b6d4" strokeWidth="2" />
              {/* Left arm */}
              <rect x="6" y="40" width="14" height="40" rx="6" stroke="#06b6d4" strokeWidth="2" />
              {/* Right arm */}
              <rect x="60" y="40" width="14" height="40" rx="6" stroke="#06b6d4" strokeWidth="2" />
              {/* Left leg */}
              <rect x="22" y="92" width="15" height="58" rx="6" stroke="#06b6d4" strokeWidth="2" />
              {/* Right leg */}
              <rect x="43" y="92" width="15" height="58" rx="6" stroke="#06b6d4" strokeWidth="2" />
              {/* Heart indicator */}
              <circle cx="38" cy="58" r="5" fill={latestAssessment?.results.heartRate.status === 'RED' ? '#ef4444' : latestAssessment?.results.heartRate.status === 'YELLOW' ? '#f59e0b' : '#10b981'} opacity="0.8" />
              {/* Head indicator */}
              <circle cx="40" cy="20" r="4" fill={latestAssessment?.results.mood.status === 'RED' ? '#ef4444' : latestAssessment?.results.mood.status === 'YELLOW' ? '#f59e0b' : '#10b981'} opacity="0.8" />
              {/* Gut indicator */}
              <circle cx="42" cy="68" r="4" fill={latestAssessment?.results.bloodSugar.status === 'RED' ? '#ef4444' : latestAssessment?.results.bloodSugar.status === 'YELLOW' ? '#f59e0b' : '#10b981'} opacity="0.8" />
              {/* Temp indicator */}
              <circle cx="38" cy="45" r="3" fill={latestAssessment?.results.bodyTemperature.status === 'RED' ? '#ef4444' : latestAssessment?.results.bodyTemperature.status === 'YELLOW' ? '#f59e0b' : '#10b981'} opacity="0.7" />
            </svg>
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/5 blur-2xl" />
          </div>
          <p className="mt-4 text-xs text-slate-500 text-center">Click a system on the right to explore</p>
        </div>

        {/* System list */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-white/5 space-y-1">
          {bodySystemItems.map((sys) => {
            const st = sys.getStatus(latestAssessment);
            const ss2 = statusStyle(st);
            const isSelected = selected.id === sys.id;
            const Icon = sys.icon;
            return (
              <button
                key={sys.id}
                onClick={() => setSelected(sys)}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all text-left ${isSelected ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sys.iconBg}`}>
                    <Icon className={`w-4 h-4 ${sys.iconColor}`} />
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {sys.label}
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ss2.bg} ${ss2.text} border ${ss2.border}`}>
                  {statusLabel(st)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected.iconBg}`}>
              <selected.icon className={`w-5 h-5 ${selected.iconColor}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{detail.title}</h3>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${ss.bg} ${ss.text} border ${ss.border}`}>
                <CheckCircle className="w-3 h-3" />
                {statusLabel(detailStatus)}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{detail.desc}</p>

          {detail.quickInfo && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-blue-400 text-[10px] font-bold">i</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-300 mb-0.5">Quick Info</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{detail.quickInfo}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   TRENDS & ANALYTICS PAGE
   ══════════════════════════════════════════════════════════════════════ */
const TrendsPage: React.FC<{ records: DailyAssessmentRecord[] }> = ({ records }) => {
  const [period, setPeriod] = useState<'1D' | '1W' | '1M' | '3M'>('1W');

  const avgHR = records.length > 0 ? Math.round(records.reduce((a, r) => a + r.values.heartRate, 0) / records.length) : 0;
  const avgSleep = records.length > 0 ? (records.reduce((a, r) => a + r.values.sleepDuration, 0) / records.length).toFixed(1) : '0';
  const avgScore = records.length > 0 ? Math.round(records.reduce((a, r) => a + r.overall.score, 0) / records.length) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Health Trends & Analytics</h1>
          <p className="text-sm text-slate-400 mt-0.5">Track your health over time</p>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 p-1 bg-[#111827] rounded-xl border border-white/5">
          {(['1D', '1W', '1M', '3M'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-white/5">
        {records.length > 1 ? (
          <SimpleHealthTrendChart records={records} />
        ) : (
          <div className="h-48 flex flex-col items-center justify-center gap-3 text-center">
            <TrendingUp className="w-10 h-10 text-slate-600" />
            <p className="text-slate-400 text-sm">Log at least 2 assessments to see your trend charts</p>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Health Insights */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
            </div>
            <h3 className="text-sm font-bold text-white">Health Insights</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {records.length === 0
              ? 'Start logging your vitals to receive personalized health insights.'
              : avgScore >= 80
              ? 'Your health is stable and within normal range.'
              : avgScore >= 60
              ? 'Some indicators need attention. Review your recent check-ins.'
              : 'Multiple indicators are outside normal range. Contact flight surgeon.'}
          </p>
          {records.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-medium">Average score: {avgScore}/100</span>
            </div>
          )}
        </div>

        {/* Key Stats */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/5">
          <h3 className="text-sm font-bold text-white mb-3">Key Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                Avg Heart Rate
              </div>
              <span className="text-sm font-bold text-white">{avgHR > 0 ? `${avgHR} bpm` : '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                Avg Sleep
              </div>
              <span className="text-sm font-bold text-white">{records.length > 0 ? `${avgSleep}h` : '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                Health Score
              </div>
              <span className="text-sm font-bold text-white">{avgScore > 0 ? `${avgScore}/100` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Records count */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/5">
          <h3 className="text-sm font-bold text-white mb-3">Mission Log</h3>
          <div className="space-y-3">
            {records.slice(0, 4).map((rec) => {
              const st = statusStyle(rec.overall.status);
              return (
                <div key={rec.id} className="flex items-center justify-between text-xs">
                  <div className="text-slate-400 font-mono">Sol {rec.missionDay}</div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.bg} ${st.text} border ${st.border}`}>
                    {statusLabel(rec.overall.status)}
                  </span>
                </div>
              );
            })}
            {records.length === 0 && <p className="text-xs text-slate-500">No records yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   GUIDANCE & ALERTS PAGE
   ══════════════════════════════════════════════════════════════════════ */
const GuidancePage: React.FC<{ latestAssessment?: DailyAssessmentRecord }> = ({ latestAssessment }) => {
  const hasIssues = latestAssessment && (latestAssessment.overall.urgentCount > 0 || latestAssessment.overall.warningCount > 0);
  const recommendations = [
    { icon: Droplets, iconColor: 'text-blue-400', iconBg: 'bg-blue-400/10', text: 'Keep drinking water — aim for 2–3 L/day in microgravity' },
    { icon: Moon, iconColor: 'text-indigo-400', iconBg: 'bg-indigo-400/10', text: 'Maintain good sleep — target 7–9 hours per cycle' },
    { icon: Dumbbell, iconColor: 'text-orange-400', iconBg: 'bg-orange-400/10', text: 'Do light exercise today — ARED + cycle ergometer protocol' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Guidance & Alerts</h1>
        <p className="text-sm text-slate-400 mt-0.5">Personalized advice and important notifications</p>
      </div>

      {/* Main status banner */}
      <div
        className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
          hasIssues
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border-white/5'
        }`}
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${hasIssues ? 'bg-red-500/20' : 'bg-green-500/15'}`}>
          {hasIssues ? (
            <AlertTriangle className="w-8 h-8 text-red-400" />
          ) : (
            <CheckCircle className="w-8 h-8 text-green-400" />
          )}
        </div>
        <div>
          {hasIssues ? (
            <>
              <h2 className="text-xl font-bold text-red-300">Health Alert</h2>
              <p className="text-sm text-slate-300 mt-1">
                {latestAssessment?.overall.urgentCount ?? 0} critical and {latestAssessment?.overall.warningCount ?? 0} warning indicator(s) detected.
              </p>
              <p className="text-xs text-slate-400 mt-1 italic">{latestAssessment?.overall.recommendationSnippet}</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-green-300">All Clear!</h2>
              <p className="text-sm text-slate-300 mt-1">
                {latestAssessment ? 'No urgent alerts at the moment.' : 'Log your first check-in to receive personalized guidance.'}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recommendations */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white">Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => {
              const Icon = rec.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${rec.iconBg} shrink-0`}>
                    <Icon className={`w-4 h-4 ${rec.iconColor}`} />
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{rec.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* When to contact flight surgeon */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white">When to Contact a Flight Surgeon</h3>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-amber-300">Contact Immediately If:</p>
            </div>
            <ul className="space-y-1 ml-6">
              {[
                'Persistent dizziness or disorientation',
                'Chest pain or unusual heart rhythm',
                'Temperature above 38.5°C',
                'Blood pressure above 140/90 mmHg',
                'Vision changes or severe headache',
              ].map((s, i) => (
                <li key={i} className="text-xs text-slate-400 list-disc">{s}</li>
              ))}
            </ul>
          </div>

          {/* SBAR Alert structure */}
          {latestAssessment && hasIssues && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
              <p className="text-xs font-bold text-red-300 font-mono">SBAR ALERT PACKET</p>
              <div className="space-y-1">
                <p className="text-[11px] text-slate-300"><strong className="text-slate-200">S:</strong> {latestAssessment.overall.alertTitle}</p>
                <p className="text-[11px] text-slate-300"><strong className="text-slate-200">A:</strong> {latestAssessment.overall.summary}</p>
                <p className="text-[11px] text-slate-300"><strong className="text-slate-200">R:</strong> {latestAssessment.overall.recommendationSnippet}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   MISSION ROUTINE PAGE
   ══════════════════════════════════════════════════════════════════════ */
interface RoutineTask {
  id: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const routineTasks: RoutineTask[] = [
  { id: '1', label: 'Take Health Check-in', icon: CheckCircle, iconColor: 'text-blue-400', iconBg: 'bg-blue-400/10' },
  { id: '2', label: 'Drink Water (2–3 L)', icon: Droplets, iconColor: 'text-cyan-400', iconBg: 'bg-cyan-400/10' },
  { id: '3', label: 'Get 7+ Hours of Sleep', icon: Moon, iconColor: 'text-indigo-400', iconBg: 'bg-indigo-400/10' },
  { id: '4', label: 'Do Light Exercise', icon: Dumbbell, iconColor: 'text-orange-400', iconBg: 'bg-orange-400/10' },
  { id: '5', label: 'Check Alerts', icon: AlertTriangle, iconColor: 'text-yellow-400', iconBg: 'bg-yellow-400/10' },
  { id: '6', label: 'Relax & Stay Positive', icon: Heart, iconColor: 'text-pink-400', iconBg: 'bg-pink-400/10' },
];

const MissionRoutinePage: React.FC<{ latestAssessment?: DailyAssessmentRecord }> = ({ latestAssessment }) => {
  const [completed, setCompleted] = useState<Set<string>>(
    latestAssessment ? new Set(['1']) : new Set()
  );

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pct = Math.round((completed.size / routineTasks.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Mission Routine</h1>
        <p className="text-sm text-slate-400 mt-0.5">Your daily mission checklist</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Progress ring */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/5 flex flex-col items-center gap-4">
          {/* Ring */}
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={pct >= 80 ? '#10b981' : pct >= 50 ? '#06b6d4' : '#3b82f6'}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - pct / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{completed.size}/{routineTasks.length}</span>
              <span className="text-xs text-slate-400">Tasks</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">{pct}% Complete</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {pct === 100 ? '🎉 All done!' : `${routineTasks.length - completed.size} tasks remaining`}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-400 font-mono">Mission Day {latestAssessment?.missionDay ?? '—'}</span>
          </div>
        </div>

        {/* Checklist */}
        <div className="md:col-span-1 p-5 rounded-2xl bg-[#111827] border border-white/5 space-y-2">
          {routineTasks.map((task) => {
            const done = completed.has(task.id);
            const Icon = task.icon;
            return (
              <button
                key={task.id}
                onClick={() => toggle(task.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${done ? 'opacity-60' : 'hover:bg-white/5'}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${done ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                  {done && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${task.iconBg} shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${task.iconColor}`} />
                </div>
                <span className={`text-sm font-medium ${done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {task.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Motivational card */}
        <div
          className="p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3 text-center"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}
        >
          <div className="relative">
            {/* Stars */}
            {[...Array(12)].map((_, i) => (
              <span key={i} className="absolute rounded-full bg-white opacity-40" style={{ width: 2, height: 2, top: Math.random() * 80 - 40 + 'px', left: Math.random() * 80 - 40 + 'px' }} />
            ))}
            <div className="w-16 h-16 rounded-full bg-yellow-500/15 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-yellow-300">You're doing great!</p>
            <p className="text-xs text-slate-400 mt-1">
              {pct >= 80 ? 'Outstanding mission discipline, Astronaut!' : pct >= 50 ? 'Keep up the good work, Astronaut!' : 'Stay focused — your health matters! 🚀'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   MAIN EXPORT (router)
   ══════════════════════════════════════════════════════════════════════ */
export const FeaturePlaceholder: React.FC<PlaceholderProps> = ({
  pageId,
  onNavigateToDashboard: _onNavigateToDashboard,
  records = [],
  latestAssessment,
}) => {
  if (pageId === 'body-map') return <BodyOverviewPage latestAssessment={latestAssessment} />;
  if (pageId === 'analytics') return <TrendsPage records={records} />;
  if (pageId === 'guidance') return <GuidancePage latestAssessment={latestAssessment} />;
  if (pageId === 'routine') return <MissionRoutinePage latestAssessment={latestAssessment} />;

  return (
    <div className="text-center py-12 text-slate-500">
      <p>Page not found.</p>
    </div>
  );
};
