/**
 * Aegis Health — Mission Routine & Countermeasures Checklist Page
 * Compliant with PLAN.md Section 10.9
 */

import React, { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle, Clock, ShieldCheck, Dumbbell, Droplets, Moon, Activity } from 'lucide-react';
import { AstronautProfile } from '../types/health';

interface MissionRoutinePageProps {
  profile: AstronautProfile;
}

interface RoutineTask {
  id: string;
  category: 'exercise' | 'hydration' | 'hygiene' | 'sleep' | 'telemetry';
  title: string;
  detail: string;
  timeWindow: string;
  completed: boolean;
  requiredForFlightReadiness: boolean;
}

const DEFAULT_TASKS: RoutineTask[] = [
  {
    id: 't-1',
    category: 'telemetry',
    title: 'Daily Bio-Telemetry Check-in',
    detail: 'Complete full vital physiological assessment to track microgravity adaptation.',
    timeWindow: '08:00 – 10:00 UTC',
    completed: true,
    requiredForFlightReadiness: true,
  },
  {
    id: 't-2',
    category: 'hydration',
    title: 'Hydration Target (2.5 L Oral Fluid Loading)',
    detail: 'Counteract cephalic fluid shift and maintain optimal plasma volume.',
    timeWindow: 'Continuous (Day Target)',
    completed: true,
    requiredForFlightReadiness: true,
  },
  {
    id: 't-3',
    category: 'exercise',
    title: 'ARED High-Resistance Deadlift / Squat Protocol',
    detail: 'Apply axial loading to mitigate bone mineral density loss and spinal elongation.',
    timeWindow: '14:00 – 15:30 UTC',
    completed: false,
    requiredForFlightReadiness: true,
  },
  {
    id: 't-4',
    category: 'exercise',
    title: 'CEVIS Aerobic Ergometer Interval Training',
    detail: '30-minute high-cadence cardiovascular workout to sustain stroke volume.',
    timeWindow: '16:00 – 16:45 UTC',
    completed: false,
    requiredForFlightReadiness: true,
  },
  {
    id: 't-5',
    category: 'sleep',
    title: 'Sleep Chamber Isolation (8.5 Hours)',
    detail: 'Enforce circadian rhythm alignment with cabin acoustic isolation.',
    timeWindow: '22:00 – 06:30 UTC',
    completed: false,
    requiredForFlightReadiness: false,
  },
];

export const MissionRoutinePage: React.FC<MissionRoutinePageProps> = ({ profile }) => {
  const [tasks, setTasks] = useState<RoutineTask[]>(() => {
    try {
      const stored = localStorage.getItem(`aegis_routine_sol_${profile.currentMissionDay}`);
      return stored ? JSON.parse(stored) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`aegis_routine_sol_${profile.currentMissionDay}`, JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks, profile.currentMissionDay]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pct = Math.round((completedCount / tasks.length) * 100);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exercise':
        return <Dumbbell className="w-4 h-4 text-orange-400" />;
      case 'hydration':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'sleep':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      default:
        return <Activity className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12 select-none font-sans">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0c142c]/90 border border-[#1b2752] shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs mb-2">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>FLIGHT RULES COMPLIANCE MATRIX</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Mission Routine & Countermeasures</h1>
            <p className="text-sm text-slate-300 mt-1">
              Mission Day (Sol) {profile.currentMissionDay} · Scheduled protocols for Cmdr. {profile.name}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#070b1a] border border-[#1b2752] px-5 py-3 rounded-2xl">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                DAILY COMPLIANCE
              </span>
              <span className="text-2xl font-black text-white font-mono">{pct}%</span>
            </div>
            <div className="w-16 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3.8"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.8"
                  strokeDasharray={`${pct}, 100`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
              task.completed
                ? 'bg-[#0c142c]/60 border-emerald-500/30'
                : 'bg-[#0c142c]/90 border-[#1b2752] hover:border-cyan-500/40 hover:bg-[#111c3d]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
                  task.completed
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : 'border-slate-600 bg-[#070b1a] text-transparent'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[#070b1a] border border-[#1b2752]">
                    {getCategoryIcon(task.category)}
                  </div>
                  <h3
                    className={`text-sm font-bold font-sans ${
                      task.completed ? 'text-slate-400 line-through' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.requiredForFlightReadiness && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      MANDATORY
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{task.detail}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{task.timeWindow}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 rounded-2xl bg-[#0c142c]/70 border border-[#1b2752] flex items-center gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <p>
          <strong className="text-slate-200">NASA HRP Countermeasure Requirement:</strong> Astronauts on long-duration orbital missions must complete mandatory physical countermeasures daily to prevent osteopenia and cardiovascular deconditioning.
        </p>
      </div>
    </div>
  );
};
