import type { LearningStatsData } from '../../../../types/student-role-types/learning.types';

export interface StatsCardsProps {
  data: LearningStatsData;
}

export interface StatCardProps {
  label:    string;
  children: React.ReactNode;
}