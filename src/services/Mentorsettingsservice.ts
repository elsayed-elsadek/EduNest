
import api from './api';
import type {
  ChangeEmailRequest,
  ConfirmEmailChangeRequest,
  ChangePasswordRequest,
  ConfirmDeleteRequest,
} from '../types/mentor-settings.types';

const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try { return (await req).data; }
  catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

// ── Email change — Step 1: send OTP to newEmail ────────────────────────────
// POST /settings/email  body: { newEmail }
export const requestEmailChange = (data: ChangeEmailRequest) =>
  handleRequest(api.post('/settings/request-email-change', data));

// ── Email change — Step 2: confirm with OTP (forces logout) ───────────────
// PATCH /settings/email?otpCode=xxx
export const confirmEmailChange = (data: ConfirmEmailChangeRequest) =>
  handleRequest(api.patch('/settings/confirm-email-change', null, { params: { otpCode: data.otpCode } }));

// ── Password ───────────────────────────────────────────────────────────────
// PATCH /settings/password
export const changePassword = (data: ChangePasswordRequest) =>
  handleRequest(api.patch('settings/password', data));

// ── Deactivate — password as query param ──────────────────────────────────
// POST /settings/deactivate?password=xxx
export const deactivateAccount = (password: string) =>
  handleRequest(api.post('settings/deactivate', null, { params: { password } }));

// ── Delete — Step 1: send OTP to current email ────────────────────────────
// POST /settings/delete
export const requestDeleteAccount = () =>
  handleRequest(api.post('settings/delete'));

// ── Delete — Step 2: confirm with OTP ────────────────────────────────────
// POST /settings/confirm-delete?otp=xxx
export const confirmDeleteAccount = (data: ConfirmDeleteRequest) =>
  handleRequest(api.post('settings/confirm-delete', null, { params: { otp: data.otp } }));