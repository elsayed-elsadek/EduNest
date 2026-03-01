import api from './api';

//Helpers

const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try {
    return (await req).data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

import type { MentorProfileApiData, UpdateMentorProfileRequest } from '../types/mentor-profile.types';

//  GET /mentor/profile 
export const getMentorProfile = () =>
  handleRequest(api.get('mentor/profile'));

export const extractMentorProfile = (response: unknown): MentorProfileApiData | null => {
  if (!response || typeof response !== 'object') return null;
  const res = response as Record<string, unknown>;
  const apiResponse = res.apiResponse as Record<string, unknown> | undefined;
  if (!apiResponse) return null;
  const info = apiResponse['Mentor-Profile-Information'] as Record<string, unknown> | undefined;
  if (!info) return null;

  return {
    firstName:         String(info.firstName        ?? ''),
    lastName:          String(info.lastName         ?? ''),
    fullName:          String(info.fullName         ?? ''),
    email:             String(info.email            ?? ''),
    jobTitle:          info.jobTitle          ? String(info.jobTitle)          : null,
    bio:               info.bio              ? String(info.bio)              : null,
    yearsOfExperience: Number(info.yearsOfExperience ?? 0),
    linkedInLink:      info.linkedInLink     ? String(info.linkedInLink)     : null,
    githubLink:        info.githubLink       ? String(info.githubLink)       : null,
    profileImageUrl:   info.profileImageUrl  ? String(info.profileImageUrl)  : null,
  };
};

//  PATCH /mentor/profile
export const updateMentorProfile = (data: UpdateMentorProfileRequest) =>
  handleRequest(api.patch('mentor/profile', data));

//  PATCH /mentor/profile/image 
export const updateMentorProfileImage = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await handleRequest(
    api.patch('mentor/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  ) as Record<string, unknown>;

  const apiResponse = (res as Record<string, unknown>).apiResponse as Record<string, unknown> | undefined;
  return apiResponse?.profileImageUrl ? String(apiResponse.profileImageUrl) : null;
};