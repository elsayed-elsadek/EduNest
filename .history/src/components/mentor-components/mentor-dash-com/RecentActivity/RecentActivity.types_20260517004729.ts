

export interface StudentActivity {
  title: ReactNode;
  id: string;
  studentName: string;
  studentAvatar?: string;
  action: string;
  mentorshipTitle: string;
  timestamp: string;
  type: 'submission' | 'question' | 'completion';
}

export interface RecentActivityListProps {
  activities?: StudentActivity[];
  maxDisplay?: number;
  title?: string;
}