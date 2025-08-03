import * as yup from "yup";

export const getResendOtpSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object().shape({
    email: yup
      .string()
      .email(t("validation.invalid_email"))
      .required(t("validation.required", { field: "email" })),
  });
