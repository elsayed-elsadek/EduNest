
import api from '../api';

const handle = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try { return (await req).data; }
  catch (err: unknown) {
    const e = err as { response?: { data?: unknown }; message?: string };
    throw e.response?.data ?? e.message;
  }
};

export interface AdminProfileApi {
  firstName:       string;
  lastName:        string;
  fullName:        string;
  email:           string;
  headline:        string | null;
  profileImageUrl: string | null;
  commissionRate:  number;
}

// GET /admin/profile
export const getAdminProfile = ():
  Promise<{ apiResponse: { profile: AdminProfileApi } }> =>
  handle(api.get('admin/profile'));

// PATCH /admin/profile
export const updateAdminProfile = (data: { firstName: string; lastName: string; headline: string }):
  Promise<{ apiResponse: unknown }> =>
  handle(api.patch('admin/profile', data));

// PATCH /admin/profile/image
export const updateAdminImage = (image: File):
  Promise<{ apiResponse: { profileImageUrl?: string } }> => {
  const form = new FormData();
  form.append('image', image);
  return handle(api.patch('admin/profile/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }));
};

// POST /admin/profile/change-email/request?newEmail=xxx
export const requestEmailChange = (newEmail: string):
  Promise<{ apiResponse: unknown }> =>
  handle(api.post('admin/profile/change-email/request', null, { params: { newEmail } }));

// POST /admin/profile/change-email/confirm?otpCode=xxx
export const confirmEmailChange = (otpCode: string):
  Promise<{ apiResponse: unknown }> =>
  handle(api.post('admin/profile/change-email/confirm', null, { params: { otpCode } }));

// PATCH /admin/profile/change-password
export const changePassword = (data: { oldPassword: string; newPassword: string; confirmPassword: string }):
  Promise<{ apiResponse: unknown }> =>
  handle(api.patch('admin/profile/change-password', data));

// GET /admin/commission
export const getCommission = ():
  Promise<{ apiResponse: { commissionRate: number } }> =>
  handle(api.get('admin/commission'));

// PATCH /admin/commission?rate=xx
export const updateCommission = (rate: number):
  Promise<{ apiResponse: { message: string } }> =>
  handle(api.patch('admin/commission', null, { params: { rate } }));