import axiosInstance from "../axiosInstance";
import { GeneralResponse } from "../types/GeneralTypes";
import { ProfileResponse, TwofaVerifyResponse } from "../types/ProfileTypes";


class ProfileResposotory {
  async profile(
    signal?: AbortSignal,
  ): Promise<GeneralResponse<ProfileResponse>> {         
    const response = await axiosInstance.get<GeneralResponse<ProfileResponse>>(
      "/user/profile",
      { signal },
    );
    return response.data;
  }

 async updateProfile(
    data: { name: string; surname: string; language: string; profileImage?: File },
    signal?: AbortSignal,
  ): Promise<GeneralResponse<ProfileResponse>> {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("surname", data.surname);
    formData.append("language", data.language);
    if (data.profileImage) {
      formData.append("profileImage", data.profileImage);
    }

    const response = await axiosInstance.put<GeneralResponse<ProfileResponse>>(
      "/user/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal,
      },
    );
    return response.data;
  }

    async changePassword(
        data: { oldPassword: string; newPassword: string; confirmPassword: string },
        signal?: AbortSignal,
    ): Promise<GeneralResponse<void>> {
        const response = await axiosInstance.post<GeneralResponse<void>>(
        "/user/change-password",
        data,
        { signal },
        );
        return response.data;
    }

    async TwofaVerify(
        data: { token: string },
        signal?: AbortSignal,
    ): Promise<GeneralResponse<void>> {
        const response = await axiosInstance.post<GeneralResponse<void>>(
            "/user/2fa/verify",
            data,
            { signal },
        );
        return response.data;
    }

    async TwoFaInitialize(
        signal?: AbortSignal,
    ): Promise<GeneralResponse<TwofaVerifyResponse>> {
        const response = await axiosInstance.post<GeneralResponse<TwofaVerifyResponse>>(
            "/user/2fa/init",
            {},
            { signal },
        );
        return response.data;
    }

    async TwofaDisable(
        signal?: AbortSignal,
    ): Promise<GeneralResponse<void>> {
        const response = await axiosInstance.post<GeneralResponse<void>>(
            "/user/2fa/disable",
            { signal },
        );
        return response.data;
    }


}
export default new ProfileResposotory();
