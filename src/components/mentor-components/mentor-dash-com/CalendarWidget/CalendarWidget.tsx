
import type { FC } from 'react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { CalendarWidgetProps, CalendarSession } from './Calenderwideget.types';

const CalendarWidget: FC<CalendarWidgetProps> = ({
  selectedDate: initialDate = new Date(2026, 2, 13),
  onDateSelect,
  sessions = [],
  onSessionClick
}) => {
  // Function to parse date from various formats
  const parseSessionDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const parsed = new Date(dateStr);
    return !isNaN(parsed.getTime()) ? parsed : null;
  };

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date): CalendarSession[] => {
    return sessions.filter(session => {
      const sessionDate = session.date ? parseSessionDate(session.date) : null;
      if (!sessionDate) return false;
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const d = new Date(initialDate);
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  const [selectedDate, setSelectedDate] = useState(initialDate);

  const displayDate = new Date(weekStartDate);
  displayDate.setDate(weekStartDate.getDate() + 3);

  const monthName = displayDate.toLocaleDateString('en-US', { month: 'long' });
  const year = displayDate.getFullYear();

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysOfCurrentWeek = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + i);
      return d;
    });
  };

  const weekDays = getDaysOfCurrentWeek();

  const handlePrevWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(newDate.getDate() - 7);
    setWeekStartDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(newDate.getDate() + 7);
    setWeekStartDate(newDate);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm w-full m-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-base font-bold text-[var(--sidebar-bg)] dark:text-gray-200">
          {monthName} <span className="text-gray-400 font-medium">{year}</span>
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={handlePrevWeek} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={handleNextWeek} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Days Labels  */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-center text-[9px] sm:text-[10px] font-bold text-gray-300 uppercase italic">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 justify-items-center items-center">
        {weekDays.map((date, index) => {
          const isSelected =
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();

          const isDifferentMonth = date.getMonth() !== displayDate.getMonth();
          const dateSessions = getSessionsForDate(date);
          const hasSession = dateSessions.length > 0;

          return (
            <div key={index} className="flex flex-col items-center w-full">
              <button
                onClick={() => {
                  setSelectedDate(date);
                  onDateSelect?.(date);
                }}
                className={`
                  relative w-full aspect-square max-w-[40px] flex items-center justify-center 
                  text-xs sm:text-sm font-bold rounded-xl transition-all duration-200
                  ${isSelected
                    ? 'bg-[#0c2d48] text-white shadow-md scale-105 sm:scale-110'
                    : isDifferentMonth
                      ? 'text-gray-200'
                      : 'text-gray-600 hover:bg-blue-50'
                  }
                  ${hasSession && !isSelected ? 'ring-2 ring-blue-300' : ''}
                `}
                title={hasSession ? `${dateSessions.length} session(s)` : ''}
              >
                {date.getDate()}
              </button>

              {/* Session indicators and gold point */}
              <div className="h-2 mt-1 flex flex-col items-center gap-0.5">
                {/* Gold point for selected */}
                {isSelected && <div className="w-1 h-1 bg-[#d4af37] rounded-full"></div>}
                
                {/* Colored dots for sessions */}
                {hasSession && !isSelected && (
                  <div className="flex gap-0.5 justify-center">
                    {dateSessions.slice(0, 2).map((session, i) => {
                      const typeColors = {
                        live: 'bg-green-400',
                        qa: 'bg-orange-400',
                        course: 'bg-blue-400',
                      };
                      const color = typeColors[session.type as keyof typeof typeColors] || 'bg-gray-400';
                      return (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${color} cursor-pointer hover:scale-125 transition-transform`}
                          title={session.title}
                        />
                      );
                    })}
                    {dateSessions.length > 2 && (
                      <div className="text-[8px] text-gray-400 ml-0.5">+{dateSessions.length - 2}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sessions for selected date */}
      {selectedDate && getSessionsForDate(selectedDate).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Calendar size={12} /> {getSessionsForDate(selectedDate).length} session{getSessionsForDate(selectedDate).length !== 1 ? 's' : ''}
          </h4>
          <div className="space-y-1">
            {getSessionsForDate(selectedDate).map(session => (
              <button
                key={session.id}
                onClick={() => onSessionClick?.(session)}
                className="w-full text-left text-xs p-2 rounded-lg hover:bg-blue-50 transition-colors bg-gray-50 border border-gray-200"
              >
                <div className="font-medium text-gray-800 truncate">{session.title}</div>
                {session.startTime && (
                  <div className="text-gray-500 text-[10px]">{session.startTime} {session.endTime ? `- ${session.endTime}` : ''}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;


