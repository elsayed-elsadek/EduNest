

import type { FC } from 'react';
import ScheduledSessionCard from './ScheduledSessionCard';
import type { ScheduledSessionsProps } from './ScheduledSessions.types';

const ScheduledSessions: FC<ScheduledSessionsProps> = ({ 
  sessions = [
    {
      id: '1',
      title: 'Live session',
      startTime: '9.30',
      endTime: '11.30',
      type: 'live',
    },
    {
      id: '2',
      title: 'Q&A Session, Monitoring',
      startTime: '13.00',
      endTime: '14.00',
      type: 'qa',
    },
    {
      id: '3',
      title: 'New Course',
      startTime: '15.00',
      endTime: '',
      type: 'course',
    },
  ]
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        Scheduled sessions
      </h2>

      <div className="space-y-3">
        {sessions.map((session) => (
          <ScheduledSessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
};

export default ScheduledSessions;