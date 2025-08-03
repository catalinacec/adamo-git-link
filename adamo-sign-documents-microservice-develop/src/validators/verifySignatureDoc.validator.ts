import * as yup from "yup";

export const getVerifySignatureDocSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object().shape({
    hash: yup
      .string()
      .required(t("validation.required", { field: "hash" }))
      .matches(/^[a-fA-F0-9]{64}$/, t("custom.hash_invalid")),
  });
