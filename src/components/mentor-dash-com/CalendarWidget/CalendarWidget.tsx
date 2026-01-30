
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
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-[#0c2d48]">
          {monthName} <span className="text-gray-400 font-medium">{year}</span>
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={handlePrevWeek} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400"><ChevronLeft size={18} /></button>
          <button onClick={handleNextWeek} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Days Labels */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-center text-[10px] font-bold text-gray-300 uppercase italic">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid with Month Break Logic */}
      <div className="flex justify-between items-center gap-1">
        {weekDays.map((date, index) => {
          const isSelected = date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth();
          const isDifferentMonth = date.getMonth() !== displayDate.getMonth();

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <button
                onClick={() => {
                  setSelectedDate(date);
                  onDateSelect?.(date);
                }}
                className={`
                  w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all
                  ${isSelected
                    ? 'bg-[#0c2d48] text-white shadow-md scale-110'
                    : isDifferentMonth
                      ? 'text-gray-300 opacity-50'
                      : 'text-gray-600 hover:bg-blue-50'
                  }
                `}
              >
                {date.getDate()}
              </button>

              {isSelected && <div className="w-1 h-1 bg-[#d4af37] rounded-full mt-1"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWidget;