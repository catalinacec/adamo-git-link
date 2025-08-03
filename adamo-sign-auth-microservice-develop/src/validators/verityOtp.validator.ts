import * as yup from "yup";

export const getVerifyOtpSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object().shape({
    code: yup.string().required(t("validation.required", { field: "code" })),
  });
