import { type FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVideo,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import type { Session } from './ScheduledSessions.types';

const BORDER_COLORS = {
  live: 'border-l-green-500 bg-green-50/50',
  qa: 'border-l-orange-500 bg-orange-50/50',
  course: 'border-l-blue-500 bg-blue-50/50',
};

const TEXT_COLORS = {
  live: 'text-green-700',
  qa: 'text-orange-700',
  course: 'text-blue-700',
};

// --- functions ---
const formatSessionDate = (session: Session): string => {
  if (session.sessionStartDate) {
    const d = new Date(String(session.sessionStartDate).replace(' ', 'T'));
    const valid = !Number.isNaN(d.getTime());
    
    return valid
      ? d.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : String(session.sessionStartDate);
  }
  
  const start = session.startTime ?? '';
  const end = session.endTime ? `- ${session.endTime}` : '';
  return `${start} ${end}`.trim();
};

// --- interfaces ---
interface ScheduledSessionCardProps {
  session: Session;
}

const ScheduledSessionCard: FC<ScheduledSessionCardProps> = ({ session }) => {
  if (!session) return null;

  const currentType = (session.type as keyof typeof BORDER_COLORS) || 'course';
  const icon = currentType === 'qa' ? faQuestionCircle : faVideo;

  return (
    <div className={`
      border-l-4 rounded-lg p-4 flex items-start gap-3
      transition-all duration-200 hover:shadow-sm
      ${BORDER_COLORS[currentType]}
    `}>
      <FontAwesomeIcon icon={icon} className="w-5 h-5 text-gray-500 shrink-0 mt-1" />
      
      <div className="flex-1 ">
        {/* activity title */}
        <div className="flex justify-between items-start  flex-wrap">
          <h4 className={`font-semibold text-sm ${TEXT_COLORS[currentType]}`}>
            {session.title.slice(0,12)}
            {session.title.length>15 ? "..." : ""}
          </h4>

          <div className="flex flex-wrap gap-2 text-center justify-center ">

          <span className="text-xs text-gray-600 whitespace-nowrap mt-0.5">
            {session.date}

         </span>
          <span className="text-xs text-gray-600 whitespace-nowrap mt-0.5">
            {formatSessionDate(session)}
          </span>
          </div>

        </div>

          {/* mentorship title  */}
        {session.mentorshipTitle && (
          <p className="text-xs text-gray-500 mt-1" style={{ color: 'inherit' }}>
            {String(session.mentorshipTitle)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ScheduledSessionCard;