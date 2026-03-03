
import type { FC } from 'react';
import { Calendar } from 'lucide-react';
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
  const hasApiData = sessions && sessions.length > 0 && 
    sessions.some(s => s.id && (s.id !== '1' && s.id !== '2' && s.id !== '3'));
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-bold text-gray-900">
          Scheduled sessions
        </h2>
        <Calendar className="w-4 h-4 text-gray-400" />
      </div>

      <div className="space-y-3">
        {sessions && sessions.length > 0 ? (
          sessions.map((session) => (
            <ScheduledSessionCard key={session.id} session={session} />
          ))
        ) : (
          <div className="text-center py-6">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No upcoming sessions</p>
            <p className="text-xs text-gray-400 mt-1">Schedule a session to get started</p>
          </div>
        )}
      </div>


    </div>
  );
};

export default ScheduledSessions;


