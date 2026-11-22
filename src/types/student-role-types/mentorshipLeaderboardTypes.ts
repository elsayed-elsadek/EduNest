export interface LeaderboardStudent {
  studentFullName: string;
  totalPoints: number;
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
  /** Kept opaque until the backend documents its shape; UI uses userRank. */
  currentUser?: unknown;
  totalStudents: number;
  userRank: number | null;
}

export interface MentorshipLeaderboardApiResponse {
  apiResponse: {
    leaderboard: MentorshipLeaderboardPayload;
    message: string;
  };
}
