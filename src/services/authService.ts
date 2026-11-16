import type { RegisterFormData, AuthResponse } from "../types/auth";
import api from "./api";

// 1. مركزية الروابط لتسهيل التعديل
const ENDPOINTS = {
  REGISTER_MENTOR: 'api/v1/register/mentor',
  REGISTER_STUDENT: 'api/v1/register/student',
  SEND_OTP: 'api/v1/register/send-otp',
  VERIFY_OTP: 'api/v1/register/verify-user',
  LOGIN: 'login-api',
  FORGET_PWD: 'forget-password',
  FORGET_PWD_VERIFY: 'forget-password/verify-otp',
  FORGET_PWD_RESET: 'forget-password/reset',
  RESTORE_OTP: 'api/v1/register/restore',
  CONFIRM_RESTORE: 'api/v1/register/confirm-restore',
};

// 2. استخدام Generic Types لضمان دقة البيانات العائدة
// نرمي الخطأ الكامل (مع response) حتى صفحة التسجيل تقرأ status و data
const handleRequest = async <T>(request: Promise<{ data: T }>): Promise<T> => {
  const response = await request;
  return response.data;
};

// --- Registration ---

// للمينتور لا نرسل educationalLevel (حقل خاص بالطالب فقط)
function buildMentorPayload(formData: RegisterFormData) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { educationalLevel, ...rest } = formData;
  return rest;
}

export const registerMentor = (formData: RegisterFormData) => 
  handleRequest(api.post(ENDPOINTS.REGISTER_MENTOR, buildMentorPayload(formData)));

export const registerStudent = (formData: RegisterFormData) => 
  handleRequest(api.post(ENDPOINTS.REGISTER_STUDENT, formData));

export const sendOtp = (email: string) => 
  handleRequest(api.post(ENDPOINTS.SEND_OTP, null, { params: { email } }));

export const verifyOtp = (email: string, otp: string) => 
  handleRequest(api.post(ENDPOINTS.VERIFY_OTP, { email, otp }));

// --- Authentication ---

export const loginUser = (email: string, password: string) => 
  handleRequest<AuthResponse>(api.post(ENDPOINTS.LOGIN, { email, password }));

// --- Forget Password Section ---

export const forgetPassword = (email: string) => 
  handleRequest(api.post(ENDPOINTS.FORGET_PWD, { email }));

export interface VerifyResetOtpResult {
  resetToken: string;
  message: string;
}

/**
 * Verifies the password-reset OTP and returns the single-use `resetToken`
 * plus the backend's own success message.
 *
 * Contract (Integration Handbook §4 / live OpenAPI): the response is a
 * `SimpleResponse` envelope — `{ apiResponse: { resetToken, message } }` —
 * and the token is valid for 5 minutes and consumed by the very first
 * `POST /forget-password/reset` call.
 *
 * Callers must keep the token in React memory / navigation state only.
 */
export const forgetPasswordVerifyOtp = async (
  email: string,
  otp: string
): Promise<VerifyResetOtpResult> => {
  const data = await handleRequest<unknown>(
    api.post(ENDPOINTS.FORGET_PWD_VERIFY, { email, otp })
  );

  const apiResponse = (data as { apiResponse?: Record<string, unknown> })?.apiResponse;
  const resetToken = apiResponse?.resetToken;
  const message = typeof apiResponse?.message === "string" ? apiResponse.message : "";

  if (typeof resetToken !== "string" || !resetToken) {
    throw new Error("Verification succeeded but no reset token was returned.");
  }

  return { resetToken, message };
};

/**
 * Resets the password with a verified single-use `resetToken`.
 * Returns the backend's own success message for display.
 */
export const forgetResetPassword = async (
  email: string,
  resetToken: string,
  newPassword: string
): Promise<string> => {
  const data = await handleRequest<unknown>(
    api.post(ENDPOINTS.FORGET_PWD_RESET, { email, resetToken, newPassword })
  );

  const message = (data as { apiResponse?: { message?: unknown } })?.apiResponse?.message;

  return typeof message === "string" ? message : "";
};

/**
 * Extracts a user-facing message from an unknown axios/backend error without
 * ever exposing the request body (which contains the OTP or reset token).
 */
export function extractBackendMessage(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { errorMessages?: { error?: string }; message?: string; apiResponse?: { message?: string } } };
    message?: string;
  } | null;

  return (
    err?.response?.data?.errorMessages?.error ||
    err?.response?.data?.apiResponse?.message ||
    err?.response?.data?.message ||
    (typeof err?.message === "string" && err.message ? err.message : "") ||
    fallback
  );
}

// --- Account Restore ---

export const sendRestoreOtp = (email: string) =>
  handleRequest(api.post(ENDPOINTS.RESTORE_OTP, { email }));

export const confirmRestore = (email: string, otp: string) =>
  handleRequest(api.post(ENDPOINTS.CONFIRM_RESTORE, { email, otp }));
