
import api from '../api';
import type { MyLearningDataApi } from '../../types/student-role-types/learning.types';
import type { AchievementsDataApi } from '../../types/student-role-types/achievement.types';
import type { CertificateApi } from '../../types/student-role-types/Certificate.types';

const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try { return (await req).data; }
  catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

export const getMyLearning = (page = 0, size = 10):
  Promise<{ apiResponse: { data: MyLearningDataApi } }> =>
  handleRequest(api.get('api/v1/my-learning', { params: { page, size } }));

export const getAchievements = (
  badgesPage = 0, badgesSize = 10,
  projectsPage = 0, projectsSize = 10,
): Promise<{ apiResponse: { data: AchievementsDataApi; message: string } }> =>
  handleRequest(api.get('api/v1/student/achievements', {
    params: { badgesPage, badgesSize, projectsPage, projectsSize },
  }));

export const getCertificates = (page = 0, size = 10):
  Promise<{ apiResponse: { data: { content: CertificateApi[]; page: number; size: number; totalElements: number; totalPages: number }; message: string } }> =>
  handleRequest(api.get('api/v1/student/certificates', { params: { page, size } }));