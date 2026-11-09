/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Health History Page
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React, { useState } from 'react';
import { DailyAssessmentRecord } from '../types/health';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { AssessmentDetailModal } from '../components/health/AssessmentDetailModal';
import {
  History,
  Search,
  Filter,
  Eye,
  Download,
  AlertCircle,
  FileSpreadsheet,
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
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filtering
  const filteredRecords = records.filter((rec) => {
    const matchesStatus =
      filterStatus === 'ALL' || rec.overall.status === filterStatus;

    const matchesSearch =
      searchTerm === '' ||
      rec.missionDay.toString().includes(searchTerm) ||
      (rec.values.notes && rec.values.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      rec.overall.summary.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegis_health_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
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
            Historical log of daily physiological assessments stored in spacecraft local storage
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-space-850 transition-colors"
            title="Export all records as JSON"
          >
            <Download className="w-4 h-4" />
            <span>Export Telemetry</span>
          </button>

          <button
            onClick={onNavigateToAssessment}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-neon-cyan/20"
          >
            <span>+ New Assessment</span>
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
            placeholder="Search by Mission Sol, clinical notes, or symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-space-900/80 pl-10 pr-4 py-2 text-xs font-sans text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-800 bg-space-900/80 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses ({records.length})</option>
            <option value="GREEN">Nominal / Green Only</option>
            <option value="YELLOW">Warning / Yellow Only</option>
            <option value="RED">Urgent / Red Only</option>
          </select>
        </div>
      </div>

      {/* Records Table Card */}
      <Card
        glow="none"
        title={`Archived Assessment Records (${filteredRecords.length})`}
        subtitle="Chronological list with complete physiological parameters"
        icon={<FileSpreadsheet className="w-4 h-4" />}
      >
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-mono space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-500" />
            <p>NO ASSESSMENT RECORDS MATCH CURRENT FILTER</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-space-950/60">
                <tr>
                  <th className="py-3 px-3">Mission Sol</th>
                  <th className="py-3 px-3">Timestamp (UTC)</th>
                  <th className="py-3 px-3">Overall Triage</th>
                  <th className="py-3 px-3">HR (BPM)</th>
                  <th className="py-3 px-3">BP (mmHg)</th>
                  <th className="py-3 px-3">Sugar (mg/dL)</th>
                  <th className="py-3 px-3">Temp (°C)</th>
                  <th className="py-3 px-3">Sleep (hrs)</th>
                  <th className="py-3 px-3">Mood</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((record) => {
                  const date = new Date(record.timestamp);
                  const formattedDate = date.toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });
                  const formattedTime = date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={record.id}
                      onClick={() => setSelectedRecord(record)}
                      className="hover:bg-space-850/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 font-bold text-cyan-300">
                        SOL {record.missionDay}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {formattedDate} {formattedTime}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge
                          status={record.overall.status}
                          label={record.overall.statusLabel}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {record.results.heartRate.valueDisplay}
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {record.results.bloodPressure.valueDisplay}
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {record.results.bloodSugar.valueDisplay}
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {record.results.bodyTemperature.valueDisplay}°
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {record.results.sleepDuration.valueDisplay}h
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {record.values.mood}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(record);
                          }}
                          className="px-2.5 py-1 rounded bg-space-850 hover:bg-space-800 text-cyan-400 hover:text-cyan-300 border border-slate-800 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal for viewing clicked assessment */}
      <AssessmentDetailModal
        record={selectedRecord}
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

    </div>
  );
};
