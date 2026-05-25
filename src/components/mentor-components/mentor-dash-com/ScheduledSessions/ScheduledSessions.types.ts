

export interface Session {
  mentorshipId: string;
  id: string;
  title: string;
   
  // New API fields
  mentorshipTitle?: string;
  sessionStartDate?: string;

  // Existing fields (kept for backward compatibility)
  startTime?: string;
  endTime?: string;
  type?: 'live' | 'qa' | 'course';

  date?: string;
}


export interface ScheduledSessionsProps {
  sessions?: Session[];
}