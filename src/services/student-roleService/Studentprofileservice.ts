import api from '../api';
import type { StudentProfileApi, UpdateProfileRequest } from '../../types/student-role-types/profile.types';

const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try { return (await req).data; }
  catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

// GET student/profile
export const getStudentProfile = ():
  Promise<{ apiResponse: { profile: StudentProfileApi } }> =>
  handleRequest(api.get('student/profile'));

// PATCH student/profile
export const updateStudentProfile = (data: UpdateProfileRequest):
  Promise<{ apiResponse: unknown }> =>
  handleRequest(api.patch('student/profile', data));

// PATCH student/profile/image
export const updateStudentProfileImage = (image: File):
  Promise<{ apiResponse: { profileImageUrl?: string; message?: string } }> => {
  const form = new FormData();
  form.append('image', image);
  return handleRequest(
    api.patch('student/profile/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  );
};