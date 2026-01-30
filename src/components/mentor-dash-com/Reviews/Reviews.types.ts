
export interface Review {
  id: string;
  studentName: string;
  studentAvatar?: string;
  courseTitle: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ReviewsListProps {
  reviews?: Review[];
  maxDisplay?: number;
  onViewAll?: () => void;
}