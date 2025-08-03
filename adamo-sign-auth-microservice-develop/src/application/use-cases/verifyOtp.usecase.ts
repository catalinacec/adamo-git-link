import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { generateOTP } from "../../utils/generateOTP";
import { getVerifyOtpSchema } from "../../validators/verityOtp.validator";
import { HttpError } from "../../utils/httpError";

export class VerifyOtpUseCase {
  constructor(
    private userRepository: IUserRepository,
    private otpRepository: IOtpRepository
  ) {}

  async execute(
    email: string,
    code: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<{ temporaryPassword: string; temporaryPasswordExpiresAt: Date }> {
    const schema = getVerifyOtpSchema(t);

    try {
      await schema.validate({ email, code }, { abortEarly: false });
    } catch (err: any) {
      throw new HttpError(
        400,
        t("validation.validation_failed"),
        undefined,
        undefined,
        err.errors
      );
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new HttpError(404, t("errors.auth.user_not_found"));
    }
    const otpRecord = await this.otpRepository.findByUserIdAndCode(
      user._id as string,
      code
    );

    if (!otpRecord) {
      throw new HttpError(400, t("errors.otp.verify_failed"));
    }
    if (otpRecord.expiresAt < new Date()) {
      throw new HttpError(400, t("errors.token.expired"));
    }

    await this.otpRepository.deleteById(otpRecord.id as string);

    const temporaryPassword = generateOTP(8);
    const temporaryPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    (user as any).temporaryPassword = temporaryPassword;
    (user as any).temporaryPasswordExpiresAt = temporaryPasswordExpiresAt;

    // Actualiza el usuario en la base de datos
    await this.userRepository.update(user);

    return { temporaryPassword, temporaryPasswordExpiresAt };
  }
}
