
import  type{ FC } from 'react';
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

  return (
    <div className={`
      border-l-4 rounded-lg p-4
      ${borderColors[currentType as keyof typeof borderColors]}
      transition-all duration-200
      hover:shadow-sm
    `}>
      <h4 className={`font-semibold text-sm mb-1 ${textColors[currentType as keyof typeof textColors]}`}>
        {session.title}
      </h4>
      <p className="text-xs text-gray-600">
        {session.startTime} {session.endTime ? `- ${session.endTime}` : ''}
      </p>
    </div>
  );
};
export default ScheduledSessionCard;