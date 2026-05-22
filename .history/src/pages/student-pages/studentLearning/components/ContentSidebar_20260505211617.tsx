import { BookOpen, CalendarDays, FileText, PlayCircle } from 'lucide-react';
import type { Week } from '../../../../types/student-role-types/studentMentorshipTypes';

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
}: ContentSidebarProps) => (
  <aside className="w-full lg:w-[350px] flex-shrink-0">
    <div className="lg:sticky lg:top-24 space-y-4">
      <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
        <h2 className="font-bold text-lg text-slate-900">Content</h2>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-2 shadow-sm">
        {weeks.map((week) => {
          const isActiveWeek = week.weekId === selectedWeekId;
          const completedCount = week.items.filter(i => i.completed).length;
          
          return (
            <div key={week.weekId} className="mb-2">
              <button
                onClick={() => onSelect(week.weekId, week.items[0]?.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition ${
                  isActiveWeek ? 'bg-slate-100' : 'hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold text-sm text-slate-900">{week.weekTitle}</span>
                <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">{completedCount}/{week.items.length}</span>
              </button>
              
              {isActiveWeek && (
                <div className="space-y-1 mt-1 pl-2">
                  {week.items.map((item) => {
                    const Icon = getItemIcon(item.type);
                    const isSelected = item.id === selectedItemId;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelect(week.weekId, item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition ${
                          isSelected ? 'bg-[var(--primary-500)]/10 text-[var(--primary-500)]' : 'text-slate-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </aside>
);

export default ContentSidebar;
