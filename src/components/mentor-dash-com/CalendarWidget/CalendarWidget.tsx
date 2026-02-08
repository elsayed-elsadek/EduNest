
import type { FC } from 'react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarWidgetProps } from './Calenderwideget.types';

const CalendarWidget: FC<CalendarWidgetProps> = ({
  selectedDate: initialDate = new Date(2026, 2, 13),
  onDateSelect
}) => {
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
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm w-full max-w-md mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-base font-bold text-[#0c2d48]">
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
                `}
              >
                {date.getDate()}
              </button>

              {/* gold point for selected */}
              <div className="h-1 mt-1">
                {isSelected && <div className="w-1 h-1 bg-[#d4af37] rounded-full mx-auto"></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWidget;