/**
 * Aegis Health — Floating AI Flight Surgeon Quick Launcher
 * Floats on all mission pages, allowing instant consultation with Dr. Orion AI
 */

import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { AstronautProfile, DailyAssessmentRecord } from '../../types/health';

interface FloatingChatButtonProps {
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
  historyRecords?: DailyAssessmentRecord[];
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  profile,
  latestAssessment,
  historyRecords = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Trigger Pill / Circle in bottom right */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
            aria-label="Open AI Flight Surgeon consultation"
          >
            {/* Animated pulsating ambient halo */}
            <span className="absolute -inset-1 rounded-full bg-blue-500/30 blur-md group-hover:bg-blue-500/50 transition-all animate-pulse"></span>

            <div className="relative flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold tracking-wide drop-shadow">
                Ask Dr. Orion AI
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
          </button>
        )}
      </div>

      {/* Floating Chat Drawer / Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[440px] md:w-[480px] h-[640px] max-h-[85vh] shadow-2xl rounded-2xl animate-in fade-in slide-in-from-bottom-6 duration-300">
          <ChatInterface
            profile={profile}
            latestAssessment={latestAssessment}
            historyRecords={historyRecords}
            isFloating={true}
            onCloseFloating={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
};
