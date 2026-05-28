export interface CalendarSession {
  mentorshipId?: string;
  mentorshipTitle?: string;
  id: string;
  title: string;
  startTime?: string;
  endTime?: string;
  type?: 'live' | 'qa' | 'course';
  date?: string;
}

export interface CalendarWidgetProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  sessions?: CalendarSession[];
  onSessionClick?: (session: CalendarSession) => void;
}