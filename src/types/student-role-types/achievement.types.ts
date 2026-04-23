

export type BadgeColor = 'blue' | 'yellow' | 'purple' | 'green' | 'red';

// API statuses
export type ProjectSubmissionStatus = 'SUBMITTED' | 'GRADED' | 'REJECTED' | 'PENDING';

// UI mapped statuses (what the components display)
export type ProjectStatus = 'APPROVED' | 'PENDING' | 'REVISION';

// ─── Raw API shapes ───────────────────────────────────────────────────────────

export interface BadgeApi {
  id:                number;
  title:             string;
  description:       string;
  points:            number;
  mentorshipId:      number;
  mentorshipTitle:   string;
  awardedByFullName: string;
  awardedAt:         string;
}

export interface ProjectSubmissionApi {
  id:               number;
  projectTitle:     string;
  mentorshipId:     number;
  mentorshipTitle:  string;
  mentorFullName:   string;
  submissionStatus: ProjectSubmissionStatus;
  fileUrl:          string | null;
  uploadedFilePath: string | null;
  feedback:         string | null;
  submittedAt:      string;
}

export interface AchievementsDataApi {
  badges: {
    content:       BadgeApi[];
    page:          number;
    size:          number;
    totalElements: number;
    totalPages:    number;
  };
  projectSubmissions: {
    content:       ProjectSubmissionApi[];
    page:          number;
    size:          number;
    totalElements: number;
    totalPages:    number;
  };
}

// ─── UI shapes ────────────────────────────────────────────────────────────────

export interface Badge {
  id:              string;
  title:           string;
  description:     string;
  points:          number;
  icon:            string;
  color:           BadgeColor;
  mentorshipTitle: string;
  awardedBy:       string;
  awardedAt:       string;
}

export interface ProjectSubmission {
  id:          string;
  status:      ProjectStatus;
  category:    string;
  title:       string;
  mentorQuote: string;
  mentorName:  string;
  mentorRole:  string;
  fileUrl?:    string;
}