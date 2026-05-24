
import { type FC, useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Trash2,  RefreshCw } from 'lucide-react';
import ActivityItem from './ActivityItem';
import LedgerPagination from '../payment-com/LedgerPagination';
import type { LiveActivityStreamProps, ActivityEvent, ActivityType } from '../../../types/admin-role-types/admin-dash.types';
import {
  useAdminDeleteNotification,
  useAdminDeleteAllNotifications,
} from '../../../services/admin-role-service/Admindashboardservice';
import { wsService } from '../../../services/Websocketservice';
import { formatTimeAgo } from '../../../utils/formatTimeago';

const ITEMS_PER_PAGE = 3;

const typeMap: Record<string, ActivityType> = {
  ANNOUNCEMENT: 'announcement', QUIZ: 'quiz',       SESSION: 'session',
  TASK: 'task',                 PROJECT: 'project',  SUPPORT: 'support',
  BADGE: 'badge',               CERTIFICATE: 'certificate', LIVE_SESSION: 'live_session',
  MENTORSHIP: 'mentorship',     REVIEW: 'review',    VERIFIED: 'verified',
  ALERT: 'alert',               PAYMENT: 'payment',
};

interface RawWsNotification {
  id: number;
  title: string;
  content: string;
  type: string;
  createdAt: string;
}

const mapWsToEvent = (raw: RawWsNotification): ActivityEvent => ({
  id:          raw.id,
  type:        typeMap[raw.type?.toUpperCase()] ?? 'other',
  title:       raw.title,
  description: raw.content,
  timeLabel:   formatTimeAgo(raw.createdAt),
  isAlert:     raw.type?.toUpperCase() === 'ALERT',
});

// ─── Component ────────────────────────────────────────────────────────────────
const LiveActivityStream: FC<LiveActivityStreamProps> = ({ events: initialEvents }) => {

  const [wsEvents,    setWsEvents]    = useState<ActivityEvent[]>([]);
  const [deletedIds,  setDeletedIds]  = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [, setWsConnected] = useState(false);
  const [newCount,    setNewCount]    = useState(0);
  const mountedRef     = useRef(true);
  const subscribedRef  = useRef(false);
  const cbRef          = useRef<((data: unknown) => void) | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const events = useMemo(() => {
    const seen = new Set<number>();
    return [...wsEvents, ...initialEvents].filter(e => {
      if (deletedIds.has(e.id) || seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, [wsEvents, initialEvents, deletedIds]);

  useEffect(() => {
    const handleNotification = (data: unknown) => {
      if (!mountedRef.current) return;
      const raw = data as RawWsNotification;
      if (!raw?.id || !raw?.title) return;

      const event = mapWsToEvent(raw);
      setWsEvents(prev => {
        if (prev.some(e => e.id === event.id)) return prev;
        return [event, ...prev];
      });
      setNewCount(n => n + 1);
      setCurrentPage(1);
    };

    cbRef.current = handleNotification;

    const subscribe = () => {
      if (subscribedRef.current) return;
      if (!mountedRef.current) return;
      subscribedRef.current = true;
      setWsConnected(true);
      wsService.subscribeToNotifications(handleNotification);
    };

    if (wsService.isConnected) {
      subscribe();
    }

    const interval = setInterval(() => {
      if (!mountedRef.current) return;
      if (wsService.isConnected && !subscribedRef.current) {
        subscribe();
      }
      setWsConnected(wsService.isConnected);
    }, 2000);

    return () => {
      clearInterval(interval);
      if (subscribedRef.current && cbRef.current) {
        wsService.unsubscribe('/user/queue/notifications', cbRef.current);
      }
      subscribedRef.current = false;
      cbRef.current = null;
    };
  }, []);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const { mutate: deleteOne }                               = useAdminDeleteNotification();
  const { mutate: deleteAll, isPending: isDeletingAll }     = useAdminDeleteAllNotifications();

  const handleDelete = useCallback((id: number) => {
    setDeletingIds(prev => new Set(prev).add(id));

    deleteOne(id, {
      onSuccess: () => {
        if (!mountedRef.current) return;
        setDeletedIds(prev => new Set(prev).add(id));
        setDeletingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        setNewCount(prev => (wsEvents.some((event) => event.id === id) ? Math.max(0, prev - 1) : prev));
        setCurrentPage(prev => {
          const afterCount = events.length - 1;
          const maxPage    = Math.max(1, Math.ceil(afterCount / ITEMS_PER_PAGE));
          return Math.min(prev, maxPage);
        });
      },
      onError: () => {
        if (!mountedRef.current) return;
        setDeletingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      },
    });
  }, [deleteOne, events.length, wsEvents]);

  const handleClearAll = useCallback(() => {
    deleteAll(undefined, {
      onSuccess: () => {
        if (!mountedRef.current) return;
        setDeletedIds(new Set([
          ...wsEvents.map(e => e.id),
          ...initialEvents.map(e => e.id),
        ]));
        setWsEvents([]);
        setNewCount(0);
        setCurrentPage(1);
      },
    });
  }, [deleteAll, wsEvents, initialEvents]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(events.length / ITEMS_PER_PAGE));

  const paginatedEvents = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return events.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [events, currentPage]);

  return (
    <div className="mt-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">Live Activity Stream</h2>

          {newCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
              +{newCount} new
            </span>
          )}

          {/* <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
              wsConnected
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {wsConnected
              ? <><Wifi className="w-3 h-3" /> Live</>
              : <><WifiOff className="w-3 h-3" /> Offline</>
            }
          </span> */}
        </div>

        {events.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={isDeletingAll}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
              transition-all duration-150
              ${isDeletingAll
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 active:scale-95'
              }
            `}
          >
            {isDeletingAll
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />
            }
            {isDeletingAll ? 'Clearing…' : 'Clear All'}
          </button>
        )}
      </div>

      {/* ── Events list ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        {paginatedEvents.length > 0 ? (
          paginatedEvents.map(event => (
            <ActivityItem
              key={event.id}
              event={event}
              onDelete={handleDelete}
              isDeleting={deletingIds.has(event.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-300">
            <Trash2 className="w-8 h-8" />
            <p className="text-sm font-medium">No activities yet</p>
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {events.length > ITEMS_PER_PAGE && (
        <LedgerPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={events.length}
          perPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default LiveActivityStream;