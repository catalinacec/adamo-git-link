import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { getI18n, resolveLanguage } from "../../i18n/i18n";
import { ApiResponse } from "../../domain/models/api-response.model";

export const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const lang = resolveLanguage(req.headers["accept-language"]);
    const t = getI18n(lang);
    const message = t("errors.rate_limit.too_many_requests");

    const response: ApiResponse<null> = {
      message,
      data: null,
      errors: [message],
      timestamp: new Date(),
    };

    res.status(429).json(response);
  },
});
