import { Request, Response, NextFunction } from "express";
import { AuditLoggerService } from "../../application/services/audit-logger.service";
import useragent from "express-useragent";

export const auditMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const ua = useragent.parse(req.headers["user-agent"] || "");

  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;

    AuditLoggerService.log({
      timestamp: new Date(),
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
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
      response: body,
      durationMs: duration,
    });

    return originalSend.call(this, body);
  };

  next();
};
