import { IUserRepository } from "../../domain/repositories/IUserRepository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { getLoginUserSchema } from "../../validators/loginUser.validator";
import { User } from "../../domain/models/user.entity";
import { SessionModel } from "../../infrastructure/repositories/sessions.repository";
import { HttpError } from "../../utils/httpError";
import * as fs from "fs";

dotenv.config();

export class LoginUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    email: string,
    password: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<{
    token: string;
    refreshToken: string;
    user: Partial<User>;
    expiresAt: Date;
  }> {
    console.time("Validation and Authentication");
    const schema = getLoginUserSchema(t);

    try {
      await schema.validate({ email, password }, { abortEarly: false });
    } catch (err: any) {
      throw new HttpError(
        400,
        t("validation.validation_failed"),
        undefined,
        undefined,
        err.errors
      );
    }
    console.timeEnd("Validation and Authentication");

    console.time("User Authentication");
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new HttpError(401, t("errors.auth.invalid_credentials"));
    }
    console.timeEnd("User Authentication");

    console.time("Password Comparison");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new HttpError(401, t("errors.auth.invalid_credentials"));
    }
    console.timeEnd("Password Comparison");

    console.time("Session Cleanup and Creation");
    await SessionModel.deleteMany({ userId: user._id }).catch(console.error);
    console.timeEnd("Session Cleanup and Creation");

    console.time("Token Generation");
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1h
    const refreshToken = crypto.randomBytes(64).toString("hex");
    const refreshTokenExpiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );
    // fs.readFileSync("src/jwt-keys/private.pem"),
    const token = jwt.sign(
      {
        id: user._id,
        uuid: user.uuid,
        email: user.email,
        firstLogin: user.firstLogin,
        language: user.language,
        twoFactorAuthEnabled: user.twoFactorAuthEnabled,
        roles: user.roles,
        sub: user._id,
        aud: process.env.JWT_AUDIENCE,
      },
      (process.env.JWT_PRIVATE_KEY as string).replace(/\\n/g, "\n"),
      {
        algorithm: "RS256",
        keyid: "adamo-sign-key",
        expiresIn: "1h",
      }
    );
    console.timeEnd("Token Generation");

    console.time("Session Storage");
    // ✅ Guardar la sesión en la base de datos
    await SessionModel.create({
      userId: user._id,
      token: token,
      expiresAt,
      refreshToken,
      refreshTokenExpiresAt,
    });

    const {
      password: _,
      temporaryPassword,
      temporaryPasswordExpiresAt,
      __s,
      ...userData
    } = user;
    console.timeEnd("Session Storage");

    return { token, refreshToken, user: userData, expiresAt };
  }
}
