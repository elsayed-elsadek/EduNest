
import  type{ FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVideo,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import type { Session } from './ScheduledSessions.types';

interface ScheduledSessionCardProps {
  session: Session;
}


const ScheduledSessionCard: FC<ScheduledSessionCardProps> = ({ session }) => {

  if (!session) return null;

  const borderColors = {
    live: 'border-l-green-500 bg-green-50/50',
    qa: 'border-l-orange-500 bg-orange-50/50',
    course: 'border-l-blue-500 bg-blue-50/50',
  };

  const textColors = {
    live: 'text-green-700',
    qa: 'text-orange-700',
    course: 'text-blue-700',
  };

  const currentType = session.type || 'course'; 

  // choose an icon based on session type
  let icon = faVideo;
  if (currentType === 'live') icon = faVideo;
  else if (currentType === 'qa') icon = faQuestionCircle;

  return (
    <div className={`
      border-l-4 rounded-lg p-4 flex items-start gap-3
      ${borderColors[currentType as keyof typeof borderColors]}
      transition-all duration-200
      hover:shadow-sm
    `}>
      <FontAwesomeIcon icon={icon} className="w-5 h-5 text-gray-500 shrink-0 mt-1" />
      <div className="flex-1">
        <h4 className={`font-semibold text-sm mb-1 ${textColors[currentType as keyof typeof textColors]}`}>
          {session.title}
        </h4>
        <p className="text-xs text-gray-600">
          {session.startTime} {session.endTime ? `- ${session.endTime}` : ''}
        </p>
      </div>
    </div>
  );
};
export default ScheduledSessionCard;


