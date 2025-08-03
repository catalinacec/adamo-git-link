import * as yup from "yup";
import { EAdamoIdStatus } from "../application/services/adamo-id.service";

export const getUpdateAdamoIdSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object().shape({
    followId: yup
      .string()
      .matches(
        /^[a-fA-F0-9]{24}$/,
        t("validation.invalid", { field: "followId" })
      )
      .required(t("validation.required", { field: "followId" })),
    status: yup
      .mixed<EAdamoIdStatus>()
      .oneOf(
        Object.values(EAdamoIdStatus),
        t("validation.oneOf", { field: "status" })
      )
      .required(t("validation.required", { field: "status" })),
    completedAt: yup.date().nullable(),
  });
