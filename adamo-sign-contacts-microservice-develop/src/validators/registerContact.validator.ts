import * as yup from "yup";

export const getRegisterContactSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object().shape({
    firstName: yup
      .string()
      .required(t("validation.required", { field: "first name" })),
    lastName: yup
      .string()
      .required(t("validation.required", { field: "last name" })),
    email: yup
      .string()
      .email(t("validation.invalid_email"))
      .required(t("validation.required", { field: "email" })),
    phone: yup
      .string()
      .transform((value) => (value === "" ? undefined : value))
      .matches(/^\+[1-9]\d{1,14}$/, t("validation.invalid_format"))
      .optional(),
    company: yup.string().optional(),
    role: yup.string().optional(),
    position: yup.string().optional(),
    language: yup.string().optional(),
    is_signer: yup.boolean().default(false),
    address: yup
      .object()
      .shape({
        street: yup.string().optional(),
        city: yup.string().optional(),
        state: yup.string().optional(),
        country: yup.string().optional(),
        postalCode: yup.string().optional(),
      })
      .optional(),
  });
