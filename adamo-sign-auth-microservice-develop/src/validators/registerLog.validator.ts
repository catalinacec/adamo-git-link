import * as yup from "yup";

export const getRegisterLogSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object().shape({
    action: yup
      .string()
      .required(t("validation.required", { field: "action" })),
    success: yup
      .boolean()
      .required(t("validation.required", { field: "success" })),
    userId: yup.string().optional(),
    email: yup.string().email(t("validation.invalid_email")).optional(),
    statusCode: yup
      .number()
      .integer(t("validation.must_be_integer", { field: "statusCode" }))
      .optional(),
    message: yup.string().optional(),
    payload: yup.mixed().optional(),
    headers: yup.mixed().optional(),
    ip: yup.string().optional(),
    userAgent: yup.string().optional(),
    method: yup.string().optional(),
    path: yup.string().optional(),
    timestamp: yup
      .date()
      .default(() => new Date())
      .required(t("validation.required", { field: "timestamp" })),
  });
