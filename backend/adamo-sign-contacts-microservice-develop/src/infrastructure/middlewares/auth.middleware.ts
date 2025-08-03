import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getI18n, resolveLanguage } from "../../i18n/i18n";
import { getErrorMessage } from "../../utils/setErrorMessage";
import { ApiResponse } from "../../domain/models/api-response.model";

dotenv.config();
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, "\n");

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const lang = resolveLanguage(req.headers["accept-language"]);
  const t = getI18n(lang);

  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
      const message = getErrorMessage(
        req,
        "token",
        "missing",
        t("errors.token.missing")
      );
      const response: ApiResponse<null> = {
        message,
        data: null,
        errors: [message],
        timestamp: new Date(),
      };
      res.status(401).json(response);
      return;
    }
    
    jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err) {
        const message =
          err.name === "TokenExpiredError"
            ? t("errors.token.expired")
            : t("errors.token.invalid");

        const response: ApiResponse<null> = {
          message,
          data: null,
          errors: [message],
          timestamp: new Date(),
        };
        res.status(err.name === "TokenExpiredError" ? 401 : 403).json(response);
        return;
      }

      if (
        typeof decoded === "object" &&
        decoded !== null &&
        "id" in decoded &&
        typeof (decoded as any).id === "string"
      ) {
        req.user = { id: (decoded as any).id };
        req.token = token;
        next();
      } else {
        const message = t("errors.token.invalid");
        const response: ApiResponse<null> = {
          message,
          data: null,
          errors: [message],
          timestamp: new Date(),
        };
        res.status(403).json(response);
      }
    });
  } catch (error) {
    const message = t("errors.server.internal");
    const response: ApiResponse<null> = {
      message,
      data: null,
      errors: [message],
      timestamp: new Date(),
    };
    res.status(500).json(response);
  }
};
