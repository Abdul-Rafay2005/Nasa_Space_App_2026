/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Simple Health Trend Chart (Phase 1 Baseline)
 * Team: Abdul Rafay & Sameen
 * 
 * Satisfies PDF Requirement: "first simple trend chart"
 * Built with Recharts, plots multi-Sol physiological trajectories across historical logs.
 */

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { DailyAssessmentRecord } from '../../types/health';
import { Card } from '../common/Card';
import { LineChart as LineChartIcon } from 'lucide-react';

interface SimpleHealthTrendChartProps {
  records: DailyAssessmentRecord[];
}

export const SimpleHealthTrendChart: React.FC<SimpleHealthTrendChartProps> = ({
  records,
}) => {
  const [activeMetric, setActiveMetric] = useState<'cardio' | 'metabolic' | 'sleep'>('cardio');

  // Format records in chronological order (oldest to newest)
  const chartData = [...records]
    .reverse()
    .map((rec) => ({
      sol: `Sol ${rec.missionDay}`,
      timestamp: new Date(rec.timestamp).toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
      heartRate: rec.values.heartRate,
      systolic: rec.values.systolic,
      diastolic: rec.values.diastolic,
      bloodSugar: rec.values.bloodSugar,
      temperature: rec.values.bodyTemperature,
      sleepDuration: rec.values.sleepDuration,
      status: rec.overall.status,
    }));

  return (
    <Card
      glow="cyan"
      title="Longitudinal Health Trend Charts"
      subtitle="Multi-Sol physiological telemetry trajectories"
      icon={<LineChartIcon className="w-4 h-4" />}
      headerSlot={
        <div className="flex items-center gap-1.5 bg-space-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveMetric('cardio')}
            className={`text-[11px] font-mono px-2.5 py-1 rounded transition-all ${
              activeMetric === 'cardio'
                ? 'bg-cyan-500 text-space-950 font-bold shadow-neon-cyan/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cardiovascular (HR/BP)
          </button>
          <button
            onClick={() => setActiveMetric('metabolic')}
            className={`text-[11px] font-mono px-2.5 py-1 rounded transition-all ${
              activeMetric === 'metabolic'
                ? 'bg-cyan-500 text-space-950 font-bold shadow-neon-cyan/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Metabolic & Core Temp
          </button>
          <button
            onClick={() => setActiveMetric('sleep')}
            className={`text-[11px] font-mono px-2.5 py-1 rounded transition-all ${
              activeMetric === 'sleep'
                ? 'bg-cyan-500 text-space-950 font-bold shadow-neon-cyan/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sleep Duration
          </button>
        </div>
      }
    >
      <div className="w-full h-72 pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
            NO TELEMETRY DATA TO CHART
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="sol"
                stroke="#64748b"
                fontSize={11}
                fontFamily="ui-monospace, monospace"
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                fontFamily="ui-monospace, monospace"
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0e1a',
                  borderColor: '#06b6d4',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  fontFamily: 'ui-monospace, monospace',
                  boxShadow: '0 0 15px rgba(6,182,212,0.2)',
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: '11px',
                  fontFamily: 'ui-monospace, monospace',
                  paddingTop: '8px',
                }}
              />

              {activeMetric === 'cardio' && (
                <>
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    name="Heart Rate (BPM)"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={{ fill: '#f43f5e', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic BP (mmHg)"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={{ fill: '#38bdf8', r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic BP (mmHg)"
                    stroke="#818cf8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: '#818cf8', r: 3 }}
                  />
                </>
              )}

              {activeMetric === 'metabolic' && (
                <>
                  <Line
                    type="monotone"
                    dataKey="bloodSugar"
                    name="Glucose (mg/dL)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Core Temp (°C)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 3 }}
                  />
                </>
              )}

              {activeMetric === 'sleep' && (
                <Line
                  type="monotone"
                  dataKey="sleepDuration"
                  name="Restorative Sleep (Hours)"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  dot={{ fill: '#a855f7', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
