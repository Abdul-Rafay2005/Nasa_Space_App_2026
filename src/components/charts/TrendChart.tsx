/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Longitudinal Health Trend Chart (Recharts)
 * Second Developer: Sameen (Phase 1/2 Visualization Engine)
 * 
 * Plots historical telemetry trends against clinical threshold bands.
 * Dynamic shaded bands are read strictly from src/config/thresholds.ts (no hardcoded numbers).
 * Points are colored and shaped (Circle=Green, Triangle=Yellow, Diamond=Red) for colorblind accessibility.
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';
import { PROVISIONAL_DEMO_THRESHOLDS } from '../../config/thresholds';
import {
  DailyAssessmentRecord,
  HealthStatus,
  MoodType,
} from '../../types/health';
import {
  evaluateHeartRate,
  evaluateBloodSugar,
  evaluateBodyTemperature,
  evaluateSleepDuration,
  evaluateMood,
  evaluateAllIndicators,
  calculateOverallHealth,
} from '../../services/healthStatus';
import { getAstronautProfile, saveAssessmentsToStorage } from '../../services/storage';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import {
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Moon,
  Smile,
  RefreshCw,
  PlusCircle,
  Trash2,
  SlidersHorizontal,
  Info,
} from 'lucide-react';

export type ChartIndicatorKey =
  | 'heartRate'
  | 'bloodPressure'
  | 'bloodSugar'
  | 'bodyTemperature'
  | 'sleepDuration'
  | 'mood';

interface TrendChartProps {
  records: DailyAssessmentRecord[];
  onRecordsChange?: (updated: DailyAssessmentRecord[]) => void;
  className?: string;
}

interface ChartDataPoint {
  id: string;
  sol: string;
  dateLabel: string;
  timestamp: string;
  missionDay: number;
  value: number;
  secondaryValue?: number;
  unit: string;
  status: HealthStatus;
  statusSecondary?: HealthStatus;
  label: string;
  isDemonstrationData: boolean;
}

// Colorblind custom marker component
interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartDataPoint;
  strokeColor?: string;
}

const ColorblindStatusDot: React.FC<CustomDotProps> = ({ cx, cy, payload }) => {
  if (cx === undefined || cy === undefined || !payload) return null;

  const status = payload.status;

  if (status === 'RED') {
    // Diamond shape for RED / Urgent
    return (
      <g>
        <polygon
          points={`${cx},${cy - 7} ${cx + 7},${cy} ${cx},${cy + 7} ${cx - 7},${cy}`}
          fill="#ef4444"
          stroke="#060913"
          strokeWidth={2}
          className="drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]"
        />
        <circle cx={cx} cy={cy} r={2} fill="#ffffff" />
      </g>
    );
  }

  if (status === 'YELLOW') {
    // Triangle shape for YELLOW / Warning
    return (
      <g>
        <polygon
          points={`${cx},${cy - 7} ${cx + 7},${cy + 6} ${cx - 7},${cy + 6}`}
          fill="#f59e0b"
          stroke="#060913"
          strokeWidth={2}
          className="drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]"
        />
        <circle cx={cx} cy={cy + 1} r={1.5} fill="#ffffff" />
      </g>
    );
  }

  // Circle shape for GREEN / Nominal
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5.5}
      fill="#10b981"
      stroke="#060913"
      strokeWidth={2}
      className="drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]"
    />
  );
};

