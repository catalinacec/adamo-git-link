// src/infrastructure/middleware/responseFormatter.ts
import { Response, Request, NextFunction } from "express";
import { successResponse } from "../../utils/httpResponse";
import { isApiResponse } from "../../utils/validateApiResponse";

export const responseFormatter = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const oldJson = res.json;

    res.json = function (data: any) {
      if (isApiResponse(data)) {
        return oldJson.call(this, data);
      }

      const message =
        res.locals.message || req.t?.("common.success") || "Success";
      const pagination = res.locals.pagination || null;
      const formatted = successResponse(message, data, pagination);
      return oldJson.call(this, formatted);
    };

    next();
  };
};
