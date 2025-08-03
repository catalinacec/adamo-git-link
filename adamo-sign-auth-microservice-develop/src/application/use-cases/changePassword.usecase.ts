import bcrypt from "bcrypt";
import { getChangePasswordSchema } from "../../validators/changePassword.validator";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { sendPasswordUpdatedEmail } from "../services/email.service";
import { HttpError } from "../../utils/httpError";

export class ChangePasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    email: string,
    temporaryPassword: string,
    password: string,
    confirmPassword: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<void> {
    // 1) Validación de esquema i18n-aware
    const schema = getChangePasswordSchema(t);
    try {
      await schema.validate(
        { email, temporaryPassword, password, confirmPassword },
        { abortEarly: false }
      );
    } catch (err: any) {
      // err.errors es string[]
      throw new HttpError(
        400,
        t("validation.validation_failed"),
        undefined,
        undefined,
        err.errors
      );
    }

    // 2) Verificar existencia de usuario
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new HttpError(404, t("errors.auth.user_not_found"));
    }

    // 3) Verificar que el OTP temporal esté presente
    if (!user.temporaryPassword || !user.temporaryPasswordExpiresAt) {
      throw new HttpError(400, t("errors.token.missing"));
    }

    // 4) Comparar OTP
    if (user.temporaryPassword !== temporaryPassword) {
      throw new HttpError(400, t("errors.otp.verify_failed"));
    }

    // 5) Verificar expiración del OTP
    if (new Date() > user.temporaryPasswordExpiresAt) {
      throw new HttpError(400, t("errors.token.expired"));
    }

    // 6) Actualizar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.temporaryPassword = "";
    user.temporaryPasswordExpiresAt = undefined;
    user.firstLogin = false;

    await this.userRepository.update(user);

    // 7) Notificar al usuario
    await sendPasswordUpdatedEmail(email, user.name, t);
  }
}
