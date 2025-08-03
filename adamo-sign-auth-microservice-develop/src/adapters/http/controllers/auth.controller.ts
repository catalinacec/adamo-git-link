import { Request, Response } from "express";
import { RegisterUserUseCase } from "../../../application/use-cases/registerUser.usecase";
import { LoginUserUseCase } from "../../../application/use-cases/loginUser.usecase";
import { ForgotPasswordUseCase } from "../../../application/use-cases/forgotPassword.usecase";
import { VerifyOtpUseCase } from "../../../application/use-cases/verifyOtp.usecase";
import { ResendOtpUseCase } from "../../../application/use-cases/resendOtp.usecase";
import { ChangePasswordUseCase } from "../../../application/use-cases/changePassword.usecase";
import { ChangePasswordWithTokenUseCase } from "../../../application/use-cases/changePasswordWithToken.usecase";
import { UserRepository } from "../../../infrastructure/repositories/user.repository";
import { OtpRepository } from "../../../infrastructure/repositories/otp.repository";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../../../domain/models/api-response.model";

import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { SessionModel } from "../../../infrastructure/repositories/sessions.repository";
import { setSuccessMessage } from "../../../utils/responseHelpers";
import { HttpError } from "../../../utils/httpError";
import { getErrorMessage } from "../../../utils/setErrorMessage";
import crypto from "crypto";

const userRepository = new UserRepository();
const otpRepository = new OtpRepository();

// ── ENV y tipado ───────────────────────────────────────────────────────────────
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET!; // "aadererer"

const JWT_PUBLIC_KEY = (process.env.JWT_PUBLIC_KEY as string).replace(
  /\\n/g,
  "\n"
);

// const JWT_EXPIRES_IN: jwt.SignOptions["expiresIn"] =
//   process.env.JWT_EXPIRES_IN!; // "1h"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;
const REFRESH_TOKEN_TTL_SEC = parseInt(process.env.JWT_REFRESH_EXPIRES_IN!, 10); // 86400

// ── Helper para pasar "1h", "15m" o segundos a milisegundos ────────────────────
function parseDurationToMs(d: string | number): number {
  if (typeof d === "number") {
    return d * 1000;
  }
  // Si es solo dígitos, se interpreta como segundos
  if (/^\d+$/.test(d)) {
    return parseInt(d, 10) * 1000;
  }
  const m = d.match(/^(\d+)([smhd])$/);
  if (!m) throw new Error("Formato inválido de duración: " + d);
  const v = parseInt(m[1], 10);
  switch (m[2]) {
    case "s":
      return v * 1000;
    case "m":
      return v * 60_000;
    case "h":
      return v * 3_600_000;
    case "d":
      return v * 86_400_000;
    default:
      throw new Error("Unidad inválida en duración: " + m[2]);
  }
}

export class AuthController {
  static async register(req: Request, res: Response) {
    const { name, surname, email, password, confirmPassword } = req.body;
    const useCase = new RegisterUserUseCase(userRepository);
    const t = req.t;

    try {
      const user = await useCase.execute(
        name,
        surname,
        email,
        password,
        confirmPassword,
        t
      );
      setSuccessMessage(req, res, "user", "create");
      return res.status(201).json(user);
    } catch (error: any) {
      console.error("Error in register:", error);
      // Si ya es HttpError, delegamos al manejador global
      if (error instanceof HttpError) {
        throw error;
      }

      // Determinar si fue validación (errores array) o error de servidor
      const isValidationError = Array.isArray(error.errors);
      const statusCode = isValidationError ? 400 : 500;
      const message = isValidationError
        ? error.message
        : t("errors.auth.registration_failed");
      const errors = error.errors ?? [error.message];

      throw new HttpError(statusCode, message, undefined, undefined, errors);
    }
  }

