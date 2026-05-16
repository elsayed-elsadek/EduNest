import { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, ChevronDown, FileText, PlayCircle } from 'lucide-react';
import type { Week } from '../../../../types/student-role-types/studentMentorshipTypes';
import { Link } from 'react-router-dom';

// --- Helpers ---
const getItemIcon = (type?: string) => {
  if (!type) return FileText;
  const normalized = type.toUpperCase();
  if (normalized.includes('SESSION') || normalized.includes('LIVE')) return CalendarDays;
  if (normalized.includes('TASK') || normalized.includes('ASSIGNMENT')) return FileText;
  if (normalized.includes('QUIZ')) return BookOpen;
  if (normalized.includes('LECTURE') || normalized.includes('VIDEO')) return PlayCircle;
  return FileText;
};

interface ContentSidebarProps {
  weeks: Week[];
  selectedWeekId: number | null;
  selectedItemId: number | null;
  onSelect: (wId: number, iId: number) => void;
}

const ContentSidebar = ({ 
  weeks, 
  selectedWeekId, 
  selectedItemId, 
  onSelect 
}: ContentSidebarProps) => {
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({});

  // Initialize expanded state responsively
  useEffect(() => {
    const newExpanded: Record<number, boolean> = {};
    weeks.forEach(week => {
      newExpanded[week.weekId] = selectedWeekId === week.weekId;
    });
    setExpandedWeeks(newExpanded);
  }, [weeks, selectedWeekId]);

  const toggleWeek = (weekId: number) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekId]: !prev[weekId]
    }));
  };

  const isWeekExpanded = (weekId: number) => expandedWeeks[weekId] ?? false;

  return (
    <aside className="w-full lg:w-[350px] flex-shrink-0">
      
      <div className="lg:sticky lg:top-24 space-y-4">
        <div className=" flex gap-3 bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-lg text-slate-900">Content</h2>
          <FileText/>
          
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
          {weeks.map((week) => {
            const isActiveWeek = week.weekId === selectedWeekId;
            const isExpanded = isWeekExpanded(week.weekId);
            const completedCount = week.items.filter(i => i.completed).length;
            
            return (
              <div key={week.weekId} className="mb-2 ">
                <button
                  onClick={() => {
                    if (!isExpanded) {
                      onSelect(week.weekId, week.items[0]?.id ?? 0);
                    }
                    toggleWeek(week.weekId);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 ${
                    isActiveWeek ? 'bg-slate-100 ring-2 ring-[var(--primary-500)]/20' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="font-semibold text-sm text-slate-900 flex-1 text-left">
                    {week.weekTitle}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">
                      {completedCount}/{week.items.length}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      } text-slate-500`}
                    />
                  </div>
                </button>
                
                <div className={`overflow-auto  transition-all duration-300 ease-in-out ${
                  isExpanded ? 'max-h-96 opacity-100 pb-3 px-2' : 'max-h-0 opacity-0'
                }`}>
                  <div className="space-y-1 mt-3 pl-6 lg:pl-2">
                    {week.items.map((item) => {
                      const Icon = getItemIcon(item.type);
                      const isSelected = item.id === selectedItemId;
                      return (
                        <button
                          key={item.id}
                          onClick={() => onSelect(week.weekId, item.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all duration-200 ${
                            isSelected 
                              ? 'bg-[var(--primary-500)]/10 text-[var(--primary-500)] ring-1 ring-[var(--primary-500)]/30' 
                              : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </button>
                      );
                    })}

                
                  </div>
                </div>
                
              </div>
            );
          })}


        </div>
        {/* add mentorshipId when hazem add it */}
             <Link to={`/mentorships/${selectedWeekId}`} className= " m-11 text-white px-4 py-2.5 mt-4 text-center text-sm rounded-full bg-[var(--primary-500)] hover:underline">
                      Show Mentorship Details
                    </Link>
      </div>
       
       
    </aside>
  );
};

export default ContentSidebar;
