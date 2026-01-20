import type { RegisterFormData } from '../types/auth';
import api from './api';

// Register mentor
export const registerMentor = async (
  formData: RegisterFormData
) => {
  const response = await api.post('/register-mentor', formData);
  return response.data;
};

// Register student
export const registerStudent = async (
  formData: RegisterFormData
) => {
  const response = await api.post('/register-student', formData);
  return response.data;
};

export const sendOtp = async (email: string) => {
  const response = await api.post(
    `/send-otp`,
    null, 
    {
      params: { email }, 
    }
  );

  return response.data;
};

// Verify OTP code
export const verifyOtp = async (email: string, otp: string) => {
  const response = await api.post(
    `/verify-user`,
    { email, otp }
  );

  return response.data;
};

