

export interface Session {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'live' | 'qa' | 'course';
}

export interface ScheduledSessionsProps {
  sessions?: Session[];
}