  static async login(req: Request, res: Response) {
    console.time("🏁 Login total");
    const { email, password } = req.body;
    const useCase = new LoginUserUseCase(userRepository);
    const t = req.t;

    try {
      console.time("🏁 Login execution");
      const result = await useCase.execute(email.trim(), password, t);
      console.timeEnd("🏁 Login execution");
      if (!result.user.twoFactorAuthEnabled) {
        if (!result.user.__s) {
          console.time("🏁 Login QR Code generation");
          const secret = speakeasy.generateSecret({ length: 10 });
          if (!result.user._id) {
            throw new HttpError(
              500,
              t("common.error", {
                entity: t("entities.user"),
                action: t("infinitive_actions.login"),
              })
            );
          }
          console.timeEnd("🏁 Login QR Code generation");
          console.time("🏁 QR Code generation");
          const existingUser = await userRepository.findById(result.user._id);
          if (!existingUser) {
            throw new HttpError(404, t("errors.auth.user_not_found"));
          }
          const completeUser = {
            ...existingUser,
            __s: secret.base32,
          };
          console.timeEnd("🏁 QR Code generation");

          console.time("🏁 QR Code generation with speakeasy");
          await userRepository.update(completeUser);
          console.timeEnd("🏁 QR Code generation with speakeasy");
        }
      }

      setSuccessMessage(req, res, "auth", "login");
      return res.status(200).json({
        token: result.token,
        refreshToken: result.refreshToken,
        user: result.user,
        expiresAt: result.expiresAt,
      });
    } catch (error: any) {
      // Si ya es HttpError, delegamos al manejador global
      if (error instanceof HttpError) {
        throw error;
      }

      // Verificar credenciales inválidas
      const isInvalidCreds =
        error.message === "Invalid credentials" ||
        error.code === "INVALID_CREDENTIALS";

      const statusCode = isInvalidCreds ? 401 : 400;
      const message = t("errors.auth.invalid_credentials");
      const errors = error.errors ?? [error.message];

      throw new HttpError(statusCode, message, undefined, undefined, errors);
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    console.log("🏁 Login total");
    const useCase = new ForgotPasswordUseCase(userRepository, otpRepository);
    const t = req.t;
    console.log("🏁 Login execution");

    try {
      console.time("🏁 Login execution");
      await useCase.execute(email, t);
      console.timeEnd("🏁 Login execution");

      setSuccessMessage(req, res, "auth", "otp_send_email");
      return res.status(200).json({});
    } catch (error: any) {
      console.log("Error in forgotPassword:", error);
      // si ya es HttpError, lo propagamos
      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError(400, t("auth.otp_send_email"));
    }
    console.timeEnd("🏁 Login total");
  }

  static async verifyOtp(req: Request, res: Response) {
    const { email, otp } = req.body;
    const useCase = new VerifyOtpUseCase(userRepository, otpRepository);
    const t = req.t;

    try {
      const result = await useCase.execute(email, otp, t);

      setSuccessMessage(req, res, "auth", "otp_verification");
      return res.status(200).json({
        temporaryPassword: result.temporaryPassword,
        temporaryPasswordExpiresAt: result.temporaryPasswordExpiresAt,
      });
    } catch (error: any) {
      // si ya es HttpError, lo propagamos
      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError(400, t("auth.otp_verification.failed"));
    }
  }

  static async resendOtp(req: Request, res: Response) {
    const { email } = req.body;
    const useCase = new ResendOtpUseCase(userRepository, otpRepository);
    const t = req.t;

    try {
      await useCase.execute(email, t);

      // éxito
      setSuccessMessage(req, res, "auth", "otp_resend_email");
      return res.status(200).json({});
    } catch (error: any) {
      // si ya es HttpError, lo propagamos
      if (error instanceof HttpError) {
        throw error;
      }

      // error genérico de reenvío de OTP
      throw new HttpError(400, t("auth.otp_resend_email.failed"));
    }
  }

  static async changePassword(req: Request, res: Response) {
    const { email, temporaryPassword, password, confirmPassword } = req.body;
    const useCase = new ChangePasswordUseCase(userRepository);
    const t = req.t;

    try {
      await useCase.execute(
        email,
        temporaryPassword,
        password,
        confirmPassword,
        t
      );

      const user = await userRepository.findByEmail(email);
      if (user) {
        await SessionModel.deleteMany({ userId: user._id });
      }

      // Respuesta exitosa
      setSuccessMessage(req, res, "auth", "password_change");
      return res.status(200).json({});
    } catch (error: any) {
      // Si ya viene como HttpError lo propagamos
      if (error instanceof HttpError) {
        throw error;
      }

      // Error genérico de cambio de contraseña
      throw new HttpError(400, t("auth.password_change.failed"));
    }
  }

  static async changePasswordWithToken(req: Request, res: Response) {
    const t = req.t;

    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new HttpError(401, t("auth.errors.unauthorized"));
      }
      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new HttpError(401, t("auth.errors.unauthorized"));
      }

      const decoded = jwt.verify(token, JWT_PUBLIC_KEY, {
        algorithms: ["RS256"],
      });
      const userId = (decoded as any).id;
      if (!userId) {
        throw new HttpError(401, t("auth.errors.unauthorized"));
      }

      const { password, confirmPassword } = req.body;
      const useCase = new ChangePasswordWithTokenUseCase(userRepository);
      await useCase.execute(userId, password, confirmPassword, t);

