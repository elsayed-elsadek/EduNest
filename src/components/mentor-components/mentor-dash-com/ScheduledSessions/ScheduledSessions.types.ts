

export interface Session {
  mentorshipId: any;
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'live' | 'qa' | 'course';
  date?: string;
}

export interface ScheduledSessionsProps {
  sessions?: Session[];
}