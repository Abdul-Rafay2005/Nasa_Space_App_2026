/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Header Notification Panel Dropdown Portal
 *
 * Fixed-position portal panel anchored immediately below the header bell.
 * Matches NASA dark glass aesthetic with high z-index, accessibility,
 * focus trapping/restoration, outside click, and Escape key dismissal.
 */

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Info,
  ChevronRight,
  CheckCheck,
} from 'lucide-react';
import { useNotifications, NotificationItem } from '../../stores/notificationStore';
import { navigateTo } from '../../lib/navigation';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onNavigateToGuidance?: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  anchorRef,
  onNavigateToGuidance,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Computed layout coordinates to anchor directly below bell
  const [coords, setCoords] = useState<{
    top: number;
    right: number;
    caretOffsetRight: number;
  }>({
    top: 72,
    right: 16,
    caretOffsetRight: 24,
  });

  const updatePosition = () => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    const isMobile = windowWidth < 640;
    const top = rect.bottom + 8;
    const right = isMobile ? 12 : Math.max(12, Math.min(24, windowWidth - rect.right - 4));
    const bellCenter = rect.left + rect.width / 2;
    const caretOffsetRight = Math.max(14, Math.min(340, windowWidth - bellCenter - right));

    setCoords({
      top,
      right,
      caretOffsetRight,
    });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleResizeOrScroll = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleResizeOrScroll);
    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
    };
  }, [isOpen]);

  // Accessibility: Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus panel or first focusable element
      panelRef.current?.focus();
    } else {
      // Return focus to bell on close
      anchorRef.current?.focus();
    }
  }, [isOpen, anchorRef]);

  // Close on outside click, Escape key, or route hashchange
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current && panelRef.current.contains(target)) return;
      if (anchorRef.current && anchorRef.current.contains(target)) return;
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    const handleHashChange = () => {
      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleItemClick = (item: NotificationItem) => {
    markAsRead(item.id);
    onClose();
    if (onNavigateToGuidance) {
      onNavigateToGuidance();
    } else {
      navigateTo('alerts');
    }
  };

  const handleViewAllAlerts = () => {
    onClose();
    if (onNavigateToGuidance) {
      onNavigateToGuidance();
    } else {
      navigateTo('alerts');
    }
  };

  const getSeverityBadge = (severity: NotificationItem['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <div className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
        );
      case 'warning':
        return (
          <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  const panelContent = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Notifications Panel"
      tabIndex={-1}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        right: `${coords.right}px`,
        width: 'min(380px, calc(100vw - 24px))',
        maxHeight: `calc(100vh - ${coords.top + 16}px)`,
        zIndex: 99999,
      }}
      className="flex flex-col rounded-2xl bg-[#0b1228]/95 border border-cyan-500/40 shadow-2xl shadow-cyan-950/80 backdrop-blur-2xl text-slate-100 font-sans animate-fade-in outline-none select-none"
    >
      {/* Caret pointing up toward the bell */}
      <div
        style={{ right: `${coords.caretOffsetRight}px` }}
        className="absolute -top-2 w-4 h-4 bg-[#0b1228] border-t border-l border-cyan-500/40 rotate-45 pointer-events-none"
      />

      {/* ── Panel Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1b2752] shrink-0 bg-[#070b1a]/60 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-mono text-cyan-300 font-bold">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
            title="Mark all notifications as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* ── Scrollable Notifications List ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 relative group ${
                !item.isRead
                  ? 'bg-[#0f1b3d]/80 border-cyan-500/35 hover:border-cyan-400 shadow-md shadow-cyan-950/40'
                  : 'bg-[#070c1f]/60 border-[#152042] hover:border-slate-600 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Severity Icon */}
              {getSeverityBadge(item.severity)}

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4
                    className={`text-xs truncate font-sans ${
                      !item.isRead ? 'font-bold text-white' : 'font-semibold text-slate-300'
                    }`}
                  >
                    {item.title}
                  </h4>
                  {!item.isRead && (
                    <span
                      className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_#22d3ee] animate-pulse"
                      title="Unread"
                    />
                  )}
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                  {item.message}
                </p>

                <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                  <span>{item.relativeTime}</span>
                  {item.hazard && (
                    <>
                      <span>•</span>
                      <span className="text-cyan-400 truncate max-w-[150px]">{item.hazard}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="py-8 px-4 text-center space-y-2">
            <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white font-sans">You're all caught up</p>
            <p className="text-xs text-slate-400 font-sans">
              No active flight rule notifications or physiological drift warnings.
            </p>
          </div>
        )}
      </div>

      {/* ── Footer Link: View all alerts ───────────────────────────────── */}
      <div className="p-2.5 border-t border-[#1b2752] bg-[#070b1a]/80 rounded-b-2xl shrink-0">
        <button
          onClick={handleViewAllAlerts}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold transition-all"
        >
          <span>View all alerts</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return createPortal(panelContent, document.body);
};
