import api from '../api';
import type { HomepageApiResponse, HomepageDataDto } from '../../types/student-role-types/student-home-page.types';

const handleRequest = async <T>(request: Promise<{ data: T }>): Promise<T> => {
  try {
    return (await request).data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};


//  GET /api/v1/homepage/full

export const getFullHomepage = (): Promise<HomepageApiResponse> =>
  handleRequest(api.get('api/v1/homepage/full'));


export const extractHomepageData = (response: HomepageApiResponse): HomepageDataDto =>
  response.apiResponse.data;