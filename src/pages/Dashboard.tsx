/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Dashboard Page — Phase 2 UI (matches Abdullah's design images)
 * Lead Developer: Abdul Rafay
 */

import React, { useState } from 'react';
import { AstronautProfile, DailyAssessmentRecord } from '../types/health';
import { AssessmentDetailModal } from '../components/health/AssessmentDetailModal';
import { analyzePhysiologicalDrift, DriftAlert } from '../services/driftDetection';
import {
  Heart,
  Droplets,
  Thermometer,
  Moon,
  Activity,
  ChevronRight,
  Smile,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Gauge,
  Radio,
  FileText,
} from 'lucide-react';

interface DashboardProps {
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
  historyRecords: DailyAssessmentRecord[];
  isCompletedToday: boolean;
  onNavigateToAssessment: () => void;
  onNavigateToHistory: () => void;
  onNavigateToOverview: () => void;
}

/* ─── small helpers ─────────────────────────────────────────────────── */

function statusColor(status?: string) {
  if (status === 'GREEN') return { dot: 'bg-green-400', text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-500/30', label: 'Healthy' };
  if (status === 'RED')   return { dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/30', label: 'Critical' };
  return { dot: 'bg-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/30', label: 'Warning' };
}

function healthScore(overall?: DailyAssessmentRecord['overall']): number {
  return overall ? overall.score : 0;
}

interface VitalCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  unit: string;
  status?: string;
  onClick?: () => void;
}
const VitalCard: React.FC<VitalCardProps> = ({ icon, iconBg, label, value, unit, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col gap-2 p-4 rounded-2xl bg-[#111827] border border-white/5 hover:border-blue-500/30 hover:bg-[#131c2e] transition-all text-left"
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-white">{value}</span>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
      {/* subtle sparkline placeholder */}
      <div className="mt-2 h-5 opacity-40">
        <svg viewBox="0 0 60 20" className="w-full h-full">
          <polyline
            points="0,15 10,10 20,12 30,7 40,9 50,5 60,8"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  </button>
);

/* ─── Score ring ─────────────────────────────────────────────────────── */
const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const fill = circ - (circ * score) / 100;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={fill}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-xs text-slate-400">/100</span>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────── */
export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  latestAssessment,
  historyRecords,
  isCompletedToday,
  onNavigateToAssessment,
  onNavigateToHistory,
}) => {
  const [modalRecord, setModalRecord] = useState<DailyAssessmentRecord | null>(null);
  const [selectedSbarAlert, setSelectedSbarAlert] = useState<DriftAlert | null>(null);
  const driftAlerts = analyzePhysiologicalDrift(historyRecords, profile);
  const score = healthScore(latestAssessment?.overall);
  const overall = latestAssessment?.overall;
  const sc = statusColor(overall?.status);
  const v = latestAssessment?.values;
  const r = latestAssessment?.results;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header greeting ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hello, Astronaut! 👋
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Here's your health overview for today — Sol {profile.currentMissionDay}
          </p>
        </div>

        {/* Research prototype notice — small + non-intrusive */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] text-amber-300 font-mono">Research Prototype — Not for clinical use</span>
        </div>
      </div>

      {/* ── Top row: Score + Overall status + Astronaut art ──────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Health Score ring */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/5 flex flex-col items-center gap-3">
          <ScoreRing score={score} />
          <div className="text-center">
            <p className="font-bold text-white text-base">Health Score</p>
            <p className={`text-sm font-semibold ${sc.text} flex items-center justify-center gap-1`}>
              <CheckCircle className="w-3.5 h-3.5" />
              {score >= 80 ? 'Excellent!' : score >= 60 ? 'Fair' : 'Needs Attention'}
            </p>
          </div>
        </div>

        {/* Overall Status */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/5 flex flex-col justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-3">Overall Status</p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm ${sc.bg} ${sc.border} border`}>
              <CheckCircle className={`w-4 h-4 ${sc.text}`} />
              <span className={sc.text}>{overall?.statusLabel ?? 'No data yet'}</span>
            </div>
          </div>
          {overall ? (
            <div>
              <p className="text-xs text-slate-300 leading-relaxed">{overall.summary}</p>
              {/* mini ECG line */}
              <div className="mt-3 h-6 opacity-50">
                <svg viewBox="0 0 200 30" className="w-full h-full">
                  <polyline
                    points="0,15 20,15 30,5 40,25 50,15 70,15 80,8 90,20 100,15 120,15 130,4 140,24 150,15 170,15 180,10 190,18 200,15"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {overall.normalCount} normal · {overall.warningCount} warning · {overall.urgentCount} urgent
              </p>
            </div>
          ) : (
            <button
              onClick={onNavigateToAssessment}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              Log first assessment <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Astronaut image / mission card */}
        <div
          className="relative p-5 rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-end"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          }}
        >
          {/* Star field dots */}
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white opacity-30"
              style={{
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
              }}
            />
          ))}
          <div className="relative z-10">
            <p className="text-lg font-bold text-white">{profile.name}</p>
            <p className="text-xs text-slate-400">{profile.rank} · {profile.role}</p>
            <p className="text-xs text-blue-300 mt-1 font-mono">{profile.missionName}</p>
            <p className="text-xs text-slate-500 mt-0.5">🚀 {profile.spacecraft}</p>
          </div>
        </div>
      </div>

      {/* ── Multi-Sol Drift & Baseline Variance Alert Banner (Phase 2 Deliverable) ── */}
      {driftAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-amber-300">
                Multi-Sol Physiological Drift Alert ({driftAlerts.length} Active)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-amber-400/80 bg-amber-500/20 px-2 py-0.5 rounded-full">
              Phase 2 Telemetry Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {driftAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl bg-black/40 border border-amber-500/20 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-red-400 animate-ping' : 'bg-amber-400'}`} />
                    <span className="text-xs font-semibold text-slate-100">{alert.title}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 shrink-0">
                    {alert.detectedChange}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 italic">Span: {alert.solSpan} Sols</span>
                  <button
                    onClick={() => setSelectedSbarAlert(alert)}
                    className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Flight Surgeon SBAR Packet</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SBAR Packet Modal */}
      {selectedSbarAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f172a] border border-cyan-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  Flight Surgeon SBAR Communication
                </h3>
              </div>
              <button
                onClick={() => setSelectedSbarAlert(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <strong className="text-blue-300 font-mono block mb-1">S — SITUATION:</strong>
                <p className="text-slate-300">{selectedSbarAlert.sbarSummary.situation}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <strong className="text-purple-300 font-mono block mb-1">B — BACKGROUND:</strong>
                <p className="text-slate-300">{selectedSbarAlert.sbarSummary.background}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <strong className="text-amber-300 font-mono block mb-1">A — ASSESSMENT:</strong>
                <p className="text-slate-300">{selectedSbarAlert.sbarSummary.assessment}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <strong className="text-emerald-300 font-mono block mb-1">R — RECOMMENDATION:</strong>
                <p className="text-slate-300">{selectedSbarAlert.sbarSummary.recommendation}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  alert('SBAR telemetry packet queued for Deep Space Network (DSN) uplink transmission.');
                  setSelectedSbarAlert(null);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-900/40"
              >
                Transmit SBAR Uplink
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Vital Signs row ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">Vital Signs</h2>
          <button
            onClick={onNavigateToHistory}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            View Details <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <VitalCard
            icon={<Heart className="w-4 h-4 text-red-400" />}
            iconBg="bg-red-400/10"
            label="Heart Rate"
            value={v ? String(v.heartRate) : '--'}
            unit="bpm"
            status={r?.heartRate.status}
            onClick={() => latestAssessment && setModalRecord(latestAssessment)}
          />
          <VitalCard
            icon={<Gauge className="w-4 h-4 text-blue-400" />}
            iconBg="bg-blue-400/10"
            label="Blood Pressure"
            value={v ? `${v.systolic}/${v.diastolic}` : '--'}
            unit="mmHg"
            status={r?.bloodPressure.status}
            onClick={() => latestAssessment && setModalRecord(latestAssessment)}
          />
          <VitalCard
            icon={<Droplets className="w-4 h-4 text-purple-400" />}
            iconBg="bg-purple-400/10"
            label="Blood Sugar"
            value={v ? String(v.bloodSugar) : '--'}
            unit="mg/dL"
            status={r?.bloodSugar.status}
            onClick={() => latestAssessment && setModalRecord(latestAssessment)}
          />
          <VitalCard
            icon={<Thermometer className="w-4 h-4 text-orange-400" />}
            iconBg="bg-orange-400/10"
            label="Temperature"
            value={v ? String(v.bodyTemperature) : '--'}
            unit="°C"
            status={r?.bodyTemperature.status}
            onClick={() => latestAssessment && setModalRecord(latestAssessment)}
          />
          <VitalCard
            icon={<Moon className="w-4 h-4 text-indigo-400" />}
            iconBg="bg-indigo-400/10"
            label="Sleep"
            value={v ? `${Math.floor(v.sleepDuration)}h ${Math.round((v.sleepDuration % 1) * 60)}m` : '--'}
            unit=""
            status={r?.sleepDuration.status}
            onClick={() => latestAssessment && setModalRecord(latestAssessment)}
          />
        </div>
      </div>

      {/* ── Bottom row: Check-in prompt + Recent Alerts ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Daily check-in status */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {isCompletedToday ? (
              <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-white">
                {isCompletedToday ? 'Check-in Complete' : 'Daily Check-in Pending'}
              </p>
              <p className="text-xs text-slate-400">
                {isCompletedToday
                  ? `Logged ${historyRecords.length} assessment${historyRecords.length !== 1 ? 's' : ''} this mission`
                  : 'Log your vitals for today'}
              </p>
            </div>
          </div>
          {!isCompletedToday && (
            <button
              onClick={onNavigateToAssessment}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-900/40"
            >
              Start Health Check-in
            </button>
          )}
          {isCompletedToday && (
            <div className="flex gap-2">
              <button
                onClick={onNavigateToAssessment}
                className="flex-1 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-medium border border-blue-500/20 transition-all"
              >
                Log Another
              </button>
              <button
                onClick={onNavigateToHistory}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/5 transition-all"
              >
                View History
              </button>
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent Alerts</h3>
            <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {(!overall || overall.urgentCount === 0) && (!overall || overall.warningCount === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
              <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-green-400">All good!</p>
                <p className="text-xs text-slate-400">No new alerts</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {overall && overall.urgentCount > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-300">Critical Alert</p>
                    <p className="text-[11px] text-slate-400">{overall.urgentCount} indicator(s) need urgent attention</p>
                  </div>
                </div>
              )}
              {overall && overall.warningCount > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-yellow-300">Warning</p>
                    <p className="text-[11px] text-slate-400">{overall.warningCount} indicator(s) elevated</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {overall && (
            <div className="mt-auto pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Smile className="w-3.5 h-3.5 text-blue-400" />
                <span>{overall.recommendationSnippet}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Trend mini section ────────────────────────────────────────── */}
      {historyRecords.length > 1 && (
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Mission Health Trend</h3>
            </div>
            <span className="text-xs text-slate-400">{historyRecords.length} records</span>
          </div>
          <div className="h-20 w-full">
            <svg viewBox={`0 0 ${historyRecords.length * 40} 50`} className="w-full h-full" preserveAspectRatio="none">
              {/* Heart Rate line */}
              <polyline
                points={historyRecords
                  .slice()
                  .reverse()
                  .map((rec, i) => `${i * 40 + 20},${50 - (rec.values.heartRate / 150) * 45}`)
                  .join(' ')}
                fill="none"
                stroke="#f87171"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Score line */}
              <polyline
                points={historyRecords
                  .slice()
                  .reverse()
                  .map((rec, i) => `${i * 40 + 20},${50 - (rec.overall.score / 100) * 45}`)
                  .join(' ')}
                fill="none"
                stroke="#34d399"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-red-400 inline-block rounded" />
              <span className="text-[11px] text-slate-400">Heart Rate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-green-400 inline-block rounded" />
              <span className="text-[11px] text-slate-400">Health Score</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pb-2">
        <p className="text-[11px] text-slate-500 font-mono">
          🚀 Stay healthy. Stay mission-ready.
        </p>
      </div>

      <AssessmentDetailModal
        record={modalRecord}
        isOpen={!!modalRecord}
        onClose={() => setModalRecord(null)}
      />
    </div>
  );
};
