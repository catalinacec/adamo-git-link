import axiosInstance from "../axiosInstance";
import {
  ChangePasswordAuthRequest,
  ChangePasswordAuthResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  refreshRequest,
  RegisterRequest,
  RegisterResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
} from "../types/AuthTypes";
import { GeneralResponse } from "../types/GeneralTypes";

class AuthRepository {
  async login(
    data: LoginRequest,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<LoginResponse>> {
    const response = await axiosInstance.post<GeneralResponse<LoginResponse>>(
      "/auth/login",
      data,
      { signal },
    );
    return response.data;
  }

  async refresh(
    data: refreshRequest,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<LoginResponse>> {
    const response = await axiosInstance.post<GeneralResponse<LoginResponse>>(
      "/auth/login/refresh",
      data,
      { signal },
    );
    return response.data;
  }

  async register(
    data: RegisterRequest,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<RegisterResponse>> {
    const response = await axiosInstance.post<
      GeneralResponse<RegisterResponse>
    >("/auth/register", data, { signal });
    return response.data;
  }

  async forgotPassword(
    data: ForgotPasswordRequest,
    locale:string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<ForgotPasswordResponse>> {
    const response = await axiosInstance.post<
      GeneralResponse<ForgotPasswordResponse>
    >("/auth/forgot-password", data, {
      signal,
      headers: { 'Accept-Language': locale },
    });
    return response.data;
  }
  async verifyOTP(
    data: VerifyOTPRequest,
    locale:string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<VerifyOTPResponse>> {
    const response = await axiosInstance.post<
      GeneralResponse<VerifyOTPResponse>
    >("/auth/verify-otp", data, {
      signal,
      headers: { 'Accept-Language': locale },
    });
    return response.data;
  }

  async resendOtp(
    data: ResendOtpRequest,
    locale:string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<ResendOtpResponse>> {
    const response = await axiosInstance.post<
      GeneralResponse<GeneralResponse<ResendOtpResponse>>
    >("/auth/resend-otp", data, {
      signal,
      headers: { 'Accept-Language': locale },
    });
    return response.data;
  }

  async changePassword(
    data: ChangePasswordRequest,
    locale:string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<ChangePasswordResponse>> {
    const response = await axiosInstance.post<
      GeneralResponse<GeneralResponse<ChangePasswordResponse>>
    >("/auth/change-password", data, {
      signal,
      headers: { 'Accept-Language': locale },
    });
    return response.data;
  }

  async changePasswordAuth(
    data: ChangePasswordAuthRequest,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<ChangePasswordAuthResponse>> {
    const response = await axiosInstance.post<
      GeneralResponse<ChangePasswordAuthResponse>
    >("/auth/change-password-auth", data, { signal });
    return response.data;
  }

  async logout(signal?: AbortSignal): Promise<void> {
    await axiosInstance.post("/auth/logout", null, { signal });
  }
}

const authRepositoryInstance = new AuthRepository();
export default authRepositoryInstance;
