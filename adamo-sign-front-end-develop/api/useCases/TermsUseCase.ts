import TermRepository from "../repositories/TermRepository";
import { GeneralResponse } from "../types/GeneralTypes";
import { AcceptTermRequest } from "../types/TermTypes";

class AuthUseCase {
  async acceptTerm(
    data: Omit<AcceptTermRequest, "userId">,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<undefined>> {
    return await TermRepository.acceptTerm(data, signal);
  }
}

export default new AuthUseCase();
