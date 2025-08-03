import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AuditLoggerService } from "../../application/services/audit-logger.service";
import useragent from "express-useragent";
import { ApiResponse } from "../../domain/models/api-response.model";
import { HttpError } from "../../utils/httpError";
import { getI18n, resolveLanguage } from "../../i18n/i18n";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const lang = resolveLanguage(req.headers["accept-language"]);
  const t = getI18n(lang);
  const ua = useragent.parse(req.headers["user-agent"] || "");
  const timestamp = new Date();

  // 1. Determinar el código de estado
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = t("errors.server.internal");
  let errorDetails: string[] = [];

  if (err instanceof HttpError) {
    statusCode = err.statusCode;
    // message =
    //   t(`errors.${err.code.toLowerCase()}`, { field: err.field }) ||
    //   err.message;
    // errorDetails.push(message);
    // ✅ Si el código es string y traducible, usa t(...)
    if (typeof err.code === "string" && err.code !== "UNKNOWN") {
      const translated = t(`errors.${err.code.toLowerCase()}`, {
        field: err.field,
      });
      message = translated || err.message;
    } else {
      message = err.message;
    }

    // ✅ Si viene una lista de errores, úsala
    if (Array.isArray(err.errors) && err.errors.length > 0) {
      errorDetails = err.errors;
    } else {
      errorDetails = [message];
    }
  } else if (
    err.name === "ValidationError" ||
    err.name === "YupError" ||
    err.name === "SyntaxError"
  ) {
    statusCode = 400;
    message = "Bad request";
    errorDetails.push(t("errors.server.internal"));
  } else {
    errorDetails.push(err.message || "Unexpected error");
  }

  // 2. Audit log
  AuditLoggerService.log({
    timestamp: new Date(),
    method: req.method,
    path: req.originalUrl,
    statusCode: 500,
    ip: req.ip || req.socket.remoteAddress || "",
    userAgent: req.headers["user-agent"] || "",
    device: {
      os: ua.os,
      browser: ua.browser,
      platform: ua.platform,
      source: ua.source,
    },
    request: {
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
    },
    response: null,
    durationMs: 0,
    error: err.message,
  });

  // 3. Send response
  const response: ApiResponse<null> = {
    message,
    data: null,
    errors: errorDetails,
    timestamp,
  };

  res.status(statusCode).json(response);
};
