
import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Users, FileText, Briefcase, Brain,
  ChevronDown, ChevronUp, Clock,
} from 'lucide-react';
import { theme } from '../../../../theme/colors';
import type { TimelineEvent } from '../../../../types/student-role-types/course.types';

//  Icon & color per type 
const TYPE_CONFIG: Record<string, {
  icon:  React.ReactNode;
  bg:    string;
  label: string;
}> = {
  SESSION: {
    icon:  <Users    className="w-4 h-4 text-blue-600"   />,
    bg:    'bg-blue-100',
    label: 'Session',
  },
  MENTORSHIP: {
    icon:  <Users    className="w-4 h-4 text-blue-600"   />,
    bg:    'bg-blue-100',
    label: 'Session',
  },
  TASK: {
    icon:  <FileText className="w-4 h-4 text-orange-600" />,
    bg:    'bg-orange-100',
    label: 'Task',
  },
  ASSIGNMENT: {
    icon:  <FileText className="w-4 h-4 text-orange-600" />,
    bg:    'bg-orange-100',
    label: 'Task',
  },
  PROJECT: {
    icon:  <Briefcase className="w-4 h-4 text-purple-600" />,
    bg:    'bg-purple-100',
    label: 'Project',
  },
  QUIZ: {
    icon:  <Brain     className="w-4 h-4 text-green-600"  />,
    bg:    'bg-green-100',
    label: 'Quiz',
  },
};

const FALLBACK_CONFIG = {
  icon:  <Calendar className="w-4 h-4 text-gray-500" />,
  bg:    'bg-gray-100',
  label: 'Event',
};

function formatDue(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = Math.round((target.getTime() - today.getTime()) / 86400000);

    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (diff === 0) return `Today · ${time}`;
    if (diff === 1) return `Tomorrow · ${time}`;
    if (diff < 0)  return `Overdue · ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${time}`;
  } catch {
    return dateStr;
  }
}


const TimelineItem: FC<{ event: TimelineEvent }> = ({ event }) => {
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[event.type] ?? FALLBACK_CONFIG;

  const handleClick = () => {
    const mentorshipId = (event as { mentorshipId?: number }).mentorshipId ?? Number(event.id);
    const weekId = (event as { weekId?: number }).weekId;
    const itemId = (event as { itemId?: number }).itemId ?? Number(event.id);
    const itemType = event.type;
    const itemKey = `${weekId ?? ''}-${itemType}-${itemId}`;

    navigate(`/student/learning/${mentorshipId}`, {
      state: {
        weekId,
        itemId,
        itemKey,
      },
    });
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group"
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate leading-snug group-hover:text-blue-700 transition-colors">
            {event.title}
          </p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${cfg.bg} text-gray-700`}>
            {cfg.label}
          </span>
        </div>
        {event.date && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            {formatDue(event.date)}
          </p>
        )}
      </div>
    </button>
  );
};

// Main component 
interface TimelineProps {
  events: TimelineEvent[];
}

const COLLAPSED_COUNT = 3;

const Timeline: FC<TimelineProps> = ({ events }) => {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? events : events.slice(0, COLLAPSED_COUNT);
  const hasMore = events.length > COLLAPSED_COUNT;

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-5 ${events.length === 0 ? '' : 'h-full'} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Timeline</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <Calendar className="w-4 h-4 text-blue-600" />
        </div>
      </div>

      {/* Events */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">All clear!</p>
          <p className="text-xs text-gray-400 mt-0.5">No upcoming events</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 min-h-0">
          {visible.map(event => (
            <TimelineItem key={event.id} event={event} />
          ))}

          {/* Expand / Collapse */}
          {hasMore && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border transition-colors"
              style={{
                color:       theme.primary[600],
                borderColor: theme.primary[200],
              }}
            >
              {expanded ? (
                <>
                  <ChevronUp   className="w-3.5 h-3.5" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  {events.length - COLLAPSED_COUNT} more item{events.length - COLLAPSED_COUNT !== 1 ? 's' : ''}
                </>
              )}
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default Timeline;