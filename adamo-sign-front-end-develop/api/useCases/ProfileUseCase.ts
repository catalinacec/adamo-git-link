import ProfileRepository from "../repositories/ProfileRepository";
import { GeneralResponse } from "../types/GeneralTypes";
import { ProfileResponse, TwofaVerifyResponse } from "../types/ProfileTypes";


class ProfileUseCase {
  async profile(
    signal?: AbortSignal,
  ): Promise<GeneralResponse<ProfileResponse>> {
    return await ProfileRepository.profile(signal);
  }

  async updateProfile(
    payload: { name: string; surname: string; language: string; profileImage?: File },
    signal?: AbortSignal,
  ) {
    return await ProfileRepository.updateProfile(payload, signal);
  }

  async changePassword(
      data: { oldPassword: string; newPassword: string; confirmPassword: string },
      signal?: AbortSignal,
  ): Promise<GeneralResponse<void>> {
      return await ProfileRepository.changePassword(data, signal);
  }

    async TwofaVerify(
        data: { token: string },
        signal?: AbortSignal,
    ): Promise<GeneralResponse<void>> {
        return await ProfileRepository.TwofaVerify(data, signal);
    }

    async TwofaEnable(
        signal?: AbortSignal,
    ): Promise<GeneralResponse<TwofaVerifyResponse>> {
        return await ProfileRepository.TwoFaInitialize(signal);
    }

  async TwofaDisable(
      signal?: AbortSignal,
  ): Promise<GeneralResponse<void>> {
      return await ProfileRepository.TwofaDisable(signal);
  }
}

export default new ProfileUseCase();
