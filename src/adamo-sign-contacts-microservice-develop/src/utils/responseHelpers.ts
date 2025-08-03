import { Request, Response } from "express";
import { Pagination } from "../domain/models/api-response.model";

export function setSuccessMessage(
  req: Request,
  res: Response,
  entityKey: string,
  actionKey: string,
  customMessage?: string
): void {
  res.locals.message = customMessage
    ? customMessage
    : req.t("common.success", {
        entity: req.t(`entities.${entityKey}`),
        action: req.t(`actions.${actionKey}`),
      });
}

export function setPagination(res: Response, pagination: Pagination): void {
  res.locals.pagination = pagination;
}
