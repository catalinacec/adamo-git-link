import { Request, Response, NextFunction } from "express";
import { UpdateProfileUseCase } from "../../../application/use-cases/updateProfile.usecase";
import { GetProfileUseCase } from "../../../application/use-cases/getProfile.usecase";
import { UserRepository } from "../../../infrastructure/repositories/user.repository";
import { EnableTwoFactorAuthUseCase } from "../../../application/use-cases/enabledTwoFactorAuth.usecase";
import { VerifyTwoFactorAuthUseCase } from "../../../application/use-cases/verifyTwoFactorAuth.usecase";
import { DisableTwoFactorAuthUseCase } from "../../../application/use-cases/disabledTwoFactorAuth.usecase";
import { ChangePasswordUseCase } from "../../../application/use-cases/changePassword.usecase";
import s3 from "../../../infrastructure/aws/s3";
import { SessionModel } from "../../../infrastructure/repositories/session.repository";
import { ApiResponse } from "../../../domain/models/api-response.model";
import { setSuccessMessage } from "../../../utils/responseHelpers";
import { HttpError } from "../../../utils/httpError";
import { getErrorMessage } from "../../../utils/setErrorMessage";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

const userRepository = new UserRepository();
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
const getProfileUseCase = new GetProfileUseCase(userRepository);
const enableTwoFactorAuthUseCase = new EnableTwoFactorAuthUseCase(
  userRepository
);
const verifyTwoFactorAuthUseCase = new VerifyTwoFactorAuthUseCase(
  userRepository
);
const disableTwoFactorAuthUseCase = new DisableTwoFactorAuthUseCase(
  userRepository
);
const changePasswordUseCase = new ChangePasswordUseCase(userRepository);

export class UserController {
  static async health(req: Request, res: Response) {
    return res.status(200).json({ status: "ok" });
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const t = req.t;
      const userId = req.user?.id ?? "";
      const response = await getProfileUseCase.execute(userId, t);

      setSuccessMessage(req, res, "user", "retrieve");
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(req, "user", "retrieve");
      throw new HttpError(500, message);
    }
  }

  static async updateProfile(req: Request, res: Response) {
    const t = req.t;
    try {
      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const file = req.file;

      if (file) {
        // Definimos el nombre del archivo en S3
        const fileExtension = file.originalname.split(".").pop();
        const fileName = `profile-pictures/${userData._id}.${fileExtension}`;

        // Configuración para subir a S3
        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME as string,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        // Subir el archivo a S3
        await s3.upload(params).promise();

        const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
        userData.profileImageUrl = publicUrl;
      }

      const response = await updateProfileUseCase.execute(userData, t);

      setSuccessMessage(req, res, "user", "update");
      return res.status(200).json(response);
    } catch (error) {
      console.log("Error in updateProfile:", error);
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(req, "user", "update");
      throw new HttpError(500, message);
    }
  }

  static async enabledTwoFactorAuth(req: Request, res: Response) {
    const t = req.t;
    try {
      const userId = req.user?.id ?? "";
      const result = await enableTwoFactorAuthUseCase.execute(userId, t);

      setSuccessMessage(
        req,
        res,
        "user",
        "enabled",
        t("custom.enabled_two_factor_auth")
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(
        req,
        "user",
        "enabled",
        t("errors.user.failed_two_factor_auth")
      );
      throw new HttpError(500, message);
    }
  }

  static async verifyTwoFactorAuth(req: Request, res: Response) {
    const t = req.t;
    try {
      const userId = req.user?.id ?? "";
      const { token } = req.body;

      const isValid = await verifyTwoFactorAuthUseCase.execute(
        userId,
        token,
        t
      );

      if (isValid) {
        await userRepository.update({
          _id: userId,
          twoFactorAuthEnabled: true,
        });

        setSuccessMessage(
          req,
          res,
          "user",
          "valid",
          t("custom.valid_two_factor_auth")
        );
        return res.status(200).json(null);
      } else {
        const message = getErrorMessage(
          req,
          "user",
          "enabled",
          t("errors.user.invalid_two_factor_auth")
        );
        throw new HttpError(400, message);
      }
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(
        req,
        "user",
        "enabled",
        t("errors.user.token_verification_failed")
      );
      throw new HttpError(400, message);
    }
  }

  static async disabledTwoFactorAuth(req: Request, res: Response) {
    const t = req.t;
    try {
      const userId = req.user?.id ?? "";
      await disableTwoFactorAuthUseCase.execute(userId, t);

      setSuccessMessage(
        req,
        res,
        "user",
        "disabled",
        t("custom.disabled_two_factor_auth")
      );
      return res.status(200).json(null);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(
        req,
        "user",
        "enabled",
        t("errors.user.failed_disable_two_factor_auth")
      );
      throw new HttpError(400, message);
    }
  }

  static async changePassword(req: Request, res: Response) {
    const t = req.t;
    try {
      const userId = req.user?.id ?? "";
      const { oldPassword, newPassword, confirmPassword } = req.body;

      await changePasswordUseCase.execute(
        userId,
        oldPassword,
        newPassword,
        confirmPassword,
        t
      );

      if (userId) {
        await SessionModel.deleteMany({ userId: userId });
      }

      setSuccessMessage(req, res, "user", "update");
      return res.status(200).json(null);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(req, "user", "update");
      throw new HttpError(400, message);
    }
  }
}
