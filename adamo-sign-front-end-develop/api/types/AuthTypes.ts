export interface LoginRequest {
  email: string;
  password: string;
}
export interface refreshRequest {
 refreshToken: string 
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: UserDTO;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message: string;
  user: UserDTO;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
  temporaryPassword: string;
  temporaryPasswordExpireAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  message: string;
}

export interface ChangePasswordRequest {
  email: string;
  temporaryPassword: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}
export interface ChangePasswordAuthRequest {
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordAuthResponse {
  message: string;
}

export interface UserDTO {
  id: number;
  email: string;
  firstLogin: boolean;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}
