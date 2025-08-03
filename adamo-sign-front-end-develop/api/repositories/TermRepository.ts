import axiosInstance from "../axiosInstance";
import { GeneralResponse } from "../types/GeneralTypes";
import { AcceptTermRequest } from "../types/TermTypes";

class TermsRepository {
  async acceptTerm(
    data: Omit<AcceptTermRequest, "userId">,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<undefined>> {
    const response = await axiosInstance.post<GeneralResponse<undefined>>(
      "/auth/accept-terms",
      data,
      { signal },
    );
    return response.data;
  }
}

export default new TermsRepository();
