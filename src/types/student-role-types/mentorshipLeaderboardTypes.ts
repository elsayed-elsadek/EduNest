export interface LeaderboardStudent {
  completedSessions: number;
  studentFullName: string;
  studentEmail: string;
  studentLevel: string;
  studentProfileImageUrl: string | null;
  totalPoints: number;
  rank: number;
  lastBadgeTitle: string | null;
  lastBadgeCategory: string | null;
}

export interface LeaderboardContent {
  content: LeaderboardStudent[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface MentorshipLeaderboardPayload {
  leaderboard: LeaderboardContent;
  currentUser: LeaderboardStudent | null;
  totalStudents: number;
  userRank: number | null;
}

export interface MentorshipLeaderboardApiResponse {
  apiResponse: {
    leaderboard: MentorshipLeaderboardPayload;
    message: string;
  };
}
