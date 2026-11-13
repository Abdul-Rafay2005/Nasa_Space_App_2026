/**
 * Aegis Health — Longitudinal Health Trend Chart (Recharts)
 * Conforms to Section 10.3 of PLAN.md
 * 
 * Plots historical telemetry trends against clinical threshold bands.
 * Dynamic shaded bands are read strictly from src/config/thresholds.ts
 * Points are colored and shaped (Circle=Green, Triangle=Yellow, Diamond=Red) for colorblind accessibility.
 * Pure presentation chart with external state bindings.
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
} from '../../services/healthStatus';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import {
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Moon,
  Smile,
  Info,
  Table,
} from 'lucide-react';

export type ChartIndicatorKey =
  | 'heartRate'
  | 'bloodPressure'
  | 'bloodSugar'
  | 'bodyTemperature'
  | 'sleepDuration'
  | 'mood';

export type TimeRangeKey = '15m' | '1h' | '24h' | '7d' | 'all';

interface TrendChartProps {
  records: DailyAssessmentRecord[];
  className?: string;
  initialIndicator?: ChartIndicatorKey;
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
}

const ColorblindStatusDot: React.FC<CustomDotProps> = ({ cx, cy, payload }) => {
  if (cx === undefined || cy === undefined || !payload) return null;
  const status = payload.status;

  if (status === 'RED') {
    return (
      <g>
        <path
          d={`M ${cx} ${cy - 6} L ${cx + 6} ${cy} L ${cx} ${cy + 6} L ${cx - 6} ${cy} Z`}
          fill="#ef4444"
          stroke="#090C12"
          strokeWidth={1.5}
        />
      </g>
    );
  }

  if (status === 'YELLOW') {
    return (
      <g>
        <polygon
          points={`${cx},${cy - 6} ${cx + 6},${cy + 5} ${cx - 6},${cy + 5}`}
          fill="#f59e0b"
          stroke="#090C12"
          strokeWidth={1.5}
        />
      </g>
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4.5}
      fill="#10b981"
      stroke="#090C12"
      strokeWidth={1.5}
    />
  );
};

export const TrendChart: React.FC<TrendChartProps> = ({
  records,
  className,
  initialIndicator = 'heartRate'
}) => {
  const [selectedIndicator, setSelectedIndicator] = useState<ChartIndicatorKey>(initialIndicator);
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('all');
  const [showDataTable, setShowDataTable] = useState(false);

  const thresholds = PROVISIONAL_DEMO_THRESHOLDS;

  // Filter records by time range based on real timestamps
  const filteredRecords = useMemo(() => {
    if (timeRange === 'all') return records;

    const now = Date.now();
    let cutoffMs = now;
    if (timeRange === '15m') cutoffMs = now - 15 * 60 * 1000;
    else if (timeRange === '1h') cutoffMs = now - 60 * 60 * 1000;
    else if (timeRange === '24h') cutoffMs = now - 24 * 60 * 60 * 1000;
    else if (timeRange === '7d') cutoffMs = now - 7 * 24 * 60 * 60 * 1000;

    const res = records.filter((r) => new Date(r.timestamp).getTime() >= cutoffMs);
    return res.length > 0 ? res : records; // graceful fallback if timestamps are older demo samples
  }, [records, timeRange]);

  // Convert filtered records to Recharts data points sorted chronologically
  const chartData: ChartDataPoint[] = useMemo(() => {
    const sorted = [...filteredRecords].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return sorted.map((rec) => {
      const date = new Date(rec.timestamp);
      const dateLabel = isNaN(date.getTime())
        ? `Sol ${rec.missionDay}`
        : `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

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
          status = rec.results?.heartRate?.status || evaluateHeartRate(val).status;
          label = `${val} ${unit}`;
          break;
        }
        case 'bloodPressure': {
          val = rec.values.systolic;
          secVal = rec.values.diastolic;
          unit = thresholds.bloodPressure.unit;
          status = rec.results?.bloodPressure?.status || 'GREEN';
          label = `${val}/${secVal} ${unit}`;
          break;
        }
        case 'bloodSugar': {
          val = rec.values.bloodSugar;
          unit = thresholds.bloodSugar.unit;
          status = rec.results?.bloodSugar?.status || evaluateBloodSugar(val).status;
          label = `${val} ${unit}`;
          break;
        }
        case 'bodyTemperature': {
          val = rec.values.bodyTemperature;
          unit = thresholds.bodyTemperature.unit;
          status = rec.results?.bodyTemperature?.status || evaluateBodyTemperature(val).status;
          label = `${val.toFixed(1)} ${unit}`;
          break;
        }
        case 'sleepDuration': {
          val = rec.values.sleepDuration;
          unit = thresholds.sleepDuration.unit;
          status = rec.results?.sleepDuration?.status || evaluateSleepDuration(val).status;
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
          unit = 'Index';
          status = rec.results?.mood?.status || evaluateMood(rec.values.mood).status;
          label = `${rec.values.mood.toUpperCase()} (${val}/5)`;
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

  // Band configuration
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
          yDomain: [34.5, 39.5] as [number, number],
        };
      }
      case 'sleepDuration': {
        const cfg = thresholds.sleepDuration;
        return {
          title: 'Sleep Duration',
          unit: cfg.unit,
          green: cfg.green,
          yellowLow: cfg.yellowLow,
          redLow: cfg.redCriticalLow,
          yDomain: [0, 12] as [number, number],
        };
      }
      case 'mood': {
        return {
          title: 'Neurobehavioral Readiness / Mood',
          unit: 'Index (1-5)',
          green: { min: 4, max: 5 },
          yellowLow: { min: 2, max: 3 },
          redLow: 1,
          yDomain: [0, 6] as [number, number],
        };
      }
    }
  }, [selectedIndicator, thresholds]);

  // Statistical summary
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return { min, max, avg: avg.toFixed(1), latest: values[values.length - 1] };
  }, [chartData]);

  const indicatorsList: Array<{
    id: ChartIndicatorKey;
    name: string;
    icon: React.ReactNode;
  }> = [
    { id: 'heartRate', name: 'Heart Rate', icon: <Heart className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'bloodPressure', name: 'Blood Pressure', icon: <Activity className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'bloodSugar', name: 'Glucose', icon: <Droplets className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'bodyTemperature', name: 'Temperature', icon: <Thermometer className="w-3.5 h-3.5 text-orange-400" /> },
    { id: 'sleepDuration', name: 'Sleep', icon: <Moon className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'mood', name: 'Mood', icon: <Smile className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  return (
    <Card
      glow="cyan"
      title="Longitudinal Physiological Telemetry Explorer"
      subtitle="Calibrated time-series with clinical flight threshold envelopes"
      icon={<Activity className="w-4 h-4 text-cyan-400" />}
      className={className}
      headerSlot={
        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex items-center bg-space-950/80 rounded-lg p-0.5 border border-slate-800 text-[11px] font-mono">
            {(['15m', '1h', '24h', '7d', 'all'] as TimeRangeKey[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-0.5 rounded transition-all ${
                  timeRange === r
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowDataTable(!showDataTable)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-space-950/80 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Toggle accessible tabular data"
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showDataTable ? 'Chart' : 'Table'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Metric Selector Pills */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800/80">
          {indicatorsList.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedIndicator(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                selectedIndicator === item.id
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 font-semibold shadow-sm'
                  : 'bg-space-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-space-900/60'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        {/* Statistical Summary Row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-space-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">LATEST</span>
              <span className="text-slate-100 font-bold text-sm">{stats.latest} {bandConfig.unit}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-space-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">AVERAGE</span>
              <span className="text-cyan-300 font-bold text-sm">{stats.avg} {bandConfig.unit}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-space-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">MINIMUM</span>
              <span className="text-emerald-400 font-bold text-sm">{stats.min} {bandConfig.unit}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-space-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">MAXIMUM</span>
              <span className="text-rose-400 font-bold text-sm">{stats.max} {bandConfig.unit}</span>
            </div>
          </div>
        )}

        {/* Accessible Data Table Mode */}
        {showDataTable ? (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-space-950/90 p-4">
            <table className="w-full text-xs font-mono text-left">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-2 px-3">Mission Sol</th>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Reading</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {chartData.map((pt) => (
                  <tr key={pt.id} className="hover:bg-space-900/40">
                    <td className="py-2 px-3 text-cyan-300 font-bold">{pt.sol}</td>
                    <td className="py-2 px-3 text-slate-300">{new Date(pt.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-3 text-slate-100 font-semibold">{pt.label}</td>
                    <td className="py-2 px-3"><StatusBadge status={pt.status} size="sm" /></td>
                    <td className="py-2 px-3 text-slate-400 text-[10px]">
                      {pt.isDemonstrationData ? '⚡ Simulation' : 'Verified Device'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Recharts Interactive Chart */
          <div className="w-full h-80 sm:h-96 rounded-xl bg-space-950/90 border border-slate-800/80 p-2 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" opacity={0.6} />
                <XAxis dataKey="sol" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
                <YAxis
                  domain={bandConfig.yDomain}
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  unit={` ${bandConfig.unit}`}
                />

                {/* Nominal Green Band */}
                <ReferenceArea
                  y1={bandConfig.green.min}
                  y2={bandConfig.green.max}
                  fill="#10b981"
                  fillOpacity={0.12}
                  stroke="#10b981"
                  strokeOpacity={0.35}
                  strokeDasharray="2 2"
                />

                {/* Yellow Warning Low */}
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

                {/* Yellow Warning High */}
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

                {/* Red Critical Low */}
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

                {/* Red Critical High */}
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
                          <span className="text-slate-400 font-mono">Telemetry:</span>
                          <span className="font-mono font-bold text-slate-100 text-sm">{pt.label}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-slate-400 font-mono text-[11px]">Status:</span>
                          <StatusBadge status={pt.status} size="sm" />
                        </div>
                        {pt.isDemonstrationData && (
                          <div className="pt-1 text-[10px] font-mono text-amber-400">⚡ Sample Demonstration Telemetry</div>
                        )}
                      </div>
                    );
                  }}
                />

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
        )}

        {/* Legend note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-space-950/80 border border-slate-800 text-[11px]">
          <div className="flex flex-wrap items-center gap-4 font-mono">
            <span className="text-slate-400 uppercase tracking-wider font-semibold">Geometry:</span>
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
            <span>Thresholds dynamically loaded from configuration</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
