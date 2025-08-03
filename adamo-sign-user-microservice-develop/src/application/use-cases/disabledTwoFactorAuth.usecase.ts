import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { HttpError } from "../../utils/httpError";

export class DisableTwoFactorAuthUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    userId: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<void> {
    if (!userId) {
      throw new HttpError(400, t("validation.required", { field: "userId" }));
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", { entity: "User" })
      );
    }

    user.twoFactorAuthEnabled = false;
    user.__s = "";

    await this.userRepository.update(user);
  }
}
