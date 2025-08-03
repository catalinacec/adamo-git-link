import { z } from "zod";

const passwordRequirements = {
  regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/,
};

export const getPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      password: z
        .string()
        .min(8, t("validation.too_small"))
        .regex(passwordRequirements.regex, t("validation.invalid_string"))
        .refine((password) => !/\s/.test(password), {
          message: t("validation.no_spaces"),
        }),
      confirmPassword: z.string().min(1, t("validation.required")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.custom"),
      path: ["confirmPassword"],
    });

export type PasswordInputs = z.infer<ReturnType<typeof getPasswordSchema>>;