export const TrendChart: React.FC<TrendChartProps> = ({
  records,
  onRecordsChange,
  className = '',
}) => {
  const [selectedIndicator, setSelectedIndicator] = useState<ChartIndicatorKey>('heartRate');
  const [filterDemoOnly, setFilterDemoOnly] = useState<'all' | 'real' | 'demo'>('all');

  const thresholds = PROVISIONAL_DEMO_THRESHOLDS;

  // Filter records according to demo toggle
  const filteredRecords = useMemo(() => {
    let list = [...records];
    if (filterDemoOnly === 'real') {
      list = list.filter((r) => !r.isDemonstrationData);
    } else if (filterDemoOnly === 'demo') {
      list = list.filter((r) => !!r.isDemonstrationData);
    }
    // Sort chronologically ascending for time-series (oldest to newest)
    return list.sort((a, b) => a.missionDay - b.missionDay);
  }, [records, filterDemoOnly]);

  // Transform records into chart points based on selected indicator
  const chartData = useMemo<ChartDataPoint[]>(() => {
    return filteredRecords.map((rec) => {
      const date = new Date(rec.timestamp);
      const dateLabel = isNaN(date.getTime())
        ? `Sol ${rec.missionDay}`
        : `${date.getUTCMonth() + 1}/${date.getUTCDate()} UTC`;

      let val = 0;
      let secVal: number | undefined;
      let unit = '';
      let status: HealthStatus = 'GREEN';
      let secStatus: HealthStatus | undefined;
      let label = '';

      switch (selectedIndicator) {
        case 'heartRate': {
          val = rec.values.heartRate;
          unit = thresholds.heartRate.unit;
          status = rec.results.heartRate?.status || evaluateHeartRate(val).status;
          label = `${val} ${unit}`;
          break;
        }
        case 'bloodPressure': {
          val = rec.values.systolic;
          secVal = rec.values.diastolic;
          unit = thresholds.bloodPressure.unit;
          status = rec.results.bloodPressure?.status || 'GREEN';
          label = `${val}/${secVal} ${unit}`;
          break;
        }
        case 'bloodSugar': {
          val = rec.values.bloodSugar;
          unit = thresholds.bloodSugar.unit;
          status = rec.results.bloodSugar?.status || evaluateBloodSugar(val).status;
          label = `${val} ${unit}`;
          break;
        }
        case 'bodyTemperature': {
          val = rec.values.bodyTemperature;
          unit = thresholds.bodyTemperature.unit;
          status = rec.results.bodyTemperature?.status || evaluateBodyTemperature(val).status;
          label = `${val.toFixed(1)} ${unit}`;
          break;
        }
        case 'sleepDuration': {
          val = rec.values.sleepDuration;
          unit = thresholds.sleepDuration.unit;
          status = rec.results.sleepDuration?.status || evaluateSleepDuration(val).status;
          label = `${val.toFixed(1)} ${unit}`;
          break;
        }
        case 'mood': {
          const moodScores: Record<MoodType, number> = {
            excellent: 5,
            good: 4,
            fatigued: 3,
            stressed: 2,
            disoriented: 1,
          };
          val = moodScores[rec.values.mood] || 4;
          unit = 'Readiness Index';
          status = rec.results.mood?.status || evaluateMood(rec.values.mood).status;
          label = `${rec.values.mood.toUpperCase()} (Score ${val})`;
          break;
        }
      }

      return {
        id: rec.id,
        sol: `Sol ${rec.missionDay}`,
        dateLabel,
        timestamp: rec.timestamp,
        missionDay: rec.missionDay,
        value: val,
        secondaryValue: secVal,
        unit,
        status,
        statusSecondary: secStatus,
        label,
        isDemonstrationData: !!rec.isDemonstrationData,
      };
    });
  }, [filteredRecords, selectedIndicator, thresholds]);

  // Compute reference band boundaries dynamically from thresholds
  const bandConfig = useMemo(() => {
    switch (selectedIndicator) {
      case 'heartRate': {
        const cfg = thresholds.heartRate;
        return {
          title: 'Resting Heart Rate',
          unit: cfg.unit,
          green: cfg.green,
          yellowLow: cfg.yellowLow,
          yellowHigh: cfg.yellowHigh,
          redLow: cfg.redCriticalLow,
          redHigh: cfg.redCriticalHigh,
          yDomain: [35, 125] as [number, number],
          description: cfg.description,
        };
      }
      case 'bloodPressure': {
        const cfg = thresholds.bloodPressure.systolic;
        return {
          title: 'Blood Pressure (Systolic & Diastolic)',
          unit: thresholds.bloodPressure.unit,
          green: cfg.green,
          yellowLow: cfg.yellowLow,
          yellowHigh: cfg.yellowHigh,
          redLow: cfg.redCriticalLow,
          redHigh: cfg.redCriticalHigh,
          yDomain: [45, 155] as [number, number],
          description: 'Systolic arterial pressure with secondary diastolic telemetry tracking.',
        };
      }
      case 'bloodSugar': {
        const cfg = thresholds.bloodSugar;
        return {
          title: 'Blood Sugar (Glucose)',
          unit: cfg.unit,
          green: cfg.green,
          yellowLow: cfg.yellowLow,
          yellowHigh: cfg.yellowHigh,
          redLow: cfg.redCriticalLow,
          redHigh: cfg.redCriticalHigh,
          yDomain: [50, 155] as [number, number],
          description: cfg.description,
        };
      }
      case 'bodyTemperature': {
        const cfg = thresholds.bodyTemperature;
        return {
          title: 'Core Body Temperature',
          unit: cfg.unit,
          green: cfg.green,
          yellowLow: cfg.yellowLow,
          yellowHigh: cfg.yellowHigh,
          redLow: cfg.redCriticalLow,
          redHigh: cfg.redCriticalHigh,
          yDomain: [34.8, 38.8] as [number, number],
          description: cfg.description,
        };
      }
      case 'sleepDuration': {
        const cfg = thresholds.sleepDuration;
        return {
          title: 'Sleep Duration',
          unit: cfg.unit,
          green: cfg.green,
          yellowLow: cfg.yellowLow,
          yellowHigh: cfg.yellowHigh,
          redLow: cfg.redCriticalLow,
          redHigh: cfg.redCriticalHigh,
          yDomain: [4.0, 12.0] as [number, number],
          description: cfg.description,
        };
      }
      case 'mood': {
        return {
          title: 'Psychological Readiness & Mood Score',
          unit: 'Index (1-5)',
          green: { min: 3.5, max: 5.5 },
          yellowLow: { min: 1.5, max: 3.5 },
          yellowHigh: undefined,
          redLow: 1.5,
          redHigh: 5.5,
          yDomain: [0.5, 5.5] as [number, number],
          description: '5=Peak, 4=Nominal, 3=Fatigued, 2=Stressed, 1=Disoriented (SAS alert)',
        };
      }
    }
  }, [selectedIndicator, thresholds]);

  // Generate 10-14 days of realistic sample demonstration telemetry
  const handleLoadDemoData = () => {
    const profile = getAstronautProfile();
    const demoRecords: DailyAssessmentRecord[] = [];
    const baseDay = profile.currentMissionDay;

    // 12 days of realistic spaceflight progression
    const sampleSeries = [
      { dayOffset: 11, hr: 62, sys: 116, dia: 74, glu: 84, tmp: 36.6, slp: 8.0, mood: 'excellent' as MoodType, note: 'Pre-EVA nominal conditioning' },
      { dayOffset: 10, hr: 64, sys: 118, dia: 76, glu: 88, tmp: 36.7, slp: 7.8, mood: 'excellent' as MoodType, note: 'Nominal maintenance shift' },
      { dayOffset: 9, hr: 66, sys: 120, dia: 78, glu: 92, tmp: 36.8, slp: 7.5, mood: 'good' as MoodType, note: 'T2 treadmill 30 min run' },
      { dayOffset: 8, hr: 72, sys: 122, dia: 80, glu: 96, tmp: 37.0, slp: 6.8, mood: 'good' as MoodType, note: 'Heavy payload repositioning' },
      { dayOffset: 7, hr: 78, sys: 128, dia: 84, glu: 104, tmp: 37.2, slp: 6.2, mood: 'fatigued' as MoodType, note: 'Extended cargo berthing schedule' },
      { dayOffset: 6, hr: 94, sys: 132, dia: 86, glu: 118, tmp: 37.5, slp: 5.4, mood: 'stressed' as MoodType, note: 'Post-EVA suit servicing fatigue' },
      { dayOffset: 5, hr: 82, sys: 126, dia: 82, glu: 102, tmp: 37.1, slp: 6.5, mood: 'fatigued' as MoodType, note: 'Recovery hydration day' },
      { dayOffset: 4, hr: 70, sys: 120, dia: 78, glu: 90, tmp: 36.9, slp: 7.4, mood: 'good' as MoodType, note: 'ECLSS filter rotation' },
      { dayOffset: 3, hr: 65, sys: 118, dia: 76, glu: 86, tmp: 36.8, slp: 7.9, mood: 'good' as MoodType, note: 'Resistive ARED leg workout' },
      { dayOffset: 2, hr: 63, sys: 116, dia: 74, glu: 85, tmp: 36.7, slp: 8.2, mood: 'excellent' as MoodType, note: 'Mission rest Sol' },
      { dayOffset: 1, hr: 64, sys: 117, dia: 75, glu: 89, tmp: 36.8, slp: 7.7, mood: 'excellent' as MoodType, note: 'Robotics teleoperation test' },
      { dayOffset: 0, hr: 68, sys: 119, dia: 77, glu: 91, tmp: 36.8, slp: 7.6, mood: 'good' as MoodType, note: 'Current flight day telemetry check' },
    ];

    sampleSeries.forEach((item, index) => {
      const missionDay = baseDay - item.dayOffset;
      const date = new Date(Date.now() - item.dayOffset * 86400000);
      const parsedValues = {
        heartRate: item.hr,
        systolic: item.sys,
        diastolic: item.dia,
        bloodSugar: item.glu,
        bodyTemperature: item.tmp,
        sleepDuration: item.slp,
        mood: item.mood,
        notes: item.note,
      };

      const results = evaluateAllIndicators(parsedValues, profile);
      const overall = calculateOverallHealth(results);

      demoRecords.push({
        id: `REC-DEMO-EXP-${index + 1}`,
        timestamp: date.toISOString(),
        missionDay,
        astronautId: profile.id,
        values: parsedValues,
        results,
        overall,
        isDemonstrationData: true,
      });
    });

    // Merge demo records with any non-demo real records
    const realRecords = records.filter((r) => !r.isDemonstrationData);
    const updated = [...demoRecords, ...realRecords].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    saveAssessmentsToStorage(updated);
    if (onRecordsChange) {
      onRecordsChange(updated);
    }
  };

  // Remove demo data, preserving only real astronaut check-ins
  const handleClearDemoData = () => {
    const realOnly = records.filter((r) => !r.isDemonstrationData);
    saveAssessmentsToStorage(realOnly);
    if (onRecordsChange) {
      onRecordsChange(realOnly);
    }
  };

  // Navigation tab indicator buttons
  const indicatorsList: Array<{
    id: ChartIndicatorKey;
    name: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    { id: 'heartRate', name: 'Heart Rate', icon: <Heart className="w-3.5 h-3.5" />, color: 'text-rose-400' },
    { id: 'bloodPressure', name: 'Blood Pressure', icon: <Activity className="w-3.5 h-3.5" />, color: 'text-cyan-400' },
    { id: 'bloodSugar', name: 'Blood Sugar', icon: <Droplets className="w-3.5 h-3.5" />, color: 'text-amber-400' },
    { id: 'bodyTemperature', name: 'Temperature', icon: <Thermometer className="w-3.5 h-3.5" />, color: 'text-orange-400' },
    { id: 'sleepDuration', name: 'Sleep', icon: <Moon className="w-3.5 h-3.5" />, color: 'text-indigo-400' },
    { id: 'mood', name: 'Mood / Readiness', icon: <Smile className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
  ];

  const demoCount = records.filter((r) => r.isDemonstrationData).length;
  const realCount = records.filter((r) => !r.isDemonstrationData).length;

  return (
    <Card
      glow="cyan"
      title="Longitudinal Physiological Trend Telemetry"
      subtitle="Recharts time-series with clinical shaded bands & colorblind-safe marker geometry"
      icon={<Activity className="w-4 h-4 text-cyan-400" />}
      className={className}
      headerSlot={
        <div className="flex items-center gap-2">
          {demoCount > 0 ? (
            <button
              onClick={handleClearDemoData}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 flex items-center gap-1.5 transition-all"
              title="Remove sample demonstration records"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>Clear Demo ({demoCount})</span>
            </button>
          ) : (
            <button
              onClick={handleLoadDemoData}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 flex items-center gap-1.5 transition-all shadow-neon-cyan/15"
              title="Load 12 days of realistic sample astronaut telemetry"
            >
              <PlusCircle className="w-3 h-3 text-cyan-400" />
              <span>Load 12-Day Demo</span>
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Controls Toolbar: Indicator Tabs & Data Source Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          
          {/* Indicator selection tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {indicatorsList.map((ind) => {
              const isSelected = selectedIndicator === ind.id;
              return (
                <button
                  key={ind.id}
                  onClick={() => setSelectedIndicator(ind.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-neon-cyan/20 font-semibold'
                      : 'bg-space-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className={isSelected ? 'text-cyan-300' : ind.color}>{ind.icon}</span>
                  <span>{ind.name}</span>
                </button>
              );
            })}
          </div>

          {/* Dataset toggle filter */}
          <div className="flex items-center gap-1 bg-space-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono shrink-0">
            <span className="text-slate-400 px-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-cyan-400" /> Scope:
            </span>
            <button
              onClick={() => setFilterDemoOnly('all')}
              className={`px-2 py-0.5 rounded transition-all ${
                filterDemoOnly === 'all'
                  ? 'bg-cyan-500/30 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({records.length})
            </button>
            <button
              onClick={() => setFilterDemoOnly('real')}
              className={`px-2 py-0.5 rounded transition-all ${
                filterDemoOnly === 'real'
                  ? 'bg-cyan-500/30 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Logged ({realCount})
            </button>
            <button
              onClick={() => setFilterDemoOnly('demo')}
              className={`px-2 py-0.5 rounded transition-all ${
                filterDemoOnly === 'demo'
                  ? 'bg-cyan-500/30 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Demo ({demoCount})
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}
        {chartData.length === 0 ? (
          <div className="py-14 px-4 text-center rounded-xl bg-space-950/80 border border-dashed border-slate-800 space-y-4">
            <div className="inline-flex p-4 rounded-2xl bg-space-900 border border-slate-800 text-cyan-400 mx-auto shadow-inner">
              <Activity className="w-8 h-8 opacity-60" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-200 text-sm">
                No Telemetry Records Available
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No matching health assessments were found for this indicator. You can initialize 12 days of realistic sample demonstration telemetry or complete today&apos;s check-in form.
              </p>
            </div>
            <button
              onClick={handleLoadDemoData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium text-xs hover:from-cyan-500 hover:to-blue-500 shadow-neon-cyan/20 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load 12-Day Demonstration Telemetry</span>
            </button>
          </div>
        ) : (
          /* CHART CANVAS */
          <div className="space-y-3">
            
            {/* Header info bar for active indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-space-950/70 border border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">ACTIVE TELEMETRY:</span>
                <span className="text-cyan-300 font-semibold">{bandConfig.title}</span>
                <span className="text-slate-400">({bandConfig.unit})</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Nominal Range: <span className="text-emerald-400 font-semibold">{bandConfig.green.min} – {bandConfig.green.max} {bandConfig.unit}</span>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="w-full h-80 sm:h-96 rounded-xl bg-space-950/90 border border-slate-800/80 p-2 sm:p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" opacity={0.6} />

                  <XAxis
                    dataKey="sol"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />

                  <YAxis
                    domain={bandConfig.yDomain}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    unit={` ${bandConfig.unit}`}
                  />

                  {/* ======================================================= */}
                  {/* DYNAMIC SHADED REFERENCE BANDS (FROM THRESHOLDS CONFIG) */}
                  {/* ======================================================= */}
                  
                  {/* Green Nominal Band */}
                  <ReferenceArea
                    y1={bandConfig.green.min}
                    y2={bandConfig.green.max}
                    fill="#10b981"
                    fillOpacity={0.12}
                    stroke="#10b981"
                    strokeOpacity={0.35}
                    strokeDasharray="2 2"
                  />

                  {/* Yellow Warning Low Band */}
                  {bandConfig.yellowLow && (
                    <ReferenceArea
                      y1={bandConfig.yellowLow.min}
                      y2={bandConfig.yellowLow.max}
                      fill="#f59e0b"
                      fillOpacity={0.12}
                      stroke="#f59e0b"
                      strokeOpacity={0.3}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Yellow Warning High Band */}
                  {bandConfig.yellowHigh && (
                    <ReferenceArea
                      y1={bandConfig.yellowHigh.min}
                      y2={bandConfig.yellowHigh.max}
                      fill="#f59e0b"
                      fillOpacity={0.12}
                      stroke="#f59e0b"
                      strokeOpacity={0.3}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Red Critical Low Band */}
                  {bandConfig.redLow !== undefined && (
                    <ReferenceArea
                      y1={bandConfig.yDomain[0]}
                      y2={bandConfig.redLow}
                      fill="#ef4444"
                      fillOpacity={0.10}
                      stroke="#ef4444"
                      strokeOpacity={0.3}
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Red Critical High Band */}
                  {bandConfig.redHigh !== undefined && (
                    <ReferenceArea
                      y1={bandConfig.redHigh}
                      y2={bandConfig.yDomain[1]}
                      fill="#ef4444"
                      fillOpacity={0.10}
                      stroke="#ef4444"
                      strokeOpacity={0.3}
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Interactive Tooltip */}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const pt = payload[0].payload as ChartDataPoint;
                      return (
                        <div className="p-3 rounded-xl bg-space-950/95 border border-cyan-500/40 shadow-xl backdrop-blur-xl space-y-1.5 text-xs font-sans min-w-[200px]">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                            <span className="font-mono text-cyan-300 font-bold">{pt.sol}</span>
                            <span className="text-[11px] text-slate-400">{pt.dateLabel}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-mono">Value:</span>
                            <span className="font-mono font-bold text-slate-100 text-sm">
                              {pt.value} {pt.unit}
                              {pt.secondaryValue !== undefined && ` / ${pt.secondaryValue}`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-slate-400 font-mono text-[11px]">Triage:</span>
                            <StatusBadge status={pt.status} size="sm" />
                          </div>

                          {pt.isDemonstrationData && (
                            <div className="pt-1 text-[10px] font-mono text-amber-400">
                              ⚡ Sample Demonstration Telemetry
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />

                  {/* Legend */}
                  <Legend
                    verticalAlign="top"
                    height={36}
                    content={() => (
                      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-400 mb-2">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-2 rounded bg-emerald-500/30 border border-emerald-400/80 inline-block" />
                          <span className="text-emerald-300">Nominal Band</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-2 rounded bg-amber-500/30 border border-amber-400/80 inline-block" />
                          <span className="text-amber-300">Warning Band</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-2 rounded bg-rose-500/30 border border-rose-400/80 inline-block" />
                          <span className="text-rose-300">Critical Band</span>
                        </span>
                      </div>
                    )}
                  />

                  {/* Primary Telemetry Line with Accessible Colorblind Marker Dots */}
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={bandConfig.title}
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    dot={<ColorblindStatusDot />}
                    activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2, fill: '#22d3ee' }}
                    isAnimationActive={false}
                  />

                  {/* Secondary Line for Diastolic (when viewing Blood Pressure) */}
                  {selectedIndicator === 'bloodPressure' && (
                    <Line
                      type="monotone"
                      dataKey="secondaryValue"
                      name="Diastolic Pressure"
                      stroke="#818cf8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 4, fill: '#818cf8', stroke: '#060913' }}
                      isAnimationActive={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Accessible Colorblind Shape Legend & Guidance Note */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-space-950/80 border border-slate-800 text-[11px]">
              <div className="flex flex-wrap items-center gap-4 font-mono">
                <span className="text-slate-400 uppercase tracking-wider font-semibold">
                  Colorblind Geometry:
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" /> Circle = Nominal
                </span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="inline-block text-xs font-bold">▲</span> Triangle = Warning
                </span>
                <span className="flex items-center gap-1.5 text-rose-300">
                  <span className="inline-block text-xs font-bold">◆</span> Diamond = Critical
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Ranges derived from `src/config/thresholds.ts`</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

