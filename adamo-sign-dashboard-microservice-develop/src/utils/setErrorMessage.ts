import { Request } from "express";

export function getErrorMessage(
  req: Request,
  entityKey: string,
  actionKey: string,
  customMessage?: string
): string {
  return customMessage
    ? customMessage
    : req.t("common.error", {
        entity: req.t(`entities.${entityKey}`),
        action: req.t(`infinitive_actions.${actionKey}`),
      });
}
