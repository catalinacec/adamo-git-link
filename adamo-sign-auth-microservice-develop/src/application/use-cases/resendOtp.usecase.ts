import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { Otp } from "../../domain/models/otp.entity";
import { generateOTP } from "../../utils/generateOTP";
import { sendOtpEmail } from "../services/email.service";
import { getResendOtpSchema } from "../../validators/resendOtp.validator";
import { HttpError } from "../../utils/httpError";

export class ResendOtpUseCase {
  constructor(
    private userRepository: IUserRepository,
    private otpRepository: IOtpRepository
  ) {}

  async execute(
    email: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<void> {
    const schema = getResendOtpSchema(t);

    try {
      await schema.validate({ email }, { abortEarly: false });
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
    const otpCode = generateOTP();
    const expiresAt = new Date(
      Date.now() + parseInt(process.env.OTP_EXPIRATION_MINUTES || "15") * 60000
    );
    const otp = new Otp(null, user._id as string, otpCode, 1, expiresAt);
    await this.otpRepository.upsert(otp);
    await sendOtpEmail(email, otpCode, true, t);
  }
}
