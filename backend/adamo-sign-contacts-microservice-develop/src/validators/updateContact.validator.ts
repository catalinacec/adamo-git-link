import * as yup from "yup";

export const getUpdateContactSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object().shape({
    firstName: yup.string(),
    lastName: yup.string(),
    email: yup.string().email(t("validation.invalid_email")),
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
