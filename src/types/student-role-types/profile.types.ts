

export type ProjectStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'PENDING' | 'APPROVED' | 'GRADED' | 'REJECTED';

// ─── Raw API shapes 

export interface ProfileBadgeApi {
  id:                number;
  title:             string;
  description:       string;
  points:            number;
  mentorshipId:      number;
  mentorshipTitle:   string;
  awardedByFullName: string;
  awardedAt:         string;
}

export interface ProfileProjectApi {
  projectSubmissionId: number;
  projectTitle:        string;
  mentorshipTitle:     string;
  status:              ProjectStatus;
  submittedAt:         string;
  gradedAt:            string | null;
  feedback:            string | null;
  submissionLink:      string | null;
  rawScore:            number | null;
  finalScore:          number | null;
}

export interface ProfileCertificateApi {
  studentFullName:    string;
  mentorFullName:     string;
  mentorshipTitle:    string;
  mentorshipSubtitle: string;
  issuedAt:           string;
  rank:               number;
}

export interface StudentProfileApi {
  firstName:        string;
  lastName:         string;
  fullName:         string;
  email:            string;
  jobTitle:         string | null;
  bio:              string | null;
  profileImageUrl:  string | null;
  githubLink:       string | null;
  linkedInLink:     string | null;
  badges:           ProfileBadgeApi[];
  projects:         ProfileProjectApi[];
  certificates:     ProfileCertificateApi[];
  skills:           string[];
}

// ─── UI shapes ────────────────────────────────────────────────────────────────

export interface ProfileData {
  id:           string;
  firstName:    string;
  lastName:     string;
  role:         string;   // maps to jobTitle
  email:        string;
  avatar?:      string;
  bio:          string;
  skills:       string[];
  githubUrl?:   string;
  linkedinUrl?: string;
}

export interface AchievementBadge {
  id:               string;
  title:            string;
  description:      string;
  points:           number;
  awardedBy:        string;
  mentorshipTitle:  string;
  awardedAt:        string;
  icon:             string;
  unlocked:         boolean;
  nextHint?:        string;
}

export interface ActiveProject {
  id:               string;
  title:            string;
  mentorship:       string;
  completion:       number;
  status:           ProjectStatus;
  submissionLink?:  string;
}

export interface CredentialEntry {
  id:          string;
  type:        string;
  mentorship:  string;
  rank:        string;
  issuedAt?:   string;
  mentorName?: string;
}

// ─── Request shape 

export interface UpdateProfileRequest {
  firstName:        string;
  lastName:         string;
  bio:              string;
  jobTitle:         string;
  socialMediaLinks: Array<{ name: 'GITHUB' | 'LINKEDIN'; url: string }>;
  skills:           string[];
}