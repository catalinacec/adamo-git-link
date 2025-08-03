import { IUserRepository } from "../../domain/repositories/IUserRepository";
import speakeasy from "speakeasy";
import { HttpError } from "../../utils/httpError";

export class VerifyTwoFactorAuthUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    userId: string,
    token: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<boolean> {
    if (!userId) {
      throw new HttpError(400, t("validation.required", { field: "userId" }));
    }

    if (!token) {
      throw new HttpError(400, t("validation.required", { field: "token" }));
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", { entity: "User" })
      );
    }

    if (!user.__s) {
      throw new HttpError(400, t("errors.auth.two_factor_not_enabled"));
    }

    const verified = speakeasy.totp.verify({
      secret: user.__s,
      encoding: "base32",
      token,
      window: 2,
    });

    if (!verified) {
      throw new HttpError(400, t("errors.auth.invalid_two_factor_code"));
    }

    return verified;
  }
}
