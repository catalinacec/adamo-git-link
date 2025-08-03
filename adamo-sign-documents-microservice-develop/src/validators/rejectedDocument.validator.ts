import * as yup from "yup";

export const getRejectDocumentSchema = (
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
    reason: yup
      .string()
      .required(t("validation.required", { field: "reason" }))
      .test(
        "no-js-or-html",
        t("validation.invalid_reason"),
        (value) =>
          value !== undefined &&
          !/<script[\s\S]*?>[\s\S]*?<\/script>/gi.test(value) &&
          !/<[a-z][\s\S]*>/i.test(value)
      ),
  });
