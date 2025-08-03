import { IUserRepository } from "../../domain/repositories/IUserRepository";
import bcrypt from "bcryptjs";
import { HttpError } from "../../utils/httpError";

export class ChangePasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    userId: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<void> {
    if (!userId) {
      throw new HttpError(400, t("validation.required", { field: "userId" }));
    }

    if (!oldPassword) {
      throw new HttpError(
        400,
        t("validation.required", { field: "oldPassword" })
      );
    }
    if (!newPassword) {
      throw new HttpError(
        400,
        t("validation.required", { field: "newPassword" })
      );
    }
    if (!confirmPassword) {
      throw new HttpError(
        400,
        t("validation.required", { field: "confirmPassword" })
      );
    }

    if (newPassword !== confirmPassword) {
      throw new HttpError(400, t("errors.auth.passwords_do_not_match"));
    }

    if (newPassword === oldPassword) {
      throw new HttpError(400, t("errors.auth.password_same_as_old"));
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", { entity: "User" })
      );
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new HttpError(400, t("errors.auth.old_password_incorrect"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update({
      _id: userId,
      password: hashedPassword,
    });
  }
}
