/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Recent Activity Telemetry Feed
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React from 'react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { DailyAssessmentRecord } from '../../types/health';
import { History, Eye, ArrowUpRight } from 'lucide-react';

interface RecentActivityListProps {
  records: DailyAssessmentRecord[];
  onSelectRecord: (record: DailyAssessmentRecord) => void;
  onViewAllHistory: () => void;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  records,
  onSelectRecord,
  onViewAllHistory,
}) => {
  const displayRecords = records.slice(0, 5);

  return (
    <Card
      title="Recent Telemetry Logs"
      subtitle="Historical telemetry submissions & audit trail"
      icon={<History className="w-4 h-4" />}
      headerSlot={
        <button
          onClick={onViewAllHistory}
          className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>Full History</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      {displayRecords.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs font-mono">
          NO HISTORICAL RECORDS STORED YET
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80">
          {displayRecords.map((record) => {
            const formattedDate = new Date(record.timestamp).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const formattedTime = new Date(record.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={record.id}
                onClick={() => onSelectRecord(record)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer hover:bg-space-850/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                {/* Left: Mission Day & Timestamp */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-space-950 border border-slate-800 flex flex-col items-center justify-center font-mono shrink-0">
                    <span className="text-[9px] text-slate-400 uppercase">SOL</span>
                    <span className="text-xs font-bold text-cyan-300">{record.missionDay}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-200">
                        {formattedDate} • {formattedTime}
                      </span>
                      {record.isDemonstrationData && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-space-800 text-slate-400 border border-slate-700">
                          Demo Data
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 font-sans mt-0.5">
                      HR: {record.results.heartRate.valueDisplay} BPM • BP: {record.results.bloodPressure.valueDisplay} mmHg • Temp: {record.results.bodyTemperature.valueDisplay}°C
                    </p>
                  </div>
                </div>

                {/* Right: Status badge & Inspect action */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <StatusBadge status={record.overall.status} label={record.overall.statusLabel} size="sm" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRecord(record);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 group-hover:text-cyan-300 hover:bg-space-800 transition-colors"
                    title="View complete record breakdown"
                    aria-label={`View record for Sol ${record.missionDay}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
