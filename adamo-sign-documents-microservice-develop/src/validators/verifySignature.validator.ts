import * as yup from "yup";

export const getVerifySignatureSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object().shape({
    hash: yup
      .string()
      .required(t("validation.required", { field: "hash" }))
      .matches(/^[a-f0-9]{64}$/i, t("custom.hash_invalid")),
  });
