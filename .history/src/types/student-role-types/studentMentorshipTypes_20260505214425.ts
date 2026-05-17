export interface MentorshipSummary {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  mentorName: string;
  price: number;
  discountPercentage: number;
  priceAfterDiscount: number;
  duration: number;
  coverImageUrl: string | null;
}

export interface MentorshipDetails {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  difficultyLevel: string;
  duration: number;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  coverImageUrl: string | null;
  status: string;
  rating: number | null;
  

  mentorName: string;
  mentorEmail: string;
  mentorProfileImageUrl: string | null;
  mentorJobTitle: string;
  mentorYearsOfExperience: number;

  tags: string[];
  whatWillLearn: string[];
  topMentorMentorships: MentorshipSummary[];
  thumnailUrls: string[];
  priceAfterDiscount: number;
}

export interface MentorshipDetailsApiResponse {
  apiResponse: {
    mentorship: {
      beforeEnroll: Record<string, unknown>;
    };
  };
}

export interface ContentItem {
  type: string;
  id: number;
  title: string;
  createdAt: string;
  completed: boolean;
}

export interface Week {
  weekId: number;
  weekTitle: string;
  items: ContentItem[];
}

export interface WeekContent {
  weekId: number;
  weekTitle: string;
  items: ContentItem[];
}

export interface WeekContentResponse {
  apiResponse: {
    week: WeekContent;
    status: string;
  };
}

export interface MentorshipContentResponse {
  apiResponse: {
    weeks: {
      mentorshipTitle: string;
      weeks: Week[];
    };
    status: string;
  };
}

export interface MentorshipContentErrorResponse {
  errorMessages: {
    error: string;
  };
}

// --- Lecture Types ---
export interface Lecture {
  id: number;
  title: string;
  lectureUrl: string;
}

export interface LectureApiResponse {
  apiResponse: {
    lecture: Lecture;
    message: string;
  };
}

// --- Join Mentorship Types ---
export interface JoinMentorshipSuccessResponse {
  apiResponse: {
    message: string;
  };
}

export interface JoinMentorshipErrorResponse {
  errorMessages: {
    error: string;
  };
}
