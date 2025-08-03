import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { Otp } from "../../domain/models/otp.entity";
import { generateOTP } from "../../utils/generateOTP";
import { sendOtpEmail } from "../services/email.service";
import { HttpError } from "../../utils/httpError";
import { getForgotPasswordSchema } from "../../validators/forgotPassword.validator";

export class ForgotPasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private otpRepository: IOtpRepository
  ) {}

  async execute(
    email: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<void> {
    console.log("ForgotPasswordUseCase.execute called with email:", email);
    // 1) Validación del esquema i18n-aware
    const schema = getForgotPasswordSchema(t);
    try {
      await schema.validate({ email }, { abortEarly: false });
      console.log("Validation passed for email:", email);
    } catch (err: any) {
      throw new HttpError(
        400,
        t("validation.validation_failed"),
        undefined,
        undefined,
        err.errors
      );
    }
    console.log("Schema validation successful for email:", email);

    // 2) Verificar existencia de usuario
    const user = await this.userRepository.findByEmail(email);

    console.log("User found:", user ? user._id : "No user found");
    if (!user) {
      console.log("User not found for email:", email);
      throw new HttpError(404, t("errors.auth.user_not_found"));
    }

    if (user.firstLogin || user.isActive === false) {
      throw new HttpError(404, t("custom.user_not_active"));
    }

    console.log(
      "User exists, proceeding with OTP generation for email:",
      email
    );
    // 3) Comprobar OTP previo para evitar envíos muy frecuentes
    const existingOtp = await this.otpRepository.findLatestByUserId(
      user._id as string
    );
    console.log(
      "Existing OTP found:",
      existingOtp ? existingOtp.id : "No existing OTP"
    );
    if (existingOtp?.createdAt) {
      console.log("Checking if existing OTP can be reused for email:", email);
      const now = new Date();
      const lastSent = new Date(existingOtp.createdAt);
      const diffSeconds = (now.getTime() - lastSent.getTime()) / 1000;
      console.log(
        `Time since last OTP sent: ${diffSeconds} seconds for email:`
      );

      if (diffSeconds < 30) {
        throw new HttpError(429, t("errors.otp.resend_failed"));
      }
    }

    console.log(
      "No recent OTP found, proceeding to create a new one for email:",
      email
    );
    // 4) Eliminar OTPs anteriores y crear uno nuevo
    await this.otpRepository.deleteAllByUserId(user._id as string);
    console.log("Old OTPs deleted for user ID:", user._id);

    const otpCode = generateOTP();
    console.log("Generated OTP code:", otpCode);
    const expiresAt = new Date(
      Date.now() + Number(process.env.OTP_EXPIRATION_MINUTES ?? "15") * 60_000
    );

    console.log("OTP will expire at:", expiresAt);
    const otp = new Otp(
      null,
      user._id as string,
      otpCode,
      1,
      expiresAt,
      new Date()
    );
    console.log("Creating new OTP entity:", otp);
    await this.otpRepository.create(otp);

    console.log(
      "New OTP created and saved to repository for user ID:",
      user._id
    );
    // 5) Enviar correo con el OTP
    await sendOtpEmail(email, otpCode, false, t);
  }
}
