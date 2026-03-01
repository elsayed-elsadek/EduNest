
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import type { UserProfile, UpdateMentorProfileRequest } from '../types/mentor-profile.types';
import {
  getMentorProfile,
  extractMentorProfile,
  updateMentorProfile,
  updateMentorProfileImage,
} from '../services/Mentorprofileservice';
import api from '../services/api';
const BASE_URL = (() => {
  const url = (api.defaults.baseURL ?? '').replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  return url;
})();

const toUiProfile = (raw: ReturnType<typeof extractMentorProfile>): UserProfile | null => {
  if (!raw) return null;
  return {
    id:         '1',
    firstName:  raw.firstName,
    lastName:   raw.lastName,
    email:      raw.email,
    title:      raw.jobTitle ?? '',
    experience: raw.yearsOfExperience
      ? `${raw.yearsOfExperience}+ Years Experience`
      : '',
    avatar:     raw.profileImageUrl
      ? (raw.profileImageUrl.startsWith('http')
          ? raw.profileImageUrl
          : `${BASE_URL}${raw.profileImageUrl}`)
      : undefined,
    bio:   raw.bio   ?? '',
    links: {
      linkedin: raw.linkedInLink ?? '',
      github:   raw.githubLink   ?? '',
    },
  };
};

// Hook 
export const useMentorProfile = () => {
  const token      = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [profile,  setProfile ] = useState<UserProfile | null>(null);
  const [loading,  setLoading ] = useState(true);
  const [saving,   setSaving  ] = useState(false);
  const [error,    setError   ] = useState<string | null>(null);
  const [success,  setSuccess ] = useState<string | null>(null);

  //  Fetch
  const fetchProfile = useCallback(async () => {
    if (!isHydrated || !token) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await getMentorProfile();
      const data = extractMentorProfile(res);
      const ui = toUiProfile(data);
      setProfile(ui);
      // Sync basic fields into the global auth store so header/sidebar update immediately
      if (ui) {
        const fullName = `${ui.firstName || ''} ${ui.lastName || ''}`.trim();
        useAuthStore.setState({ userName: fullName || useAuthStore.getState().userName, userAvatar: ui.avatar ?? useAuthStore.getState().userAvatar });
      }
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [isHydrated, token]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  //  Update info
  const saveProfile = async (data: UpdateMentorProfileRequest) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateMentorProfile(data);
      // Re-fetch to get latest data
      await fetchProfile();
    //   setSuccess('Profile updated successfully!');
      toast.success('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string })?.message ?? 'Failed to update profile';
    //   setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Upload image
  const uploadImage = async (file: File) => {
    setSaving(true);
    setError(null);
    try {
      const url = await updateMentorProfileImage(file);
      if (url) {
        const finalUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
        if (profile) {
          setProfile({
            ...profile,
            avatar: finalUrl,
          });
        }
        // update global auth store avatar immediately (always)
        useAuthStore.setState({ userAvatar: finalUrl });
      }
      setSuccess('Profile image updated!');
      toast.success('Profile image updated!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string })?.message ?? 'Failed to upload image';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return { profile, loading, saving, error, success, saveProfile, uploadImage, refetch: fetchProfile };
};