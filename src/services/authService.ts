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
};

// 2. استخدام Generic Types لضمان دقة البيانات العائدة
const handleRequest = async <T>(request: Promise<{ data: T }>): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// --- Registration ---

export const registerMentor = (formData: RegisterFormData) => 
  handleRequest(api.post(ENDPOINTS.REGISTER_MENTOR, formData));

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

export const forgetPasswordVerifyOtp = (email: string, otp: string) => 
  handleRequest(api.post(ENDPOINTS.FORGET_PWD_VERIFY, { email, otp }));

export const forgetResetPassword = (email: string, newPassword: string) => 
  handleRequest(api.post(ENDPOINTS.FORGET_PWD_RESET, { email, newPassword }));