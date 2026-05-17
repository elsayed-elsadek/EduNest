

export interface Mentorship {
  totalEnroll: number;
  id: string;
  title: string;
  description?: string;
  icon: string;
  coverImageUrl?: string | null;
  level: string;
  rating: number;
  totalEnrolled: number;
  revenue: number;
  createdDate: string;
  status: 'active' | 'draft' | 'completed';
}
