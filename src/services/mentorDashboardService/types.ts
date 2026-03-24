/** Mentorship entity from API */
export interface MentorshipApiResponse {
  id: string | number;
  title: string;
  description?: string;
  category?: string;
  difficultyLevel?: string;
  level?: string;
  price?: number;
  whatWillLearn?: string[];
  tags?: string[];
  duration?: number;
  revenue?: number;
  rating?: number;
  totalEnrolled?: number;
  enrolledCount?: number;
  status?: string;
  createdAt?: string;
  createdDate?: string;
  created_at?: string;
  Image_URL?: string;
  imageUrl?: string;
  coverImage?: string;
  [key: string]: unknown;
}

export interface CreateMentorshipResult {
  mentorship: MentorshipApiResponse | null;
  message?: string;
}

/** API validation error shape */
export interface ApiValidationErrorResponse {
  errorMessages?: Record<string, string>;
  error?: string;
  message?: string;
}

/** Error class holding field errors from API */
export class ApiValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.name = 'ApiValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/** Paginated mentorships list response */
export interface MentorshipsPageResponse {
  content: unknown[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
