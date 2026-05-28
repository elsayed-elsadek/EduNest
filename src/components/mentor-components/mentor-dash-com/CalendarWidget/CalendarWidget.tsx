import type { FC } from 'react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import type { CalendarWidgetProps, CalendarSession } from './Calenderwideget.types';

// ─── Constants & Helpers Outside Component (Prevent Re-allocation) ───────────
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SESSION_TYPE_COLORS: Record<string, { bg: string; dot: string; defaultText: string }> = {
  live: { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', defaultText: 'Live' },
  qa: { bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', defaultText: 'Q&A' },
  course: { bg: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500', defaultText: 'Mentorship' },
};

const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const CalendarWidget: FC<CalendarWidgetProps> = ({
  selectedDate: initialDate = new Date(2026, 2, 13),
  onDateSelect,
  sessions = [],
  onSessionClick
}) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  
  // Initialize week start date (Sunday of current week)
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const d = new Date(initialDate);
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  // ─── Performance Optimization: Group Sessions by Date Map O(N) ──────────────
  const sessionsByDateMap = useMemo(() => {
    const map: Record<string, CalendarSession[]> = {};
    
    sessions.forEach((session) => {
      if (!session.date) return;
      const parsedDate = new Date(session.date);
      if (isNaN(parsedDate.getTime())) return;
      
      const key = formatDateKey(parsedDate);
      if (!map[key]) map[key] = [];
      map[key].push(session);
    });
    
    return map;
  }, [sessions]);

  // ─── Derived State & Memoized Computations ──────────────────────────────────
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + i);
      return d;
    });
  }, [weekStartDate]);

  const displayDate = useMemo(() => {
    const d = new Date(weekStartDate);
    d.setDate(weekStartDate.getDate() + 3);
    return d;
  }, [weekStartDate]);

  const monthName = displayDate.toLocaleDateString('en-US', { month: 'long' });
  const year = displayDate.getFullYear();

  const selectedDateSessions = useMemo(() => {
    return sessionsByDateMap[formatDateKey(selectedDate)] || [];
  }, [sessionsByDateMap, selectedDate]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleWeekChange = (offset: number) => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(newDate.getDate() + offset);
    setWeekStartDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs w-full flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <h3 className="text-sm sm:text-base font-bold text-gray-900">
          {monthName} <span className="text-gray-400 font-medium pl-0.5">{year}</span>
        </h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleWeekChange(-7)} 
            className="p-1.5 hover:bg-gray-50 active:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-all duration-200"
            aria-label="Previous week"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => handleWeekChange(7)} 
            className="p-1.5 hover:bg-gray-50 active:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-all duration-200"
            aria-label="Next week"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2.5 shrink-0">
        {DAYS_OF_WEEK.map((day, index) => (
          <div key={index} className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-wider">
            {day.slice(0, 2)}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 justify-items-center items-center shrink-0">
        {weekDays.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isDifferentMonth = date.getMonth() !== displayDate.getMonth();
          const dateSessions = sessionsByDateMap[formatDateKey(date)] || [];
          const hasSession = dateSessions.length > 0;

          return (
            <div key={index} className="flex flex-col items-center w-full">
              <button
                onClick={() => handleDateClick(date)}
                className={`
                  relative w-full aspect-square max-w-[36px] flex items-center justify-center 
                  text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer
                  ${isSelected
                    ? 'bg-[var(--primary-500)] text-white shadow-xs scale-105'
                    : isDifferentMonth
                      ? 'text-gray-200 hover:bg-gray-50/50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                title={hasSession ? `${dateSessions.length} session(s)` : ''}
              >
                {date.getDate()}
                
                {/* Active Session Subtle Ring indicator */}
                {hasSession && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--primary-500)]" />
                )}
              </button>

              {/* Tiny Dot indicators below for Multiple Session Types */}
              <div className="h-1.5 mt-1 flex items-center justify-center gap-0.5 w-full">
                {hasSession && !isSelected && (
                  <div className="flex gap-0.5 justify-center max-w-full overflow-hidden">
                    {dateSessions.slice(0, 3).map((session, i) => {
                      const typeConfig = SESSION_TYPE_COLORS[session.type as keyof typeof SESSION_TYPE_COLORS] || { dot: 'bg-gray-400' };
                      return (
                        <div
                          key={i}
                          className={`w-0.5 h-0.5 rounded-full ${typeConfig.dot}`}
                        />
                      );
                    })}
                  </div>
                )}
                {isSelected && <div className="w-1 h-1 bg-white/0 rounded-full" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sessions Content List for Selected Date */}
      {selectedDateSessions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-50 flex-1 min-h-0 flex flex-col">
          <h4 className="text-xs font-bold text-gray-400 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider shrink-0">
            <Calendar size={13} className="text-gray-400" /> 
            <span>Today's Schedule ({selectedDateSessions.length})</span>
          </h4>
          
          <div className="space-y-2 overflow-y-auto pr-1 max-h-[180px] custom-scrollbar">
            {selectedDateSessions.map((session) => {
              const typeConfig = SESSION_TYPE_COLORS[session.type as keyof typeof SESSION_TYPE_COLORS] || { bg: 'bg-gray-50 text-gray-700', dot: 'bg-gray-400', defaultText: 'Event' };
              
              const badgeText = session.mentorshipTitle?.trim() || session.title?.trim() || typeConfig.defaultText;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    if (onSessionClick) {
                      onSessionClick(session);
                      return;
                    }

                    if (session.mentorshipId) {
                      navigate(`/mentor/mentorships/${session.mentorshipId ?? 'unknown'}/sessions`);
                    }
                  }}
                  className="w-full text-left p-3 rounded-xl hover:border-gray-200 bg-gray-50/60 border border-gray-100 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-gray-800 truncate group-hover:text-[var(--primary-500)] transition-colors">
                      {session.title}
                    </div>
                    {session.startTime && (
                      <div className="text-gray-400 text-[10px] font-semibold mt-1 flex items-center gap-1">
                        <Clock size={11} className="text-gray-300" />
                        <span>{session.startTime} {session.endTime ? ` - ${session.endTime}` : ''}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Dynamic Badge Label from API (mentorshipTitle) */}
                  <span 
                    className={`text-[9px] font-bold  px-2 py-0.5 rounded-md shrink-0 tracking-wider truncate max-w-[100px] ${typeConfig.bg} text-[var(--primary-500)]`}
                    title={badgeText}
                  >
                    {badgeText.slice(0, 15)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;