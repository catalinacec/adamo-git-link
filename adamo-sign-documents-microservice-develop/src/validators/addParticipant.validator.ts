import * as yup from "yup";

export const getAddSignerSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) => {
  const signatureSchema = yup.object().shape({
    recipientEmail: yup
      .string()
      .email(t("validation.invalid_email"))
      .required(t("validation.required", { field: "recipientEmail" })),
    recipientsName: yup
      .string()
      .required(t("validation.required", { field: "recipientsName" })),
    signatureText: yup
      .string()
      .required(t("validation.required", { field: "signatureText" })),
    signatureContentFixed: yup
      .boolean()
      .required(t("validation.required", { field: "signatureContentFixed" })),
    signatureDelete: yup
      .boolean()
      .required(t("validation.required", { field: "signatureDelete" })),
    signatureIsEdit: yup
      .boolean()
      .required(t("validation.required", { field: "signatureIsEdit" })),
    slideElement: yup
      .string()
      .required(t("validation.required", { field: "slideElement" })),
    slideIndex: yup
      .number()
      .required(t("validation.required", { field: "slideIndex" })),
    top: yup.number().required(t("validation.required", { field: "top" })),
    left: yup.number().required(t("validation.required", { field: "left" })),
    width: yup.number().required(t("validation.required", { field: "width" })),
    height: yup
      .number()
      .required(t("validation.required", { field: "height" })),
    rotation: yup
      .number()
      .required(t("validation.required", { field: "rotation" })),
    color: yup.string().required(t("validation.required", { field: "color" })),
  });

  const participantSchema = yup.object().shape({
    first_name: yup
      .string()
      .required(t("validation.required", { field: "first_name" })),
    last_name: yup
      .string()
      .required(t("validation.required", { field: "last_name" })),
    email: yup
      .string()
      .email(t("validation.invalid_email"))
      .required(t("validation.required", { field: "email" })),
    requireValidation: yup.boolean().default(false),
    typeValidation: yup
      .array()
      .of(yup.string())
      .when("requireValidation", {
        is: true,
        then: (schema) =>
          schema
            .min(
              1,
              t("validation.min_items", { field: "typeValidation", min: 1 })
            )
            .required(t("validation.required", { field: "typeValidation" })),
        otherwise: (schema) => schema.default([]),
      }),
    isActive: yup.boolean().default(true),
    signatures: yup
      .array()
      .of(signatureSchema)
      .min(1, t("validation.min_items", { field: "signatures", min: 1 }))
      .required(t("validation.required", { field: "signatures" })),
  });

  return yup.object().shape({
    participants: yup
      .array()
      .of(participantSchema)
      .required(t("validation.required", { field: "participants" })),
  });
};
