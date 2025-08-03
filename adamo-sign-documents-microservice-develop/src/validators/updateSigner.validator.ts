import * as yup from "yup";

export const getUpdateSignerSchema = (
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
    signerData: yup.object().shape({
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
      order: yup
        .number()
        .required(t("validation.required", { field: "order" })),
      requireValidation: yup.boolean(),
      typeValidation: yup.string(),
      isActive: yup.boolean(),
      signatures: yup.array().of(
        yup.object().shape({
          id: yup
            .string()
            .required(t("validation.required", { field: "id de la firma" })),
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
            .required(
              t("validation.required", { field: "signatureContentFixed" })
            ),
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
          top: yup
            .number()
            .required(t("validation.required", { field: "top" })),
          left: yup
            .number()
            .required(t("validation.required", { field: "left" })),
          width: yup
            .number()
            .required(t("validation.required", { field: "width" })),
          height: yup
            .number()
            .required(t("validation.required", { field: "height" })),
          rotation: yup
            .number()
            .required(t("validation.required", { field: "rotation" })),
          color: yup
            .string()
            .required(t("validation.required", { field: "color" })),
        })
      ),
    }),
  });
