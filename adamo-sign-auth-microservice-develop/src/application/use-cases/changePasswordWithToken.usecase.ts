import bcrypt from "bcrypt";
import { getChangePasswordWithTokenSchema } from "../../validators/changePasswordWithToken.validator";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { HttpError } from "../../utils/httpError";

export class ChangePasswordWithTokenUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    userId: string,
    password: string,
    confirmPassword: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<void> {
    // 1) Validación de esquema i18n-aware
    const schema = getChangePasswordWithTokenSchema(t);
    try {
      await schema.validate(
        { password, confirmPassword },
        { abortEarly: false }
      );
    } catch (err: any) {
      throw new HttpError(
        400,
        t("validation.validation_failed"),
        undefined,
        undefined,
        err.errors
      );
    }

    // 2) Verificar existencia de usuario
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, t("errors.auth.user_not_found"));
    }

    // 3) Actualizar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.temporaryPassword = "";
    user.temporaryPasswordExpiresAt = undefined;
    user.firstLogin = false;

    await this.userRepository.update(user);
  }
}