      setSuccessMessage(req, res, "auth", "password_change");
      return res.status(200).json({});
    } catch (error: any) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        throw new HttpError(
          401,
          t("auth.errors.unauthorized"),
          undefined,
          undefined,
          [error.message]
        );
      }
      throw new HttpError(
        400,
        t("custom.password_change_failed"),
        undefined,
        undefined,
        [error.message]
      );
    }
  }

  static async acceptTerm(req: Request, res: Response) {
    const t = req.t;
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new HttpError(401, t("auth.errors.unauthorized"));
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new HttpError(401, t("auth.errors.unauthorized"));
      }

      // Decode token to get userId
      const decoded = jwt.verify(token, JWT_PUBLIC_KEY, {
        algorithms: ["RS256"],
      });
      const userId = (decoded as any).id;
      if (!userId) {
        throw new HttpError(401, t("auth.errors.unauthorized"));
      }

      // Validate required fields in the request body
      const { termId, accepted } = req.body;
      if (!termId) {
        throw new HttpError(400, t("validation.required", { field: "termId" }));
      }

      if (accepted === undefined) {
        throw new HttpError(
          400,
          t("validation.required", { field: "accepted" })
        );
      }

      // Process terms acceptance
      await userRepository.acceptTerms(userId, termId, accepted);

      setSuccessMessage(req, res, "term", "accept");
      return res.status(200).json({});
    } catch (error: any) {
      // Si ya es un HttpError, lo propagamos
      if (error instanceof HttpError) {
        throw error;
      }

      // Manejo específico de JWT
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        throw new HttpError(
          401,
          t("auth.errors.unauthorized"),
          undefined,
          undefined,
          [error.message]
        );
      }

      // Para el resto de errores, usamos la función de error genérico
      const message = getErrorMessage(req, "term", "accept");
      throw new HttpError(500, message);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        const message = getErrorMessage(req, "auth", "logout");
        throw new HttpError(401, message);
      }

      const token = authHeader.split(" ")[1];

      // ✅ Borramos la sesión de la base de datos
      await SessionModel.deleteOne({ token });

      setSuccessMessage(req, res, "auth", "logout");
      return res.status(200).json({});
    } catch (error: any) {
      const message = getErrorMessage(req, "auth", "logout");
      return res.status(500).json(message);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    const t = req.t;
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new HttpError(
        400,
        t("validation.required", { field: "refreshToken" })
      );
    }

    // 1️⃣ Busca la sesión usando el refresh token opaco
    const session = await SessionModel.findOne({ refreshToken });
    if (!session) {
      throw new HttpError(401, t("auth.errors.invalid_refresh_token"));
    }

    // 2️⃣ Verifica que no haya expirado
    if (session.refreshTokenExpiresAt < new Date()) {
      await SessionModel.deleteOne({ _id: session._id });
      throw new HttpError(401, t("auth.errors.refresh_token_expired"));
    }

    // 3️⃣ Recupera el usuario
    const user = await userRepository.findById(session.userId.toString());
    if (!user) {
      throw new HttpError(404, t("errors.auth.user_not_found"));
    }

    // 4️⃣ Genera nuevo access token JWT
    const accessToken = jwt.sign(
      {
        id: user._id,
        uuid: user.uuid,
        email: user.email,
        firstLogin: user.firstLogin,
        language: user.language,
        twoFactorAuthEnabled: user.twoFactorAuthEnabled,
        roles: user.roles,
      },
      JWT_SECRET as jwt.Secret,
      { expiresIn: JWT_EXPIRES_IN as any }
    );
    const expiresAt = new Date(Date.now() + parseDurationToMs(JWT_EXPIRES_IN));

    // 5️⃣ Rota el refresh token: crea uno opaco nuevo
    const newRefreshToken = crypto.randomBytes(64).toString("hex");
    const refreshTokenExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_SEC * 1000
    );

    // 6️⃣ Actualiza la sesión en BD
    session.token = accessToken;
    session.expiresAt = expiresAt;
    session.refreshToken = newRefreshToken;
    session.refreshTokenExpiresAt = refreshTokenExpiresAt;
    await session.save();

    // 7️⃣ Devuelve ambos tokens
    setSuccessMessage(req, res, "auth", "refresh_token");
    return res.status(200).json({
      token: accessToken,
      refreshToken: newRefreshToken,
      expiresAt,
    });
  }
  static async getJWKSPublicKey(req: Request, res: Response) {
    try {
      // Obtener los valores del .env
      const modulus = process.env.JWT_PUBLIC_KEY_N;
      const exponent = process.env.JWT_PUBLIC_KEY_E ?? "";
      const kid = process.env.JWT_PUBLIC_KEY_KID ?? "";
      const signMethod = process.env.JWT_SIGN_METHOD ?? "RS256";

      const jwks = {
        keys: [
          {
            kty: "RSA",
            alg: signMethod,
            use: "sig",
            kid: kid,
            n: modulus,
            e: exponent,
          },
        ],
      };

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json(jwks);
    } catch (error: any) {
      const message = getErrorMessage(req, "auth", "public_key");
      return res.status(500).json({ error: message });
    }
  }
}
