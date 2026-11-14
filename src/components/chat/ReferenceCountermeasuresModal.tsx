/**
 * Aegis Health — Reference Countermeasures & Medication Protocols Modal
 * Prepared for NASA Space Apps 2026 Team (14 November 2026)
 * Sources: NASA Human Research Program (HRP), NASA-STD-3001, ISS Medical Checklist
 */

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import {
  Pill,
  Heart,
  Droplets,
  Thermometer,
  Moon,
  Smile,
  Shield,
  Zap,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { REFERENCE_COUNTERMEASURES } from '../../data/referenceCountermeasures';

interface ReferenceCountermeasuresModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskDrOrion?: (question: string) => void;
}

export const ReferenceCountermeasuresModal: React.FC<ReferenceCountermeasuresModalProps> = ({
  isOpen,
  onClose,
  onAskDrOrion,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Countermeasures' },
    { id: 'cardiovascular', label: 'Blood Pressure' },
    { id: 'metabolic', label: 'Blood Sugar' },
    { id: 'thermoregulation', label: 'Temperature / Fever' },
    { id: 'sleep', label: 'Sleep / Insomnia' },
    { id: 'behavioral', label: 'Mood / Fatigue' },
    { id: 'environmental', label: 'Cabin CO₂' },
    { id: 'radiation', label: 'Radiation / Nausea' },
  ];

  const filtered = filterCategory === 'all'
    ? REFERENCE_COUNTERMEASURES
    : REFERENCE_COUNTERMEASURES.filter(c => c.category === filterCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cardiovascular': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'metabolic': return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'thermoregulation': return <Thermometer className="w-4 h-4 text-amber-400" />;
      case 'sleep': return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'behavioral': return <Smile className="w-4 h-4 text-purple-400" />;
      case 'environmental': return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'radiation': return <Zap className="w-4 h-4 text-orange-400" />;
      default: return <Pill className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reference Countermeasures & Medication Protocols"
      subtitle="NASA Human Research Program (HRP), NASA-STD-3001 & ISS Medical Checklist"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-sm text-slate-300">
        {/* Purpose & Disclaimer Banner */}
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-amber-200 uppercase tracking-wide font-mono">
              Reference Information — Not Prescriptions
            </p>
            <p className="text-slate-300 leading-relaxed">
              This protocol lists typical medical and environmental countermeasures for each parameter tracked in the NASA Space Health Monitor prototype. Drug choice and dosing depend on the individual astronaut and must be authorized by the flight surgeon. No doses are given here on purpose.
            </p>
            <p className="text-emerald-300 font-medium pt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              All readings in the current mission profile (Mission Sol 142) are within normal range — none of these countermeasures are currently triggered.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilterCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                filterCategory === c.id
                  ? 'border-blue-500 bg-blue-600/30 text-white font-semibold shadow-md'
                  : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Countermeasures Table */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950/70 shadow-xl max-h-[460px] overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 bg-[#0a0f24] border-b border-white/10 z-10">
              <tr>
                <th className="py-2.5 px-3.5 font-semibold text-blue-300 uppercase tracking-wider text-[11px]">Parameter & Baseline</th>
                <th className="py-2.5 px-3.5 font-semibold text-amber-300 uppercase tracking-wider text-[11px]">Out-of-Range Condition</th>
                <th className="py-2.5 px-3.5 font-semibold text-emerald-300 uppercase tracking-wider text-[11px]">Reference Countermeasures & Drugs</th>
                <th className="py-2.5 px-3.5 font-semibold text-slate-400 uppercase tracking-wider text-[11px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                  {/* Parameter */}
                  <td className="py-3 px-3.5 align-top">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(item.category)}
                      <div>
                        <span className="font-semibold text-white block">{item.parameter}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Normal: {item.normalRange}</span>
                      </div>
                    </div>
                  </td>

                  {/* Condition */}
                  <td className="py-3 px-3.5 align-top">
                    <span className="font-medium text-amber-200 block">{item.condition}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{item.notes}</p>
                  </td>

                  {/* Countermeasures & Medications */}
                  <td className="py-3 px-3.5 align-top">
                    <p className="text-white font-medium mb-1">{item.countermeasures}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.medications.map((m, mIdx) => (
                        <span
                          key={mIdx}
                          className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-200 text-[10px] font-mono"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3.5 align-top text-right">
                    {onAskDrOrion && (
                      <button
                        type="button"
                        onClick={() => {
                          onAskDrOrion(`According to NASA reference countermeasures, what should be done for ${item.condition}? Which medications or protocols apply?`);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-[11px] font-medium transition-colors"
                      >
                        Ask Dr. Orion
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verification Footer */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Sources: NASA Human Research Program (HRP) • NASA-STD-3001 • ISS Medical Checklist</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Close Table
          </button>
        </div>
      </div>
    </Modal>
  );
};
