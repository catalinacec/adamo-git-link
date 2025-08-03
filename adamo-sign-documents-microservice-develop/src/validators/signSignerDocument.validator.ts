import * as yup from "yup";

export const getSignSignerDocumentSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object().shape({
    signatures: yup.array().of(
      yup.object().shape({
        signId: yup
          .string()
          .required(t("validation.required", { field: "signId" })),
        signatureType: yup
          .string()
          .oneOf(["image", "text"])
          .required(t("validation.required", { field: "signatureType" })),
        signatureFile: yup.mixed().when("signatureType", {
          is: "image",
          then: (schema) =>
            schema.required(
              t("validation.required", { field: "signatureFile" })
            ),
          otherwise: (schema) => schema.notRequired(),
        }),
        signatureText: yup.string().when("signatureType", {
          is: "text",
          then: (schema) =>
            schema.required(
              t("validation.required", { field: "signatureText" })
            ),
          otherwise: (schema) => schema.notRequired(),
        }),
        signatureFontFamily: yup.string().when("signatureType", {
          is: "text",
          then: (schema) =>
            schema.required(
              t("validation.required", { field: "signatureFontFamily" })
            ),
          otherwise: (schema) => schema.notRequired(),
        }),
      })
    ),
  });
