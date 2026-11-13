/**
 * Aegis Health — Biometric Telemetry Archive & History
 * Conforms to Section 10.7 of PLAN.md
 * 
 * Provides timeline and tabular inspection with provenance tags and versioned JSON export envelopes.
 */

import React, { useState, useMemo } from 'react';
import { DailyAssessmentRecord } from '../types/health';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { AssessmentDetailModal } from '../components/health/AssessmentDetailModal';
import { exportHistoryEnvelope, downloadJsonFile } from '../services/persistence/historyRepository';
import {
  History,
  Search,
  Filter,
  Eye,
  Download,
  Table,
  List,
  Calendar,
  Layers,
  Heart,
  Droplets,
  Thermometer,
  Moon,
  Smile,
  Shield,
} from 'lucide-react';

interface HealthHistoryProps {
  records: DailyAssessmentRecord[];
  onSelectRecord?: (record: DailyAssessmentRecord) => void;
  onNavigateToAssessment: () => void;
}

export const HealthHistory: React.FC<HealthHistoryProps> = ({
  records,
  onNavigateToAssessment,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<DailyAssessmentRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterProvenance, setFilterProvenance] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [isExporting, setIsExporting] = useState(false);

  // Filtering
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesStatus = filterStatus === 'ALL' || rec.overall.status === filterStatus;

      const provenance = rec.isDemonstrationData ? 'simulation' : 'legacy-unknown';
      const matchesProvenance = filterProvenance === 'ALL' || provenance === filterProvenance;

      const matchesSearch =
        searchTerm === '' ||
        rec.missionDay.toString().includes(searchTerm) ||
        (rec.values.notes && rec.values.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rec.overall.summary.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesProvenance && matchesSearch;
    });
  }, [records, filterStatus, filterProvenance, searchTerm]);

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const astronautId = records[0]?.astronautId || 'ASTRO-2026-ALPHA';
      const envelope = await exportHistoryEnvelope(astronautId);
      downloadJsonFile(`aegis_health_telemetry_${astronautId}_${Date.now()}.json`, envelope);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-sans tracking-wide">
              Biometric Telemetry Archive
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Chronological audit log of astronaut physiological telemetry with provenance verification
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-space-950/80 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'timeline' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Timeline View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dense Table View"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-space-850 transition-colors"
            title="Export telemetry envelope as JSON"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export Envelope'}</span>
          </button>

          <button
            onClick={onNavigateToAssessment}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-neon-cyan/20"
          >
            <span>+ Check-in</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by mission Sol, symptoms, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-space-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-space-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {(['ALL', 'GREEN', 'YELLOW', 'RED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === s
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Provenance Filter */}
        <div className="flex items-center gap-1 bg-space-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <Layers className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {[
            { id: 'ALL', label: 'All Sources' },
            { id: 'simulation', label: 'Simulated' },
            { id: 'legacy-unknown', label: 'Manual/Legacy' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterProvenance(p.id)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterProvenance === p.id
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Timeline or Dense Table */}
      {viewMode === 'timeline' ? (
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <Card glow="none" className="text-center py-12">
              <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-mono">No telemetry records match the current filter.</p>
            </Card>
          ) : (
            filteredRecords.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className="p-4 rounded-xl bg-space-950/80 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-space-900/50 transition-all cursor-pointer space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-850">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-300 font-bold text-sm">Sol {rec.missionDay}</span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(rec.timestamp).toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700 bg-space-900 text-slate-400">
                      {rec.isDemonstrationData ? '⚡ Simulation' : 'Legacy manual / origin unverified'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={rec.overall.status} size="sm" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecord(rec);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors"
                      title="Inspect record"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Vitals Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" /> HR
                    </span>
                    <span className="text-slate-100 font-bold">{rec.values.heartRate} BPM</span>
                  </div>
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-cyan-400" /> BP
                    </span>
                    <span className="text-slate-100 font-bold">{rec.values.systolic}/{rec.values.diastolic}</span>
                  </div>
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-amber-400" /> Glucose
                    </span>
                    <span className="text-slate-100 font-bold">{rec.values.bloodSugar} mg/dL</span>
                  </div>
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-orange-400" /> Temp
                    </span>
                    <span className="text-slate-100 font-bold">{rec.values.bodyTemperature.toFixed(1)}°C</span>
                  </div>
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Moon className="w-3 h-3 text-indigo-400" /> Sleep
                    </span>
                    <span className="text-slate-100 font-bold">{rec.values.sleepDuration.toFixed(1)} h</span>
                  </div>
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Smile className="w-3 h-3 text-emerald-400" /> Mood
                    </span>
                    <span className="text-slate-100 font-bold capitalize">{rec.values.mood}</span>
                  </div>
                </div>

                {rec.values.notes && (
                  <p className="text-xs text-slate-400 italic font-sans border-l-2 border-cyan-500/40 pl-2">
                    "{rec.values.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Dense Table View */
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-space-950/90 p-4">
          <table className="w-full text-xs font-mono text-left">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Mission Sol</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Heart Rate</th>
                <th className="py-2.5 px-3">Blood Pressure</th>
                <th className="py-2.5 px-3">Blood Sugar</th>
                <th className="py-2.5 px-3">Temperature</th>
                <th className="py-2.5 px-3">Sleep</th>
                <th className="py-2.5 px-3">Overall Status</th>
                <th className="py-2.5 px-3">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredRecords.map((rec) => (
                <tr
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className="hover:bg-space-900/50 cursor-pointer"
                >
                  <td className="py-2 px-3 text-cyan-300 font-bold">Sol {rec.missionDay}</td>
                  <td className="py-2 px-3 text-slate-300">{new Date(rec.timestamp).toLocaleDateString()}</td>
                  <td className="py-2 px-3 text-slate-100 font-semibold">{rec.values.heartRate} BPM</td>
                  <td className="py-2 px-3 text-slate-100">{rec.values.systolic}/{rec.values.diastolic} mmHg</td>
                  <td className="py-2 px-3 text-slate-100">{rec.values.bloodSugar} mg/dL</td>
                  <td className="py-2 px-3 text-slate-100">{rec.values.bodyTemperature.toFixed(1)} °C</td>
                  <td className="py-2 px-3 text-slate-100">{rec.values.sleepDuration.toFixed(1)} h</td>
                  <td className="py-2 px-3"><StatusBadge status={rec.overall.status} size="sm" /></td>
                  <td className="py-2 px-3 text-slate-400 text-[10px]">
                    {rec.isDemonstrationData ? '⚡ Simulation' : 'Legacy / unverified'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <AssessmentDetailModal
          record={selectedRecord}
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};
