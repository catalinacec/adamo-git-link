import * as yup from "yup";

export const getDeleteSignerSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object().shape({
    userId: yup
      .string()
      .required(t("validation.required", { field: "userId" })),
    documentId: yup
      .string()
      .required(t("validation.required", { field: "documentId" })),
    signerId: yup
      .string()
      .required(t("validation.required", { field: "signerId" })),
  });
