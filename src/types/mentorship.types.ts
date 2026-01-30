

export interface Mentorship {
  id: string;
  title: string;
  description?: string;
  icon: string;
  level: string;
  rating: number;
  totalEnrolled: number;
  revenue: number;
  createdDate: string;
  status: 'active' | 'draft' | 'completed';
}