import  { useMemo, useState } from 'react';
import { BookOpen, CalendarDays, ChevronDown, FileText, PlayCircle } from 'lucide-react';
import type { Week, Item } from '../../../../types/student-role-types/studentMentorshipTypes';

// --- Constants & Helpers ---
const ICON_MAP: Record<string, any> = {
  SESSION: CalendarDays,
  LIVE: CalendarDays,
  TASK: FileText,
  ASSIGNMENT: FileText,
  QUIZ: BookOpen,
  LECTURE: PlayCircle,
  VIDEO: PlayCircle,
};

const getItemIcon = (type?: string) => {
  if (!type) return FileText;
  const key = Object.keys(ICON_MAP).find(k => type.toUpperCase().includes(k));
  return ICON_MAP[key || 'DEFAULT'] || FileText;
};

// --- Sub-Components ---

const SidebarItem = ({ 
  item, 
  isSelected, 
  onSelect 
}: { 
  item: Item; 
  isSelected: boolean; 
  onSelect: () => void 
}) => {
  const Icon = useMemo(() => getItemIcon(item.type), [item.type]);

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all duration-200 ${
        isSelected 
          ? 'bg-primary-500/10 text-primary-500 ring-1 ring-primary-500/30 font-medium' 
          : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">{item.title}</span>
    </button>
  );
};

// --- Main Component ---

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
  // بنخزن بس الـ IDs اللي اليوزر فتحها يدوي (Manual Toggles)
  const [manualExpanded, setManualExpanded] = useState<Record<number, boolean>>({});

  const toggleWeek = (weekId: number) => {
    setManualExpanded(prev => ({
      ...prev,
      [weekId]: !prev[weekId]
    }));
  };

  return (
    <aside className="w-full lg:w-[350px] flex-shrink-0">
      <div className="lg:sticky lg:top-24 space-y-4">
        {/* Header Section */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-lg text-slate-900">Content</h2>
        </div>

        {/* Weeks List */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-2">
          {weeks.map((week) => {
            const isActiveWeek = week.weekId === selectedWeekId;
            // الأسبوع يتفتح لو هو الـ Active "أو" لو اليوزر فتحه يدوي
            const isExpanded = manualExpanded[week.weekId] ?? isActiveWeek;
            const completedCount = week.items.filter(i => i.completed).length;
            
            return (
              <div key={week.weekId} className="group">
                <button
                  onClick={() => {
                    toggleWeek(week.weekId);
                    // لو قفلناه وهو كان اكتف مش بنغير الداتا، بس لو فتحناه وهو مش اكتف بنختار أول عنصر
                    if (!isExpanded && !isActiveWeek && week.items.length > 0) {
                      onSelect(week.weekId, week.items[0].id);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 ${
                    isActiveWeek ? 'bg-slate-100 ring-1 ring-slate-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-semibold text-sm flex-1 text-left ${isActiveWeek ? 'text-primary-600' : 'text-slate-900'}`}>
                    {week.weekTitle}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                      {completedCount}/{week.items.length}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-slate-400`}
                    />
                  </div>
                </button>
                
                {/* Items Container */}
                <div className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}>
                  <div className="overflow-hidden">
                    <div className="space-y-1 pl-4 border-l-2 border-slate-50 ml-4 mb-2">
                      {week.items.map((item) => (
                        <SidebarItem
                          key={item.id}
                          item={item}
                          isSelected={item.id === selectedItemId}
                          onSelect={() => onSelect(week.weekId, item.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default ContentSidebar;