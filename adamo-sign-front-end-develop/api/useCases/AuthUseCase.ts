import AuthRepository from "../repositories/AuthRepository";
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

class AuthUseCase {
  async login(data: LoginRequest): Promise<GeneralResponse<LoginResponse>> {
    return await AuthRepository.login(data);
  }

  async refresh(data: refreshRequest): Promise<GeneralResponse<LoginResponse>> {
    return await AuthRepository.refresh(data);
  }

  async register(
    data: RegisterRequest,
  ): Promise<GeneralResponse<RegisterResponse>> {
    return await AuthRepository.register(data);
  }

  async forgotPassword(
    data: ForgotPasswordRequest,
    locale:string,
  ): Promise<GeneralResponse<ForgotPasswordResponse>> {
    return await AuthRepository.forgotPassword(data, locale);
  }

  async verifyOTP(
    data: VerifyOTPRequest,
    locale:string,
  ): Promise<GeneralResponse<VerifyOTPResponse>> {
    return await AuthRepository.verifyOTP(data, locale);
  }

  async resendOtp(
    data: ResendOtpRequest,
    locale:string,
  ): Promise<GeneralResponse<ResendOtpResponse>> {
    return await AuthRepository.resendOtp(data, locale);
  }

  async changePassword(
    data: ChangePasswordRequest,
    locale:string,
  ): Promise<GeneralResponse<ChangePasswordResponse>> {
    return await AuthRepository.changePassword(data, locale);
  }

  async changePasswordAuth(
    data: ChangePasswordAuthRequest,
  ): Promise<GeneralResponse<ChangePasswordAuthResponse>> {
    return await AuthRepository.changePasswordAuth(data);
  }

  async logout(): Promise<void> {
    return await AuthRepository.logout();
  }
  
}

const authUseCaseInstance = new AuthUseCase();
export default authUseCaseInstance;
