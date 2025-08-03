import * as yup from "yup";

export const getChangePasswordWithTokenSchema = (
  t: (key: string, vars?: Record<string, any>) => string
) =>
  yup.object().shape({
    password: yup
          .string()
          .min(8, t("validation.min_length", { field: "password", min: 8 }))
          .matches(/[A-Z]/, t("validation.password_uppercase"))
          .matches(/\d/, t("validation.password_number"))
          .matches(/[^a-zA-Z0-9]/, t("validation.password_special"))
          .required(t("validation.required", { field: "password" })),

    confirmPassword: yup
      .string()
      .oneOf(
        [yup.ref("password"), undefined],
        t("validation.passwords_must_match")
      )
      .required(t("validation.required", { field: "confirmPassword" })),
  });
