

export interface SettingsData {
  email:   string;

  darkMode: boolean;

}

// Step 1: just newEmail
export interface ChangeEmailRequest        { newEmail: string; }
// Step 2: otpCode to confirm
export interface ConfirmEmailChangeRequest { otpCode: string; }

export interface ChangePasswordRequest { oldPassword: string; newPassword: string; confirmPassword: string; }
export interface ConfirmDeleteRequest  { otp: string; }