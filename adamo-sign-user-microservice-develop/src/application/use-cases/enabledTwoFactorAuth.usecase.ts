import { IUserRepository } from "../../domain/repositories/IUserRepository";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { HttpError } from "../../utils/httpError";

export class EnableTwoFactorAuthUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    userId: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<{ secret: string; qrCodeURI: string }> {
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

    const secret = speakeasy.generateSecret({ length: 10 });

    const qrCodeURI = await QRCode.toDataURL(
      `otpauth://totp/Adamo Sign:${user.email}?secret=${secret.base32}`,
      {
        margin: 1,
        color: {
          dark: "#107569",
          light: "#FFFFFFFF",
        },
      }
    );

    user.__s = secret.base32;
    await this.userRepository.update(user);

    return {
      secret: secret.base32,
      qrCodeURI,
    };
  }
}
