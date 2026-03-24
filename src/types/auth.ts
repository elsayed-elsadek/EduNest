

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
  otp?: string;
  general?: string;
}

export type JoinAs = "mentor" | "student";

// --- API Responses ---

// هيكل الرسالة العائدة من السيرفر في عمليات الـ auth (login, register, ...)
export interface AuthMessages {
  jwt?: string;          // التوكن في حالة نجاح تسجيل الدخول
  status?: string;       // رسالة الحالة العامة من الباك إند
  // أي فيلدات إضافية يضيفها الباك إند بدون كسر التايب
  [key: string]: unknown;
}

// الشكل العام لريسبونس الـ auth المستخدم في loginUser وغيره
export interface AuthResponse {
  messages?: AuthMessages;
  // لو في بيانات أخرى (مثلاً user, errors ...) تتضاف هنا تلقائيًا
  [key: string]: unknown;
}

export interface ApiError {
  errorMessages?: {
    error?: string;
  };
}

// --- Account Restore ---
export interface RestoreRequest {
  email: string;
}

export interface ConfirmRestoreRequest {
  email: string;
  otp: string;
}
