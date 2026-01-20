

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
  educationalLevel?: string;
  agreeTerms?: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  educationalLevel?: string;
  agreeTerms?: string;
  rememberMe?: string;
  general?: string;
}

export type JoinAs = "mentor" | "student";

